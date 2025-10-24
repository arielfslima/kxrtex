import prisma from '../config/database.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';
import { AppError } from '../middlewares/errorHandler.js';

export const register = async (req, res, next) => {
  try {
    const {
      email,
      senha,
      tipo,
      nome,
      telefone,
      cpfCnpj,
      nomeArtistico,
      categoria,
      bio,
      valorBaseHora,
      tipoPessoa
    } = req.body;

    // Verificar se usuário já existe
    const existingUser = await prisma.usuario.findFirst({
      where: {
        OR: [
          { email },
          { cpfCnpj: cpfCnpj.replace(/\D/g, '') }
        ]
      }
    });

    if (existingUser) {
      throw new AppError('Email ou CPF/CNPJ já cadastrado', 409);
    }

    // Hash da senha
    const senhaHash = await hashPassword(senha);

    // Criar usuário com perfil específico
    const usuario = await prisma.usuario.create({
      data: {
        email,
        senhaHash,
        tipo,
        nome,
        telefone,
        cpfCnpj: cpfCnpj.replace(/\D/g, ''),
        ...(tipo === 'ARTISTA' && {
          artista: {
            create: {
              nomeArtistico: nomeArtistico || nome,
              categoria,
              bio: bio || '',
              valorBaseHora: valorBaseHora || 0,
              subcategorias: [],
              cidadesAtuacao: [],
              portfolio: [],
              documentos: []
            }
          }
        }),
        ...(tipo === 'CONTRATANTE' && {
          contratante: {
            create: {
              tipoPessoa: tipoPessoa || 'PF'
            }
          }
        })
      },
      include: {
        artista: true,
        contratante: true
      }
    });

    // Gerar token
    const token = generateToken(usuario.id);

    // Remover senha do retorno
    const { senhaHash: _, ...usuarioSemSenha } = usuario;

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      token,
      user: usuarioSemSenha
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, senha } = req.body;

    // Buscar usuário
    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: {
        artista: true,
        contratante: true
      }
    });

    if (!usuario) {
      throw new AppError('Email ou senha incorretos', 401);
    }

    // Verificar status
    if (usuario.status !== 'ATIVO') {
      throw new AppError('Conta suspensa ou banida', 403);
    }

    // Verificar senha
    const senhaValida = await comparePassword(senha, usuario.senhaHash);

    if (!senhaValida) {
      throw new AppError('Email ou senha incorretos', 401);
    }

    // Gerar token
    const token = generateToken(usuario.id);

    // Remover senha do retorno
    const { senhaHash: _, ...usuarioSemSenha } = usuario;

    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: usuarioSemSenha
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.user.id },
      include: {
        artista: true,
        contratante: true
      }
    });

    const { senhaHash: _, ...usuarioSemSenha } = usuario;

    res.json({
      user: usuarioSemSenha
    });
  } catch (error) {
    next(error);
  }
};

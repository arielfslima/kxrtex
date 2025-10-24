import prisma from '../config/database.js';
import { AppError } from '../middlewares/errorHandler.js';

export const getUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        foto: true,
        tipo: true,
        status: true,
        createdAt: true,
        artista: {
          select: {
            id: true,
            nomeArtistico: true,
            bio: true,
            valorBaseHora: true,
            categoria: true,
            subcategorias: true,
            cidadesAtuacao: true,
            portfolio: true,
            redesSociais: true,
            plano: true,
            statusVerificacao: true,
            notaMedia: true,
            totalBookings: true
          }
        },
        contratante: {
          select: {
            id: true,
            tipoPessoa: true
          }
        }
      }
    });

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    res.json({ data: user });
  } catch (error) {
    next(error);
  }
};

export const updateUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { nome, telefone, foto } = req.body;

    if (!nome && !telefone && !foto) {
      throw new AppError('Nenhum campo para atualizar foi fornecido', 400);
    }

    const updateData = {};
    if (nome) updateData.nome = nome;
    if (telefone) updateData.telefone = telefone;
    if (foto) updateData.foto = foto;

    const updatedUser = await prisma.usuario.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        foto: true,
        tipo: true,
        status: true,
        artista: {
          select: {
            id: true,
            nomeArtistico: true,
            bio: true,
            valorBaseHora: true,
            categoria: true,
            plano: true
          }
        },
        contratante: {
          select: {
            id: true,
            tipoPessoa: true
          }
        }
      }
    });

    res.json({
      message: 'Perfil atualizado com sucesso',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

import prisma from '../config/database.js';
import { AppError } from '../middlewares/errorHandler.js';
import { uploadImageBuffer, deleteImage, extractPublicId } from '../services/cloudinary.service.js';

export const uploadProfilePhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('Nenhuma imagem foi enviada', 400);
    }

    const { url, publicId } = await uploadImageBuffer(
      req.file.buffer,
      'kxrtex/profiles'
    );

    const usuario = await prisma.usuario.findUnique({
      where: { id: req.user.id }
    });

    if (usuario.foto) {
      const oldPublicId = extractPublicId(usuario.foto);
      await deleteImage(oldPublicId);
    }

    const usuarioAtualizado = await prisma.usuario.update({
      where: { id: req.user.id },
      data: { foto: url }
    });

    res.json({
      message: 'Foto de perfil atualizada com sucesso',
      data: {
        foto: usuarioAtualizado.foto
      }
    });
  } catch (error) {
    next(error);
  }
};

export const uploadPortfolio = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      throw new AppError('Nenhuma imagem foi enviada', 400);
    }

    if (req.user.tipo !== 'ARTISTA') {
      throw new AppError('Apenas artistas podem fazer upload de portfolio', 403);
    }

    const artista = await prisma.artista.findUnique({
      where: { usuarioId: req.user.id }
    });

    if (!artista) {
      throw new AppError('Artista não encontrado', 404);
    }

    const limitesPorPlano = {
      FREE: 5,
      PLUS: 15,
      PRO: Infinity
    };

    const limiteAtual = limitesPorPlano[artista.plano];
    const totalAtual = artista.portfolio.length;
    const novasImagens = req.files.length;

    if (totalAtual + novasImagens > limiteAtual) {
      throw new AppError(
        `Limite de ${limiteAtual} imagens atingido para o plano ${artista.plano}. Você tem ${totalAtual} imagens.`,
        400
      );
    }

    const uploadPromises = req.files.map(file =>
      uploadImageBuffer(file.buffer, 'kxrtex/portfolio')
    );

    const results = await Promise.all(uploadPromises);

    const novasUrls = results.map(r => r.url);

    const artistaAtualizado = await prisma.artista.update({
      where: { id: artista.id },
      data: {
        portfolio: {
          push: novasUrls
        }
      }
    });

    res.json({
      message: `${novasImagens} imagem(ns) adicionada(s) ao portfolio`,
      data: {
        portfolio: artistaAtualizado.portfolio,
        total: artistaAtualizado.portfolio.length,
        limite: limiteAtual
      }
    });
  } catch (error) {
    next(error);
  }
};

export const deletePortfolioImage = async (req, res, next) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      throw new AppError('URL da imagem é obrigatória', 400);
    }

    if (req.user.tipo !== 'ARTISTA') {
      throw new AppError('Apenas artistas podem deletar imagens do portfolio', 403);
    }

    const artista = await prisma.artista.findUnique({
      where: { usuarioId: req.user.id }
    });

    if (!artista) {
      throw new AppError('Artista não encontrado', 404);
    }

    if (!artista.portfolio.includes(imageUrl)) {
      throw new AppError('Imagem não encontrada no portfolio', 404);
    }

    const publicId = extractPublicId(imageUrl);
    await deleteImage(publicId);

    const novoPortfolio = artista.portfolio.filter(url => url !== imageUrl);

    const artistaAtualizado = await prisma.artista.update({
      where: { id: artista.id },
      data: {
        portfolio: novoPortfolio
      }
    });

    res.json({
      message: 'Imagem removida do portfolio com sucesso',
      data: {
        portfolio: artistaAtualizado.portfolio,
        total: artistaAtualizado.portfolio.length
      }
    });
  } catch (error) {
    next(error);
  }
};

import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler.js';
import prisma from '../config/database.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar usuário no banco
    const user = await prisma.usuario.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        tipo: true,
        nome: true,
        status: true,
        artista: {
          select: {
            id: true,
            nomeArtistico: true,
            plano: true
          }
        },
        contratante: {
          select: {
            id: true
          }
        }
      }
    });

    if (!user) {
      throw new AppError('User not found', 401);
    }

    if (user.status !== 'ATIVO') {
      throw new AppError('User account is not active', 403);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const requireArtist = (req, res, next) => {
  if (req.user.tipo !== 'ARTISTA') {
    return next(new AppError('Access denied. Artists only.', 403));
  }
  next();
};

export const requireContratante = (req, res, next) => {
  if (req.user.tipo !== 'CONTRATANTE') {
    return next(new AppError('Access denied. Contratantes only.', 403));
  }
  next();
};

const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

const { User, Profissional } = require('../models');
const { AppError } = require('../middlewares/errorHandler');
const { cache } = require('../config/redis');
const logger = require('../utils/logger');

class UserController {
  static async getProfile(req, res, next) {
    try {
      const user = await User.findByPk(req.user.id, {
        include: [
          {
            model: Profissional,
            as: 'profissional',
            include: ['categoria']
          }
        ]
      });

      if (!user) {
        throw new AppError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
      }

      res.json({
        success: true,
        data: user.toJSON()
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Dados inválidos', 400, 'VALIDATION_ERROR');
      }

      const { nome, telefone, cpf_cnpj } = req.body;
      const userId = req.user.id;

      // Get current user
      const user = await User.findByPk(userId);
      if (!user) {
        throw new AppError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
      }

      // Check if CPF/CNPJ is being changed and if it's already in use
      if (cpf_cnpj && cpf_cnpj !== user.cpf_cnpj) {
        const existingUser = await User.findOne({
          where: {
            cpf_cnpj,
            id: { [User.sequelize.Sequelize.Op.ne]: userId }
          }
        });

        if (existingUser) {
          throw new AppError('Este CPF/CNPJ já está em uso', 400, 'DOCUMENT_ALREADY_EXISTS');
        }
      }

      // Update user
      await user.update({
        nome: nome || user.nome,
        telefone: telefone || user.telefone,
        cpf_cnpj: cpf_cnpj || user.cpf_cnpj
      });

      // Update cache
      await cache.set(`user_${user.id}`, user.toJSON(), 86400);

      logger.info(`User profile updated: ${user.id}`);

      res.json({
        success: true,
        message: 'Perfil atualizado com sucesso!',
        data: user.toJSON()
      });
    } catch (error) {
      next(error);
    }
  }

  static async uploadPhoto(req, res, next) {
    try {
      const userId = req.user.id;

      if (!req.file) {
        throw new AppError('Nenhuma foto foi enviada', 400, 'NO_FILE_UPLOADED');
      }

      const user = await User.findByPk(userId);
      if (!user) {
        throw new AppError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
      }

      // Delete old photo if exists
      if (user.foto_perfil_url) {
        const { uploadHelpers } = require('../config/cloudinary');
        const oldPublicId = uploadHelpers.extractPublicId(user.foto_perfil_url);
        if (oldPublicId) {
          await uploadHelpers.deleteFile(oldPublicId);
        }
      }

      // Update user with new photo URL
      await user.update({
        foto_perfil_url: req.file.path
      });

      // Update cache
      await cache.set(`user_${user.id}`, user.toJSON(), 86400);

      logger.info(`User photo uploaded: ${user.id}`);

      res.json({
        success: true,
        message: 'Foto de perfil atualizada com sucesso!',
        data: {
          foto_perfil_url: req.file.path
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async deletePhoto(req, res, next) {
    try {
      const userId = req.user.id;

      const user = await User.findByPk(userId);
      if (!user) {
        throw new AppError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
      }

      // Remove photo URL
      await user.update({ foto_perfil_url: null });

      // Delete photo from Cloudinary
      if (user.foto_perfil_url) {
        const { uploadHelpers } = require('../config/cloudinary');
        const publicId = uploadHelpers.extractPublicId(user.foto_perfil_url);
        if (publicId) {
          await uploadHelpers.deleteFile(publicId);
        }
      }

      // Update cache
      await cache.set(`user_${user.id}`, user.toJSON(), 86400);

      logger.info(`User photo deleted: ${user.id}`);

      res.json({
        success: true,
        message: 'Foto removida com sucesso!'
      });
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req, res, next) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Dados inválidos', 400, 'VALIDATION_ERROR');
      }

      const { senha_atual, nova_senha } = req.body;
      const userId = req.user.id;

      // Get current user
      const user = await User.findByPk(userId);
      if (!user) {
        throw new AppError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
      }

      // Verify current password
      const isValidPassword = await user.comparePassword(senha_atual);
      if (!isValidPassword) {
        throw new AppError('Senha atual incorreta', 400, 'INVALID_CURRENT_PASSWORD');
      }

      // Update password
      await user.update({ senha_hash: nova_senha }); // Will be hashed by model hook

      // Invalidate all existing tokens
      await cache.del(`user_${user.id}`);
      await cache.del(`refresh_${user.id}`);

      logger.info(`Password changed for user: ${user.id}`);

      res.json({
        success: true,
        message: 'Senha alterada com sucesso! Faça login novamente.'
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteAccount(req, res, next) {
    try {
      const userId = req.user.id;

      // Get user with related data
      const user = await User.findByPk(userId, {
        include: [
          {
            model: Profissional,
            as: 'profissional'
          }
        ]
      });

      if (!user) {
        throw new AppError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
      }

      // Check for active bookings
      const { Booking } = require('../models');
      const activeBookings = await Booking.count({
        where: {
          [Booking.sequelize.Sequelize.Op.or]: [
            { contratante_id: userId },
            { profissional_id: user.profissional?.id }
          ],
          status: {
            [Booking.sequelize.Sequelize.Op.in]: ['pendente', 'confirmado']
          }
        }
      });

      if (activeBookings > 0) {
        throw new AppError(
          'Não é possível excluir a conta com bookings ativos. Cancele ou conclua todos os bookings primeiro.',
          400,
          'ACTIVE_BOOKINGS_EXIST'
        );
      }

      // Soft delete: change status instead of deleting
      await user.update({
        status: 'banido',
        motivo_suspensao: 'Conta excluída pelo usuário',
        email: `deleted_${Date.now()}_${user.email}`,
        cpf_cnpj: user.cpf_cnpj ? `deleted_${Date.now()}_${user.cpf_cnpj}` : null
      });

      // Clear cache
      await cache.del(`user_${user.id}`);
      await cache.del(`refresh_${user.id}`);

      logger.info(`User account deleted: ${user.id}`);

      res.json({
        success: true,
        message: 'Conta excluída com sucesso!'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
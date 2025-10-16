const { validationResult } = require('express-validator');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const { User } = require('../models');
const { AppError } = require('../middlewares/errorHandler');
const { generateTokens, verifyRefreshToken } = require('../middlewares/auth');
const { cache } = require('../config/redis');
const logger = require('../utils/logger');

class AuthController {
  // Register new user
  static async register(req, res, next) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Dados inválidos', 400, 'VALIDATION_ERROR');
      }

      const { nome, email, senha, tipo, telefone, cpf_cnpj } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({
        where: { email }
      });

      if (existingUser) {
        throw new AppError('Este email já está em uso', 400, 'EMAIL_ALREADY_EXISTS');
      }

      // Check CPF/CNPJ if provided
      if (cpf_cnpj) {
        const existingDoc = await User.findOne({
          where: { cpf_cnpj }
        });

        if (existingDoc) {
          throw new AppError('Este CPF/CNPJ já está em uso', 400, 'DOCUMENT_ALREADY_EXISTS');
        }
      }

      // Create user
      const user = await User.create({
        nome,
        email,
        senha_hash: senha, // Will be hashed by model hook
        tipo,
        telefone,
        cpf_cnpj,
        email_verification_token: crypto.randomBytes(32).toString('hex')
      });

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user);

      // Cache user data
      await cache.set(`user_${user.id}`, user.toJSON(), 86400); // 24 hours

      // Store refresh token
      await cache.set(`refresh_${user.id}`, refreshToken, 30 * 24 * 60 * 60); // 30 days

      // TODO: Send verification email

      logger.info(`User registered: ${user.id} - ${user.email}`);

      res.status(201).json({
        success: true,
        message: 'Conta criada com sucesso! Verifique seu email.',
        data: {
          user: user.toJSON(),
          tokens: {
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_in: process.env.JWT_EXPIRES_IN || '7d'
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Login user
  static async login(req, res, next) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Dados inválidos', 400, 'VALIDATION_ERROR');
      }

      const { email, senha } = req.body;

      // Find user
      const user = await User.findOne({
        where: { email }
      });

      if (!user) {
        throw new AppError('Email ou senha incorretos', 401, 'INVALID_CREDENTIALS');
      }

      // Check password
      const isValidPassword = await user.comparePassword(senha);
      if (!isValidPassword) {
        throw new AppError('Email ou senha incorretos', 401, 'INVALID_CREDENTIALS');
      }

      // Check if user is suspended or banned
      if (user.status === 'suspenso') {
        const suspensionEnd = user.data_suspensao_ate;
        if (suspensionEnd && new Date() < suspensionEnd) {
          throw new AppError(
            `Conta suspensa até ${suspensionEnd.toLocaleDateString()}. Motivo: ${user.motivo_suspensao}`,
            403,
            'ACCOUNT_SUSPENDED'
          );
        }
      }

      if (user.status === 'banido') {
        throw new AppError('Conta banida. Entre em contato com o suporte.', 403, 'ACCOUNT_BANNED');
      }

      // Update last login
      await user.update({ ultimo_login: new Date() });

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user);

      // Cache user data
      await cache.set(`user_${user.id}`, user.toJSON(), 86400); // 24 hours

      // Store refresh token
      await cache.set(`refresh_${user.id}`, refreshToken, 30 * 24 * 60 * 60); // 30 days

      logger.info(`User logged in: ${user.id} - ${user.email}`);

      res.json({
        success: true,
        message: 'Login realizado com sucesso!',
        data: {
          user: user.toJSON(),
          tokens: {
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_in: process.env.JWT_EXPIRES_IN || '7d'
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Logout user
  static async logout(req, res, next) {
    try {
      const { user, token } = req;

      // Blacklist current token
      const decoded = jwt.decode(token);
      const ttl = decoded.exp - Math.floor(Date.now() / 1000);
      if (ttl > 0) {
        await cache.set(`blacklist_${token}`, true, ttl);
      }

      // Remove user from cache
      await cache.del(`user_${user.id}`);
      await cache.del(`refresh_${user.id}`);

      logger.info(`User logged out: ${user.id}`);

      res.json({
        success: true,
        message: 'Logout realizado com sucesso!'
      });
    } catch (error) {
      next(error);
    }
  }

  // Refresh access token
  static async refreshToken(req, res, next) {
    try {
      const { refresh_token } = req.body;

      if (!refresh_token) {
        throw new AppError('Refresh token é obrigatório', 400, 'REFRESH_TOKEN_REQUIRED');
      }

      // Verify refresh token
      const decoded = verifyRefreshToken(refresh_token);

      // Check if refresh token exists in cache
      const storedToken = await cache.get(`refresh_${decoded.id}`);
      if (!storedToken || storedToken !== refresh_token) {
        throw new AppError('Refresh token inválido', 401, 'INVALID_REFRESH_TOKEN');
      }

      // Get user
      const user = await User.findByPk(decoded.id);
      if (!user) {
        throw new AppError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
      }

      // Generate new tokens
      const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

      // Update cached refresh token
      await cache.set(`refresh_${user.id}`, newRefreshToken, 30 * 24 * 60 * 60);

      res.json({
        success: true,
        data: {
          access_token: accessToken,
          refresh_token: newRefreshToken,
          expires_in: process.env.JWT_EXPIRES_IN || '7d'
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Forgot password
  static async forgotPassword(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Email inválido', 400, 'VALIDATION_ERROR');
      }

      const { email } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        // Don't reveal if email exists or not
        return res.json({
          success: true,
          message: 'Se o email existir, você receberá um link para redefinir sua senha.'
        });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await user.update({
        reset_password_token: resetToken,
        reset_password_expires: resetExpires
      });

      // TODO: Send reset password email

      logger.info(`Password reset requested for user: ${user.id}`);

      res.json({
        success: true,
        message: 'Se o email existir, você receberá um link para redefinir sua senha.'
      });
    } catch (error) {
      next(error);
    }
  }

  // Reset password
  static async resetPassword(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Dados inválidos', 400, 'VALIDATION_ERROR');
      }

      const { token, senha } = req.body;

      const user = await User.findOne({
        where: {
          reset_password_token: token,
          reset_password_expires: {
            [User.sequelize.Sequelize.Op.gt]: new Date()
          }
        }
      });

      if (!user) {
        throw new AppError('Token inválido ou expirado', 400, 'INVALID_RESET_TOKEN');
      }

      // Update password and clear reset token
      await user.update({
        senha_hash: senha, // Will be hashed by model hook
        reset_password_token: null,
        reset_password_expires: null
      });

      // Invalidate all existing tokens
      await cache.del(`user_${user.id}`);
      await cache.del(`refresh_${user.id}`);

      logger.info(`Password reset completed for user: ${user.id}`);

      res.json({
        success: true,
        message: 'Senha redefinida com sucesso! Faça login com sua nova senha.'
      });
    } catch (error) {
      next(error);
    }
  }

  // Verify email
  static async verifyEmail(req, res, next) {
    try {
      const { token } = req.params;

      const user = await User.findOne({
        where: { email_verification_token: token }
      });

      if (!user) {
        throw new AppError('Token de verificação inválido', 400, 'INVALID_VERIFICATION_TOKEN');
      }

      await user.update({
        email_verified_at: new Date(),
        email_verification_token: null
      });

      logger.info(`Email verified for user: ${user.id}`);

      res.json({
        success: true,
        message: 'Email verificado com sucesso!'
      });
    } catch (error) {
      next(error);
    }
  }

  // Resend verification email
  static async resendVerification(req, res, next) {
    try {
      const { email } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.json({
          success: true,
          message: 'Se o email existir, um novo link de verificação será enviado.'
        });
      }

      if (user.email_verified_at) {
        return res.json({
          success: true,
          message: 'Este email já foi verificado.'
        });
      }

      // Generate new verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      await user.update({ email_verification_token: verificationToken });

      // TODO: Send verification email

      res.json({
        success: true,
        message: 'Novo link de verificação enviado!'
      });
    } catch (error) {
      next(error);
    }
  }

  // Get current user profile
  static async getProfile(req, res, next) {
    try {
      const user = await User.findByPk(req.user.id, {
        include: [
          {
            association: 'profissional',
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
}

module.exports = AuthController;
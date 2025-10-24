import prisma from '../config/database.js';
import { AppError } from './errorHandler.js';

/**
 * Anti-Circumvention Patterns
 * Detects attempts to share external contact information in messages
 * PRD Section 12.1 - Moderação e Anti-Circumvention
 */

// Regex patterns for detecting external contacts
const CONTACT_PATTERNS = {
  // Phone numbers: (11) 99999-9999, 11999999999, 11 99999 9999, etc
  PHONE: /(\(?\d{2}\)?\s?\d{4,5}[-\s]?\d{4})|(\d{10,11})/g,

  // Email addresses
  EMAIL: /([\w\.-]+@[\w\.-]+\.\w{2,})/gi,

  // Social media handles: @username, instagram.com/username, etc
  SOCIAL_HANDLE: /@[\w._]+|(?:instagram|twitter|facebook|tiktok|telegram)\.com\/[\w._]+/gi,

  // WhatsApp mentions
  WHATSAPP: /whats\s*app|zap|whats/gi,

  // Direct contact requests
  DIRECT_CONTACT: /fora\s+da\s+plataforma|contato\s+direto|me\s+liga|liga\s+pra\s+mim|manda\s+mensagem/gi,

  // URLs (with protocol or www)
  URL: /(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi
};

/**
 * Check if message contains external contact information
 * @param {String} message - Message content to check
 * @returns {Object} Detection result with matched patterns
 */
export const detectExternalContacts = (message) => {
  const violations = [];

  // Check for phone numbers
  const phoneMatches = message.match(CONTACT_PATTERNS.PHONE);
  if (phoneMatches && phoneMatches.length > 0) {
    violations.push({
      type: 'PHONE',
      pattern: 'Número de telefone detectado',
      matches: phoneMatches
    });
  }

  // Check for emails
  const emailMatches = message.match(CONTACT_PATTERNS.EMAIL);
  if (emailMatches && emailMatches.length > 0) {
    violations.push({
      type: 'EMAIL',
      pattern: 'Email detectado',
      matches: emailMatches
    });
  }

  // Check for social media
  const socialMatches = message.match(CONTACT_PATTERNS.SOCIAL_HANDLE);
  if (socialMatches && socialMatches.length > 0) {
    violations.push({
      type: 'SOCIAL_MEDIA',
      pattern: 'Rede social detectada',
      matches: socialMatches
    });
  }

  // Check for WhatsApp mentions
  const whatsappMatches = message.match(CONTACT_PATTERNS.WHATSAPP);
  if (whatsappMatches && whatsappMatches.length > 0) {
    violations.push({
      type: 'WHATSAPP',
      pattern: 'Menção ao WhatsApp detectada',
      matches: whatsappMatches
    });
  }

  // Check for direct contact requests
  const directContactMatches = message.match(CONTACT_PATTERNS.DIRECT_CONTACT);
  if (directContactMatches && directContactMatches.length > 0) {
    violations.push({
      type: 'DIRECT_CONTACT',
      pattern: 'Solicitação de contato direto detectada',
      matches: directContactMatches
    });
  }

  // Check for URLs
  const urlMatches = message.match(CONTACT_PATTERNS.URL);
  if (urlMatches && urlMatches.length > 0) {
    violations.push({
      type: 'URL',
      pattern: 'Link externo detectado',
      matches: urlMatches
    });
  }

  return {
    hasViolations: violations.length > 0,
    violations,
    violationCount: violations.length
  };
};

/**
 * Get user's violation history
 * @param {String} userId - User ID
 * @returns {Promise<Array>} Array of violations
 */
const getUserViolations = async (userId) => {
  return await prisma.infracao.findMany({
    where: {
      usuarioId: userId,
      tipo: 'CONTATO_EXTERNO'
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

/**
 * Determine action based on violation count
 * PRD Rules:
 * - 1st attempt: Warning
 * - 2nd attempt: 7-day suspension
 * - 3rd+ attempt: Permanent ban
 * @param {Number} violationCount - Number of previous violations
 * @returns {Object} Action details
 */
const determineAction = (violationCount) => {
  if (violationCount === 0) {
    return {
      action: 'AVISO',
      gravidade: 'LEVE',
      diasSuspensao: null,
      message: 'Primeira tentativa de compartilhar contato externo. Este é um aviso.'
    };
  } else if (violationCount === 1) {
    return {
      action: 'SUSPENSAO',
      gravidade: 'MEDIA',
      diasSuspensao: 7,
      message: 'Segunda tentativa de compartilhar contato externo. Conta suspensa por 7 dias.'
    };
  } else {
    return {
      action: 'BANIMENTO',
      gravidade: 'GRAVE',
      diasSuspensao: null,
      message: 'Terceira tentativa de compartilhar contato externo. Conta banida permanentemente.'
    };
  }
};

/**
 * Middleware to check messages for external contact violations
 * Should be applied to message sending endpoints
 */
export const moderateMessage = async (req, res, next) => {
  try {
    const { conteudo } = req.body;
    const userId = req.user.id;

    // Skip moderation for system messages
    if (req.body.tipo === 'SISTEMA') {
      return next();
    }

    // Check message for violations
    const detection = detectExternalContacts(conteudo);

    if (detection.hasViolations) {
      // Get user's violation history
      const previousViolations = await getUserViolations(userId);
      const violationCount = previousViolations.length;

      // Determine action
      const actionDetails = determineAction(violationCount);

      // Create infraction record
      await prisma.infracao.create({
        data: {
          usuarioId: userId,
          tipo: 'CONTATO_EXTERNO',
          gravidade: actionDetails.gravidade,
          descricao: `Tentativa de compartilhar informações de contato externo: ${detection.violations.map(v => v.type).join(', ')}`,
          conteudoOriginal: conteudo,
          bookingId: req.body.bookingId || req.params.bookingId || null,
          acaoTomada: actionDetails.action,
          diasSuspensao: actionDetails.diasSuspensao
        }
      });

      // Update user status if needed
      if (actionDetails.action === 'SUSPENSAO') {
        await prisma.usuario.update({
          where: { id: userId },
          data: { status: 'SUSPENSO' }
        });
      } else if (actionDetails.action === 'BANIMENTO') {
        await prisma.usuario.update({
          where: { id: userId },
          data: { status: 'BANIDO' }
        });
      }

      // Block the message and return error
      throw new AppError(
        `Mensagem bloqueada: ${actionDetails.message} Não é permitido compartilhar informações de contato fora da plataforma.`,
        403
      );
    }

    // Message is clean, proceed
    next();

  } catch (error) {
    next(error);
  }
};

/**
 * Check if user is allowed to send messages
 * Checks if user is suspended or banned
 */
export const checkUserCanSendMessage = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await prisma.usuario.findUnique({
      where: { id: userId },
      select: { status: true }
    });

    if (user.status === 'BANIDO') {
      throw new AppError('Sua conta foi banida e você não pode enviar mensagens.', 403);
    }

    if (user.status === 'SUSPENSO') {
      // Check if suspension has expired
      const lastSuspension = await prisma.infracao.findFirst({
        where: {
          usuarioId: userId,
          acaoTomada: 'SUSPENSAO'
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      if (lastSuspension && lastSuspension.diasSuspensao) {
        const suspensionEnd = new Date(lastSuspension.createdAt);
        suspensionEnd.setDate(suspensionEnd.getDate() + lastSuspension.diasSuspensao);

        if (new Date() < suspensionEnd) {
          const daysRemaining = Math.ceil((suspensionEnd - new Date()) / (1000 * 60 * 60 * 24));
          throw new AppError(`Sua conta está suspensa por mais ${daysRemaining} dias.`, 403);
        } else {
          // Suspension expired, reactivate account
          await prisma.usuario.update({
            where: { id: userId },
            data: { status: 'ATIVO' }
          });
        }
      }
    }

    next();

  } catch (error) {
    next(error);
  }
};

export default {
  detectExternalContacts,
  moderateMessage,
  checkUserCanSendMessage
};

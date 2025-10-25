import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /notifications/token - Salvar/atualizar token do dispositivo
export const saveDeviceToken = async (req, res) => {
  try {
    const { token, platform } = req.body;
    const usuarioId = req.user.id;

    if (!token) {
      return res.status(400).json({ error: 'Token é obrigatório' });
    }

    if (!platform || !['ios', 'android', 'web'].includes(platform)) {
      return res.status(400).json({ error: 'Platform inválida. Use: ios, android ou web' });
    }

    // Verificar se o token já existe para este usuário
    const existingToken = await prisma.deviceToken.findFirst({
      where: {
        usuarioId,
        token,
      },
    });

    if (existingToken) {
      // Atualizar data de última atualização
      const updated = await prisma.deviceToken.update({
        where: { id: existingToken.id },
        data: {
          platform,
          updatedAt: new Date(),
        },
      });

      return res.json({
        message: 'Token atualizado com sucesso',
        data: updated,
      });
    }

    // Criar novo token
    const deviceToken = await prisma.deviceToken.create({
      data: {
        usuarioId,
        token,
        platform,
      },
    });

    res.status(201).json({
      message: 'Token salvo com sucesso',
      data: deviceToken,
    });
  } catch (error) {
    console.error('Erro ao salvar token:', error);
    res.status(500).json({ error: 'Erro ao salvar token do dispositivo' });
  }
};

// DELETE /notifications/token - Remover token do dispositivo (logout)
export const removeDeviceToken = async (req, res) => {
  try {
    const { token } = req.body;
    const usuarioId = req.user.id;

    if (!token) {
      return res.status(400).json({ error: 'Token é obrigatório' });
    }

    await prisma.deviceToken.deleteMany({
      where: {
        usuarioId,
        token,
      },
    });

    res.json({ message: 'Token removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover token:', error);
    res.status(500).json({ error: 'Erro ao remover token do dispositivo' });
  }
};

// GET /notifications/tokens - Listar tokens do usuário (para debug)
export const getUserTokens = async (req, res) => {
  try {
    const usuarioId = req.user.id;

    const tokens = await prisma.deviceToken.findMany({
      where: { usuarioId },
      select: {
        id: true,
        platform: true,
        createdAt: true,
        updatedAt: true,
        // Não retornar o token completo por segurança
      },
    });

    res.json({
      data: tokens,
      total: tokens.length,
    });
  } catch (error) {
    console.error('Erro ao listar tokens:', error);
    res.status(500).json({ error: 'Erro ao listar tokens' });
  }
};

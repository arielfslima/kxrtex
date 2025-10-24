import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /admin/dashboard - Dashboard com métricas principais
export const getDashboard = async (req, res) => {
  try {
    const { periodo = 'mes' } = req.query; // hoje, semana, mes, ano

    // Define intervalo de datas
    let dataInicio, dataFim;
    const now = new Date();

    switch (periodo) {
      case 'hoje':
        dataInicio = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        dataFim = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case 'semana':
        const dayOfWeek = now.getDay();
        dataInicio = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
        dataFim = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (7 - dayOfWeek));
        break;
      case 'mes':
        dataInicio = new Date(now.getFullYear(), now.getMonth(), 1);
        dataFim = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      case 'ano':
        dataInicio = new Date(now.getFullYear(), 0, 1);
        dataFim = new Date(now.getFullYear() + 1, 0, 1);
        break;
      default:
        dataInicio = new Date(now.getFullYear(), now.getMonth(), 1);
        dataFim = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }

    // USUÁRIOS
    const [totalUsuarios, usuariosAtivos, novosUsuarios, totalArtistas, totalContratantes, artistasVerificados] = await Promise.all([
      prisma.usuario.count(),
      prisma.usuario.count({
        where: {
          updatedAt: {
            gte: dataInicio,
            lt: dataFim,
          },
        },
      }),
      prisma.usuario.count({
        where: {
          createdAt: {
            gte: dataInicio,
            lt: dataFim,
          },
        },
      }),
      prisma.usuario.count({
        where: { tipo: 'ARTISTA' },
      }),
      prisma.usuario.count({
        where: { tipo: 'CONTRATANTE' },
      }),
      prisma.artista.count({
        where: { statusVerificacao: 'VERIFICADO' },
      }),
    ]);

    // BOOKINGS
    const bookings = await prisma.booking.groupBy({
      by: ['status'],
      where: {
        createdAt: {
          gte: dataInicio,
          lt: dataFim,
        },
      },
      _count: true,
    });

    const bookingsStats = {
      total: bookings.reduce((acc, b) => acc + b._count, 0),
      pendentes: bookings.find((b) => b.status === 'PENDENTE')?._count || 0,
      aceitos: bookings.find((b) => b.status === 'ACEITO')?._count || 0,
      confirmados: bookings.find((b) => b.status === 'CONFIRMADO')?._count || 0,
      emAndamento: bookings.find((b) => b.status === 'EM_ANDAMENTO')?._count || 0,
      concluidos: bookings.find((b) => b.status === 'CONCLUIDO')?._count || 0,
      cancelados: bookings.find((b) => b.status === 'CANCELADO')?._count || 0,
    };

    // Valor médio e GMV de bookings
    const bookingsFinanceiro = await prisma.booking.aggregate({
      where: {
        createdAt: {
          gte: dataInicio,
          lt: dataFim,
        },
        status: {
          in: ['CONFIRMADO', 'EM_ANDAMENTO', 'CONCLUIDO'],
        },
      },
      _avg: {
        valorTotal: true,
      },
      _sum: {
        valorTotal: true,
        taxaPlataforma: true,
      },
    });

    // PAGAMENTOS
    const pagamentosStats = await prisma.transacao.groupBy({
      by: ['status'],
      where: {
        createdAt: {
          gte: dataInicio,
          lt: dataFim,
        },
      },
      _count: true,
      _sum: {
        valor: true,
      },
    });

    const receitaTotal = pagamentosStats
      .filter((p) => p.status === 'CONFIRMED' || p.status === 'RECEIVED')
      .reduce((acc, p) => acc + (p._sum.valor || 0), 0);

    // PLANOS (assinaturas)
    const planos = await prisma.artista.groupBy({
      by: ['plano'],
      _count: true,
    });

    const receitaAssinaturas = planos.reduce((acc, p) => {
      if (p.plano === 'PLUS') return acc + p._count * 49;
      if (p.plano === 'PRO') return acc + p._count * 99;
      return acc;
    }, 0);

    // RESPOSTA
    res.json({
      periodo,
      dataInicio,
      dataFim,
      usuarios: {
        total: totalUsuarios,
        ativos: usuariosAtivos,
        novos: novosUsuarios,
        artistas: totalArtistas,
        contratantes: totalContratantes,
        artistasVerificados,
      },
      bookings: {
        ...bookingsStats,
        ticketMedio: bookingsFinanceiro._avg.valorTotal || 0,
        gmv: bookingsFinanceiro._sum.valorTotal || 0,
      },
      financeiro: {
        receitaBookings: bookingsFinanceiro._sum.taxaPlataforma || 0,
        receitaAssinaturas,
        receitaTotal: (bookingsFinanceiro._sum.taxaPlataforma || 0) + receitaAssinaturas,
      },
      planos: {
        free: planos.find((p) => p.plano === 'FREE')?._count || 0,
        plus: planos.find((p) => p.plano === 'PLUS')?._count || 0,
        pro: planos.find((p) => p.plano === 'PRO')?._count || 0,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar dashboard:', error);
    res.status(500).json({ error: 'Erro ao buscar métricas do dashboard' });
  }
};

// GET /admin/usuarios - Listar todos os usuários com filtros
export const getUsuarios = async (req, res) => {
  try {
    const { tipo, status, page = 1, limit = 20, busca } = req.query;

    const where = {};

    if (tipo) where.tipo = tipo;
    if (status) where.status = status;
    if (busca) {
      where.OR = [
        { nome: { contains: busca, mode: 'insensitive' } },
        { email: { contains: busca, mode: 'insensitive' } },
      ];
    }

    const [usuarios, total] = await Promise.all([
      prisma.usuario.findMany({
        where,
        include: {
          artista: {
            select: {
              nomeArtistico: true,
              categoria: true,
              plano: true,
              statusVerificacao: true,
              notaMedia: true,
            },
          },
          contratante: {
            select: {
              tipoPessoa: true,
            },
          },
          _count: {
            select: {
              infracoes: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
      }),
      prisma.usuario.count({ where }),
    ]);

    res.json({
      data: usuarios,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ error: 'Erro ao listar usuários' });
  }
};

// PUT /admin/usuarios/:id/status - Alterar status do usuário (banir/desbanir)
export const updateUsuarioStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, motivo } = req.body;

    if (!['ATIVO', 'SUSPENSO', 'BANIDO'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

    const usuario = await prisma.usuario.update({
      where: { id },
      data: { status },
      include: {
        artista: true,
        contratante: true,
      },
    });

    // Registrar infração se for suspensão ou banimento
    if (status === 'SUSPENSO' || status === 'BANIDO') {
      await prisma.infracao.create({
        data: {
          usuarioId: id,
          tipo: status === 'BANIDO' ? 'BANIMENTO' : 'SUSPENSAO',
          descricao: motivo || `Usuário ${status.toLowerCase()} por admin`,
          gravidade: status === 'BANIDO' ? 'GRAVE' : 'MEDIA',
        },
      });
    }

    res.json({
      message: `Usuário ${status.toLowerCase()} com sucesso`,
      data: usuario,
    });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ error: 'Erro ao atualizar status do usuário' });
  }
};

// PUT /admin/artistas/:id/verificar - Verificar artista
export const verificarArtista = async (req, res) => {
  try {
    const { id } = req.params;

    const artista = await prisma.artista.update({
      where: { id },
      data: {
        statusVerificacao: 'VERIFICADO',
      },
      include: {
        usuario: true,
      },
    });

    res.json({
      message: 'Artista verificado com sucesso',
      data: artista,
    });
  } catch (error) {
    console.error('Erro ao verificar artista:', error);
    res.status(500).json({ error: 'Erro ao verificar artista' });
  }
};

// GET /admin/bookings - Listar todos os bookings
export const getBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, dataInicio, dataFim } = req.query;

    const where = {};

    if (status) where.status = status;
    if (dataInicio && dataFim) {
      where.dataEvento = {
        gte: new Date(dataInicio),
        lte: new Date(dataFim),
      };
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          artista: {
            include: {
              usuario: {
                select: {
                  nome: true,
                  email: true,
                  foto: true,
                },
              },
            },
          },
          contratante: {
            include: {
              usuario: {
                select: {
                  nome: true,
                  email: true,
                  foto: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
      }),
      prisma.booking.count({ where }),
    ]);

    res.json({
      data: bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Erro ao listar bookings:', error);
    res.status(500).json({ error: 'Erro ao listar bookings' });
  }
};

// GET /admin/infracoes - Listar infrações
export const getInfracoes = async (req, res) => {
  try {
    const { usuarioId, gravidade, page = 1, limit = 20 } = req.query;

    const where = {};

    if (usuarioId) where.usuarioId = usuarioId;
    if (gravidade) where.gravidade = gravidade;

    const [infracoes, total] = await Promise.all([
      prisma.infracao.findMany({
        where,
        include: {
          usuario: {
            select: {
              nome: true,
              email: true,
              foto: true,
              tipo: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
      }),
      prisma.infracao.count({ where }),
    ]);

    res.json({
      data: infracoes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Erro ao listar infrações:', error);
    res.status(500).json({ error: 'Erro ao listar infrações' });
  }
};

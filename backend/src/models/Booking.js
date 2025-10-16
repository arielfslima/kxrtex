const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Booking extends Model {
  // Instance methods
  isExpired() {
    if (this.status !== 'pendente') return false;
    const now = new Date();
    const expireDate = new Date(this.expira_em);
    return now > expireDate;
  }

  canCancel() {
    const now = new Date();
    const eventDate = new Date(this.data_evento);
    const hoursUntilEvent = (eventDate - now) / (1000 * 60 * 60);

    return this.status === 'confirmado' && hoursUntilEvent > 24;
  }

  canRequestAdvance() {
    return (
      this.status === 'confirmado' &&
      this.valor_booking >= 500 &&
      this.cidade_evento !== this.contratante_cidade // Different city
    );
  }

  calculatePlatformFee(profissionalPlano) {
    switch (profissionalPlano) {
      case 'pro': return this.valor_booking * 0.07;
      case 'plus': return this.valor_booking * 0.10;
      default: return this.valor_booking * 0.15;
    }
  }

  getStatusColor() {
    const colors = {
      'pendente': '#FFA500',
      'confirmado': '#4CAF50',
      'cancelado': '#F44336',
      'rejeitado': '#757575',
      'concluido': '#2196F3',
      'em_disputa': '#FF5722'
    };
    return colors[this.status] || '#757575';
  }
}

Booking.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  contratante_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  profissional_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'profissionais',
      key: 'id'
    }
  },
  titulo_evento: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  descricao_evento: {
    type: DataTypes.TEXT
  },
  tipo_evento: {
    type: DataTypes.ENUM('festa', 'casamento', 'aniversario', 'corporativo', 'rave', 'clube', 'bar', 'outro'),
    allowNull: false
  },
  data_evento: {
    type: DataTypes.DATE,
    allowNull: false
  },
  horario_inicio: {
    type: DataTypes.TIME,
    allowNull: false
  },
  horario_fim: {
    type: DataTypes.TIME,
    allowNull: false
  },
  endereco_evento: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  cidade_evento: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  estado_evento: {
    type: DataTypes.STRING(2),
    allowNull: false
  },
  valor_booking: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: {
        args: [50],
        msg: 'Valor mínimo é R$ 50'
      }
    }
  },
  valor_original: {
    type: DataTypes.DECIMAL(10, 2),
    comment: 'Valor inicial da proposta antes de contra-propostas'
  },
  horas_evento: {
    type: DataTypes.DECIMAL(3, 1),
    allowNull: false,
    validate: {
      min: {
        args: [1],
        msg: 'Duração mínima é 1 hora'
      }
    }
  },
  status: {
    type: DataTypes.ENUM('pendente', 'confirmado', 'cancelado', 'rejeitado', 'concluido', 'em_disputa'),
    defaultValue: 'pendente'
  },
  mensagem_contratante: {
    type: DataTypes.TEXT
  },
  equipamento_fornecido: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  descricao_equipamento: {
    type: DataTypes.TEXT
  },
  numero_convidados: {
    type: DataTypes.INTEGER,
    validate: {
      min: 1
    }
  },
  expira_em: {
    type: DataTypes.DATE,
    allowNull: false
  },
  respondido_em: {
    type: DataTypes.DATE
  },
  confirmado_em: {
    type: DataTypes.DATE
  },
  cancelado_em: {
    type: DataTypes.DATE
  },
  motivo_cancelamento: {
    type: DataTypes.TEXT
  },
  quem_cancelou: {
    type: DataTypes.ENUM('contratante', 'artista', 'admin')
  },
  taxa_cancelamento: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0
  },
  concluido_em: {
    type: DataTypes.DATE
  },
  checkin_artista_em: {
    type: DataTypes.DATE
  },
  checkin_lat: {
    type: DataTypes.DECIMAL(10, 8)
  },
  checkin_lng: {
    type: DataTypes.DECIMAL(11, 8)
  },
  checkout_artista_em: {
    type: DataTypes.DATE
  },
  requer_adiantamento: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  percentual_adiantamento: {
    type: DataTypes.INTEGER,
    validate: {
      min: 10,
      max: 40
    }
  },
  motivo_adiantamento: {
    type: DataTypes.TEXT
  },
  observacoes_internas: {
    type: DataTypes.TEXT
  }
}, {
  sequelize,
  modelName: 'Booking',
  tableName: 'bookings',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: (booking) => {
      // Set expiration date (48 hours from creation)
      if (!booking.expira_em) {
        booking.expira_em = new Date(Date.now() + 48 * 60 * 60 * 1000);
      }

      // Store original value
      if (!booking.valor_original) {
        booking.valor_original = booking.valor_booking;
      }
    }
  }
});

module.exports = Booking;
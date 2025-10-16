const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Profissional extends Model {
  // Instance methods
  isEligibleForAdvance(bookingValue, isDifferentCity) {
    return (
      this.total_bookings >= 3 &&
      this.avaliacao_media >= 4.0 &&
      bookingValue >= 500 &&
      isDifferentCity
    );
  }

  calculateAdvanceScore() {
    let score = 50; // Base score

    // Add score based on completed bookings
    score += Math.min(this.total_bookings * 2, 20);

    // Add score based on rating
    if (this.avaliacao_media >= 4.5) score += 15;
    else if (this.avaliacao_media >= 4.0) score += 10;
    else if (this.avaliacao_media >= 3.5) score += 5;

    // Subtract score based on cancellation rate
    if (this.taxa_cancelamento > 10) score -= 15;
    else if (this.taxa_cancelamento > 5) score -= 10;
    else if (this.taxa_cancelamento > 2) score -= 5;

    // Add score for verified account
    if (this.verificado) score += 10;

    // Add score based on plan
    if (this.plano === 'pro') score += 10;
    else if (this.plano === 'plus') score += 5;

    return Math.min(Math.max(score, 0), 100); // Keep between 0-100
  }

  getTaxaPlataforma() {
    switch (this.plano) {
      case 'pro': return 0.07;
      case 'plus': return 0.10;
      default: return 0.15;
    }
  }
}

Profissional.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  usuario_id: {
    type: DataTypes.UUID,
    unique: true,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  nome_artistico: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Nome artístico é obrigatório'
      },
      len: {
        args: [2, 100],
        msg: 'Nome artístico deve ter entre 2 e 100 caracteres'
      }
    }
  },
  categoria_id: {
    type: DataTypes.UUID,
    references: {
      model: 'categorias',
      key: 'id'
    }
  },
  bio: {
    type: DataTypes.TEXT,
    validate: {
      len: {
        args: [50, 2000],
        msg: 'Bio deve ter entre 50 e 2000 caracteres'
      }
    }
  },
  video_apresentacao_url: {
    type: DataTypes.TEXT
  },
  valor_base_hora: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: {
        args: [50],
        msg: 'Valor mínimo por hora é R$ 50'
      }
    }
  },
  valor_base_minimo: {
    type: DataTypes.DECIMAL(10, 2),
    validate: {
      min: {
        args: [50],
        msg: 'Valor mínimo é R$ 50'
      }
    }
  },
  valor_base_maximo: {
    type: DataTypes.DECIMAL(10, 2)
  },
  cidades_atuacao: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  plano: {
    type: DataTypes.ENUM('free', 'plus', 'pro'),
    defaultValue: 'free'
  },
  data_assinatura: {
    type: DataTypes.DATE
  },
  data_proxima_cobranca: {
    type: DataTypes.DATE
  },
  avaliacao_media: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0,
    validate: {
      min: 0,
      max: 5
    }
  },
  total_avaliacoes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  total_bookings: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  taxa_cancelamento: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  tempo_medio_resposta: {
    type: DataTypes.INTEGER, // em minutos
    comment: 'Tempo médio de resposta em minutos'
  },
  ultima_alteracao_preco: {
    type: DataTypes.DATE
  },
  perfil_completo_percentual: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  total_seguidores: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  instagram_url: {
    type: DataTypes.STRING
  },
  tiktok_url: {
    type: DataTypes.STRING
  },
  youtube_url: {
    type: DataTypes.STRING
  },
  spotify_url: {
    type: DataTypes.STRING
  },
  soundcloud_url: {
    type: DataTypes.STRING
  },
  website_url: {
    type: DataTypes.STRING
  },
  presskit_url: {
    type: DataTypes.TEXT
  },
  aceita_eventos_privados: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  aceita_eventos_corporativos: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  aceita_eventos_outras_cidades: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  equipamento_proprio: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  descricao_equipamento: {
    type: DataTypes.TEXT
  }
}, {
  sequelize,
  modelName: 'Profissional',
  tableName: 'profissionais',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeUpdate: async (profissional) => {
      // Update profile completion percentage
      let completed = 0;
      const fields = [
        'nome_artistico', 'bio', 'categoria_id', 'valor_base_hora',
        'cidades_atuacao', 'instagram_url', 'foto_perfil_url'
      ];

      fields.forEach(field => {
        if (profissional[field]) completed += 14.3; // 100 / 7 fields
      });

      profissional.perfil_completo_percentual = Math.round(completed);
    }
  }
});

module.exports = Profissional;
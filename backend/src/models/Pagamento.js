const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Pagamento extends Model {}

Pagamento.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  booking_id: {
    type: DataTypes.UUID,
    unique: true,
    allowNull: false,
    references: {
      model: 'bookings',
      key: 'id'
    }
  },
  valor_total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  valor_artista: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  taxa_plataforma: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pendente', 'processando', 'aprovado', 'rejeitado', 'estornado', 'liberado'),
    defaultValue: 'pendente'
  },
  metodo_pagamento: {
    type: DataTypes.ENUM('pix', 'cartao_credito', 'boleto'),
    allowNull: false
  },
  parcelas: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: {
      min: 1,
      max: 12
    }
  },
  asaas_payment_id: {
    type: DataTypes.STRING(100)
  },
  asaas_invoice_url: {
    type: DataTypes.TEXT
  },
  pix_qrcode: {
    type: DataTypes.TEXT
  },
  pix_qrcode_image_url: {
    type: DataTypes.TEXT
  },
  pix_payload: {
    type: DataTypes.TEXT
  },
  pix_expira_em: {
    type: DataTypes.DATE
  },
  pago_em: {
    type: DataTypes.DATE
  },
  valor_pago: {
    type: DataTypes.DECIMAL(10, 2)
  },
  liberado_em: {
    type: DataTypes.DATE
  },
  estornado_em: {
    type: DataTypes.DATE
  },
  valor_estornado: {
    type: DataTypes.DECIMAL(10, 2)
  },
  motivo_estorno: {
    type: DataTypes.TEXT
  },
  webhook_events: {
    type: DataTypes.JSONB,
    defaultValue: []
  }
}, {
  sequelize,
  modelName: 'Pagamento',
  tableName: 'pagamentos',
  timestamps: true,
  underscored: true
});

module.exports = Pagamento;
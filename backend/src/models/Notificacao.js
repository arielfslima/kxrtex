const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Notificacao extends Model {}

Notificacao.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  usuario_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  tipo: {
    type: DataTypes.ENUM(
      'booking_solicitado',
      'booking_aceito',
      'booking_rejeitado',
      'booking_cancelado',
      'pagamento_aprovado',
      'pagamento_rejeitado',
      'nova_mensagem',
      'avaliacao_recebida',
      'sistema'
    ),
    allowNull: false
  },
  titulo: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  mensagem: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  dados_contexto: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  lida: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  enviado_email: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  enviado_push: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  lida_em: {
    type: DataTypes.DATE
  }
}, {
  sequelize,
  modelName: 'Notificacao',
  tableName: 'notificacoes',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['usuario_id', 'lida']
    },
    {
      fields: ['usuario_id', 'created_at']
    },
    {
      fields: ['tipo']
    }
  ]
});

module.exports = Notificacao;
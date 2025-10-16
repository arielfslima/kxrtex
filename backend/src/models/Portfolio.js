const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Portfolio extends Model {}

Portfolio.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  profissional_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'profissionais',
      key: 'id'
    }
  },
  tipo: {
    type: DataTypes.ENUM('foto', 'video', 'audio', 'presskit'),
    allowNull: false
  },
  titulo: {
    type: DataTypes.STRING(200)
  },
  descricao: {
    type: DataTypes.TEXT
  },
  arquivo_url: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  arquivo_nome: {
    type: DataTypes.STRING(255)
  },
  arquivo_tamanho: {
    type: DataTypes.INTEGER
  },
  thumbnail_url: {
    type: DataTypes.TEXT
  },
  ordem: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  sequelize,
  modelName: 'Portfolio',
  tableName: 'portfolio',
  timestamps: true,
  underscored: true
});

module.exports = Portfolio;
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Categoria extends Model {}

Categoria.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nome: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  slug: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  icone: {
    type: DataTypes.STRING(50)
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
  modelName: 'Categoria',
  tableName: 'categorias',
  timestamps: true,
  underscored: true
});

module.exports = Categoria;
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Subcategoria extends Model {}

Subcategoria.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  categoria_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'categorias',
      key: 'id'
    }
  },
  nome: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING(50),
    allowNull: false
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
  modelName: 'Subcategoria',
  tableName: 'subcategorias',
  timestamps: true,
  underscored: true
});

module.exports = Subcategoria;
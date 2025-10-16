const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

class User extends Model {
  // Instance methods
  async comparePassword(password) {
    return bcrypt.compare(password, this.senha_hash);
  }

  toJSON() {
    const values = Object.assign({}, this.get());
    delete values.senha_hash;
    return values;
  }

  // Class methods
  static async hashPassword(password) {
    return bcrypt.hash(password, 10);
  }
}

User.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nome: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Nome é obrigatório'
      },
      len: {
        args: [3, 100],
        msg: 'Nome deve ter entre 3 e 100 caracteres'
      }
    }
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: {
        msg: 'Email inválido'
      },
      notEmpty: {
        msg: 'Email é obrigatório'
      }
    }
  },
  senha_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  telefone: {
    type: DataTypes.STRING(20),
    validate: {
      is: {
        args: /^[0-9+\-() ]+$/,
        msg: 'Telefone inválido'
      }
    }
  },
  tipo: {
    type: DataTypes.ENUM('contratante', 'artista', 'admin'),
    allowNull: false,
    defaultValue: 'contratante'
  },
  foto_perfil_url: {
    type: DataTypes.TEXT
  },
  cpf_cnpj: {
    type: DataTypes.STRING(18),
    unique: true,
    validate: {
      is: {
        args: /^[0-9.\-/]+$/,
        msg: 'CPF/CNPJ inválido'
      }
    }
  },
  documento_verificado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  verificado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  status: {
    type: DataTypes.ENUM('ativo', 'suspenso', 'banido'),
    defaultValue: 'ativo'
  },
  motivo_suspensao: {
    type: DataTypes.TEXT
  },
  data_suspensao_ate: {
    type: DataTypes.DATE
  },
  score_confiabilidade: {
    type: DataTypes.INTEGER,
    defaultValue: 50,
    validate: {
      min: 0,
      max: 100
    }
  },
  ultimo_login: {
    type: DataTypes.DATE
  },
  reset_password_token: {
    type: DataTypes.STRING
  },
  reset_password_expires: {
    type: DataTypes.DATE
  },
  email_verification_token: {
    type: DataTypes.STRING
  },
  email_verified_at: {
    type: DataTypes.DATE
  }
}, {
  sequelize,
  modelName: 'User',
  tableName: 'usuarios',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.senha_hash && !user.senha_hash.startsWith('$2')) {
        user.senha_hash = await User.hashPassword(user.senha_hash);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('senha_hash') && !user.senha_hash.startsWith('$2')) {
        user.senha_hash = await User.hashPassword(user.senha_hash);
      }
    }
  }
});

module.exports = User;
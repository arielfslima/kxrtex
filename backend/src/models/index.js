const sequelize = require('../config/database');

// Import models
const User = require('./User');
const Profissional = require('./Profissional');
const Categoria = require('./Categoria');
const Subcategoria = require('./Subcategoria');
const Booking = require('./Booking');
const Portfolio = require('./Portfolio');
const Pagamento = require('./Pagamento');
const Notificacao = require('./Notificacao');

// Define associations
// User associations
User.hasOne(Profissional, {
  foreignKey: 'usuario_id',
  as: 'profissional'
});

User.hasMany(Booking, {
  foreignKey: 'contratante_id',
  as: 'bookings_contratante'
});

// Profissional associations
Profissional.belongsTo(User, {
  foreignKey: 'usuario_id',
  as: 'usuario'
});

Profissional.belongsTo(Categoria, {
  foreignKey: 'categoria_id',
  as: 'categoria'
});

Profissional.hasMany(Booking, {
  foreignKey: 'profissional_id',
  as: 'bookings'
});

Profissional.hasMany(Portfolio, {
  foreignKey: 'profissional_id',
  as: 'portfolio'
});

// Categoria associations
Categoria.hasMany(Subcategoria, {
  foreignKey: 'categoria_id',
  as: 'subcategorias'
});

Categoria.hasMany(Profissional, {
  foreignKey: 'categoria_id',
  as: 'profissionais'
});

// Subcategoria associations
Subcategoria.belongsTo(Categoria, {
  foreignKey: 'categoria_id',
  as: 'categoria'
});

// Booking associations
Booking.belongsTo(User, {
  foreignKey: 'contratante_id',
  as: 'contratante'
});

Booking.belongsTo(Profissional, {
  foreignKey: 'profissional_id',
  as: 'profissional'
});

// Portfolio associations
Portfolio.belongsTo(Profissional, {
  foreignKey: 'profissional_id',
  as: 'profissional'
});

// Pagamento associations
Pagamento.belongsTo(Booking, {
  foreignKey: 'booking_id',
  as: 'booking'
});

Booking.hasOne(Pagamento, {
  foreignKey: 'booking_id',
  as: 'pagamento'
});

// Notificacao associations
Notificacao.belongsTo(User, {
  foreignKey: 'usuario_id',
  as: 'usuario'
});

User.hasMany(Notificacao, {
  foreignKey: 'usuario_id',
  as: 'notificacoes'
});

// Export models
module.exports = {
  sequelize,
  User,
  Profissional,
  Categoria,
  Subcategoria,
  Booking,
  Portfolio,
  Pagamento,
  Notificacao
};
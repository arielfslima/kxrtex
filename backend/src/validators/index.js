// Export all validators from a central location
const authValidators = require('./authValidators');
const bookingValidators = require('./bookingValidators');
const userValidators = require('./userValidators');
const paymentValidators = require('./paymentValidators');

module.exports = {
  // Auth validators
  ...authValidators,

  // Booking validators
  ...bookingValidators,

  // User validators
  ...userValidators,

  // Payment validators
  ...paymentValidators
};
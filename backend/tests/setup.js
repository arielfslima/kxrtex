require('dotenv').config({ path: '.env.test' });

const { sequelize } = require('../src/models');
const redisClient = require('../src/config/redis');

// Global test setup
beforeAll(async () => {
  // Connect to test database
  try {
    await sequelize.authenticate();
    console.log('Test database connection established');
  } catch (error) {
    console.error('Unable to connect to test database:', error);
    process.exit(1);
  }

  // Sync database (create tables)
  await sequelize.sync({ force: true });
  console.log('Test database synced');

  // Clear Redis cache
  if (redisClient.flushdb) {
    await redisClient.flushdb();
  }
});

// Global test teardown
afterAll(async () => {
  // Close database connection
  await sequelize.close();

  // Close Redis connection
  if (redisClient.quit) {
    await redisClient.quit();
  }

  console.log('Test cleanup completed');
});

// Clean up between tests
beforeEach(async () => {
  // Clear all tables
  await sequelize.truncate({ cascade: true, restartIdentity: true });

  // Clear Redis cache
  if (redisClient.flushdb) {
    await redisClient.flushdb();
  }
});

// Suppress console logs in tests unless needed
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeEach(() => {
  if (process.env.TEST_VERBOSE !== 'true') {
    console.log = jest.fn();
    console.error = jest.fn();
    console.warn = jest.fn();
  }
});

afterEach(() => {
  if (process.env.TEST_VERBOSE !== 'true') {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  }
});

// Global test utilities
global.testUtils = {
  // Helper to create test user
  createTestUser: async (overrides = {}) => {
    const { User } = require('../src/models');
    const defaultUser = {
      nome: 'Test User',
      email: 'test@example.com',
      senha_hash: '$2a$10$XQFz8vH1XQFz8vH1XQFz8vH1XQFz8vH1XQFz8vH1XQFz8vH1XQFz8v',
      tipo: 'contratante',
      telefone: '(11) 99999-9999',
      cpf_cnpj: '12345678901',
      email_verificado: true,
      ativo: true
    };

    return await User.create({ ...defaultUser, ...overrides });
  },

  // Helper to create test professional
  createTestProfessional: async (userId, overrides = {}) => {
    const { Profissional, Categoria } = require('../src/models');

    // Create category if needed
    const categoria = await Categoria.findOne() || await Categoria.create({
      nome: 'DJ',
      descricao: 'Disc Jockey',
      ativo: true
    });

    const defaultProfessional = {
      usuario_id: userId,
      categoria_id: categoria.id,
      nome_artistico: 'Test DJ',
      descricao: 'Professional DJ with 5 years of experience',
      experiencia_anos: 5,
      valor_minimo: 50000, // R$ 500.00
      area_atendimento: ['São Paulo'],
      disponibilidade: {
        segunda: false,
        terca: false,
        quarta: false,
        quinta: false,
        sexta: true,
        sabado: true,
        domingo: true
      },
      aceita_viagens: true,
      plano: 'free',
      ativo: true,
      verificado: false
    };

    return await Profissional.create({ ...defaultProfessional, ...overrides });
  },

  // Helper to create test booking
  createTestBooking: async (contratanteId, profissionalId, overrides = {}) => {
    const { Booking } = require('../src/models');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const defaultBooking = {
      contratante_id: contratanteId,
      profissional_id: profissionalId,
      titulo_evento: 'Test Event',
      descricao_evento: 'A test event for automated testing',
      tipo_evento: 'festa_privada',
      data_evento: tomorrow,
      horario_inicio: '20:00',
      horario_fim: '02:00',
      endereco_evento: 'Rua Test, 123, São Paulo, SP',
      cidade_evento: 'São Paulo',
      valor_oferecido: 100000, // R$ 1000.00
      status: 'pendente',
      expira_em: new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours
    };

    return await Booking.create({ ...defaultBooking, ...overrides });
  },

  // Helper to generate JWT token
  generateTestToken: (userId, userType = 'contratante') => {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
      { id: userId, tipo: userType },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  },

  // Helper to wait for async operations
  wait: (ms = 100) => new Promise(resolve => setTimeout(resolve, ms)),

  // Helper to generate random email
  randomEmail: () => `test${Date.now()}${Math.random().toString(36).substr(2, 9)}@example.com`,

  // Helper to generate random CPF
  randomCPF: () => {
    const digits = [];
    for (let i = 0; i < 9; i++) {
      digits.push(Math.floor(Math.random() * 10));
    }

    // Calculate verification digits
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += digits[i] * (10 - i);
    }
    let digit1 = 11 - (sum % 11);
    if (digit1 >= 10) digit1 = 0;
    digits.push(digit1);

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += digits[i] * (11 - i);
    }
    let digit2 = 11 - (sum % 11);
    if (digit2 >= 10) digit2 = 0;
    digits.push(digit2);

    return digits.join('');
  }
};

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_key_for_testing_only';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_key_for_testing_only';
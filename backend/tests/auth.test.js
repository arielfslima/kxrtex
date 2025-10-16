const request = require('supertest');
const app = require('../src/server');
const { User } = require('../src/models');

describe('Authentication Endpoints', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        nome: 'João Silva',
        email: testUtils.randomEmail(),
        senha: 'MinhaSenh@123',
        confirmar_senha: 'MinhaSenh@123',
        tipo: 'contratante',
        telefone: '(11) 99999-9999',
        cpf_cnpj: testUtils.randomCPF(),
        aceita_termos: 'true'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.nome).toBe(userData.nome);
      expect(response.body.data.tokens.access_token).toBeDefined();
      expect(response.body.data.tokens.refresh_token).toBeDefined();

      // Check if user was created in database
      const user = await User.findOne({ where: { email: userData.email } });
      expect(user).toBeTruthy();
      expect(user.ativo).toBe(true);
    });

    it('should fail with invalid email format', async () => {
      const userData = {
        nome: 'João Silva',
        email: 'invalid-email',
        senha: 'MinhaSenh@123',
        confirmar_senha: 'MinhaSenh@123',
        tipo: 'contratante',
        telefone: '(11) 99999-9999',
        cpf_cnpj: testUtils.randomCPF(),
        aceita_termos: 'true'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should fail with weak password', async () => {
      const userData = {
        nome: 'João Silva',
        email: testUtils.randomEmail(),
        senha: '123456',
        confirmar_senha: '123456',
        tipo: 'contratante',
        telefone: '(11) 99999-9999',
        cpf_cnpj: testUtils.randomCPF(),
        aceita_termos: 'true'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should fail with invalid CPF', async () => {
      const userData = {
        nome: 'João Silva',
        email: testUtils.randomEmail(),
        senha: 'MinhaSenh@123',
        confirmar_senha: 'MinhaSenh@123',
        tipo: 'contratante',
        telefone: '(11) 99999-9999',
        cpf_cnpj: '12345678901', // Invalid CPF
        aceita_termos: 'true'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should fail when passwords do not match', async () => {
      const userData = {
        nome: 'João Silva',
        email: testUtils.randomEmail(),
        senha: 'MinhaSenh@123',
        confirmar_senha: 'DifferentPassword@123',
        tipo: 'contratante',
        telefone: '(11) 99999-9999',
        cpf_cnpj: testUtils.randomCPF(),
        aceita_termos: 'true'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should fail when email already exists', async () => {
      const email = testUtils.randomEmail();

      // Create first user
      await testUtils.createTestUser({ email });

      // Try to create second user with same email
      const userData = {
        nome: 'João Silva',
        email,
        senha: 'MinhaSenh@123',
        confirmar_senha: 'MinhaSenh@123',
        tipo: 'contratante',
        telefone: '(11) 99999-9999',
        cpf_cnpj: testUtils.randomCPF(),
        aceita_termos: 'true'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('EMAIL_ALREADY_EXISTS');
    });
  });

  describe('POST /api/auth/login', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await testUtils.createTestUser({
        email: 'test@example.com',
        senha_hash: '$2a$10$XQFz8vH1XQFz8vH1XQFz8vH1XQFz8vH1XQFz8vH1XQFz8vH1XQFz8v' // "password123"
      });
    });

    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          senha: 'password123'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.tokens.access_token).toBeDefined();
      expect(response.body.data.tokens.refresh_token).toBeDefined();
    });

    it('should fail with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          senha: 'password123'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('INVALID_CREDENTIALS');
    });

    it('should fail with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          senha: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('INVALID_CREDENTIALS');
    });

    it('should fail with inactive user', async () => {
      await testUser.update({ ativo: false });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          senha: 'password123'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('ACCOUNT_INACTIVE');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: '',
          senha: ''
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/auth/me', () => {
    let testUser;
    let authToken;

    beforeEach(async () => {
      testUser = await testUtils.createTestUser();
      authToken = testUtils.generateTestToken(testUser.id, testUser.tipo);
    });

    it('should return user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testUser.id);
      expect(response.body.data.email).toBe(testUser.email);
      expect(response.body.data.nome).toBe(testUser.nome);
    });

    it('should fail without authorization token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('TOKEN_REQUIRED');
    });

    it('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('INVALID_TOKEN');
    });
  });

  describe('POST /api/auth/logout', () => {
    let testUser;
    let authToken;

    beforeEach(async () => {
      testUser = await testUtils.createTestUser();
      authToken = testUtils.generateTestToken(testUser.id, testUser.tipo);
    });

    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Logout realizado com sucesso');
    });

    it('should fail without authorization token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/refresh', () => {
    let testUser;
    let refreshToken;

    beforeEach(async () => {
      testUser = await testUtils.createTestUser();
      const jwt = require('jsonwebtoken');
      refreshToken = jwt.sign(
        { id: testUser.id, tipo: testUser.tipo },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      );
    });

    it('should refresh token successfully', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refresh_token: refreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.access_token).toBeDefined();
      expect(response.body.data.refresh_token).toBeDefined();
    });

    it('should fail with invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refresh_token: 'invalid_token' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should fail without refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });
  });
});
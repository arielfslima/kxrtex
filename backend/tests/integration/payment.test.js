const request = require('supertest');
const app = require('../../src/server');
const { User, Profissional, Booking, Pagamento, Categoria } = require('../../src/models');

// Mock ASAAS service
jest.mock('../../src/services/asaasService', () => ({
  createCustomer: jest.fn().mockResolvedValue({
    id: 'cus_test123',
    name: 'Test Customer'
  }),
  createPayment: jest.fn().mockResolvedValue({
    id: 'pay_test123',
    value: 1000,
    status: 'PENDING',
    invoiceUrl: 'https://test.asaas.com/invoice/123'
  }),
  getPixQrCode: jest.fn().mockResolvedValue({
    payload: 'test_pix_payload',
    encodedImage: 'data:image/png;base64,test_image_data'
  }),
  getPayment: jest.fn().mockResolvedValue({
    id: 'pay_test123',
    status: 'RECEIVED',
    value: 1000
  }),
  verifyWebhook: jest.fn().mockReturnValue(true)
}));

describe('Payment Integration Tests', () => {
  let contratante, artistaUser, profissional, categoria, booking;
  let contratanteToken;

  beforeEach(async () => {
    // Create test users
    contratante = await testUtils.createTestUser({
      email: 'contratante@test.com',
      tipo: 'contratante'
    });

    artistaUser = await testUtils.createTestUser({
      email: 'artista@test.com',
      tipo: 'artista'
    });

    // Create category
    categoria = await Categoria.create({
      nome: 'DJ',
      descricao: 'Disc Jockey',
      ativo: true
    });

    // Create professional profile
    profissional = await testUtils.createTestProfessional(artistaUser.id, {
      categoria_id: categoria.id
    });

    // Create confirmed booking
    booking = await testUtils.createTestBooking(contratante.id, profissional.id, {
      status: 'confirmado',
      valor_booking: 100000 // R$ 1000.00
    });

    // Generate token
    contratanteToken = testUtils.generateTestToken(contratante.id, 'contratante');
  });

  describe('POST /api/pagamentos/:booking_id', () => {
    it('should create PIX payment successfully', async () => {
      const paymentData = {
        metodo_pagamento: 'pix'
      };

      const response = await request(app)
        .post(`/api/pagamentos/${booking.id}`)
        .set('Authorization', `Bearer ${contratanteToken}`)
        .send(paymentData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.metodo_pagamento).toBe('pix');
      expect(response.body.data.status).toBe('pendente');
      expect(response.body.data.pix).toBeDefined();
      expect(response.body.data.pix.qrcode).toBe('test_pix_payload');

      // Check if payment was created in database
      const payment = await Pagamento.findOne({
        where: { booking_id: booking.id }
      });
      expect(payment).toBeTruthy();
      expect(payment.metodo_pagamento).toBe('pix');
    });

    it('should create credit card payment successfully', async () => {
      const paymentData = {
        metodo_pagamento: 'cartao_credito',
        parcelas: 2,
        cartao_numero: '4111111111111111',
        cartao_nome: 'João Silva',
        cartao_vencimento: '12/25',
        cartao_cvv: '123',
        cartao_cpf: '11144477735'
      };

      const response = await request(app)
        .post(`/api/pagamentos/${booking.id}`)
        .set('Authorization', `Bearer ${contratanteToken}`)
        .send(paymentData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.metodo_pagamento).toBe('cartao_credito');
      expect(response.body.data.cartao).toBeDefined();
      expect(response.body.data.cartao.invoice_url).toBeDefined();

      // Check if payment was created in database
      const payment = await Pagamento.findOne({
        where: { booking_id: booking.id }
      });
      expect(payment).toBeTruthy();
      expect(payment.parcelas).toBe(2);
    });

    it('should fail with invalid credit card number', async () => {
      const paymentData = {
        metodo_pagamento: 'cartao_credito',
        cartao_numero: '1234567890123456', // Invalid card number
        cartao_nome: 'João Silva',
        cartao_vencimento: '12/25',
        cartao_cvv: '123',
        cartao_cpf: '11144477735'
      };

      const response = await request(app)
        .post(`/api/pagamentos/${booking.id}`)
        .set('Authorization', `Bearer ${contratanteToken}`)
        .send(paymentData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should fail with expired credit card', async () => {
      const paymentData = {
        metodo_pagamento: 'cartao_credito',
        cartao_numero: '4111111111111111',
        cartao_nome: 'João Silva',
        cartao_vencimento: '01/20', // Expired
        cartao_cvv: '123',
        cartao_cpf: '11144477735'
      };

      const response = await request(app)
        .post(`/api/pagamentos/${booking.id}`)
        .set('Authorization', `Bearer ${contratanteToken}`)
        .send(paymentData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should fail for non-confirmed booking', async () => {
      const pendingBooking = await testUtils.createTestBooking(contratante.id, profissional.id, {
        status: 'pendente'
      });

      const paymentData = {
        metodo_pagamento: 'pix'
      };

      const response = await request(app)
        .post(`/api/pagamentos/${pendingBooking.id}`)
        .set('Authorization', `Bearer ${contratanteToken}`)
        .send(paymentData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('BOOKING_NOT_CONFIRMED');
    });

    it('should fail when payment already exists', async () => {
      // Create first payment
      await Pagamento.create({
        booking_id: booking.id,
        valor_total: 107000,
        valor_artista: 100000,
        taxa_plataforma: 7000,
        metodo_pagamento: 'pix',
        status: 'pendente'
      });

      const paymentData = {
        metodo_pagamento: 'pix'
      };

      const response = await request(app)
        .post(`/api/pagamentos/${booking.id}`)
        .set('Authorization', `Bearer ${contratanteToken}`)
        .send(paymentData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('PAYMENT_ALREADY_EXISTS');
    });
  });

  describe('GET /api/pagamentos/:booking_id/status', () => {
    let payment;

    beforeEach(async () => {
      payment = await Pagamento.create({
        booking_id: booking.id,
        valor_total: 107000,
        valor_artista: 100000,
        taxa_plataforma: 7000,
        metodo_pagamento: 'pix',
        status: 'pendente',
        asaas_payment_id: 'pay_test123'
      });
    });

    it('should get payment status successfully', async () => {
      const response = await request(app)
        .get(`/api/pagamentos/${booking.id}/status`)
        .set('Authorization', `Bearer ${contratanteToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('pendente');
      expect(response.body.data.valor_total).toBe(107000);
    });

    it('should sync status with ASAAS when pending', async () => {
      const response = await request(app)
        .get(`/api/pagamentos/${booking.id}/status`)
        .set('Authorization', `Bearer ${contratanteToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Check if payment status was updated
      const updatedPayment = await Pagamento.findByPk(payment.id);
      expect(updatedPayment.status).toBe('aprovado'); // Mocked as 'RECEIVED'
    });

    it('should fail for non-existent payment', async () => {
      const otherBooking = await testUtils.createTestBooking(contratante.id, profissional.id, {
        status: 'confirmado'
      });

      const response = await request(app)
        .get(`/api/pagamentos/${otherBooking.id}/status`)
        .set('Authorization', `Bearer ${contratanteToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('PAYMENT_NOT_FOUND');
    });
  });

  describe('POST /api/pagamentos/webhook', () => {
    let payment;

    beforeEach(async () => {
      payment = await Pagamento.create({
        booking_id: booking.id,
        valor_total: 107000,
        valor_artista: 100000,
        taxa_plataforma: 7000,
        metodo_pagamento: 'pix',
        status: 'pendente',
        asaas_payment_id: 'pay_test123'
      });
    });

    it('should process payment received webhook', async () => {
      const webhookData = {
        event: 'PAYMENT_RECEIVED',
        payment: {
          id: 'pay_test123',
          value: 1070, // R$ 1070.00
          status: 'RECEIVED'
        }
      };

      const response = await request(app)
        .post('/api/pagamentos/webhook')
        .send(webhookData)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Check if payment was updated
      const updatedPayment = await Pagamento.findByPk(payment.id);
      expect(updatedPayment.status).toBe('aprovado');
      expect(updatedPayment.pago_em).toBeTruthy();
      expect(updatedPayment.valor_pago).toBe(107000); // Converted from reais to cents
    });

    it('should process payment refunded webhook', async () => {
      const webhookData = {
        event: 'PAYMENT_REFUNDED',
        payment: {
          id: 'pay_test123',
          value: 1070,
          status: 'REFUNDED'
        }
      };

      const response = await request(app)
        .post('/api/pagamentos/webhook')
        .send(webhookData)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Check if payment was updated
      const updatedPayment = await Pagamento.findByPk(payment.id);
      expect(updatedPayment.status).toBe('estornado');
      expect(updatedPayment.estornado_em).toBeTruthy();
      expect(updatedPayment.valor_estornado).toBe(107000);
    });

    it('should fail with invalid webhook signature', async () => {
      // Mock invalid signature
      const asaasService = require('../../src/services/asaasService');
      asaasService.verifyWebhook.mockReturnValueOnce(false);

      const webhookData = {
        event: 'PAYMENT_RECEIVED',
        payment: {
          id: 'pay_test123',
          value: 1070,
          status: 'RECEIVED'
        }
      };

      const response = await request(app)
        .post('/api/pagamentos/webhook')
        .set('asaas-signature', 'invalid_signature')
        .send(webhookData)
        .expect(401);

      expect(response.body.error).toBe('Invalid signature');
    });

    it('should fail for non-existent payment', async () => {
      const webhookData = {
        event: 'PAYMENT_RECEIVED',
        payment: {
          id: 'pay_nonexistent',
          value: 1070,
          status: 'RECEIVED'
        }
      };

      const response = await request(app)
        .post('/api/pagamentos/webhook')
        .send(webhookData)
        .expect(404);

      expect(response.body.error).toBe('Payment not found');
    });
  });
});
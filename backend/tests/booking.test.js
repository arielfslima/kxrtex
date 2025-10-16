const request = require('supertest');
const app = require('../src/server');
const { User, Profissional, Booking, Categoria } = require('../src/models');

describe('Booking Endpoints', () => {
  let contratante, artistaUser, profissional, categoria;
  let contratanteToken, artistaToken;

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

    // Generate tokens
    contratanteToken = testUtils.generateTestToken(contratante.id, 'contratante');
    artistaToken = testUtils.generateTestToken(artistaUser.id, 'artista');
  });

  describe('POST /api/bookings', () => {
    it('should create a booking successfully', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const bookingData = {
        profissional_id: profissional.id,
        titulo_evento: 'Festa de Aniversário',
        descricao_evento: 'Festa de 30 anos com música eletrônica',
        tipo_evento: 'aniversario',
        data_evento: tomorrow.toISOString(),
        horario_inicio: '20:00',
        horario_fim: '02:00',
        endereco_evento: 'Rua das Flores, 123, São Paulo, SP',
        cidade_evento: 'São Paulo',
        valor_oferecido: 150000, // R$ 1500.00
        observacoes: 'Favor trazer equipamento de som'
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${contratanteToken}`)
        .send(bookingData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.titulo_evento).toBe(bookingData.titulo_evento);
      expect(response.body.data.status).toBe('pendente');
      expect(response.body.data.contratante_id).toBe(contratante.id);
      expect(response.body.data.profissional_id).toBe(profissional.id);
    });

    it('should fail when artista tries to create booking', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const bookingData = {
        profissional_id: profissional.id,
        titulo_evento: 'Festa de Aniversário',
        tipo_evento: 'aniversario',
        data_evento: tomorrow.toISOString(),
        horario_inicio: '20:00',
        endereco_evento: 'Rua das Flores, 123, São Paulo, SP',
        cidade_evento: 'São Paulo',
        valor_oferecido: 150000
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${artistaToken}`)
        .send(bookingData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('CONTRACTOR_REQUIRED');
    });

    it('should fail with invalid data', async () => {
      const bookingData = {
        profissional_id: 'invalid-uuid',
        titulo_evento: 'A', // Too short
        valor_oferecido: 10 // Too low
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${contratanteToken}`)
        .send(bookingData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should fail with past date', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const bookingData = {
        profissional_id: profissional.id,
        titulo_evento: 'Festa de Aniversário',
        tipo_evento: 'aniversario',
        data_evento: yesterday.toISOString(),
        horario_inicio: '20:00',
        endereco_evento: 'Rua das Flores, 123, São Paulo, SP',
        cidade_evento: 'São Paulo',
        valor_oferecido: 150000
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${contratanteToken}`)
        .send(bookingData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/bookings', () => {
    let booking1, booking2;

    beforeEach(async () => {
      booking1 = await testUtils.createTestBooking(contratante.id, profissional.id, {
        titulo_evento: 'Evento 1',
        status: 'pendente'
      });

      booking2 = await testUtils.createTestBooking(contratante.id, profissional.id, {
        titulo_evento: 'Evento 2',
        status: 'confirmado'
      });
    });

    it('should list bookings for contratante', async () => {
      const response = await request(app)
        .get('/api/bookings')
        .set('Authorization', `Bearer ${contratanteToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.bookings).toHaveLength(2);
    });

    it('should list bookings for artista', async () => {
      const response = await request(app)
        .get('/api/bookings')
        .set('Authorization', `Bearer ${artistaToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.bookings).toHaveLength(2);
    });

    it('should filter bookings by status', async () => {
      const response = await request(app)
        .get('/api/bookings?status=pendente')
        .set('Authorization', `Bearer ${contratanteToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.bookings).toHaveLength(1);
      expect(response.body.data.bookings[0].status).toBe('pendente');
    });

    it('should paginate results', async () => {
      const response = await request(app)
        .get('/api/bookings?page=1&limit=1')
        .set('Authorization', `Bearer ${contratanteToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.bookings).toHaveLength(1);
      expect(response.body.data.total).toBe(2);
      expect(response.body.data.total_paginas).toBe(2);
    });
  });

  describe('GET /api/bookings/:id', () => {
    let booking;

    beforeEach(async () => {
      booking = await testUtils.createTestBooking(contratante.id, profissional.id);
    });

    it('should get booking details for contratante', async () => {
      const response = await request(app)
        .get(`/api/bookings/${booking.id}`)
        .set('Authorization', `Bearer ${contratanteToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(booking.id);
      expect(response.body.data.titulo_evento).toBe(booking.titulo_evento);
    });

    it('should get booking details for artista', async () => {
      const response = await request(app)
        .get(`/api/bookings/${booking.id}`)
        .set('Authorization', `Bearer ${artistaToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(booking.id);
    });

    it('should fail for unauthorized user', async () => {
      const otherUser = await testUtils.createTestUser({ email: 'other@test.com' });
      const otherToken = testUtils.generateTestToken(otherUser.id, 'contratante');

      const response = await request(app)
        .get(`/api/bookings/${booking.id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('ACCESS_DENIED');
    });

    it('should fail with invalid booking ID', async () => {
      const response = await request(app)
        .get('/api/bookings/invalid-uuid')
        .set('Authorization', `Bearer ${contratanteToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('PUT /api/bookings/:id/accept', () => {
    let booking;

    beforeEach(async () => {
      booking = await testUtils.createTestBooking(contratante.id, profissional.id);
    });

    it('should accept booking successfully', async () => {
      const response = await request(app)
        .put(`/api/bookings/${booking.id}/accept`)
        .set('Authorization', `Bearer ${artistaToken}`)
        .send({
          mensagem_resposta: 'Aceito! Será um prazer tocar no seu evento.'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('confirmado');
      expect(response.body.data.confirmado_em).toBeDefined();
    });

    it('should accept booking with counter-proposal', async () => {
      const response = await request(app)
        .put(`/api/bookings/${booking.id}/accept`)
        .set('Authorization', `Bearer ${artistaToken}`)
        .send({
          contra_proposta_valor: 120000, // R$ 1200.00
          mensagem_resposta: 'Aceito com contra-proposta de valor.'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('confirmado');
      expect(response.body.data.valor_booking).toBe(120000);
    });

    it('should fail when contratante tries to accept', async () => {
      const response = await request(app)
        .put(`/api/bookings/${booking.id}/accept`)
        .set('Authorization', `Bearer ${contratanteToken}`)
        .send({})
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('PROFESSIONAL_REQUIRED');
    });

    it('should fail with invalid counter-proposal value', async () => {
      const response = await request(app)
        .put(`/api/bookings/${booking.id}/accept`)
        .set('Authorization', `Bearer ${artistaToken}`)
        .send({
          contra_proposta_valor: 10 // Too low
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should fail for already confirmed booking', async () => {
      await booking.update({ status: 'confirmado' });

      const response = await request(app)
        .put(`/api/bookings/${booking.id}/accept`)
        .set('Authorization', `Bearer ${artistaToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('BOOKING_NOT_PENDING');
    });
  });

  describe('PUT /api/bookings/:id/reject', () => {
    let booking;

    beforeEach(async () => {
      booking = await testUtils.createTestBooking(contratante.id, profissional.id);
    });

    it('should reject booking successfully', async () => {
      const response = await request(app)
        .put(`/api/bookings/${booking.id}/reject`)
        .set('Authorization', `Bearer ${artistaToken}`)
        .send({
          motivo_rejeicao: 'Conflito de agenda - já tenho compromisso nesta data.'
        })
        .expect(200);

      expect(response.body.success).toBe(true);

      // Check booking was updated
      const updatedBooking = await Booking.findByPk(booking.id);
      expect(updatedBooking.status).toBe('rejeitado');
      expect(updatedBooking.motivo_cancelamento).toBe('Conflito de agenda - já tenho compromisso nesta data.');
    });

    it('should fail when contratante tries to reject', async () => {
      const response = await request(app)
        .put(`/api/bookings/${booking.id}/reject`)
        .set('Authorization', `Bearer ${contratanteToken}`)
        .send({
          motivo_rejeicao: 'Mudança de planos'
        })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('PROFESSIONAL_REQUIRED');
    });
  });

  describe('PUT /api/bookings/:id/cancel', () => {
    let booking;

    beforeEach(async () => {
      booking = await testUtils.createTestBooking(contratante.id, profissional.id, {
        status: 'confirmado'
      });
    });

    it('should cancel booking as contratante', async () => {
      const response = await request(app)
        .put(`/api/bookings/${booking.id}/cancel`)
        .set('Authorization', `Bearer ${contratanteToken}`)
        .send({
          motivo_cancelamento: 'Evento foi adiado devido à chuva.'
        })
        .expect(200);

      expect(response.body.success).toBe(true);

      // Check booking was updated
      const updatedBooking = await Booking.findByPk(booking.id);
      expect(updatedBooking.status).toBe('cancelado');
      expect(updatedBooking.quem_cancelou).toBe('contratante');
    });

    it('should cancel booking as artista', async () => {
      const response = await request(app)
        .put(`/api/bookings/${booking.id}/cancel`)
        .set('Authorization', `Bearer ${artistaToken}`)
        .send({
          motivo_cancelamento: 'Problemas de saúde - não poderei comparecer.'
        })
        .expect(200);

      expect(response.body.success).toBe(true);

      // Check booking was updated
      const updatedBooking = await Booking.findByPk(booking.id);
      expect(updatedBooking.status).toBe('cancelado');
      expect(updatedBooking.quem_cancelou).toBe('artista');
    });

    it('should calculate cancellation fee for last-minute cancellation', async () => {
      // Set event to tomorrow (within 24 hours)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      await booking.update({ data_evento: tomorrow });

      const response = await request(app)
        .put(`/api/bookings/${booking.id}/cancel`)
        .set('Authorization', `Bearer ${contratanteToken}`)
        .send({
          motivo_cancelamento: 'Cancelamento de última hora.'
        })
        .expect(200);

      expect(response.body.success).toBe(true);

      // Check cancellation fee was applied
      const updatedBooking = await Booking.findByPk(booking.id);
      expect(updatedBooking.taxa_cancelamento).toBe(0.1); // 10%
    });
  });
});
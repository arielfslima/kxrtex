import { describe, it, expect } from '@jest/globals';

describe('KXRTEX API - Critical Functions', () => {
  describe('Environment Setup', () => {
    it('should have required environment variables for testing', () => {
      expect(process.env.NODE_ENV).toBe('test');
      expect(process.env.JWT_SECRET).toBeDefined();
      expect(process.env.DATABASE_URL).toBeDefined();
    });
  });

  describe('Artist Ranking Algorithm', () => {
    it('should calculate correct ranking score', () => {
      const calculateRankingScore = (artist) => {
        const planoWeights = { FREE: 1, PLUS: 2, PRO: 3 };
        const planoWeight = planoWeights[artist.plano] || 1;

        const portfolioCount = artist.portfolio?.length || 0;
        const hasVideos = artist.videos?.length > 0 ? 1 : 0;
        const socialLinksCount = [
          artist.instagram,
          artist.soundcloud,
          artist.spotify
        ].filter(Boolean).length;
        const isVerified = artist.statusVerificacao === 'VERIFICADO' ? 1 : 0;
        const hasBio = artist.bio ? 1 : 0;

        const perfilCompleto =
          (hasBio * 2) +
          (portfolioCount >= 3 ? 3 : 0) +
          (hasVideos * 2) +
          socialLinksCount +
          (isVerified * 2);

        return (planoWeight * 40) +
               ((artist.notaMedia || 0) * 30) +
               ((artist.totalBookings || 0) * 20) +
               (perfilCompleto * 10);
      };

      const artistFREE = {
        plano: 'FREE',
        notaMedia: 4.5,
        totalBookings: 10,
        portfolio: ['photo1.jpg', 'photo2.jpg', 'photo3.jpg'],
        bio: 'Test bio',
        statusVerificacao: 'NAO_VERIFICADO',
        instagram: 'test',
        soundcloud: null,
        spotify: null,
        videos: []
      };

      const artistPRO = {
        plano: 'PRO',
        notaMedia: 4.8,
        totalBookings: 50,
        portfolio: ['photo1.jpg', 'photo2.jpg', 'photo3.jpg'],
        bio: 'Test bio',
        statusVerificacao: 'VERIFICADO',
        instagram: 'test',
        soundcloud: 'test',
        spotify: 'test',
        videos: ['video1.mp4']
      };

      const scoreFREE = calculateRankingScore(artistFREE);
      const scorePRO = calculateRankingScore(artistPRO);

      expect(scoreFREE).toBeGreaterThan(0);
      expect(scorePRO).toBeGreaterThan(scoreFREE);

      expect(scoreFREE).toBe(435);
      expect(scorePRO).toBe(1384);
    });
  });

  describe('Platform Fee Calculation', () => {
    it('should calculate correct fees based on artist tier', () => {
      const calculatePlatformFee = (valorBase, plano) => {
        const feePercentages = {
          FREE: 0.15,
          PLUS: 0.10,
          PRO: 0.07
        };

        const percentage = feePercentages[plano] || 0.15;
        return valorBase * percentage;
      };

      expect(calculatePlatformFee(1000, 'FREE')).toBe(150);
      expect(calculatePlatformFee(1000, 'PLUS')).toBe(100);
      expect(calculatePlatformFee(1000, 'PRO')).toBe(70);
    });
  });

  describe('Distance Calculation for Advance Payment', () => {
    it('should require advance payment for distances > 200km', () => {
      const requiresAdvancePayment = (distanceKm) => {
        return distanceKm > 200;
      };

      expect(requiresAdvancePayment(150)).toBe(false);
      expect(requiresAdvancePayment(200)).toBe(false);
      expect(requiresAdvancePayment(201)).toBe(true);
      expect(requiresAdvancePayment(500)).toBe(true);
    });
  });

  describe('Booking State Machine', () => {
    it('should validate correct state transitions', () => {
      const validTransitions = {
        PENDENTE: ['ACEITO', 'CANCELADO'],
        ACEITO: ['CONFIRMADO', 'CANCELADO'],
        CONFIRMADO: ['EM_ANDAMENTO', 'CANCELADO'],
        EM_ANDAMENTO: ['CONCLUIDO', 'DISPUTA'],
        CONCLUIDO: [],
        CANCELADO: [],
        DISPUTA: ['CONCLUIDO', 'CANCELADO']
      };

      const canTransition = (currentState, newState) => {
        return validTransitions[currentState]?.includes(newState) || false;
      };

      expect(canTransition('PENDENTE', 'ACEITO')).toBe(true);
      expect(canTransition('PENDENTE', 'CONFIRMADO')).toBe(false);
      expect(canTransition('ACEITO', 'CONFIRMADO')).toBe(true);
      expect(canTransition('CONCLUIDO', 'PENDENTE')).toBe(false);
      expect(canTransition('EM_ANDAMENTO', 'CONCLUIDO')).toBe(true);
    });
  });

  describe('Contact Information Detection', () => {
    it('should detect phone numbers in messages', () => {
      const detectPhone = (message) => {
        const phoneRegex = /\(?\d{2}\)?\s?\d{4,5}-?\d{4}/g;
        return phoneRegex.test(message);
      };

      expect(detectPhone('Call me at (11)99999-9999')).toBe(true);
      expect(detectPhone('My number is 11 99999-9999')).toBe(true);
      expect(detectPhone('(11)9999-9999')).toBe(true);
      expect(detectPhone('Just a normal message')).toBe(false);
    });

    it('should detect email addresses in messages', () => {
      const detectEmail = (message) => {
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        return emailRegex.test(message);
      };

      expect(detectEmail('Email me at test@example.com')).toBe(true);
      expect(detectEmail('Contact: user.name+tag@domain.co.uk')).toBe(true);
      expect(detectEmail('Just a normal message')).toBe(false);
    });

    it('should detect social media handles in messages', () => {
      const detectSocial = (message) => {
        const socialRegex = /@[a-zA-Z0-9_]+/g;
        return socialRegex.test(message);
      };

      expect(detectSocial('Follow me @username')).toBe(true);
      expect(detectSocial('Instagram: @my_profile123')).toBe(true);
      expect(detectSocial('Just a normal message')).toBe(false);
    });
  });

  describe('Profile Completeness Score', () => {
    it('should calculate profile completeness correctly', () => {
      const calculateProfileScore = (profile) => {
        let score = 0;

        if (profile.bio) score += 2;
        if (profile.portfolio?.length >= 3) score += 3;
        if (profile.videos?.length > 0) score += 2;
        if (profile.instagram) score += 1;
        if (profile.soundcloud) score += 1;
        if (profile.spotify) score += 1;
        if (profile.statusVerificacao === 'VERIFICADO') score += 2;

        return score;
      };

      const incompleteProfile = {
        bio: null,
        portfolio: [],
        videos: [],
        statusVerificacao: 'NAO_VERIFICADO'
      };

      const completeProfile = {
        bio: 'Complete bio',
        portfolio: ['1.jpg', '2.jpg', '3.jpg'],
        videos: ['video.mp4'],
        instagram: '@test',
        soundcloud: 'test',
        spotify: 'test',
        statusVerificacao: 'VERIFICADO'
      };

      expect(calculateProfileScore(incompleteProfile)).toBe(0);
      expect(calculateProfileScore(completeProfile)).toBe(12);
    });
  });
});

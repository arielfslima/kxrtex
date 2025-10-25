// CONFIGURAÇÃO TEMPORÁRIA HARDCODED PARA PRODUÇÃO
// TODO: Migrar para variáveis de ambiente após deploy inicial

export const productionConfig = {
  // JWT
  jwtSecret: 'p075CTZsWQokdO8VlNGmv73BoAkEC1D9CT0UpdU8Z8N87CqfJL8dfNlgY+psEVCqsLDhXxnJ67zCyWX90OZ0nQ==',
  jwtExpiresIn: '7d',

  // Cloudinary
  cloudinary: {
    cloudName: 'dqmwxsghw',
    apiKey: '852783327391678',
    apiSecret: '70lRhwHIkV0JUVIUAaZescIzbwE'
  },

  // ASAAS - USANDO SANDBOX PARA TESTES (CPFs de teste funcionam)
  asaas: {
    // Sandbox key - aceita CPFs de teste
    apiKey: '$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjAyZTkwYjBmLTUyZjEtNGYyNC05OTc2LTgwMTgwMDYxNGE1MDo6JGFhY2hfYTBkOGMwMzMtZTcwNi00MTc0LTg2Y2QtOWZlNjIwNWYzMzI2',
    // Production key - requer CPFs reais cadastrados na RF
    // apiKey: '$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6Ojk1YTVmZjFkLTUyZTEtNDY1MS05YzBhLTcwOTdlOGMzY2I4Yzo6JGFhY2hfZWMxZGM0MWEtY2ZiNS00MDU3LThjY2ItNTdmMDUyODgyYjFl',
    environment: 'sandbox',
    webhookSecret: '95f6ff8be75a6fe793d44cd22184aa76655882b91a9459df85eb682d273d1455'
  },

  // Firebase - REMOVIDO POR SEGURANÇA
  // Configure via variável de ambiente FIREBASE_SERVICE_ACCOUNT no Railway

  // Frontend URLs
  frontendUrls: [
    'https://kxrtex.vercel.app',
    'https://www.kxrtex.com.br',
    'https://kxrtex.com.br'
  ],

  // Rate Limiting
  rateLimit: {
    windowMs: 900000,
    maxRequests: 100
  }
};

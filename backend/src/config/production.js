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

  // ASAAS
  asaas: {
    apiKey: '$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6Ojk1YTVmZjFkLTUyZTEtNDY1MS05YzBhLTcwOTdlOGMzY2I4Yzo6JGFhY2hfZWMxZGM0MWEtY2ZiNS00MDU3LThjY2ItNTdmMDUyODgyYjFl',
    environment: 'production',
    webhookSecret: '95f6ff8be75a6fe793d44cd22184aa76655882b91a9459df85eb682d273d1455'
  },

  // Firebase
  firebase: {
    serviceAccount: {
      type: 'service_account',
      project_id: 'kxrtex-f32e7',
      private_key_id: 'fc5f8ac5bd1b9daac4156497fd47db332dd36452',
      private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCx9wVp6pA4ieFW\nIJcrTKau5PFCAAjnaneC/Gs53KugnbxY3MNQjAMVtLmX/pV8EGXr3hKerx4o2vjr\nDC4M71Oi3d5sCBb/+M0dLAM3fwe27Rs6wU7QS/cJMMnLK9g/GMfd5LCt6xlNEIlT\nn8mrQW1XQCrWX353s6pVQI00EBBnB3kqU7AQmahXVjT3DgMReWo9euMAF1ZNVPPU\nszrvq87WCz+RcXZH3BEf6CzgLxWpcWR/MrO+DPzibCuaA2rUDQffqEqSojFSI1+h\n1xuQgl0PCF0PgkLekm6PFnVUwtQy+PJahg1yafCgA9fhioAH2/jTrbBrw7sOPKvm\ngQyL8TLxAgMBAAECggEAHH0XNu/aO3rIVuxrq/5Ja+jxaBKFBQqplrndWQtmxr+e\nxY49jqODNj0n6AQp84zVIVomRT8c8bGwCZckY2Sye6QkdXXMEhjxjjBxVA0inoQR\nXlP7T7lBaA1mgv7XT1kiXEvo2UaFK9gwVkcs1kc91NWhpeSZOa9KCVCxP1AtAq5O\nNh7RbLFg49NHKuYiL8kvg8VqD2Iz0XnpggX5uHIsBLOtZr0p6Lru2BP7zri1Tug1\nWdLq3BQ5THCSfPoQYzLlqVZwyRCfFNGX0hb1VAbf4am97J8HSqoY6PJkX1jERrVe\n1QAGU5l0zR4S1FmYwYxWPUwNRQcp6aAhoHHmfukJewKBgQDx2r4GbKGsBkQbT7kq\n6Dbvugk6OMrAVzeR45pFy3orZM+eIitT4hBR6TTjsPc+Ynx2PiAsYgsuNHmrl4iP\nRJPviWoGkj+lsFus18v0nP93jFF/6TdrEAw/JzsKrkNcV2wSRoYhRga1bMcHYxLQ\ncGb2U7ElHqZTRjtlxcOwrBjOswKBgQC8X6slpggHDnZ3vc5UQcIAYpXGBkkBjBa6\nwKcfb2TNFBE/LQ8X3OQjclE+V1NddUZBKE1pxc9R0TLHhFwN2XvhV6j7hVWpdczf\nRtzOv5R77bUtk315YF3LewVqfGbntNuw693oNIKu4KyUHUpZdHaMVR9MYUvoblc1\ntTjXB3sJywKBgBPAMVSE+o751AYG9LA0VogtQSOoD6a1eKxJUgfxHgD9MpdPYwpu\no7aMvOz7PrWxhUiCuk3lk9QqJOWGcniAuTQOnMH8n4YAaPwsg1Nuns48f0ta2FO9\n88IUihXNNWMNIJ49dCazeUjHoVlRFfA/vajQHN9TKXITgjZFeD2tUDlRAoGAdMWR\nYKtFuqoagivlJZIF4xs54SGwTAc9Z9NZRkFVaVORRWp3OsGxos+Q0WZsxTiXrnh/\nVJxM4lkec1P3hJZXFt+yXwjOi1f9AkP5SSi1sQUwFOqjE4TLYAII33Pyjpwsu8Xb\nL8Ctah7YnJBzsHRjsKZr2ntOBO2xnheS/qkienUCgYBCQhq1lSvhTC0FRoSPgPEk\nUdz193uHLHCpagZQ7lHylGYp0k6dk7uYJGgE+CwChQJG74xsW/KxImlPR5GJacN5\n/AOeOlb2YWTkiydV+24XywzyGC3Fg5qk90ZnCbAFhHssQLJD759zflXVmumQOPhz\nX24YzKmVPxhYhwB4rBfAjA==\n-----END PRIVATE KEY-----\n',
      client_email: 'firebase-adminsdk-fbsvc@kxrtex-f32e7.iam.gserviceaccount.com',
      client_id: '109013604709726415991',
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40kxrtex-f32e7.iam.gserviceaccount.com',
      universe_domain: 'googleapis.com'
    }
  },

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

export const demoArtist = {
  id: 'demo-artist-1',
  usuario: {
    nome: 'DJ Phoenix',
    email: 'dj.phoenix@demo.com',
    fotoPerfil: 'https://i.pravatar.cc/300?img=33',
  },
  nomeArtistico: 'DJ Phoenix',
  biografia: 'DJ profissional especializado em underground, techno e house music. Com mais de 10 anos de experiência em festas e eventos, trazendo sempre a melhor energia para o público.',
  categoria: 'DJ',
  plano: 'PRO',
  precoBase: 1500.00,
  cidadeBase: 'São Paulo',
  estadoBase: 'SP',
  statusVerificacao: 'VERIFICADO',
  avaliacaoMedia: 4.8,
  totalBookings: 147,
  portfolio: [
    'https://images.unsplash.com/photo-1571266028243-d220c6ce3cd2?w=800',
    'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800',
  ],
  redesSociais: {
    instagram: '@djphoenix',
    spotify: 'djphoenix',
    soundcloud: 'djphoenix'
  }
};

export const demoContratante = {
  id: 'demo-contratante-1',
  usuario: {
    nome: 'Carlos Silva',
    email: 'carlos@demo.com',
    fotoPerfil: 'https://i.pravatar.cc/300?img=12',
  },
  empresa: 'Eventos Premium SP',
  cnpj: '12.345.678/0001-99',
};

export const demoBooking = {
  id: 'demo-booking-1',
  titulo: 'Festival Underground - Edição Verão',
  descricao: 'Grande festival de música eletrônica underground com público estimado de 2000 pessoas. Evento ao ar livre com estrutura completa de som e iluminação.',
  dataEvento: '2024-12-15T22:00:00',
  duracao: 4,
  localEvento: 'Parque Villa-Lobos',
  cidadeEvento: 'São Paulo',
  estadoEvento: 'SP',
  latitude: -23.5489,
  longitude: -46.6388,
  valorProposto: 1500.00,
  taxaPlataforma: 105.00,
  valorTotal: 1605.00,
  status: 'PENDENTE',
  createdAt: new Date().toISOString(),
};

export const demoChatMessages = [
  {
    id: 1,
    tipo: 'USUARIO',
    conteudo: 'Olá! Vi seu perfil e adorei seu trabalho. Gostaria de conversar sobre o evento.',
    remetente: demoContratante,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 2,
    tipo: 'USUARIO',
    conteudo: 'Oi! Obrigado pelo interesse. Vi os detalhes do booking, parece muito interessante!',
    remetente: demoArtist,
    timestamp: new Date(Date.now() - 3000000).toISOString(),
  },
  {
    id: 3,
    tipo: 'USUARIO',
    conteudo: 'Ótimo! O festival vai ter uma estrutura completa. Você teria disponibilidade para tocar por 4 horas?',
    remetente: demoContratante,
    timestamp: new Date(Date.now() - 2400000).toISOString(),
  },
  {
    id: 4,
    tipo: 'USUARIO',
    conteudo: 'Sim, tenho total disponibilidade! Posso preparar um set especial para o evento.',
    remetente: demoArtist,
    timestamp: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 5,
    tipo: 'SISTEMA',
    conteudo: 'AVISO: Detectamos possível compartilhamento de informações de contato. Lembre-se que toda comunicação deve ocorrer pela plataforma para sua segurança.',
    timestamp: new Date(Date.now() - 900000).toISOString(),
  },
  {
    id: 6,
    tipo: 'USUARIO',
    conteudo: 'Perfeito! Estou aceitando a proposta. Vamos seguir com o pagamento.',
    remetente: demoContratante,
    timestamp: new Date(Date.now() - 300000).toISOString(),
  },
];

export const demoReviews = [
  {
    id: 1,
    avaliador: {
      nome: 'Maria Santos',
      fotoPerfil: 'https://i.pravatar.cc/100?img=5',
    },
    pontualidade: 5,
    profissionalismo: 5,
    qualidade: 5,
    comunicacao: 4,
    custobeneficio: 5,
    recomendacao: 5,
    comentario: 'Excelente profissional! Superou todas as expectativas. O público adorou!',
    createdAt: '2024-11-01T10:00:00',
  },
  {
    id: 2,
    avaliador: {
      nome: 'João Oliveira',
      fotoPerfil: 'https://i.pravatar.cc/100?img=8',
    },
    pontualidade: 5,
    profissionalismo: 5,
    qualidade: 5,
    comunicacao: 5,
    custobeneficio: 4,
    recomendacao: 5,
    comentario: 'Trabalho impecável! Muito profissional e pontual. Recomendo 100%!',
    createdAt: '2024-10-15T14:30:00',
  },
  {
    id: 3,
    avaliador: {
      nome: 'Ana Costa',
      fotoPerfil: 'https://i.pravatar.cc/100?img=9',
    },
    pontualidade: 4,
    profissionalismo: 5,
    qualidade: 5,
    comunicacao: 5,
    custobeneficio: 5,
    recomendacao: 5,
    comentario: 'Ótima experiência! O evento foi um sucesso graças ao trabalho dele.',
    createdAt: '2024-09-20T16:00:00',
  },
];

export const demoStats = {
  totalArtists: '2,547',
  totalBookings: '8,932',
  totalContratantes: '1,823',
  satisfactionRate: '98%',
  averageRating: '4.8',
  citiesCovered: '156',
};

export const demoFeatures = [
  {
    title: 'Planos Flexíveis',
    description: 'FREE, PLUS e PRO com taxas de 15%, 10% e 7%',
    icon: 'star',
  },
  {
    title: 'Pagamento Seguro',
    description: 'Retenção de pagamento até 48h após o evento',
    icon: 'shield',
  },
  {
    title: 'Anti-Circumvenção',
    description: 'Sistema que detecta compartilhamento de contatos',
    icon: 'eye',
  },
  {
    title: 'Check-in Geolocalizado',
    description: 'Verificação de presença com coordenadas GPS',
    icon: 'map',
  },
  {
    title: 'Reviews Bilaterais',
    description: 'Sistema de 6 critérios para ambas as partes',
    icon: 'chat',
  },
  {
    title: 'Adiantamento Inteligente',
    description: '50% de adiantamento para eventos >200km',
    icon: 'cash',
  },
];

export const demoTimeline = [
  {
    status: 'Booking Criado',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    description: 'Solicitação de booking enviada ao artista',
    icon: 'plus',
  },
  {
    status: 'Proposta Aceita',
    timestamp: new Date(Date.now() - 5400000).toISOString(),
    description: 'Artista aceitou a proposta',
    icon: 'check',
  },
  {
    status: 'Pagamento Confirmado',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    description: 'Pagamento via PIX confirmado',
    icon: 'cash',
  },
  {
    status: 'Check-in Realizado',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    description: 'Artista fez check-in no local do evento',
    icon: 'map',
  },
  {
    status: 'Evento Concluído',
    timestamp: new Date(Date.now() - 900000).toISOString(),
    description: 'Evento finalizado com sucesso',
    icon: 'star',
  },
  {
    status: 'Pagamento Liberado',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    description: 'Valor liberado para o artista',
    icon: 'check-circle',
  },
];

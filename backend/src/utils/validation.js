import { z } from 'zod';

// Schemas de validação reutilizáveis

export const emailSchema = z.string().email('Email inválido');

export const passwordSchema = z
  .string()
  .min(8, 'Senha deve ter no mínimo 8 caracteres')
  .regex(/[A-Z]/, 'Senha deve conter ao menos uma letra maiúscula')
  .regex(/[a-z]/, 'Senha deve conter ao menos uma letra minúscula')
  .regex(/[0-9]/, 'Senha deve conter ao menos um número');

export const cpfCnpjSchema = z
  .string()
  .refine((val) => {
    const cleaned = val.replace(/\D/g, '');
    return cleaned.length === 11 || cleaned.length === 14;
  }, 'CPF/CNPJ inválido');

export const phoneSchema = z
  .string()
  .regex(/^\(\d{2}\)\s?\d{4,5}-?\d{4}$/, 'Telefone inválido');

// Auth schemas
export const registerSchema = z.object({
  email: emailSchema,
  senha: passwordSchema,
  tipo: z.enum(['CONTRATANTE', 'ARTISTA']),
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  telefone: phoneSchema,
  cpfCnpj: cpfCnpjSchema,
  // Campos específicos de artista
  nomeArtistico: z.string().min(2).optional(),
  categoria: z.enum(['DJ', 'MC', 'PERFORMER']).optional(),
  bio: z.string().min(50, 'Bio deve ter no mínimo 50 caracteres').optional(),
  valorBaseHora: z.number().positive().optional(),
  // Campos específicos de contratante
  tipoPessoa: z.enum(['PF', 'PJ']).optional()
});

export const loginSchema = z.object({
  email: emailSchema,
  senha: z.string().min(1, 'Senha é obrigatória')
});

// Artist schemas
export const listArtistsQuerySchema = z.object({
  categoria: z.enum(['DJ', 'MC', 'PERFORMER']).optional(),
  subcategoria: z.string().optional(),
  cidade: z.string().optional(),
  precoMin: z.string().optional(),
  precoMax: z.string().optional(),
  avaliacaoMin: z.string().optional(),
  plano: z.enum(['FREE', 'PLUS', 'PRO']).optional(),
  verificado: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
  orderBy: z.enum(['relevancia', 'preco_asc', 'preco_desc', 'avaliacao', 'recentes']).optional()
});

export const updateArtistSchema = z.object({
  nomeArtistico: z.string().min(2).optional(),
  bio: z.string().min(50, 'Bio deve ter no mínimo 50 caracteres').optional(),
  valorBaseHora: z.number().positive().optional(),
  categoria: z.enum(['DJ', 'MC', 'PERFORMER']).optional(),
  subcategorias: z.array(z.string()).max(3, 'Máximo 3 subcategorias').optional(),
  cidadesAtuacao: z.array(z.string()).optional(),
  redesSociais: z.object({
    instagram: z.string().url().optional(),
    soundcloud: z.string().url().optional(),
    spotify: z.string().url().optional(),
    youtube: z.string().url().optional(),
    twitter: z.string().url().optional()
  }).optional()
});

export const updateUserProfileSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').optional(),
  telefone: phoneSchema.optional(),
  foto: z.string().url('URL da foto inválida').optional()
});

// Booking schemas
export const createBookingSchema = z.object({
  artistaId: z.string().uuid('ID do artista inválido'),
  dataEvento: z.string().datetime('Data do evento inválida'),
  horarioInicio: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Horário inválido (formato: HH:mm)'),
  duracao: z.number().int().positive('Duração deve ser positiva').max(24, 'Duração máxima: 24 horas'),
  local: z.string().min(5, 'Local deve ter no mínimo 5 caracteres'),
  descricaoEvento: z.string().min(10, 'Descrição deve ter no mínimo 10 caracteres'),
  valorProposto: z.number().positive().optional()
});

export const listBookingsQuerySchema = z.object({
  status: z.enum(['PENDENTE', 'ACEITO', 'CONFIRMADO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO', 'DISPUTA']).optional(),
  page: z.string().optional(),
  limit: z.string().optional()
});

export const rejectBookingSchema = z.object({
  motivo: z.string().min(10, 'Motivo deve ter no mínimo 10 caracteres').optional()
});

export const counterOfferSchema = z.object({
  valorProposto: z.number().positive('Valor deve ser positivo'),
  mensagem: z.string().min(10, 'Mensagem deve ter no mínimo 10 caracteres').optional()
});

// Review schemas
export const createReviewSchema = z.object({
  profissionalismo: z.number().int().min(1).max(5, 'Nota deve ser entre 1 e 5'),
  pontualidade: z.number().int().min(1).max(5, 'Nota deve ser entre 1 e 5'),
  performance: z.number().int().min(1).max(5, 'Nota deve ser entre 1 e 5').optional(),
  comunicacao: z.number().int().min(1).max(5, 'Nota deve ser entre 1 e 5'),
  condicoes: z.number().int().min(1).max(5, 'Nota deve ser entre 1 e 5').optional(),
  respeito: z.number().int().min(1).max(5, 'Nota deve ser entre 1 e 5').optional(),
  comentario: z.string().max(500, 'Comentário deve ter no máximo 500 caracteres').optional()
});

export const listReviewsQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional()
});

// Chat schemas
export const sendMessageSchema = z.object({
  conteudo: z.string().min(1, 'Mensagem não pode ser vazia').max(1000, 'Mensagem muito longa (máx 1000 caracteres)')
});

export const getMessagesQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional()
});

// Payment schemas
export const createPaymentSchema = z.object({
  billingType: z.enum(['PIX', 'CREDIT_CARD'], { required_error: 'Tipo de pagamento é obrigatório' }),
  creditCard: z.object({
    holderName: z.string().min(3, 'Nome do titular inválido'),
    number: z.string().regex(/^\d{13,16}$/, 'Número do cartão inválido'),
    expiryMonth: z.string().regex(/^(0[1-9]|1[0-2])$/, 'Mês inválido'),
    expiryYear: z.string().regex(/^\d{4}$/, 'Ano inválido'),
    ccv: z.string().regex(/^\d{3,4}$/, 'CVV inválido')
  }).optional(),
  creditCardHolderInfo: z.object({
    name: z.string().min(3, 'Nome inválido'),
    email: z.string().email('Email inválido'),
    cpfCnpj: z.string().regex(/^\d{11}|\d{14}$/, 'CPF/CNPJ inválido'),
    postalCode: z.string().regex(/^\d{8}$/, 'CEP inválido'),
    addressNumber: z.string().min(1, 'Número do endereço é obrigatório'),
    phone: z.string().regex(/^\d{10,11}$/, 'Telefone inválido')
  }).optional()
}).refine((data) => {
  if (data.billingType === 'CREDIT_CARD') {
    return data.creditCard && data.creditCardHolderInfo;
  }
  return true;
}, {
  message: 'Dados do cartão são obrigatórios para pagamento via cartão de crédito'
});

export const refundRequestSchema = z.object({
  motivo: z.string().min(10, 'Motivo deve ter no mínimo 10 caracteres').optional(),
  valorParcial: z.number().positive('Valor deve ser positivo').optional()
});

// Check-in schemas
export const checkInSchema = z.object({
  latitude: z.number().min(-90).max(90, 'Latitude inválida'),
  longitude: z.number().min(-180).max(180, 'Longitude inválida')
});

export const checkOutSchema = z.object({
  latitude: z.number().min(-90).max(90, 'Latitude inválida').optional(),
  longitude: z.number().min(-180).max(180, 'Longitude inválida').optional()
});

# KXRTEX - Underground Artist Booking Platform

**Status do MVP: 100% COMPLETO** 🚀✅
**Backend + Web + Mobile: FULL STACK COMPLETO**

Plataforma de booking para artistas underground (DJs, MCs, Performers) com pagamentos seguros, chat em tempo real, avaliações bilaterais e upload de imagens via Cloudinary.

## 🎵 Sobre o Projeto

KXRTEX conecta contratantes a artistas underground, oferecendo:
- Descoberta de artistas por categoria/localização
- Negociação e fechamento seguro de bookings
- Sistema de pagamento intermediado com proteção
- Chat em tempo real
- Sistema de avaliações bilateral
- Adiantamento inteligente para eventos fora da cidade

## 🛠 Stack Tecnológica

### Backend
- Node.js + Express.js
- PostgreSQL + Prisma ORM
- Socket.IO (chat em tempo real)
- Redis (cache e filas - opcional)
- JWT (autenticação)
- Bcrypt (hash de senhas)
- Axios (requisições HTTP)

### Web Frontend
- React 18 + Vite
- React Router v6 (navegação)
- React Query (gerenciamento de estado do servidor)
- Zustand (estado global de autenticação)
- Socket.IO Client (real-time)
- Tailwind CSS (estilização)

### Mobile
- React Native + Expo
- Expo Router (navegação file-based)
- Zustand + AsyncStorage (persistência)
- Socket.IO Client
- React Query

### Serviços Externos
- ASAAS (pagamentos PIX e cartão)
- Cloudinary (storage de imagens/vídeos)
- Firebase (push notifications - pendente)
- SendGrid (emails transacionais - pendente)

## 📁 Estrutura do Projeto

```
KXRTEX/
├── backend/           # API Node.js + Express + Prisma
│   ├── prisma/       # Schema e migrations (14 models)
│   └── src/
│       ├── config/   # Database, Cloudinary, Rate Limiter
│       ├── controllers/ # 8 controllers (auth, artist, booking, chat, payment, review, user, checkin)
│       ├── middlewares/ # Auth, validation, error handling
│       ├── routes/   # 8 route files
│       ├── services/ # ASAAS, Cloudinary
│       ├── utils/    # Validation schemas, Socket helpers
│       └── server.js # Express + Socket.IO setup
├── web/              # Frontend React + Vite
│   └── src/
│       ├── pages/    # 9 pages (Home, Login, Register, Artists, Bookings, etc.)
│       ├── components/ # ChatBox, PaymentModal, NotificationToast, ProtectedRoute
│       ├── contexts/ # SocketContext
│       ├── services/ # API client (axios)
│       └── store/    # AuthStore (Zustand)
├── mobile/           # App React Native + Expo
│   ├── app/         # File-based routing (Expo Router)
│   └── src/         # Screens, services, store
└── docs/            # Documentação completa (PRD, MVP, Next Steps)
```

## 🚀 Como Rodar

### Pré-requisitos
- Node.js 18+
- PostgreSQL 15+
- Redis 7+ (opcional para desenvolvimento)

### Instalação Rápida (Stack Completo)

```bash
# Terminal 1 - Backend
cd backend
npm install
cp .env.example .env
# Edite .env com DATABASE_URL e JWT_SECRET
npx prisma migrate dev
npm run dev

# Terminal 2 - Web
cd web
npm install
npm run dev

# Terminal 3 - Mobile (opcional)
cd mobile
npm install
npx expo start
```

### Backend

1. Entre na pasta do backend:
```bash
cd backend
npm install
```

2. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

**Variáveis essenciais:**
- `DATABASE_URL`: `postgresql://user:password@localhost:5432/kxrtex`
- `JWT_SECRET`: Gere uma chave segura (ex: `openssl rand -base64 32`)

**Variáveis opcionais (para funcionalidades completas):**
- `ASAAS_API_KEY`: Chave de API do ASAAS (sandbox ou production)
- `CLOUDINARY_*`: Credenciais do Cloudinary para upload de imagens

3. Execute as migrations do banco:
```bash
npx prisma migrate dev
```

4. Inicie o servidor:
```bash
npm run dev
```

O servidor estará rodando em `http://localhost:3000`

### Web Frontend

1. Entre na pasta web:
```bash
cd web
npm install
```

2. Configure .env (opcional):
```bash
cp .env.example .env
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

A aplicação web estará em `http://localhost:5173`

### Mobile

1. Entre na pasta mobile:
```bash
cd mobile
npm install
```

2. Configure .env com o IP da sua máquina:
```bash
cp .env.example .env
# Edite API_URL para http://SEU-IP-LOCAL:3000/api
```

3. Inicie o Expo:
```bash
npx expo start
```

Escaneie o QR code com o app Expo Go no seu celular.

## 📋 Variáveis de Ambiente

Veja o arquivo `.env.example` para a lista completa de variáveis necessárias.

### Essenciais para desenvolvimento:
- `DATABASE_URL`: URL de conexão do PostgreSQL
- `JWT_SECRET`: Chave secreta para JWT
- `REDIS_HOST`: Host do Redis

### Para funcionalidades completas:
- Credenciais Cloudinary (upload de imagens)
- Credenciais ASAAS (pagamentos)
- Credenciais Firebase (notificações)
- Credenciais SendGrid (emails)

## 🔒 Segurança

- Senhas hashadas com bcrypt (salt rounds: 10)
- Autenticação via JWT
- Rate limiting (100 req/min)
- Validação de inputs com Zod
- HTTPS obrigatório em produção
- CORS configurado

## 📊 Status do Desenvolvimento

### ✅ MVP - 100% COMPLETO

**Backend (100% completo):**
- [x] Sistema de autenticação JWT completo
- [x] CRUD de artistas com busca e filtros
- [x] CRUD de bookings com negociação
- [x] Chat em tempo real com Socket.IO
- [x] Sistema de pagamentos ASAAS (PIX + Cartão)
- [x] Sistema de avaliações bilaterais (6 critérios)
- [x] Sistema de check-in/check-out com geolocalização
- [x] Webhooks do ASAAS para confirmação de pagamento
- [x] Anti-circumvention no chat (detecção de contatos)
- [x] Liberação de pagamento após 48h do evento

**Web Frontend (100% completo):**
- [x] Sistema de autenticação e registro
- [x] Busca de artistas com filtros avançados
- [x] Perfil de artista com portfolio e avaliações
- [x] Criação e gerenciamento de bookings
- [x] Chat em tempo real com typing indicators
- [x] Modal de pagamento PIX com QR Code
- [x] Sistema de avaliações com 6 critérios
- [x] Notificações em tempo real via Socket.IO
- [x] Design responsivo com Tailwind CSS
- [x] Check-in/check-out com geolocalização e foto
- [x] Upload de imagens (perfil e portfolio)
- [x] Página de perfil completa
- [x] Portfolio com drag-and-drop

**Mobile (100%):**
- [x] Navegação completa com Expo Router
- [x] Autenticação com persistência
- [x] Busca de artistas integrada
- [x] Lista de bookings integrada
- [x] Socket.IO conectado
- [x] Telas de detalhes (artista, booking)
- [x] Chat mobile com mensagens em tempo real
- [x] Pagamento mobile (PIX + Cartão)
- [x] Componentes de imagem upload
- [x] Edit profile screen

**Integrações:**
- [x] ASAAS (backend completo, aguardando API keys para testes em produção)
- [x] Cloudinary (integração completa com upload de imagens)
- [ ] Firebase (push notifications - planejado para Fase 3)
- [ ] SendGrid (emails transacionais - planejado para Fase 3)

### 🚀 Próximas Fases

**Fase 2 - Melhorias e Otimizações:**
- Planos de assinatura (FREE/PLUS/PRO com cobrança recorrente)
- Dashboard de analytics para artistas
- Upload de imagens via Cloudinary
- Sistema de cupons de desconto
- Otimizações de performance

**Fase 3 - Funcionalidades Avançadas:**
- Sistema de adiantamento para eventos >200km
- Check-in com foto e geolocalização (UI web/mobile)
- Painel administrativo para moderação
- Sistema de disputas
- Notificações push via Firebase

**Fase 4 - Produção:**
- Testes end-to-end automatizados
- Deploy (Backend + Web + Mobile)
- Monitoramento e logs (Sentry)
- CDN para assets estáticos
- Otimizações de SEO

## 📖 Documentação

- [PRD Completo](./docs/KXRTEX-PRD-Optimized.md) - Requisitos detalhados do produto
- **[MVP Completo](./docs/MVP_COMPLETE.md) - Documentação completa do MVP** ⭐
- [Próximos Passos](./docs/NEXT-STEPS.md) - Guia de desenvolvimento
- [Comandos Úteis](./docs/COMMANDS.md) - Referência rápida de comandos
- [Setup Summary](./docs/SETUP-SUMMARY.md) - Configurações iniciais
- [Mobile Integration](./docs/MOBILE_INTEGRATION_COMPLETE.md) - Integração mobile

## 🎯 Principais Funcionalidades Implementadas

### Para Contratantes:
1. **Buscar Artistas** - Filtros por categoria, cidade, faixa de preço, avaliação
2. **Solicitar Booking** - Criar proposta com data, horário, local, orçamento
3. **Negociar** - Chat em tempo real com artista
4. **Pagar** - PIX instantâneo com QR Code via ASAAS
5. **Avaliar** - Sistema de avaliação com 6 critérios após evento

### Para Artistas:
1. **Criar Perfil** - Nome artístico, categoria, portfolio, valor base
2. **Receber Propostas** - Notificações em tempo real
3. **Negociar** - Aceitar, recusar ou fazer contra-proposta
4. **Chat** - Comunicação protegida (anti-circumvention)
5. **Check-in/Check-out** - Confirmar presença no evento com geolocalização
6. **Receber Pagamento** - Liberação automática 48h após evento

### Segurança e Qualidade:
- 🔒 Pagamentos retidos até conclusão do evento
- 🚫 Detecção automática de compartilhamento de contatos
- ⭐ Sistema de avaliações bilateral
- 📍 Check-in com geolocalização (até 500m do local)
- 💬 Chat em tempo real com indicadores de digitação
- 🔔 Notificações push em tempo real

## 🤝 Contribuindo

Este é um projeto em desenvolvimento inicial. Contribuições serão bem-vindas em breve.

## 📄 Licença

MIT

---

**Desenvolvido com ❤️ para a cena underground**

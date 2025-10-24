# KXRTEX - Underground Artist Booking Platform

Plataforma de booking para artistas underground (DJs, MCs, Performers).

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
- Redis (cache e filas)
- JWT (autenticação)

### Mobile
- React Native + Expo
- React Navigation
- Zustand (state management)
- Socket.IO Client

### Serviços Externos
- ASAAS (pagamentos)
- Cloudinary (storage de imagens/vídeos)
- Firebase (push notifications)
- SendGrid (emails)

## 📁 Estrutura do Projeto

```
KXRTEX/
├── backend/           # API Node.js
│   ├── prisma/       # Schema e migrations
│   └── src/
│       ├── config/   # Configurações
│       ├── controllers/
│       ├── middlewares/
│       ├── routes/
│       ├── services/
│       ├── utils/
│       └── server.js
├── mobile/           # App React Native
├── shared/           # Tipos compartilhados
└── docs/            # Documentação
```

## 🚀 Como Rodar

### Pré-requisitos
- Node.js 18+
- PostgreSQL 15+
- Redis 7+

### Backend

1. Entre na pasta do backend:
```bash
cd backend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite o arquivo .env com suas credenciais
```

4. Execute as migrations do banco:
```bash
npm run db:migrate
```

5. Inicie o servidor:
```bash
npm run dev
```

O servidor estará rodando em `http://localhost:3000`

### Mobile

1. Entre na pasta mobile:
```bash
cd mobile
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o Expo:
```bash
npm start
```

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

### ✅ Fase 1 - MVP (Em andamento)

**Concluído:**
- [x] Estrutura de pastas
- [x] Setup do backend
- [x] Schema do banco de dados (Prisma)
- [x] Sistema de autenticação JWT
- [x] Middlewares de segurança
- [x] Rate limiting

**Em desenvolvimento:**
- [ ] CRUD de artistas
- [ ] Sistema de busca e filtros
- [ ] CRUD de bookings
- [ ] Chat em tempo real
- [ ] Integração ASAAS
- [ ] Upload de imagens (Cloudinary)
- [ ] Sistema de avaliações

**Próximas fases:**
- Fase 2: Planos de assinatura, dashboard
- Fase 3: Adiantamentos, disputas, admin panel
- Fase 4: Analytics, otimizações, testes

## 📖 Documentação

- [PRD Completo](./docs/KXRTEX-PRD-Optimized.md) - Requisitos detalhados do produto
- [Resumo do Setup](./docs/SETUP-SUMMARY.md) - O que foi configurado no projeto
- [Próximos Passos](./docs/NEXT-STEPS.md) - Guia de desenvolvimento
- [Comandos Úteis](./docs/COMMANDS.md) - Referência rápida de comandos
- API Docs (em breve)

## 🤝 Contribuindo

Este é um projeto em desenvolvimento inicial. Contribuições serão bem-vindas em breve.

## 📄 Licença

MIT

---

**Desenvolvido com ❤️ para a cena underground**

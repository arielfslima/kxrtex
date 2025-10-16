# KXRTEX 🎵

**Plataforma de Booking para Artistas Underground**

KXRTEX é uma plataforma inovadora que conecta artistas underground (DJs, MCs, Performers) com organizadores de eventos, facilitando o processo de contratação e pagamento de forma segura e eficiente.

## 🚀 Funcionalidades

### Para Artistas
- ✅ Perfil profissional completo com portfólio
- ✅ Gestão de propostas de booking
- ✅ Sistema de chat em tempo real
- ✅ Controle financeiro integrado
- ✅ Notificações push e email

### Para Contratantes
- ✅ Busca avançada de artistas
- ✅ Sistema de propostas e negociação
- ✅ Pagamentos seguros via PIX e cartão
- ✅ Chat direto com artistas
- ✅ Histórico completo de eventos

### Sistema Completo
- ✅ Autenticação JWT com refresh tokens
- ✅ Upload de mídia via Cloudinary
- ✅ Pagamentos via ASAAS Gateway
- ✅ Notificações em tempo real (Socket.io)
- ✅ Sistema de avaliações
- ✅ Cache com Redis
- ✅ Logs estruturados

## 🛠️ Tecnologias

### Backend
- **Node.js** + **Express.js**
- **PostgreSQL** com **Sequelize ORM**
- **Redis** para cache e sessões
- **Socket.io** para tempo real
- **JWT** para autenticação
- **Cloudinary** para armazenamento de mídia
- **ASAAS** para processamento de pagamentos
- **Nodemailer** + **Web Push** para notificações

### Segurança & Performance
- **Helmet** para segurança HTTP
- **Rate Limiting** para proteção contra abuso
- **CORS** configurado
- **Logs estruturados** com Winston
- **Validação** com Express Validator

## 📦 Instalação

### Pré-requisitos
- Node.js (>= 18.0.0)
- PostgreSQL (>= 13)
- Redis (>= 6)
- NPM (>= 8.0.0)

### Setup do Projeto

1. **Clone o repositório**
```bash
git clone https://github.com/arielfslima/kxrtex.git
cd kxrtex
```

2. **Instale as dependências**
```bash
cd backend
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. **Configure o banco de dados**
```bash
# Execute as migrações
npm run migrate
```

5. **Gere chaves VAPID para push notifications**
```bash
npm run generate-vapid
# Adicione as chaves geradas ao seu .env
```

6. **Inicie o servidor**
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## 🔧 Configuração

### Variáveis de Ambiente Principais

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/kxrtex_db

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_REFRESH_SECRET=your_refresh_token_secret

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ASAAS (Pagamentos)
ASAAS_API_KEY=your_asaas_api_key
ASAAS_WEBHOOK_TOKEN=your_webhook_token

# Email
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Push Notifications
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
```

## 📚 API Endpoints

### Autenticação
- `POST /api/auth/register` - Registro de usuário
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Renovar token
- `POST /api/auth/logout` - Logout

### Profissionais
- `GET /api/profissionais` - Listar artistas
- `GET /api/profissionais/:id` - Detalhes do artista
- `PUT /api/profissionais/profile` - Atualizar perfil

### Bookings
- `POST /api/bookings` - Criar proposta
- `GET /api/bookings` - Listar bookings
- `PUT /api/bookings/:id/accept` - Aceitar booking
- `PUT /api/bookings/:id/reject` - Rejeitar booking

### Pagamentos
- `POST /api/pagamentos/:booking_id` - Criar pagamento
- `GET /api/pagamentos/:booking_id/status` - Status do pagamento
- `POST /api/pagamentos/webhook` - Webhook ASAAS

### Notificações
- `GET /api/notificacoes` - Listar notificações
- `PATCH /api/notificacoes/:id/read` - Marcar como lida
- `POST /api/notificacoes/push/subscribe` - Subscrever push

## 🏗️ Arquitetura

```
backend/
├── src/
│   ├── config/          # Configurações (DB, Redis, Cloudinary)
│   ├── controllers/     # Controladores da API
│   ├── middlewares/     # Middlewares (auth, validação, etc)
│   ├── models/          # Modelos Sequelize
│   ├── routes/          # Definição das rotas
│   ├── services/        # Serviços de negócio
│   ├── sockets/         # Socket.io handlers
│   ├── utils/           # Utilitários e helpers
│   └── server.js        # Ponto de entrada
├── migrations/          # Migrações do banco
├── scripts/             # Scripts utilitários
└── package.json
```

## 🚧 Desenvolvimento

### Scripts Disponíveis

```bash
npm run dev           # Servidor de desenvolvimento
npm run start         # Servidor de produção
npm run migrate       # Executar migrações
npm run generate-vapid # Gerar chaves VAPID
npm test              # Executar testes
npm run test:watch    # Testes em modo watch
```

### Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Roadmap

- [ ] **Frontend React/Next.js**
- [ ] **Mobile App React Native**
- [ ] **Sistema de Reviews**
- [ ] **Analytics Dashboard**
- [ ] **API Rate Limiting Avançado**
- [ ] **Sistema de Dispute Resolution**
- [ ] **Multi-tenant Support**

## 📄 Licença

Este projeto é propriedade privada. Todos os direitos reservados.

## 👥 Equipe

- **KXNTRALEI** - Idealização e Desenvolvimento

## 📞 Suporte

Para dúvidas ou suporte, entre em contato:
- Email: support@kxrtex.com
- Discord: [KXRTEX Community](https://discord.gg/kxrtex)

---

**KXRTEX** - Conectando a cena underground 🎵✨
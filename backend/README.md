# KXRTEX Backend API

Backend da plataforma KXRTEX - Sistema de booking para artistas underground.

## 🚀 Tecnologias

- **Node.js** 18+
- **Express.js** - Framework web
- **PostgreSQL** - Banco de dados principal
- **Redis** - Cache e sessões
- **Socket.io** - Chat em tempo real
- **JWT** - Autenticação
- **Sequelize** - ORM
- **bcryptjs** - Hash de senhas
- **Cloudinary** - Upload de imagens

## 📁 Estrutura do Projeto

```
backend/
├── src/
│   ├── config/          # Configurações (DB, Redis)
│   ├── controllers/     # Controladores das rotas
│   ├── middlewares/     # Middlewares customizados
│   ├── models/          # Modelos do banco de dados
│   ├── routes/          # Definição das rotas
│   ├── services/        # Serviços e lógica de negócio
│   ├── sockets/         # Handlers do Socket.io
│   ├── utils/           # Utilitários e helpers
│   ├── validators/      # Validações de entrada
│   └── server.js        # Arquivo principal
├── migrations/          # Migrações do banco
├── seeders/            # Seeds do banco
├── tests/              # Testes automatizados
└── logs/               # Logs da aplicação
```

## 🛠️ Setup Local

### Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- Redis 6+

### 1. Clonar e instalar dependências

```bash
cd backend
npm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env` e configure:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# Environment
NODE_ENV=development
PORT=3333

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/kxrtex_db
DB_HOST=localhost
DB_PORT=5432
DB_NAME=kxrtex_dev
DB_USER=postgres
DB_PASSWORD=your_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# Cloudinary (opcional para desenvolvimento)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Configurar banco de dados

Criar o banco de dados:

```sql
-- No PostgreSQL
CREATE DATABASE kxrtex_dev;
CREATE DATABASE kxrtex_test;
```

### 4. Executar o servidor

```bash
# Modo desenvolvimento (com hot reload)
npm run dev

# Modo produção
npm start
```

O servidor estará rodando em `http://localhost:3333`

## 📡 Endpoints da API

### Autenticação

- `POST /api/auth/register` - Cadastro de usuário
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Renovar token
- `POST /api/auth/forgot-password` - Esqueci minha senha
- `POST /api/auth/reset-password` - Redefinir senha
- `GET /api/auth/me` - Dados do usuário logado

### Usuários

- `GET /api/users/profile` - Perfil do usuário
- `PUT /api/users/profile` - Atualizar perfil
- `POST /api/users/upload-photo` - Upload de foto
- `PUT /api/users/change-password` - Alterar senha

### Profissionais

- `GET /api/profissionais` - Listar artistas
- `GET /api/profissionais/:id` - Detalhes do artista
- `POST /api/profissionais` - Criar perfil de artista
- `PUT /api/profissionais/:id` - Atualizar perfil

### Bookings

- `GET /api/bookings` - Listar bookings
- `GET /api/bookings/:id` - Detalhes do booking
- `POST /api/bookings` - Criar booking
- `PUT /api/bookings/:id/accept` - Aceitar booking
- `PUT /api/bookings/:id/reject` - Rejeitar booking
- `PUT /api/bookings/:id/cancel` - Cancelar booking

### Mensagens

- `GET /api/mensagens/booking/:booking_id` - Mensagens do booking
- `POST /api/mensagens` - Enviar mensagem
- `PUT /api/mensagens/:id/read` - Marcar como lida

### Pagamentos

- `POST /api/pagamentos/:booking_id/create` - Criar pagamento
- `GET /api/pagamentos/:booking_id` - Status do pagamento
- `POST /api/pagamentos/webhook` - Webhook ASAAS

## 🔌 Socket.io Events

### Cliente → Servidor

- `join:booking` - Entrar na sala do booking
- `leave:booking` - Sair da sala do booking
- `message:send` - Enviar mensagem
- `typing:start` - Começar a digitar
- `typing:stop` - Parar de digitar
- `message:read` - Marcar mensagem como lida

### Servidor → Cliente

- `joined:booking` - Confirmação de entrada na sala
- `message:received` - Nova mensagem recebida
- `typing:started` - Usuário começou a digitar
- `typing:stopped` - Usuário parou de digitar
- `notification:new` - Nova notificação
- `user:offline` - Usuário ficou offline

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm run test:watch
```

## 📊 Logging

Os logs são salvos na pasta `logs/`:

- `error.log` - Apenas erros
- `combined.log` - Todos os logs
- `exceptions.log` - Exceções não tratadas

## 🔐 Autenticação

### Headers de autenticação

```
Authorization: Bearer <JWT_TOKEN>
```

### Estrutura do JWT

```json
{
  "id": "user_uuid",
  "email": "user@email.com",
  "tipo": "contratante|artista|admin",
  "verificado": true
}
```

## 📈 Status de Resposta

### Sucesso

```json
{
  "success": true,
  "message": "Operação realizada com sucesso",
  "data": {...}
}
```

### Erro

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Descrição do erro"
  }
}
```

## 🚦 Rate Limiting

- **Geral**: 100 requests/15 min
- **Auth**: 5 requests/15 min
- **Upload**: 20 uploads/hora
- **API**: 30 requests/minuto

## 📝 Scripts Disponíveis

```bash
npm run dev        # Servidor em modo desenvolvimento
npm start          # Servidor em modo produção
npm test           # Executar testes
npm run migrate    # Executar migrações
npm run seed       # Executar seeds
```

## 🏗️ Próximos Passos

1. **Implementar controllers completos** - Substituir os stubs por implementações reais
2. **Adicionar migrações do banco** - Criar as tabelas via migrations
3. **Implementar upload de arquivos** - Integração com Cloudinary
4. **Adicionar testes** - Testes unitários e de integração
5. **Configurar CI/CD** - Deploy automatizado
6. **Implementar notificações push** - Firebase
7. **Adicionar monitoramento** - Logs e métricas

## 📞 Suporte

Para dúvidas e suporte, entre em contato com a equipe de desenvolvimento.

---

**KXRTEX** - O núcleo da cena underground 🎧
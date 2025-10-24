# Próximos Passos - KXRTEX

Este documento detalha os próximos passos para continuar o desenvolvimento do KXRTEX após o setup inicial.

## ✅ O que já foi feito

### Backend
- [x] Estrutura de pastas organizada
- [x] Configuração do Express.js com middlewares de segurança
- [x] Schema completo do Prisma com todas as tabelas do MVP
- [x] Sistema de autenticação JWT completo
- [x] Rate limiting configurado
- [x] Error handling padronizado
- [x] Configuração do Socket.IO para chat
- [x] Configuração do Cloudinary
- [x] Rotas básicas (placeholders)

### Mobile
- [x] Setup do Expo com Expo Router
- [x] Estrutura de navegação (auth + tabs)
- [x] Design system (cores, constantes)
- [x] Store de autenticação (Zustand)
- [x] Configuração do Axios
- [x] Telas base (Welcome, Login, Register, Home, Bookings, Profile)

## 🎯 Próximos Passos Prioritários

### 1. Configurar Ambiente de Desenvolvimento (PRIMEIRO PASSO!)

#### Backend
```bash
cd backend
npm install
cp .env.example .env
# Editar .env com suas credenciais
```

**Configurar PostgreSQL:**
- Instalar PostgreSQL 15+
- Criar database: `createdb kxrtex`
- Atualizar `DATABASE_URL` no `.env`

**Executar migrations:**
```bash
npm run db:migrate
```

**Iniciar servidor:**
```bash
npm run dev
```

#### Mobile
```bash
cd mobile
npm install
cp .env.example .env
# Configurar API_URL (ex: http://192.168.1.X:3000/api para testar no celular)
npm start
```

### 2. Implementar CRUD de Artistas

**Backend:**
- [ ] `GET /api/artists` - Listar artistas com filtros
  - Implementar filtros: categoria, subcategoria, localização, preço, avaliação
  - Implementar paginação
  - Implementar ordenação (relevância, preço, avaliação)
  - Implementar algoritmo de ranking do PRD
- [ ] `GET /api/artists/:id` - Detalhes do artista
- [ ] `PATCH /api/artists/:id` - Atualizar perfil (apenas o próprio artista)
- [ ] `POST /api/artists/:id/upload` - Upload de fotos/vídeos do portfolio

**Mobile:**
- [ ] Tela de busca com filtros
- [ ] Card de artista (componente reutilizável)
- [ ] Tela de detalhes do artista
- [ ] Tela de edição de perfil (artista)

### 3. Implementar Sistema de Bookings

**Backend:**
- [ ] `POST /api/bookings` - Criar proposta de booking
  - Validar disponibilidade do artista
  - Calcular taxa baseada no plano
  - Calcular distância (se precisar de adiantamento)
- [ ] `GET /api/bookings` - Listar bookings do usuário
- [ ] `GET /api/bookings/:id` - Detalhes do booking
- [ ] `PATCH /api/bookings/:id/accept` - Aceitar booking
- [ ] `PATCH /api/bookings/:id/reject` - Recusar booking
- [ ] `POST /api/bookings/:id/counter-offer` - Contra-proposta

**Mobile:**
- [ ] Formulário de solicitação de booking
- [ ] Lista de bookings (filtros: todos, pendentes, confirmados, etc)
- [ ] Detalhes do booking
- [ ] Ações: aceitar, recusar, contra-propor

### 4. Implementar Chat em Tempo Real

**Backend:**
- [ ] Melhorar handlers do Socket.IO
- [ ] `POST /api/bookings/:id/messages` - Enviar mensagem (REST fallback)
- [ ] `GET /api/bookings/:id/messages` - Histórico de mensagens
- [ ] Implementar sistema anti-contorno (detectar telefone, email, @instagram)

**Mobile:**
- [ ] Tela de chat
- [ ] Integração com Socket.IO
- [ ] Notificações de novas mensagens
- [ ] Indicador de "digitando..."

### 5. Integração com ASAAS (Pagamentos)

**Backend:**
- [ ] Criar módulo de serviço ASAAS (`services/asaas.service.js`)
- [ ] Implementar criação de cobrança PIX
- [ ] Implementar criação de cobrança Cartão
- [ ] Implementar webhooks do ASAAS
- [ ] Implementar liberação de pagamento (split)
- [ ] Implementar saques para artistas

**Mobile:**
- [ ] Tela de pagamento PIX (QR Code)
- [ ] Tela de pagamento Cartão
- [ ] Tela de saldo/saques (artista)

### 6. Sistema de Avaliações

**Backend:**
- [ ] `POST /api/bookings/:id/review` - Criar avaliação
- [ ] `GET /api/artists/:id/reviews` - Listar avaliações
- [ ] Calcular média automaticamente

**Mobile:**
- [ ] Modal/Tela de avaliação
- [ ] Exibir avaliações no perfil do artista

### 7. Upload de Imagens (Cloudinary)

**Backend:**
- [ ] Implementar middleware de upload com Multer
- [ ] Endpoint para upload de foto de perfil
- [ ] Endpoint para upload de portfolio
- [ ] Validação de tamanho/tipo de arquivo

**Mobile:**
- [ ] Integrar expo-image-picker
- [ ] Upload de foto de perfil
- [ ] Upload de fotos do portfolio

## 📝 Backlog (Funcionalidades Fase 2+)

### Planos de Assinatura
- [ ] Lógica de upgrade/downgrade de plano
- [ ] Integração com ASAAS para cobrança recorrente
- [ ] Limites por plano (fotos, vídeos, etc)

### Dashboard e Estatísticas
- [ ] Dashboard do artista (visitas, propostas, conversão)
- [ ] Dashboard do contratante
- [ ] Gráficos e métricas

### Sistema de Adiantamento
- [ ] Lógica de cálculo de distância
- [ ] Check-in com geolocalização
- [ ] Upload de foto de comprovante
- [ ] Liberação parcial de pagamento

### Painel Admin
- [ ] Dashboard administrativo
- [ ] Gestão de usuários
- [ ] Gestão de bookings
- [ ] Moderação de conteúdo
- [ ] Sistema de disputas

## 🛠 Ferramentas Úteis

### Desenvolvimento
- **Prisma Studio**: `cd backend && npm run db:studio` - Interface visual do banco
- **Expo DevTools**: Aberto automaticamente com `npm start`

### Testing
- Testar API: [Postman](https://www.postman.com/) ou [Insomnia](https://insomnia.rest/)
- Testar webhooks: [ngrok](https://ngrok.com/) para expor localhost

### Debugging
- Backend: Usar `console.log` ou VS Code debugger
- Mobile: Usar React Native Debugger ou Expo Dev Tools

## 📚 Recursos de Aprendizado

- [Prisma Docs](https://www.prisma.io/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Expo Router Docs](https://expo.github.io/router/docs)
- [Socket.IO Docs](https://socket.io/docs/v4/)
- [ASAAS API Docs](https://docs.asaas.com/)
- [Cloudinary Upload API](https://cloudinary.com/documentation/image_upload_api_reference)

## 🚨 Importante

1. **Nunca commite o arquivo `.env`** - Ele contém credenciais sensíveis
2. **Mantenha as dependências atualizadas** - Rode `npm outdated` periodicamente
3. **Teste em dispositivo real** - Expo permite testar via app Expo Go
4. **Use migrations do Prisma** - Nunca edite o banco diretamente

## 💡 Dicas

- Comece sempre pelo backend (API) e depois mobile
- Teste cada endpoint no Postman antes de integrar no mobile
- Use o Prisma Studio para verificar dados no banco
- Faça commits frequentes com mensagens descritivas
- Leia o PRD antes de implementar cada feature

---

**Boa sorte no desenvolvimento! 🚀**

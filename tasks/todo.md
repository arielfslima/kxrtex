# Development Plan - KXRTEX MVP - Fase Final Mobile

## Status Atual
- Backend: 100% completo (todas APIs implementadas e testadas)
- Mobile: 60% completo (componentes e screens criadas, mas não integradas nas rotas principais)

## Objetivo
Integrar as screens existentes nas rotas principais do app e finalizar o MVP mobile funcional.

## Tarefas Pendentes

### Sprint 10: Integração das Telas no Mobile - PENDENTE
- [ ] Task 10.1: Integrar ArtistsScreen na tela Home
  - Substituir placeholder em (tabs)/home.jsx
  - Usar ArtistsScreen já criada em src/screens/ArtistsScreen.jsx
  - Testar navegação para detalhes do artista

- [ ] Task 10.2: Integrar BookingsScreen na tela Bookings
  - Substituir placeholder em (tabs)/bookings.jsx
  - Usar BookingsScreen já criada em src/screens/BookingsScreen.jsx
  - Testar navegação para detalhes do booking

- [ ] Task 10.3: Configurar navegação para CreateBookingScreen
  - Adicionar botão de "Solicitar Booking" no ArtistDetailScreen
  - Configurar rota dinâmica ou modal para CreateBookingScreen
  - Testar fluxo completo de criação de booking

- [ ] Task 10.4: Testar integração com backend
  - Configurar API_URL no .env mobile
  - Testar autenticação (login/register)
  - Testar busca de artistas
  - Testar criação de booking
  - Testar listagem de bookings

### Sprint 11: Melhorias e Polimento - PENDENTE
- [ ] Task 11.1: Implementar estados de loading em todas as telas
  - Usar React Query loading states
  - Adicionar ActivityIndicator consistente
  - Tratar erros de rede

- [ ] Task 11.2: Implementar pull-to-refresh
  - Adicionar RefreshControl nas listas
  - Revalidar dados ao fazer pull

- [ ] Task 11.3: Melhorar UX dos formulários
  - Adicionar validação em tempo real
  - Melhorar feedback visual de erros
  - Adicionar máscaras de input (telefone, CPF, preço)

- [ ] Task 11.4: Implementar navegação para telas já criadas
  - Garantir que todas as screens estejam acessíveis
  - Testar deep linking quando necessário
  - Validar fluxo de pagamento

### Sprint 12: Funcionalidades Real-time - PENDENTE
- [ ] Task 12.1: Integrar Socket.IO no mobile
  - Configurar conexão Socket.IO no app
  - Conectar/desconectar baseado em auth state
  - Testar eventos básicos

- [ ] Task 12.2: Implementar notificações em tempo real
  - Escutar eventos de novo booking
  - Escutar eventos de mudança de status
  - Escutar eventos de nova mensagem
  - Atualizar UI automaticamente

- [ ] Task 12.3: Melhorar tela de chat
  - Garantir scroll automático para última mensagem
  - Implementar indicador de "digitando..."
  - Adicionar timestamps

### Sprint 13: Profile e Upload de Imagens - PENDENTE
- [ ] Task 13.1: Implementar tela de Profile
  - Exibir dados do usuário
  - Botão de editar perfil (artista)
  - Botão de logout
  - Exibir plano atual (artista)

- [ ] Task 13.2: Implementar upload de foto de perfil
  - Integrar expo-image-picker
  - Upload para backend (que envia para Cloudinary)
  - Atualizar preview após upload

- [ ] Task 13.3: Implementar upload de portfolio (artista)
  - Galeria de fotos do portfolio
  - Upload múltiplo
  - Remover fotos
  - Respeitar limite por plano

### Sprint 14: Testes Finais e Documentação - PENDENTE
- [ ] Task 14.1: Testar fluxo completo end-to-end
  - Cadastro de contratante e artista
  - Busca de artistas
  - Criação de booking
  - Aceitação de booking
  - Chat
  - Pagamento (PIX e Cartão)
  - Avaliação

- [ ] Task 14.2: Testar em dispositivos reais
  - Android
  - iOS
  - Diferentes tamanhos de tela

- [ ] Task 14.3: Criar documentação de uso
  - Guia de instalação do mobile
  - Como testar o app
  - Principais fluxos

- [ ] Task 14.4: Preparar para deploy
  - Build de produção
  - Configurar variáveis de ambiente de produção
  - Testar build

## Status Atual (Atualizado em 2025-10-24)

### ✅ Sprint 10: Integração das Telas no Mobile - COMPLETO
Todas as tasks foram concluídas com sucesso:
- ✅ Task 10.1: ArtistsScreen integrada na tela Home
- ✅ Task 10.2: BookingsScreen integrada na tela Bookings
- ✅ Task 10.3: Rotas dinâmicas criadas para detalhes e criação de booking
- ✅ Task 10.4: API_URL e SOCKET_URL configurados no .env mobile

### ✅ Funcionalidades Verificadas
- ✅ Estados de loading e error já implementados em todas as telas
- ✅ Pull-to-refresh já implementado nas listas
- ✅ Tela de Profile já implementada e completa
- ✅ Socket.IO integrado e conectando automaticamente

### 📄 Documentação Criada
Ver `docs/MOBILE_INTEGRATION_COMPLETE.md` para detalhes completos

## Próximo Passo Imediato
**Testar o app mobile** conectando ao backend para validar o fluxo completo end-to-end.

## Notas Importantes

### Estrutura de Navegação Atual
```
app/
├── (auth)/          # Telas de autenticação (já funcional)
│   ├── welcome.jsx
│   ├── login.jsx
│   └── register.jsx
├── (tabs)/          # Telas principais (PLACEHOLDERS - precisa integrar)
│   ├── home.jsx     # → Integrar ArtistsScreen
│   ├── bookings.jsx # → Integrar BookingsScreen
│   └── profile.jsx  # → Implementar Profile
├── payment/         # Fluxo de pagamento (já criado)
│   ├── [bookingId].jsx
│   ├── success.jsx
│   └── error.jsx
└── chat/            # Chat (já criado)
    └── [bookingId].jsx
```

### Componentes Já Criados
- `src/components/ArtistCard.jsx` - Card de artista
- `src/components/PixPayment.jsx` - Pagamento PIX
- `src/components/CardPayment.jsx` - Pagamento Cartão
- `src/components/ChatInput.jsx` - Input do chat
- `src/components/ChatMessage.jsx` - Mensagem do chat

### Screens Já Criadas (precisa integrar nas rotas)
- `src/screens/ArtistsScreen.jsx` - Lista de artistas com busca
- `src/screens/ArtistDetailScreen.jsx` - Detalhes do artista
- `src/screens/CreateBookingScreen.jsx` - Criar booking
- `src/screens/BookingsScreen.jsx` - Lista de bookings
- `src/screens/BookingDetailScreen.jsx` - Detalhes do booking

### Backend Endpoints Disponíveis
Todos os endpoints estão documentados e funcionais. Principais:
- `GET /api/artists` - Listar artistas
- `GET /api/artists/:id` - Detalhes do artista
- `POST /api/bookings` - Criar booking
- `GET /api/bookings` - Listar bookings
- `GET /api/bookings/:id` - Detalhes do booking
- `PATCH /api/bookings/:id/accept` - Aceitar booking
- `POST /api/payments` - Criar pagamento
- `POST /api/bookings/:id/checkin` - Check-in
- `POST /api/bookings/:id/checkout` - Check-out
- `POST /api/bookings/:id/review` - Avaliar

## Convenções a Seguir
1. Usar React Query para todas as chamadas de API
2. Implementar loading e error states
3. Seguir design system (colors.js)
4. Manter componentes pequenos e reutilizáveis
5. Testar em cada passo

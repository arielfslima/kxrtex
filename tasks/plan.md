# KXRTEX - Plano de Desenvolvimento Completo

**Data:** 24 de Outubro de 2025
**Versão:** 2.0 - Revisado e Atualizado

---

## 📊 Status Geral do Projeto

### Backend: ✅ **100% MVP Completo**
- 9 Sprints concluídos
- Todos endpoints implementados e testados
- Integração ASAAS funcionando
- Socket.IO configurado
- 40+ endpoints documentados

### Mobile: 🟡 **30% Completo**
- Estrutura básica configurada
- Busca e bookings implementados
- **Faltam funcionalidades críticas:** Auth, Chat, Pagamentos, Check-in, Avaliações

---

## 🎯 Objetivo do Plano

Completar o desenvolvimento do **Mobile App** para ter um MVP funcional end-to-end, permitindo:
1. Contratantes buscarem e contratarem artistas
2. Fluxo completo de pagamento
3. Chat em tempo real
4. Check-in/check-out no evento
5. Sistema de avaliações bilateral

---

## 📋 Plano de Desenvolvimento Mobile

### **Sprint 1: Autenticação e Onboarding**
**Prioridade:** 🔴 CRÍTICA
**Duração estimada:** 2-3 dias

#### Task 1.1: Implementar telas de autenticação
**Arquivos a criar:**
- `mobile/app/(auth)/login.jsx`
- `mobile/app/(auth)/register.jsx`
- `mobile/app/(auth)/welcome.jsx`
- `mobile/src/services/authService.js`

**Funcionalidades:**
- Tela Welcome com opções "Login" e "Cadastrar"
- Formulário de Login (email + senha)
- Formulário de Registro:
  - Escolher tipo: Contratante ou Artista
  - Campos: nome, email, senha, telefone, CPF/CNPJ
  - Validação em tempo real (Zod)
- Integração com `POST /api/auth/login` e `POST /api/auth/register`
- Salvar token no AsyncStorage via authStore
- Redirecionamento automático após login

**Validações:**
- Email válido
- Senha mínima 8 caracteres
- CPF/CNPJ válido (usar biblioteca de validação)
- Telefone no formato (XX) XXXXX-XXXX

#### Task 1.2: Configurar proteção de rotas
**Arquivos a modificar:**
- `mobile/app/_layout.jsx`

**Funcionalidades:**
- Verificar token ao iniciar app
- Redirecionar para (auth) se não autenticado
- Redirecionar para (tabs) se autenticado
- Implementar splash screen durante verificação

#### Task 1.3: Implementar logout
**Arquivos a modificar:**
- `mobile/src/store/authStore.js`
- `mobile/app/(tabs)/profile.jsx` (quando criado)

**Funcionalidades:**
- Limpar token do AsyncStorage
- Limpar cache do React Query
- Redirecionar para tela de login

**Critérios de aceite:**
- [ ] Usuário consegue se registrar como Contratante ou Artista
- [ ] Usuário consegue fazer login
- [ ] Token é salvo e persiste após fechar app
- [ ] Rotas protegidas redirecionam para login se não autenticado
- [ ] Logout limpa dados e redireciona

---

### **Sprint 2: Perfil do Usuário**
**Prioridade:** 🟡 ALTA
**Duração estimada:** 2 dias

#### Task 2.1: Implementar tela de perfil
**Arquivos a criar:**
- `mobile/app/(tabs)/profile.jsx`
- `mobile/src/components/ProfileHeader.jsx`

**Funcionalidades:**
- Header com foto, nome, email
- Badge de plano (se artista)
- Estatísticas (se artista): Nota média, Total de shows
- Menu de opções:
  - Editar Perfil
  - [Se artista] Gerenciar Portfolio
  - [Se artista] Ver Estatísticas
  - Configurações
  - Sair

**Integração:**
- `GET /api/users/me` para carregar dados

#### Task 2.2: Implementar edição de perfil
**Arquivos a criar:**
- `mobile/app/profile/edit-general.jsx` - Dados gerais
- `mobile/app/profile/edit-artist.jsx` - Dados do artista
- `mobile/src/components/ImagePicker.jsx`

**Dependências a instalar:**
```bash
npx expo install expo-image-picker
```

**Funcionalidades:**

**Edição Geral (todos usuários):**
- Upload de foto de perfil
- Nome
- Telefone
- Email (readonly, apenas exibir)

**Edição Artista (apenas artistas):**
- Nome artístico
- Categoria (picker)
- Subcategorias (multi-select, máx 3)
- Bio (TextArea, mín 50 chars)
- Cidades de atuação (input múltiplo)
- Preço base/hora
- Redes sociais (Instagram, SoundCloud, Spotify, YouTube, Twitter)

**Integração:**
- `PUT /api/users/me`
- `PUT /api/artists/me`
- `POST /api/upload/profile-photo`

#### Task 2.3: Implementar gestão de portfolio
**Arquivos a criar:**
- `mobile/app/profile/portfolio.jsx`
- `mobile/src/components/PortfolioGrid.jsx`

**Funcionalidades:**
- Grid de imagens do portfolio
- Botão "Adicionar Foto" (limitado por plano)
- Cada foto tem botão "Remover"
- Upload múltiplo
- Preview antes de upload
- Loading durante upload

**Limites por plano:**
- FREE: 5 imagens
- PLUS: 15 imagens
- PRO: Ilimitado

**Integração:**
- `POST /api/upload/portfolio`
- `DELETE /api/upload/portfolio/:publicId`

**Critérios de aceite:**
- [ ] Usuário visualiza seu perfil completo
- [ ] Usuário consegue editar dados gerais
- [ ] Artista consegue editar dados específicos
- [ ] Artista consegue fazer upload de foto de perfil
- [ ] Artista consegue adicionar/remover fotos do portfolio
- [ ] Limites de portfolio são respeitados

---

### **Sprint 3: Sistema de Pagamentos**
**Prioridade:** 🔴 CRÍTICA
**Duração estimada:** 2-3 dias

#### Task 3.1: Implementar tela de pagamento
**Arquivos a criar:**
- `mobile/app/payment/[bookingId].jsx`
- `mobile/src/components/PaymentMethodSelector.jsx`
- `mobile/src/components/PixPayment.jsx`
- `mobile/src/components/CardPayment.jsx`
- `mobile/src/services/paymentService.js`

**Dependências a instalar:**
```bash
npm install react-native-qrcode-svg
npm install @react-native-community/clipboard
```

**Funcionalidades:**

**Resumo do Pagamento:**
- Valor do artista
- Taxa da plataforma (% conforme plano)
- Valor total
- Breakdown visual

**Método PIX:**
1. Botão "Pagar com PIX"
2. Chamar `POST /api/payments/booking/:id` com `billingType: PIX`
3. Exibir QR Code (react-native-qrcode-svg)
4. Exibir código "Copia e Cola"
5. Botão para copiar código
6. Polling a cada 5s ou Socket.IO para status
7. Mostrar "Aguardando confirmação..."
8. Quando confirmado: Tela de sucesso

**Método Cartão:**
1. Formulário com campos:
   - Número do cartão (formatação automática)
   - Nome no cartão
   - Validade (MM/AA)
   - CVV
2. Validação de cartão (usar lib ou regex)
3. Botão "Pagar"
4. Chamar `POST /api/payments/booking/:id` com dados do cartão
5. Loading durante processamento
6. Tela de sucesso ou erro

#### Task 3.2: Implementar polling/socket para status
**Arquivos a criar:**
- `mobile/src/hooks/usePaymentStatus.js`

**Opção 1 - Polling:**
```javascript
// Hook que verifica status a cada 5s
usePaymentStatus(bookingId, onSuccess, onError)
```

**Opção 2 - Socket.IO (preferível):**
- Conectar ao Socket.IO
- Escutar evento `payment-confirmed`
- Callback quando pagamento confirmado

#### Task 3.3: Tela de sucesso/erro
**Arquivos a criar:**
- `mobile/app/payment/success.jsx`
- `mobile/app/payment/error.jsx`

**Funcionalidades:**
- Tela de sucesso: Animação, mensagem, botão "Ver Booking"
- Tela de erro: Mensagem, motivo, botão "Tentar Novamente"

**Critérios de aceite:**
- [ ] Contratante consegue acessar tela de pagamento
- [ ] PIX gera QR Code e código Copia e Cola
- [ ] Pagamento PIX é confirmado automaticamente
- [ ] Cartão processa pagamento corretamente
- [ ] Erros de pagamento são tratados adequadamente
- [ ] Booking atualiza para CONFIRMADO após pagamento

---

### **Sprint 4: Chat em Tempo Real**
**Prioridade:** 🔴 CRÍTICA
**Duração estimada:** 3 dias

#### Task 4.1: Configurar Socket.IO Client
**Arquivos a criar:**
- `mobile/src/services/socket.js`
- `mobile/src/hooks/useSocket.js`

**Configuração:**
```javascript
import io from 'socket.io-client';

const SOCKET_URL = API_BASE_URL.replace('/api', '');

class SocketService {
  socket = null;

  connect(token) {
    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket']
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  // Métodos para join, leave, emit, listen
}
```

#### Task 4.2: Implementar tela de chat
**Arquivos a criar:**
- `mobile/app/chat/[bookingId].jsx`
- `mobile/src/components/ChatMessage.jsx`
- `mobile/src/components/ChatInput.jsx`
- `mobile/src/hooks/useChat.js`
- `mobile/src/services/chatService.js`

**Funcionalidades:**

**Lista de Mensagens:**
- FlatList invertida (novas mensagens no fim)
- Diferenciação visual:
  - Minhas mensagens: alinhadas à direita, cor accent
  - Outras mensagens: alinhadas à esquerda, cor surface
  - Mensagens de sistema: centralizadas, cor info
- Mostrar horário/data
- Avatar do remetente
- Auto-scroll para última mensagem

**Input de Mensagem:**
- Campo de texto
- Botão enviar (desabilitado se vazio)
- Indicador "Digitando..." quando outro usuário digita

**Integração Socket.IO:**

**Ao entrar na tela:**
1. Conectar Socket.IO (se não conectado)
2. `socket.emit('join-booking', bookingId)`
3. Carregar histórico: `GET /api/chat/booking/:bookingId`

**Durante uso:**
- Escutar `new-message` → adicionar na lista
- Escutar `user-typing` → mostrar indicador
- Escutar `user-stop-typing` → esconder indicador
- Ao digitar: `socket.emit('typing', { bookingId, userId, nome })`
- Ao parar: `socket.emit('stop-typing', { bookingId, userId })`

**Ao enviar mensagem:**
1. `socket.emit('send-message', { bookingId, conteudo })`
2. OU fallback REST: `POST /api/chat/booking/:id`
3. Mensagem aparece otimisticamente

**Ao sair:**
- `socket.emit('leave-booking', bookingId)`

#### Task 4.3: Avisos de anti-circunvenção
**Funcionalidade:**
- Mensagens de sistema destacadas com ícone de alerta
- Cor diferente (warning)
- Aviso: "⚠️ Detectamos compartilhamento de contato. Isso pode resultar em suspensão."

#### Task 4.4: Adicionar botão "Chat" nas telas de booking
**Arquivos a modificar:**
- `mobile/src/screens/BookingDetailScreen.jsx`
- `mobile/src/screens/BookingsScreen.jsx` (opcional: preview última mensagem)

**Funcionalidade:**
- Botão "Abrir Chat" quando booking está CONFIRMADO ou EM_ANDAMENTO
- Navegar para tela de chat

**Critérios de aceite:**
- [ ] Chat conecta via Socket.IO
- [ ] Mensagens são enviadas e recebidas em tempo real
- [ ] Indicador de digitação funciona
- [ ] Mensagens de sistema são destacadas
- [ ] Avisos de anti-circunvenção aparecem
- [ ] Histórico de mensagens carrega corretamente
- [ ] Chat é acessível apenas para participantes do booking

---

### **Sprint 5: Check-in e Check-out**
**Prioridade:** 🟡 ALTA
**Duração estimada:** 2 dias

#### Task 5.1: Implementar tela de Check-in
**Arquivos a criar:**
- `mobile/app/checkin/[bookingId].jsx`
- `mobile/src/components/LocationVerifier.jsx`
- `mobile/src/hooks/useLocation.js`
- `mobile/src/services/checkinService.js`

**Dependências a instalar:**
```bash
npx expo install expo-location expo-image-picker
```

**Funcionalidades:**

**Fluxo de Check-in:**
1. Solicitar permissão de localização
2. Obter coordenadas GPS atuais
3. Chamar `GET /api/checkin/booking/:id/status` para validar:
   - Se está na janela de tempo válida (2h antes até 1h após)
   - Se já fez check-in
4. Se válido:
   - Solicitar foto de comprovação (câmera ou galeria)
   - Preview da foto
   - Confirmar check-in
5. Enviar `POST /api/checkin/booking/:id/checkin` com FormData:
   - `foto`: arquivo da imagem
   - `latitude`: número
   - `longitude`: número
6. Mostrar feedback de sucesso ou erro

**Validações exibidas:**
- ✅ Dentro da janela de tempo
- ✅ Perto do local do evento (se coordenadas disponíveis)
- ✅ Foto anexada

**Mensagens de erro:**
- "Você está muito longe do local do evento (>500m)"
- "Check-in só pode ser feito 2h antes até 1h após o início"
- "Foto de comprovação obrigatória"

#### Task 5.2: Implementar tela de Check-out
**Arquivos a criar:**
- `mobile/app/checkout/[bookingId].jsx`

**Funcionalidades:**
- Similar ao check-in, mas sem foto obrigatória
- Validações:
  - Check-in foi realizado
  - Dentro da janela de tempo (início até 1h após fim)
- Integração: `POST /api/checkin/booking/:id/checkout`

#### Task 5.3: Adicionar botões na tela de booking
**Arquivos a modificar:**
- `mobile/src/screens/BookingDetailScreen.jsx`

**Funcionalidade:**
- Mostrar botão "Fazer Check-in" quando:
  - Usuário é artista
  - Booking está CONFIRMADO
  - Dentro da janela de tempo
- Mostrar botão "Fazer Check-out" quando:
  - Usuário é artista
  - Booking está EM_ANDAMENTO
  - Dentro da janela de tempo
- Consultar `GET /api/checkin/booking/:id/status` para verificar

**Critérios de aceite:**
- [ ] Artista consegue fazer check-in com foto
- [ ] Validação de localização funciona (500m)
- [ ] Validação de janela de tempo funciona
- [ ] Check-in atualiza booking para EM_ANDAMENTO
- [ ] Artista consegue fazer check-out
- [ ] Check-out atualiza booking para CONCLUIDO
- [ ] Adiantamento de 50% é liberado após check-in

---

### **Sprint 6: Sistema de Avaliações**
**Prioridade:** 🟡 ALTA
**Duração estimada:** 1-2 dias

#### Task 6.1: Implementar modal/tela de avaliação
**Arquivos a criar:**
- `mobile/app/review/[bookingId].jsx`
- `mobile/src/components/StarRating.jsx`
- `mobile/src/services/reviewService.js`

**Funcionalidades:**

**Formulário de Avaliação:**

**Se CONTRATANTE avaliando ARTISTA:**
- Profissionalismo (1-5 estrelas)
- Pontualidade (1-5 estrelas)
- Performance (1-5 estrelas)
- Comunicação (1-5 estrelas)
- Comentário (TextArea, opcional, máx 500 chars)

**Se ARTISTA avaliando CONTRATANTE:**
- Profissionalismo (1-5 estrelas)
- Pontualidade (1-5 estrelas)
- Condições do local (1-5 estrelas)
- Respeito aos acordos (1-5 estrelas)
- Comentário (TextArea, opcional, máx 500 chars)

**Componente StarRating:**
- 5 estrelas clicáveis
- Hover/touch feedback
- Valor selecionado destacado

**Validações:**
- Pelo menos 1 critério deve ser preenchido
- Todos critérios são obrigatórios (1-5)
- Comentário opcional

**Integração:**
- `POST /api/reviews/booking/:bookingId`

#### Task 6.2: Adicionar botão "Avaliar" na tela de booking
**Arquivos a modificar:**
- `mobile/src/screens/BookingDetailScreen.jsx`

**Funcionalidade:**
- Mostrar botão "Avaliar" quando:
  - Booking está CONCLUIDO
  - Usuário ainda não avaliou
- Verificar se já avaliou: `GET /api/reviews/booking/:bookingId`
- Se já avaliou: mostrar "Você já avaliou este booking"

#### Task 6.3: Exibir avaliações no perfil do artista
**Arquivos a modificar:**
- `mobile/src/screens/ArtistDetailScreen.jsx`

**Funcionalidade:**
- Seção "Avaliações" no perfil do artista
- Lista de últimas 5 avaliações
- Cada avaliação mostra:
  - Foto e nome do avaliador
  - Nota média (estrelas)
  - Comentário
  - Data
- Botão "Ver todas" → navega para lista completa
- Integração: `GET /api/reviews/artist/:artistId`

**Critérios de aceite:**
- [ ] Usuário consegue avaliar após booking concluído
- [ ] Critérios de avaliação são diferentes para artista e contratante
- [ ] Avaliação é salva corretamente
- [ ] Não é possível avaliar duas vezes o mesmo booking
- [ ] Avaliações aparecem no perfil do artista
- [ ] Nota média do artista é atualizada automaticamente

---

### **Sprint 7: Notificações Push (Opcional para MVP)**
**Prioridade:** 🟢 MÉDIA
**Duração estimada:** 2 dias

#### Task 7.1: Configurar Firebase Cloud Messaging
**Arquivos a criar:**
- `mobile/src/services/notifications.js`
- `mobile/src/hooks/useNotifications.js`

**Dependências:**
```bash
npm install @react-native-firebase/app @react-native-firebase/messaging
```

**Funcionalidades:**
- Solicitar permissão de notificações
- Obter token FCM
- Enviar token para backend
- Escutar notificações em foreground
- Navegar para tela correta ao clicar

#### Task 7.2: Implementar envio de notificações no backend
**Arquivos a modificar (Backend):**
- `backend/src/services/notification.service.js` (criar)
- Adicionar envio de notificação em:
  - Nova proposta de booking
  - Booking aceito/recusado
  - Pagamento confirmado
  - Nova mensagem de chat
  - Lembrete de evento (24h e 2h antes)
  - Lembrete de check-in

---

### **Sprint 8: Polimento e Testes**
**Prioridade:** 🟡 ALTA
**Duração estimada:** 2-3 dias

#### Task 8.1: Melhorias de UX
- [ ] Adicionar animações de transição (react-native-reanimated)
- [ ] Feedback visual em todas ações (loading, sucesso, erro)
- [ ] Skeleton loaders em todas listas
- [ ] Melhorar empty states com ilustrações
- [ ] Adicionar pull-to-refresh onde falta

#### Task 8.2: Tratamento de erros aprimorado
**Dependência:**
```bash
npm install react-native-toast-message
```

- [ ] Implementar Toast global
- [ ] Mensagens de erro amigáveis
- [ ] Retry automático em caso de falha de rede
- [ ] Detectar offline mode

#### Task 8.3: Testes manuais completos

**Fluxo Contratante:**
1. [ ] Registrar como contratante
2. [ ] Buscar artistas com filtros
3. [ ] Ver detalhes do artista
4. [ ] Solicitar booking
5. [ ] Aguardar aceitação do artista
6. [ ] Realizar pagamento PIX
7. [ ] Abrir chat e conversar
8. [ ] Avaliar artista após evento

**Fluxo Artista:**
1. [ ] Registrar como artista
2. [ ] Completar perfil (bio, portfolio, etc)
3. [ ] Receber solicitação de booking
4. [ ] Aceitar booking
5. [ ] Chat com contratante
6. [ ] Fazer check-in no evento
7. [ ] Fazer check-out
8. [ ] Avaliar contratante

**Testes de Edge Cases:**
- [ ] Tentar fazer check-in fora da janela de tempo
- [ ] Tentar fazer check-in longe do local (>500m)
- [ ] Tentar avaliar sem ter concluído booking
- [ ] Tentar acessar chat de booking que não participa
- [ ] Compartilhar contato no chat (validar aviso)

---

## 🔧 Configurações Necessárias

### Variáveis de Ambiente Mobile

Criar `.env` em `mobile/`:

```env
# API Backend
API_BASE_URL=http://192.168.X.X:3000/api

# ASAAS (se necessário no frontend)
ASAAS_PUBLIC_KEY=sua_chave_publica

# Firebase (para notificações)
FIREBASE_API_KEY=sua_api_key
FIREBASE_PROJECT_ID=seu_project_id
FIREBASE_SENDER_ID=seu_sender_id
FIREBASE_APP_ID=seu_app_id
```

### Backend já configurado ✅

Todas variáveis necessárias já estão em `backend/.env.example`:
- DATABASE_URL
- JWT_SECRET
- CLOUDINARY_*
- ASAAS_*

---

## 📦 Dependências a Instalar

### Sprint 1 (Auth):
```bash
cd mobile
# Nenhuma nova dependência, já tem tudo
```

### Sprint 2 (Profile):
```bash
cd mobile
npx expo install expo-image-picker
```

### Sprint 3 (Payments):
```bash
cd mobile
npm install react-native-qrcode-svg
npm install @react-native-community/clipboard
```

### Sprint 4 (Chat):
```bash
cd mobile
# socket.io-client já instalado ✅
```

### Sprint 5 (Check-in):
```bash
cd mobile
npx expo install expo-location expo-image-picker
# expo-image-picker já foi instalado no Sprint 2
```

### Sprint 6 (Reviews):
```bash
cd mobile
# Nenhuma nova dependência
```

### Sprint 7 (Notifications - opcional):
```bash
cd mobile
npm install @react-native-firebase/app @react-native-firebase/messaging
```

### Sprint 8 (Polish):
```bash
cd mobile
npm install react-native-toast-message
npm install @react-native-community/netinfo
npm install react-native-reanimated
```

---

## 🚀 Como Executar o Desenvolvimento

### 1. Iniciar Backend
```bash
cd backend
npm run dev
# Backend roda em http://localhost:3000
```

### 2. Iniciar Mobile
```bash
cd mobile
npm start
```

### 3. Testar
- **iOS:** Pressionar `i` ou usar emulador
- **Android:** Pressionar `a` ou usar emulador
- **Web:** Pressionar `w`
- **Dispositivo físico:** Escanear QR Code com Expo Go

---

## 📊 Timeline Estimado

| Sprint | Funcionalidade | Duração | Prioridade |
|--------|---------------|---------|------------|
| 1 | Autenticação | 2-3 dias | 🔴 Crítica |
| 2 | Perfil | 2 dias | 🟡 Alta |
| 3 | Pagamentos | 2-3 dias | 🔴 Crítica |
| 4 | Chat | 3 dias | 🔴 Crítica |
| 5 | Check-in | 2 dias | 🟡 Alta |
| 6 | Avaliações | 1-2 dias | 🟡 Alta |
| 7 | Notificações | 2 dias | 🟢 Média |
| 8 | Polimento | 2-3 dias | 🟡 Alta |

**Total estimado:** 16-20 dias de desenvolvimento

---

## ✅ Critérios de Sucesso do MVP

### Funcionalidades Obrigatórias:
- [x] Backend completo e funcional
- [ ] Autenticação (login, registro, logout)
- [ ] Busca e visualização de artistas
- [ ] Criação e gestão de bookings
- [ ] Pagamento PIX e Cartão
- [ ] Chat em tempo real
- [ ] Check-in com geolocalização
- [ ] Sistema de avaliações
- [ ] Upload de imagens

### Métricas de Qualidade:
- [ ] App roda em iOS, Android e Web
- [ ] Sem crashes em fluxos principais
- [ ] Loading states em todas telas
- [ ] Tratamento de erros adequado
- [ ] UX consistente e fluida
- [ ] Design system aplicado

---

## 🎯 Próximo Passo Imediato

**COMEÇAR PELO SPRINT 1 - AUTENTICAÇÃO**

A autenticação é pré-requisito para todas as outras funcionalidades. Sem ela, não é possível testar os fluxos end-to-end.

**Ordem de execução:**
1. Sprint 1 (Auth) → Essencial
2. Sprint 3 (Payments) → Core do negócio
3. Sprint 4 (Chat) → Comunicação essencial
4. Sprint 5 (Check-in) → Segurança do sistema
5. Sprint 6 (Reviews) → Confiança da plataforma
6. Sprint 2 (Profile) → Personalização
7. Sprint 7 (Notifications) → Engajamento
8. Sprint 8 (Polish) → Finalização

---

## 📝 Regras de Desenvolvimento

### Commits
- Um commit por task concluída
- Mensagem descritiva: `feat: implementa autenticação mobile`
- Testar antes de commitar

### Código
- Seguir design system (colors.js)
- Loading e error states obrigatórios
- Componentes reutilizáveis em `src/components/`
- Hooks customizados em `src/hooks/`
- Validação com Zod em formulários

### Testes
- Testar em dispositivo real sempre que possível
- Validar todos estados (loading, success, error, empty)
- Testar edge cases

---

## 📚 Recursos Úteis

- **Backend Summary:** `backend/MVP_BACKEND_SUMMARY.md`
- **Mobile Summary:** `mobile/MOBILE_SUMMARY.md`
- **PRD Completo:** `docs/KXRTEX-PRD-Optimized.md`
- **Endpoints:** Todos documentados no Backend Summary
- **Expo Docs:** https://docs.expo.dev
- **React Query:** https://tanstack.com/query

---

## 🎉 Conclusão

Este plano cobre todo o desenvolvimento necessário para completar o MVP mobile da plataforma KXRTEX. Com o backend 100% completo, o foco agora é implementar as interfaces mobile para criar uma experiência completa e funcional.

**Status:** 📋 **Plano aprovado, aguardando início da implementação**

**Próxima ação:** Aguardar sua aprovação deste plano para iniciar o Sprint 1 (Autenticação).

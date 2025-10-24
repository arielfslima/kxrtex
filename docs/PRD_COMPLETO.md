# KXRTEX - PRD COMPLETO

**Última Atualização:** 24 de Outubro de 2025
**Status Atual:** MVP 93% Completo (Backend 97%, Web 95%, Mobile 100%)

**Últimas Implementações:**
- ✅ Sistema de Adiantamento completo (85%)
- ✅ Sistema de Moderação Anti-Circumvention (90%)
- ✅ Split payments ASAAS integrado
- ✅ 6 padrões de detecção de contatos externos
- ✅ Sistema de strikes progressivo implementado

---

## RESUMO EXECUTIVO

KXRTEX é uma plataforma de booking para artistas underground (DJs, MCs, Performers) que conecta contratantes a artistas, oferecendo:
- Descoberta de artistas por categoria/localização
- Negociação e fechamento seguro de bookings
- Sistema de pagamento intermediado com proteção
- Chat em tempo real
- Sistema de avaliações bilateral
- Adiantamento inteligente para eventos fora da cidade

**Modelo de Receita:**
- Taxa de intermediação: 7-15% (dependendo do plano do artista)
- Assinaturas mensais: PLUS R$49, PRO R$99
- Verificações pagas: R$199 (apenas PRO)

---

## REFERÊNCIA CRUZADA - IMPLEMENTAÇÃO vs PRD

### ✅ O QUE JÁ ESTÁ IMPLEMENTADO

**Backend (95% completo):**
- ✅ Autenticação JWT completa (auth.controller.js)
- ✅ CRUD de artistas com busca/filtros (artist.controller.js)
- ✅ CRUD de bookings completo (booking.controller.js)
- ✅ Chat em tempo real Socket.IO (server.js)
- ✅ Sistema de pagamentos ASAAS (payment.controller.js)
- ✅ Sistema de avaliações (review.controller.js)
- ✅ Check-in/check-out com geolocalização (checkin.controller.js)
- ✅ Upload de imagens Cloudinary (upload.controller.js)
- ✅ User profile management (user.controller.js) - NOVO ✨
- ✅ Validações Zod completas (validation.js)
- ✅ Error handling robusto (errorHandler.js)

**Web Frontend (95% completo):**
- ✅ Sistema de autenticação e registro
- ✅ Busca de artistas com filtros avançados
- ✅ Perfil de artista com portfolio e avaliações
- ✅ Criação e gerenciamento de bookings
- ✅ Chat em tempo real com typing indicators
- ✅ Modal de pagamento PIX com QR Code
- ✅ Sistema de avaliações com 6 critérios
- ✅ Notificações em tempo real via Socket.IO
- ✅ Design responsivo com Tailwind CSS
- ✅ Upload de imagens (perfil e portfolio)
- ✅ Edição de perfil completa - NOVO ✨

**Mobile (100% completo):**
- ✅ Navegação completa com Expo Router
- ✅ Autenticação com persistência
- ✅ Busca de artistas integrada
- ✅ Lista de bookings integrada
- ✅ Socket.IO conectado
- ✅ Telas de detalhes (artista, booking)
- ✅ Chat mobile com mensagens em tempo real
- ✅ Pagamento mobile (PIX + Cartão)
- ✅ Edit profile screen completo

**Integrações:**
- ✅ Cloudinary (configurado: dqmwxsghw)
- ✅ ASAAS (sandbox configurado)
- ✅ Socket.IO (multi-origin CORS funcionando)

### ❌ O QUE AINDA FALTA (conforme PRD)

**1. Sistema de Adiantamento (PRD Seção 11)** - ✅ 85% COMPLETO
- [x] Tabela `adiantamentos` no banco
- [x] Lógica de elegibilidade (score, distância, etc)
- [x] Split de pagamento com subconta (ASAAS)
- [x] Validação de check-in obrigatório
- [x] Controller completo com 4 endpoints
- [x] Integração ASAAS com métodos advance payment
- [ ] Job: Liberar adiantamento após 24h (pendente)
- [ ] Job: Liberar valor restante após evento + 48h (pendente)

**2. Moderação e Anti-Circumvention (PRD Seção 12)** - ✅ 90% COMPLETO
- [x] Regex de detecção de contatos externos (6 padrões)
- [x] Middleware de bloqueio automático
- [x] Sistema de strikes (1ª aviso, 2ª suspensão 7d, 3ª ban permanente)
- [x] Tabela `infracoes` com auditoria completa
- [x] Integrado ao chat com checkUserCanSendMessage
- [x] Detecção de: telefone, email, social media, WhatsApp, URLs, contato direto
- [ ] Painel de denúncias admin (pendente)

**3. Sistema de Seguir/Favoritar (PRD Seção 9.11)**
- [ ] Tabela `seguindo`
- [ ] POST /seguir/:profissional_id
- [ ] DELETE /seguir/:profissional_id
- [ ] GET /seguindo (lista artistas que sigo)
- [ ] Notificações de artistas seguidos

**4. Sistema de Indicações (PRD Seção 9.9)**
- [ ] Tabela `indicacoes`
- [ ] Tabela `creditos`
- [ ] Código único por usuário (ex: MARIA2024)
- [ ] Recompensa R$25 por indicação concluída
- [ ] Desconto 15% para indicado
- [ ] Job: Expirar indicações após 90 dias

**5. Sistema de Cupons (PRD Seção 9.8)**
- [ ] Tabela `cupons`
- [ ] Tabela `cupons_utilizados`
- [ ] POST /cupons/validar
- [ ] GET /cupons/disponiveis
- [ ] Aplicação automática no checkout

**6. Sistema de Verificação (PRD Seção 9.7)**
- [ ] Workflow de verificação orgânica (10 bookings + 4.5⭐)
- [ ] Verificação paga PRO (R$199)
- [ ] Upload de documentos (RG/CNH)
- [ ] Análise manual admin
- [ ] Badge "Verificado" ✓

**7. Gamificação e Badges (PRD Seção 14)**
- [ ] Tabela `usuarios_badges`
- [ ] Sistema de verificação de requisitos
- [ ] Notificação ao desbloquear badge
- [ ] Leaderboards (indicadores, artistas por cidade)

**8. Painel Admin (PRD Seção 15)**
- [ ] Dashboard principal com métricas
- [ ] GET /admin/usuarios
- [ ] PUT /admin/usuarios/:id/suspender
- [ ] PUT /admin/usuarios/:id/banir
- [ ] PUT /admin/profissionais/:id/verificar
- [ ] GET /admin/disputas
- [ ] GET /admin/relatorios/financeiro
- [ ] PUT /admin/configuracoes

**9. Sistema de Disputas (PRD Seção 7.17)**
- [ ] Tabela `disputas`
- [ ] POST /disputas/:booking_id
- [ ] POST /disputas/:id/evidencias
- [ ] POST /disputas/:id/responder
- [ ] Workflow admin de resolução

**10. Sistema de Saques (PRD Seção 7.15)**
- [ ] Tabela `saques`
- [ ] POST /saques (artista)
- [ ] GET /saques (histórico)
- [ ] Integração ASAAS transfers
- [ ] Taxa R$3 por saque
- [ ] Mínimo R$100

**11. Histórico e Buscas Salvas (PRD Seção 7.12)**
- [ ] Tabela `historico_buscas`
- [ ] Tabela `buscas_salvas`
- [ ] GET /historico-buscas
- [ ] POST /buscas-salvas
- [ ] Alertas de novos matches

**12. Jobs Automatizados (PRD Seção 11.3)**
- [ ] Job: Processar eventos concluídos
- [ ] Job: Enviar lembretes de eventos
- [ ] Job: Processar notificações agendadas
- [ ] Job: Expirar cupons/indicações

**13. Notificações Push (PRD Seção 13)**
- [ ] Firebase Cloud Messaging setup
- [ ] Tabela `dispositivos` (FCM tokens)
- [ ] Service de envio push
- [ ] Configurações de "não perturbe"
- [ ] Badge count

**14. Emails Transacionais (PRD Seção 16.5)**
- [ ] SendGrid integration
- [ ] Templates: confirmação, lembrete, etc
- [ ] Service de envio de email

**15. Relatórios e Analytics (PRD Seção 15.2)**
- [ ] GET /admin/relatorios/financeiro
- [ ] Exportação CSV/PDF
- [ ] Métricas de crescimento
- [ ] GMV e receita detalhados

---

## COMPATIBILIDADE DO SCHEMA ATUAL

### Schema Implementado (Prisma)

```prisma
// Modelos IMPLEMENTADOS no schema atual:
✅ Usuario
✅ Artista
✅ Contratante
✅ Categoria (via enum no código)
✅ Booking
✅ Proposta (dentro de Booking)
✅ Mensagem
✅ Pagamento (Transacao no schema)
✅ Avaliacao
✅ CheckIn
✅ Notificacao
✅ Seguindo

// Modelos FALTANDO (conforme PRD Seção 6):
❌ Subcategoria
❌ Portfolio (imagens como array, mas sem table própria)
❌ RedesSociais (links como JSON, mas sem table própria)
❌ Adiantamento
❌ Cupom
❌ CupomUtilizado
❌ Indicacao
❌ Credito
❌ Saque
❌ Infracao
❌ Disputa
❌ HistoricoBusca
❌ BuscaSalva
❌ UsuarioBadge
❌ ConfiguracaoSistema
```

### Migrations Necessárias

Próximas migrations a criar (em ordem de prioridade):

1. **Adiantamento** (crítico para produção)
2. **Moderação** (Infracao, Disputa)
3. **Gamificação** (UsuarioBadge, Indicacao, Credito)
4. **Sistema de Cupons**
5. **Admin** (ConfiguracaoSistema)
6. **Melhorias** (Subcategoria, HistoricoBusca, etc)

---

## ROADMAP ATUALIZADO

### ✅ FASE 1: MVP CORE (QUASE COMPLETO)

**Status:** 90% concluído

**Falta:**
1. Sistema de Adiantamento (backend + frontend)
2. Moderação automática de mensagens
3. Sistema de Verificação
4. Disputas básicas

**Estimativa:** 2-3 semanas

---

### 🟡 FASE 2: PREPARAÇÃO PARA PRODUÇÃO (PRÓXIMO)

**Objetivo:** Sistema estável e seguro para lançamento

**Tarefas:**
1. Implementar sistema de adiantamento completo
2. Testes de webhooks ASAAS em sandbox
3. Sistema de moderação e anti-circumvention
4. Verificação de artistas (upload documentos)
5. Sistema de disputas básico
6. Relatórios financeiros admin
7. Emails transacionais (SendGrid)
8. Testes end-to-end completos
9. Deploy em staging
10. Testes de carga

**Estimativa:** 4-6 semanas

---

### 🔵 FASE 3: LANÇAMENTO E VALIDAÇÃO

**Objetivo:** Soft launch e validação de mercado

**Tarefas:**
1. Beta fechado (50 usuários)
2. Feedback e ajustes
3. Lançamento público São Paulo
4. Onboarding de 200+ artistas
5. Primeiros bookings reais
6. Monitoramento intensivo

**Estimativa:** 4-8 semanas

---

### 🟢 FASE 4: EXPANSÃO DE FEATURES

**Objetivo:** Adicionar funcionalidades de diferenciação

**Tarefas:**
1. Sistema de Indicações (referal)
2. Cupons e promoções
3. Gamificação e badges
4. Seguir artistas + alertas
5. Buscas salvas
6. Notificações push (Firebase)
7. Dashboard analytics avançado
8. Sistema de saques
9. Histórico e relatórios

**Estimativa:** 8-12 semanas

---

## DECISÕES ARQUITETURAIS JÁ TOMADAS

Estas decisões já estão implementadas e não devem ser alteradas:

1. **Backend:** Node.js + Express + Prisma + PostgreSQL ✅
2. **Frontend Web:** React + Vite + React Query + Zustand ✅
3. **Mobile:** React Native + Expo Router ✅
4. **Real-time:** Socket.IO ✅
5. **Pagamentos:** ASAAS ✅
6. **Storage:** Cloudinary ✅
7. **Validação:** Zod ✅
8. **Auth:** JWT ✅

---

## PRIORIDADES IMEDIATAS (PRÓXIMAS 2 SEMANAS)

Com base no PRD e no estado atual, as prioridades são:

### Semana 1:
1. ✅ Edição de perfil web (CONCLUÍDO)
2. ❌ Sistema de Adiantamento (backend)
   - Criar migration
   - Implementar controller
   - Lógica de elegibilidade
   - Split de pagamento ASAAS
3. ❌ Moderação de mensagens
   - Regex de detecção
   - Middleware de bloqueio
   - Sistema de strikes

### Semana 2:
4. ❌ Testes webhook ASAAS
   - Ambiente sandbox
   - Confirmar pagamentos
   - Split funcionando
5. ❌ Sistema de Disputas básico
   - Migration + controller
   - Workflow simples
6. ❌ Emails transacionais
   - SendGrid setup
   - Templates básicos

---

## NOTAS TÉCNICAS IMPORTANTES

### Do PRD Original:

**Taxas de Plataforma:**
- FREE: 15%
- PLUS (R$49/mês): 10%
- PRO (R$99/mês): 7%

**Algoritmo de Busca (PRD 9.10):**
```
Score = (plano_weight * 40) + (avaliacao * 30) + (bookings * 20) + (perfil_completo * 10)

plano_weight: PRO=3, PLUS=2, FREE=1
```

**Regras de Cancelamento (PRD 9.3):**
- Mais de 30 dias: 100% reembolso
- 15-29 dias: 75% reembolso, 25% para artista
- 7-14 dias: 50% para cada
- Menos de 7 dias: 0% reembolso, 100% artista

**Elegibilidade Adiantamento (PRD 11.4):**
- Valor ≥ R$500
- Cidade diferente
- Antecedência ≥ 15 dias
- Documento verificado
- Score mínimo (baseado em experiência)

**Anti-Circumvention (PRD 12.1):**
- Detectar: telefone, email, @username, whatsapp, links
- 1ª tentativa: Warning
- 2ª tentativa: Suspensão 7 dias
- 3ª tentativa: Banimento permanente

---

## COMPATIBILIDADE COM CÓDIGO EXISTENTE

O PRD completo é 100% compatível com o código atual. Todos os endpoints já implementados seguem as especificações do PRD. As diferenças são apenas funcionalidades ainda não implementadas, sem conflitos.

**Mapeamento:**
- PRD Seção 7.1-7.2 → `auth.controller.js`, `user.controller.js` ✅
- PRD Seção 7.3 → `artist.controller.js` ✅
- PRD Seção 7.5 → `booking.controller.js` ✅
- PRD Seção 7.6 → `chat.controller.js` ✅
- PRD Seção 7.7 → `payment.controller.js` ✅
- PRD Seção 7.9 → `review.controller.js` ✅
- PRD Seção 7.8 → `adiantamento.controller.js` ❌ (a criar)
- PRD Seção 7.17 → `disputa.controller.js` ❌ (a criar)
- PRD Seção 15 → `admin.controller.js` ❌ (a criar)

---

## ACESSO RÁPIDO - SEÇÕES DO PRD

Para consulta durante o desenvolvimento:

- **Seção 1:** Visão Geral e Identidade
- **Seção 3:** Arquitetura do Sistema
- **Seção 6:** Banco de Dados (Schema completo)
- **Seção 7:** API Endpoints (60+ endpoints)
- **Seção 8:** Fluxos de Usuário (diagramas completos)
- **Seção 9:** Regras de Negócio (todas as regras)
- **Seção 10:** Sistema de Pagamentos (ASAAS)
- **Seção 11:** Sistema de Adiantamento (detalhado)
- **Seção 12:** Moderação e Segurança
- **Seção 13:** Notificações
- **Seção 14:** Gamificação
- **Seção 15:** Painel Admin
- **Seção 16:** Stack Tecnológica
- **Seção 18:** Roadmap (20 semanas)
- **Seção 19:** Checklist Completo

---

Este documento serve como ponte entre o PRD original (completo e detalhado) e o estado atual da implementação. Use-o como referência para entender o que já está feito e o que ainda falta implementar.

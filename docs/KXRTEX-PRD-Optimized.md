# KXRTEX - Product Requirements Document

**Versão:** 2.0 (Otimizado para Claude Code)  
**Data:** Outubro 2025  
**Produto:** Plataforma de Booking para Artistas Underground

---

## 1. VISÃO GERAL

### 1.1 Propósito
KXRTEX é uma plataforma que conecta contratantes a artistas underground (DJs, MCs, Performers), oferecendo:
- Descoberta de artistas por categoria/localização
- Negociação e fechamento seguro de bookings
- Sistema de pagamento intermediado com proteção
- Chat em tempo real para negociação
- Sistema de avaliações bilateral
- Adiantamento inteligente para eventos fora da cidade

### 1.2 Objetivos de Negócio
- Receita via taxa de intermediação (7-15% sobre bookings)
- Assinaturas mensais para artistas (PLUS R$49, PRO R$99)
- Meta Ano 1: 1.000 artistas, 500 bookings/mês, R$60k MRR

### 1.3 Diferencial
Underground-first, pagamento seguro com retenção, sistema anti-contorno, adiantamento para viagens.

---

## 2. MODELO DE NEGÓCIO

### 2.1 Estrutura de Taxas
- **Contratante paga:** Valor do booking + Taxa da plataforma
- **Artista recebe:** 100% do valor acordado
- **Plataforma recebe:** Taxa de intermediação

**Taxas por Plano:**
- FREE: 15%
- PLUS (R$49/mês): 10%  
- PRO (R$99/mês): 7%

### 2.2 Planos de Assinatura

**FREE:** Perfil básico, até 5 fotos, taxa 15%, aparece por último nas buscas

**PLUS (R$49/mês):** Selo PLUS, até 15 fotos + 2 vídeos, prioridade nas buscas, estatísticas, taxa 10%

**PRO (R$99/mês):** Selo PRO, portfolio ilimitado, destaque no topo, presskit PDF, analytics completo, criar cupons, taxa 7%

### 2.3 Sistema Verificado
**Orgânico:** 10+ bookings, nota ≥4.5, perfil completo, docs verificados  
**Pago (PRO):** R$199 taxa única, análise em 24h

---

## 3. USUÁRIOS

### 3.1 Contratantes
**Perfil:** Nome, email, telefone, CPF/CNPJ (para pagamento), tipo (PF/PJ), foto

**Funcionalidades:**
- Buscar e filtrar artistas
- Enviar propostas de booking
- Negociar via chat
- Realizar pagamentos (PIX, cartão)
- Avaliar artistas após evento
- Seguir artistas
- Sistema de indicações

### 3.2 Artistas
**Perfil:** Nome artístico, nome real (privado), email, telefone, CPF/CNPJ (obrigatório), categoria, subcategorias (até 3), cidades de atuação, bio (min 50 chars), valor base/hora, portfolio, redes sociais, documentos

**Funcionalidades:**
- Criar/editar perfil profissional
- Receber e gerenciar propostas
- Aceitar/recusar/contra-propor bookings
- Chat de negociação
- Solicitar adiantamento (50% para eventos >200km)
- Receber e sacar pagamentos
- Dashboard com estatísticas
- Criar cupons de desconto (PRO)

---

## 4. CATEGORIAS E SUBCATEGORIAS

**DJ:** Techno, House, Hardtechno, Drum & Bass, Trance, Hip-Hop, Funk, Afro House, Deep House, UK Garage, Dubstep

**MC:** Hip-Hop, Funk, Trap, Apresentador

**Performer:** Go-Go Dancer, Performance Art, Aerialist, Fire Performer, LED Performance

---

## 5. FLUXO PRINCIPAL (BOOKING)

### 5.1 Solicitação
1. Contratante busca artistas (filtros: categoria, localização, faixa de preço, data)
2. Clica em "Solicitar Booking"
3. Preenche formulário: data, horário, duração, local, descrição do evento, orçamento
4. Sistema calcula valor total (orçamento + taxa do plano do artista)
5. Proposta criada com status PENDENTE

### 5.2 Negociação
- Artista recebe notificação
- Pode: ACEITAR, RECUSAR ou CONTRA-PROPOR (novo valor, horário ou condições)
- Chat em tempo real habilitado automaticamente
- Se distância >200km → sistema sugere adiantamento

### 5.3 Confirmação e Pagamento
- Artista aceita → status ACEITO
- Contratante deve pagar em até 24h → status CONFIRMADO
- Métodos: PIX (QR Code via ASAAS), Cartão de Crédito
- Valor fica retido na plataforma

### 5.4 Adiantamento (Opcional)
**Quando:** Evento em cidade diferente (>200km) do artista  
**Valor:** 50% do total  
**Liberação:** 24h após artista fazer check-in no hotel/local (foto + geolocalização)  
**Proteção:** Se artista não comparecer, valor é devolvido ao contratante

### 5.5 Execução
- Artista deve fazer check-in no evento (botão + geolocalização)
- Check-in deve ser feito até 30min após horário de início
- Sistema envia lembretes automáticos

### 5.6 Conclusão
- Check-out automático após horário de término
- Ambos avaliam um ao outro (1-5 estrelas + comentário)
- 50% restante (ou 100% se sem adiantamento) liberado após 48h do evento
- Artista pode sacar saldo

---

## 6. REGRAS DE NEGÓCIO CRÍTICAS

### 6.1 Cancelamentos

**Contratante cancela:**
- Até 7 dias antes: reembolso de 100%
- 3-6 dias antes: reembolso de 50%
- <3 dias ou não comparecimento: sem reembolso, artista recebe 100%

**Artista cancela:**
- Até 7 dias antes: sem penalidade, reembolso 100% ao contratante
- <7 dias: penalidade de 30% do valor + suspensão de 30 dias
- Não comparecimento: banimento permanente

### 6.2 Disputas
- Prazo: até 7 dias após evento
- Admin analisa evidências (fotos, mensagens, check-ins)
- Decisões: reembolso parcial/total, penalizar artista, manter status quo
- Taxa de disputa: R$50 (cobrada do perdedor)

### 6.3 Anti-Contorno
- Sistema detecta menção de contatos externos no chat (telefone, email, @instagram)
- Aviso automático sobre violação dos termos
- Bloqueio temporário do chat em reincidência
- Penalidades: suspensão ou banimento

### 6.4 Verificação de Documentos
- CPF/CNPJ validado via API Receita Federal
- Selfie com documento para adiantamentos
- Comprovante de endereço para PRO/Verificado

---

## 7. SISTEMA DE AVALIAÇÕES

### 7.1 Estrutura
**Critérios (1-5 estrelas cada):**

Para Artistas:
- Profissionalismo
- Pontualidade
- Performance
- Comunicação

Para Contratantes:
- Comunicação
- Pagamento em dia
- Condições do local
- Respeito aos acordos

**Comentário:** opcional, até 500 caracteres

### 7.2 Regras
- Obrigatória para liberar avaliação mútua
- Prazo: até 7 dias após evento
- Editável por 24h após envio
- Média geral calculada automaticamente
- Impacto no ranking de buscas

---

## 8. GAMIFICAÇÃO E ENGAJAMENTO

### 8.1 Sistema de Seguir
- Contratantes podem seguir artistas
- Feed de atualizações (novos vídeos, mudança de valor, próximos eventos)
- Notificações de disponibilidade

### 8.2 Badges/Conquistas
**Artistas:**
- 🏆 Estrela em Ascensão: primeiros 5 bookings
- ⭐ Top Rated: média ≥4.8 com 20+ avaliações
- 🔥 Em Alta: 10+ bookings em 30 dias
- ✅ Confiável: sem cancelamentos em 50 bookings
- 🌍 Viajante: bookings em 5+ cidades

**Contratantes:**
- 🎉 Event Starter: primeiro booking
- 🤝 Parceiro Confiável: 10+ bookings
- ⭐ Avaliador Ativo: 20+ avaliações

### 8.3 Indicações
**Mecânica:**
- Cada usuário tem código único
- Indicado ganha: 15% OFF no primeiro booking
- Indicador ganha: crédito de R$20 após o indicado completar 1 booking

**Limites:**
- Máximo 50 indicações por usuário
- Créditos expiram em 12 meses
- Créditos usáveis apenas em bookings (não em assinaturas)

---

## 9. NOTIFICAÇÕES

### 9.1 Tipos
**Push (Firebase):**
- Nova proposta de booking
- Proposta aceita/recusada
- Mensagem de chat recebida
- Pagamento confirmado
- Lembrete de evento (24h e 2h antes)
- Lembrete de check-in
- Avaliação pendente
- Saque processado

**Email:**
- Registro confirmado
- Booking confirmado (resumo completo)
- 24h antes do evento (com detalhes e mapa)
- Pagamento recebido
- Saque solicitado/confirmado
- Alterações importantes nos termos

**SMS (opcional, casos críticos):**
- Cancelamento de última hora
- Problemas com pagamento

### 9.2 Configurações
Usuário pode ativar/desativar por tipo e canal

---

## 10. SISTEMA DE PAGAMENTOS

### 10.1 Integração ASAAS
**Recursos usados:**
- Criação de cobranças (PIX e cartão)
- Geração de QR Code PIX
- Webhooks para confirmação
- Split de pagamentos (plataforma fica com taxa)
- Carteira digital para retenção
- Transferências/saques para artistas

### 10.2 Fluxo de Dinheiro
1. Contratante paga valor total (booking + taxa)
2. ASAAS retém 100% em conta da plataforma
3. Se houver adiantamento: 50% liberado para artista após check-in (24h)
4. Após evento + 48h: saldo restante liberado para artista
5. Taxa da plataforma fica retida
6. Artista solicita saque (PIX)
7. ASAAS processa transferência (até 1 dia útil)

### 10.3 Taxas ASAAS
- PIX: R$0 (grátis)
- Cartão: ~3.5% (absorvido pela plataforma ou repassado)
- Saque: R$0 (grátis)

---

## 11. BUSCA E FILTROS

### 11.1 Filtros Disponíveis
- **Categoria:** DJ, MC, Performer (múltipla seleção)
- **Subcategoria:** conforme categoria
- **Localização:** cidade/estado (raio configurável: 50km, 100km, 200km, sem limite)
- **Faixa de Preço:** slider (R$0-R$10.000)
- **Disponibilidade:** data específica
- **Avaliação:** mínimo (3+, 4+, 4.5+)
- **Plano:** FREE, PLUS, PRO, Verificado

### 11.2 Ordenação
- Relevância (padrão): PRO → PLUS → FREE, depois por avaliação
- Preço: menor para maior / maior para menor
- Avaliação: melhores primeiro
- Mais recentes: cadastros novos
- Distância: mais próximos primeiro

### 11.3 Algoritmo de Ranking
```
score = (plano_weight * 40) + (avaliacao * 30) + (bookings_completos * 20) + (perfil_completo * 10)

plano_weight:
- PRO: 3
- PLUS: 2
- FREE: 1

perfil_completo (0-10 pontos):
- Bio preenchida: 2
- Portfolio (3+ fotos): 3
- Vídeos: 2
- Links sociais: 1
- Verificado: 2
```

---

## 12. PAINEL ADMIN

### 12.1 Dashboard Principal
**Métricas:**
- Usuários ativos (hoje, 7d, 30d)
- Bookings: solicitados, confirmados, concluídos, cancelados
- Receita: total, por período, projeção
- GMV (Gross Merchandise Value)
- Taxa de conversão (propostas → confirmados)
- Ticket médio
- NPS/Satisfação

**Gráficos:**
- Evolução de cadastros (artistas vs contratantes)
- Bookings por categoria
- Receita ao longo do tempo
- Funil de conversão

### 12.2 Gestão de Usuários
- Listar todos (filtros: tipo, plano, status, cidade)
- Ver perfil completo
- Histórico de bookings
- Histórico de pagamentos
- Ações: suspender, banir, reverter, editar

### 12.3 Gestão de Bookings
- Listar todos (filtros: status, data, valor)
- Ver detalhes completos (proposta, chat, pagamentos)
- Timeline de eventos
- Forçar cancelamento/reembolso (casos excepcionais)

### 12.4 Verificação Manual
- Fila de pedidos de verificação
- Visualizar documentos enviados
- Aprovar/recusar com justificativa
- Solicitar complementos

### 12.5 Moderação de Conteúdo
- Denúncias pendentes
- Review de perfis/fotos
- Blacklist de palavras (chat)
- Banir conteúdo impróprio

### 12.6 Disputas
- Listar disputas abertas
- Ver evidências (screenshots, fotos, check-ins)
- Chat com ambas as partes
- Tomar decisão: favorável a quem, % reembolso, penalidades
- Histórico de decisões

### 12.7 Financeiro
- Receita detalhada (bookings, assinaturas, verificações)
- Comissões ASAAS
- Relatório de saques
- Conciliação bancária
- Exportar para Excel/CSV

### 12.8 Configurações do Sistema
- Taxas por plano
- Regras de cancelamento
- Limites de adiantamento
- Ativar/desativar funcionalidades
- Textos legais (termos, privacidade)

---

## 13. CONSIDERAÇÕES TÉCNICAS

### 13.1 Stack Tecnológica
**Backend:**
- Node.js + Express.js
- PostgreSQL (dados relacionais)
- Redis (cache, sessões, filas)
- Socket.IO (chat em tempo real)
- JWT (autenticação)

**Frontend Mobile:**
- React Native + Expo
- React Navigation
- Redux Toolkit (state management)
- Axios (HTTP client)
- Socket.IO Client

**Serviços Externos:**
- ASAAS (pagamentos)
- Cloudinary (storage de imagens/vídeos)
- Firebase (push notifications)
- SendGrid ou similar (emails)

### 13.2 Banco de Dados - Tabelas Principais
**Usuários:**
- usuarios (id, email, senha_hash, tipo, nome, telefone, cpf_cnpj, created_at)
- artistas (usuario_id, nome_artistico, bio, valor_base, categoria, plano, status_verificado)
- contratantes (usuario_id, tipo_pessoa)

**Bookings:**
- bookings (id, artista_id, contratante_id, data_evento, horario_inicio, duracao, local, valor_artista, taxa_plataforma, status, created_at)
- propostas (booking_id, tipo, valor_proposto, mensagem)
- check_ins (booking_id, tipo, timestamp, latitude, longitude, foto_url)

**Financeiro:**
- transacoes (id, booking_id, tipo, valor, metodo, status, asaas_id)
- saques (id, artista_id, valor, pix_chave, status, processado_em)
- adiantamentos (booking_id, valor, liberado_em, foto_checkin_url)

**Social:**
- avaliacoes (booking_id, avaliador_id, avaliado_id, profissionalismo, pontualidade, performance, comunicacao, comentario)
- seguindo (seguidor_id, seguido_id)
- indicacoes (indicador_id, indicado_id, codigo, status, credito_gerado)

**Comunicação:**
- mensagens (id, booking_id, remetente_id, conteudo, tipo, timestamp)
- notificacoes (id, usuario_id, tipo, titulo, mensagem, lida, link)

### 13.3 Segurança
- Senhas: bcrypt com salt rounds 10+
- Tokens JWT: expiração 7 dias, refresh token opcional
- Rate limiting: 100 req/min por IP
- Validação de inputs: Joi ou Yup
- Upload de arquivos: validação de tipo e tamanho
- HTTPS obrigatório
- CORS configurado
- Helmet.js para headers de segurança
- Sanitização de HTML em mensagens/bio

### 13.4 Performance
- Cache Redis para:
  - Perfis de artistas frequentemente acessados (TTL 5min)
  - Resultados de buscas populares (TTL 2min)
  - Sessões de usuários
- Paginação: 20 itens por página (ajustável)
- Lazy loading de imagens
- Compressão Gzip
- CDN para assets estáticos

### 13.5 Jobs/Tarefas Agendadas (Cron)
- **A cada 5 minutos:** Verificar pagamentos pendentes via webhook
- **A cada hora:** Enviar lembretes de check-in
- **Diariamente às 00h:**
  - Processar eventos concluídos (liberar pagamento após 48h)
  - Expirar propostas sem resposta (>48h)
  - Enviar resumo diário de bookings
- **Diariamente às 08h:** Enviar lembretes de eventos do dia
- **Semanalmente:** Expirar créditos de indicação antigos (>12 meses)

---

## 14. IDENTIDADE VISUAL

### 14.1 Paleta de Cores
- **Primária:** Dark Red `#8B0000` (elementos principais, CTAs)
- **Secundária:** Preto Profundo `#0D0D0D` (backgrounds)
- **Accent:** Vermelho Vibrante `#FF4444` (botões, hover, alertas)
- **Glassmorphism:** `rgba(139, 0, 0, 0.1)` com `backdrop-filter: blur(20px)`

### 14.2 Estilo
- Dark mode
- Liquid glass / glassmorphism
- Minimalista e underground
- Ícones simples (Lucide ou Feather)

### 14.3 Tipografia
- Headings: Inter Bold / Montserrat Bold
- Body: Inter Regular
- Tamanhos: H1 32px, H2 24px, Body 16px

---

## 15. MVPS E FASES

### Fase 1 (MVP - 8 semanas)
**Foco:** Funcionalidades core para viabilizar primeiro booking

**Backend:**
- [x] Setup e estrutura inicial
- [ ] Autenticação (registro, login, JWT)
- [ ] CRUD usuários (perfis contratante e artista)
- [ ] CRUD categorias/subcategorias
- [ ] Upload de imagens (Cloudinary)
- [ ] Busca de artistas (filtros básicos)
- [ ] CRUD bookings (criar proposta, aceitar, recusar)
- [ ] Chat básico (Socket.IO)
- [ ] Integração ASAAS (pagamento PIX)
- [ ] Avaliações simples
- [ ] Notificações básicas (push)

**Mobile:**
- [ ] Setup e navegação
- [ ] Telas de autenticação
- [ ] Onboarding (escolha de tipo)
- [ ] Perfil artista (criar/editar)
- [ ] Busca e filtros
- [ ] Detalhes do artista
- [ ] Solicitar booking
- [ ] Meus bookings (lista)
- [ ] Chat
- [ ] Pagamento (QR Code PIX)
- [ ] Avaliar

**Deploy:**
- [ ] Backend no Render/Railway
- [ ] Database PostgreSQL
- [ ] Cloudinary setup
- [ ] Push notifications (Firebase)

### Fase 2 (4 semanas)
- [ ] Planos de assinatura (FREE/PLUS/PRO)
- [ ] Sistema de taxa variável
- [ ] Pagamento por cartão
- [ ] Dashboard artista (estatísticas)
- [ ] Dashboard contratante
- [ ] Cancelamentos e regras
- [ ] Seguir artistas
- [ ] Sistema de indicações

### Fase 3 (4 semanas)
- [ ] Adiantamento para eventos fora da cidade
- [ ] Check-in/check-out no evento
- [ ] Disputas
- [ ] Painel admin (básico)
- [ ] Moderação de conteúdo
- [ ] Sistema de badges/gamificação
- [ ] Verificação manual de documentos

### Fase 4 (4 semanas)
- [ ] Analytics completo
- [ ] Painel admin avançado
- [ ] Relatórios financeiros
- [ ] Otimizações de performance
- [ ] Testes E2E
- [ ] Documentação completa
- [ ] Preparação para lançamento

---

## 16. MÉTRICAS DE SUCESSO

**Adoção:**
- 100 artistas cadastrados (Mês 3)
- 500 artistas cadastrados (Mês 6)
- 50 bookings/mês (Mês 3)
- 200 bookings/mês (Mês 6)

**Conversão:**
- Taxa de conversão proposta → confirmado: >40%
- Taxa de conclusão de bookings: >90%
- Taxa de assinatura (PLUS+PRO): >15%

**Engajamento:**
- MAU/DAU ratio: >25%
- Tempo médio na plataforma: >10min
- Retorno de artistas (2+ bookings): >60%
- Retorno de contratantes (2+ bookings): >40%

**Financeiro:**
- GMV: R$100k (Mês 6)
- Receita: R$15k (Mês 6)
- CAC (Customer Acquisition Cost): <R$50
- LTV/CAC ratio: >3

**Qualidade:**
- NPS: >50
- Avaliação média artistas: >4.2
- Taxa de disputas: <5%
- Churn mensal: <10%

---

## 17. REQUISITOS NÃO-FUNCIONAIS

**Performance:**
- Tempo de resposta API: <200ms (P95)
- Tempo de carregamento de telas: <2s
- Upload de imagens: <5s

**Disponibilidade:**
- Uptime: 99.5%
- Backup diário automático
- Recovery time: <4h

**Escalabilidade:**
- Suportar 10k usuários simultâneos
- Suportar 100k uploads de imagens

**Segurança:**
- Certificado SSL
- Conformidade com LGPD
- Auditoria de logs
- 2FA opcional (futura)

**Usabilidade:**
- Suporte a iOS 13+ e Android 8+
- Acessibilidade básica (contraste, tamanhos)
- Suporte offline básico (cache de perfis visualizados)

---

## CONCLUSÃO

Este PRD define os requisitos essenciais do KXRTEX de forma clara e objetiva, focando no que precisa ser construído e por quê, deixando as decisões de implementação para o desenvolvimento.

**Próximos passos para desenvolvimento:**
1. Validar este PRD com stakeholders
2. Definir priorização precisa das features do MVP
3. Iniciar desenvolvimento em sprints de 2 semanas
4. Iterar baseado em feedback de usuários beta

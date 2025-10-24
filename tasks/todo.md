# Development Plan - KXRTEX MVP Phase 1

## Current Status
Setup inicial completo. Próxima prioridade: Implementar funcionalidades core do MVP para viabilizar o primeiro booking.

## Próximas Tarefas (Ordem de Prioridade)

### Sprint 1: CRUD de Artistas (Backend) - COMPLETO
- [x] Task 1.1: Criar controller de listagem de artistas com filtros básicos
  - Filtros: categoria, subcategoria, cidade, faixa de preço
  - Paginação: 20 itens por página
  - Ordenação: relevância (algoritmo do PRD)

- [x] Task 1.2: Implementar algoritmo de ranking de artistas
  - Cálculo de score baseado em: plano, avaliação, bookings, perfil completo
  - Aplicar peso conforme PRD

- [x] Task 1.3: Criar endpoint de detalhes do artista
  - Retornar perfil completo com portfolio, avaliações, estatísticas

- [x] Task 1.4: Criar endpoint de atualização de perfil do artista
  - Apenas o próprio artista pode editar
  - Validação de campos obrigatórios

### Sprint 2: Sistema de Bookings (Backend) - COMPLETO
- [x] Task 2.1: Criar controller de criação de booking
  - Validar dados do formulário
  - Calcular taxa baseada no plano do artista (FREE: 15%, PLUS: 10%, PRO: 7%)
  - Criar proposta inicial com status PENDENTE

- [x] Task 2.2: Implementar endpoints de gestão de bookings
  - Listar bookings do usuário (filtros por status)
  - Detalhes do booking
  - Aceitar booking (artista)
  - Recusar booking (artista)

- [x] Task 2.3: Implementar sistema de contra-proposta
  - Artista pode propor novo valor/condições
  - Criar nova Proposta com tipo CONTRA_PROPOSTA

### Sprint 3: Upload de Imagens - COMPLETO
- [x] Task 3.1: Configurar middleware de upload com Multer
  - Validação: tamanho máximo 5MB, tipos permitidos (jpg, png, webp)

- [x] Task 3.2: Criar endpoint de upload de foto de perfil
  - Upload para Cloudinary
  - Atualizar campo foto do Usuario

- [x] Task 3.3: Criar endpoint de upload de portfolio
  - Upload múltiplo para Cloudinary
  - Adicionar URLs ao array portfolio do Artista
  - Respeitar limites por plano (FREE: 5, PLUS: 15, PRO: ilimitado)

### Sprint 4: Sistema de Avaliações - COMPLETO
- [x] Task 4.1: Criar endpoint de criação de avaliação
  - Validar que booking está CONCLUIDO
  - Validar que usuário participou do booking
  - Critérios diferentes para artista vs contratante

- [x] Task 4.2: Implementar cálculo de média de avaliações
  - Atualizar notaMedia do Artista automaticamente
  - Recalcular após cada nova avaliação

- [x] Task 4.3: Criar endpoint de listagem de avaliações
  - Listar avaliações de um artista
  - Paginação

### Sprint 5: Mobile - Telas de Artistas
- [ ] Task 5.1: Implementar tela de busca de artistas
  - Integrar com API de listagem
  - Filtros básicos
  - Loading states

- [ ] Task 5.2: Criar componente Card de Artista
  - Design conforme paleta de cores
  - Exibir foto, nome, categoria, nota, plano

- [ ] Task 5.3: Implementar tela de detalhes do artista
  - Exibir perfil completo
  - Gallery de portfolio
  - Lista de avaliações
  - Botão de "Solicitar Booking"

### Sprint 6: Mobile - Telas de Bookings
- [ ] Task 6.1: Implementar formulário de criação de booking
  - Campos: data, horário, duração, local, descrição, orçamento
  - Validação de campos
  - Integração com API

- [ ] Task 6.2: Implementar lista de bookings
  - Tabs por status (Pendentes, Confirmados, Concluídos)
  - Card de booking com informações principais

- [ ] Task 6.3: Implementar tela de detalhes do booking
  - Informações completas do booking
  - Ações conforme status e tipo de usuário
  - Timeline de status

## Regras e Convenções

### Backend
1. Sempre usar Prisma para queries (nunca SQL raw)
2. Validar inputs com Zod antes de processar
3. Usar middleware authenticate em rotas protegidas
4. Retornar erros com AppError para tratamento consistente
5. Nunca retornar senhaHash nas respostas

### Mobile
1. Usar React Query para todas as chamadas de API
2. Implementar loading e error states em todas as telas
3. Seguir design system (cores em constants/colors.js)
4. Usar Zustand apenas para estado global (auth)
5. Componentes reutilizáveis em src/components/

### Testes
1. Testar cada endpoint no Postman antes de integrar no mobile
2. Verificar dados no Prisma Studio após operações
3. Testar casos de erro (validação, autenticação, autorização)

## Notas Importantes

### Cálculo de Taxa de Plataforma
```javascript
const taxas = {
  FREE: 0.15,  // 15%
  PLUS: 0.10,  // 10%
  PRO: 0.07    // 7%
};
const taxaPlataforma = valorArtista * taxas[artistaPlano];
const valorTotal = valorArtista + taxaPlataforma;
```

### Algoritmo de Ranking de Artistas
```javascript
const planoWeights = { PRO: 3, PLUS: 2, FREE: 1 };
const perfilCompleto = calcularPerfilCompleto(artista); // 0-10 pontos
const score =
  (planoWeights[artista.plano] * 40) +
  (artista.notaMedia * 30) +
  (artista.totalBookings * 20) +
  (perfilCompleto * 10);
```

### Estados de Booking
PENDENTE → ACEITO → CONFIRMADO (pós-pagamento) → EM_ANDAMENTO → CONCLUIDO

### Sprint 7: Sistema de Pagamentos ASAAS - COMPLETO
- [x] Task 7.1: Criar serviço ASAAS
  - Integração com API ASAAS (sandbox e produção)
  - Funções: criar subconta, criar pagamento, consultar status, transferência, estorno
  - Cálculo de split entre plataforma e artista

- [x] Task 7.2: Implementar endpoints de pagamento
  - Criar pagamento (PIX e Cartão de Crédito)
  - Consultar status de pagamento
  - Webhook para notificações ASAAS
  - Solicitar estorno
  - Liberar pagamento (após 48h)

- [x] Task 7.3: Validações e regras de negócio
  - Booking deve estar ACEITO para criar pagamento
  - Apenas contratante pode pagar
  - Split automático conforme plano do artista
  - Atualização automática de status via webhook

### Sprint 8: Check-in/Check-out com Geolocalização - COMPLETO
- [x] Task 8.1: Implementar check-in
  - Validação de geolocalização (fórmula de Haversine)
  - Distância máxima: 500m do local
  - Janela de tempo: 2h antes até 1h após início
  - Upload de foto de comprovação obrigatória
  - Extração de coordenadas do campo local

- [x] Task 8.2: Implementar adiantamento de 50%
  - Libera 50% do valor do artista após check-in
  - Atualiza status do pagamento
  - Cria mensagem de sistema

- [x] Task 8.3: Implementar check-out
  - Validação de check-in prévio
  - Janela de tempo: desde início até 1h após fim
  - Check-out automático após 1h do fim
  - Job periódico para auto check-out
  - Atualiza booking para CONCLUIDO

- [x] Task 8.4: Status de check-in/check-out
  - Endpoint para consultar status
  - Retorna janelas de tempo válidas
  - Indica se pode realizar check-in/out agora

### Sprint 9: Finalização MVP Backend - COMPLETO
- [x] Task 9.1: Integração de todos os módulos
  - Registrar todas rotas no server.js
  - Validar fluxo completo end-to-end
  - Criar variáveis de ambiente necessárias

- [x] Task 9.2: Documentação completa
  - Criar MVP_BACKEND_SUMMARY.md com resumo completo
  - Documentar todos endpoints
  - Documentar regras de negócio
  - Incluir exemplos de uso
  - Troubleshooting comum

## Backlog (Pós-MVP)
- Sistema de disputas completo
- Notificações push (Firebase)
- Painel admin
- Analytics e métricas
- Testes unitários e integração
- CI/CD
- Monitoramento (Sentry)

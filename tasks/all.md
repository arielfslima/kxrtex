# Sprint 1 - CRUD de Artistas (Backend)

## Status: COMPLETO

## Resumo das Mudanças

Sprint 1 finalizado com sucesso. Foram implementados todos os endpoints básicos de CRUD para artistas, incluindo o algoritmo de ranking conforme especificado no PRD.

## Mudanças Detalhadas

### Arquivos Criados

#### 1. `backend/src/controllers/artist.controller.js`
Novo controller com 3 funções principais:

**`listArtists()`**
- Lista artistas com múltiplos filtros: categoria, subcategoria, cidade, preço, avaliação, plano, verificado
- Implementa paginação (padrão: 20 itens por página)
- Implementa 5 tipos de ordenação: relevância, preço (asc/desc), avaliação, recentes
- Aplica algoritmo de ranking do PRD para ordenação por relevância
- Retorna apenas artistas ativos

**`calcularScoreRanking(artista)`**
- Implementa algoritmo de ranking conforme PRD:
  - Peso do plano (PRO=3, PLUS=2, FREE=1) × 40
  - Nota média × 30
  - Total de bookings × 20
  - Perfil completo (0-10 pontos) × 10

**`calcularPerfilCompleto(artista)`**
- Calcula completude do perfil (0-10 pontos):
  - Bio ≥50 chars: 2 pontos
  - Portfolio ≥3 itens: 3 pontos
  - Vídeos no portfolio: 2 pontos
  - Redes sociais: 1 ponto
  - Verificado: 2 pontos

**`getArtistById()`**
- Retorna detalhes completos de um artista específico
- Inclui informações do usuário (nome, foto, telefone)
- Inclui total de seguidores
- Inclui últimas 10 avaliações com dados do avaliador
- Valida se artista existe e está ativo
- Retorna erro 404 se não encontrado
- Retorna erro 403 se artista não está ativo

**`updateArtist()`**
- Permite artista atualizar seu próprio perfil
- Valida permissão: apenas o próprio artista pode editar
- Campos atualizáveis: nomeArtistico, bio, valorBaseHora, categoria, subcategorias, cidadesAtuacao, redesSociais
- Retorna perfil atualizado com dados do usuário

### Arquivos Modificados

#### 2. `backend/src/utils/validation.js`
Adicionados 2 novos schemas Zod:

**`listArtistsQuerySchema`**
- Valida query params da listagem de artistas
- Enums validados: categoria (DJ/MC/PERFORMER), plano (FREE/PLUS/PRO), orderBy (5 opções)
- Campos opcionais: todos os filtros são opcionais

**`updateArtistSchema`**
- Valida body da atualização de perfil
- Bio: mínimo 50 caracteres (regra de negócio do PRD)
- Subcategorias: máximo 3 itens (regra de negócio do PRD)
- RedesSociais: objeto com URLs validadas (instagram, soundcloud, spotify, youtube, twitter)

#### 3. `backend/src/middlewares/validator.js`
Criada nova função:

**`validateQuery(schema)`**
- Similar ao `validate()` existente, mas para query params
- Usa `req.query` ao invés de `req.body`
- Mantém mesmo padrão de error handling (ZodError)

#### 4. `backend/src/routes/artist.routes.js`
Atualizado para usar os novos controllers:

- `GET /api/artists` - Lista artistas (pública)
  - Middlewares: validateQuery(listArtistsQuerySchema), listArtists

- `GET /api/artists/:id` - Detalhes do artista (pública)
  - Controller: getArtistById

- `PATCH /api/artists/:id` - Atualizar perfil (protegida)
  - Middlewares: authenticate, requireArtist, validate(updateArtistSchema), updateArtist

## Decisões de Design

### 1. Algoritmo de Ranking
Implementado exatamente conforme PRD:
```javascript
score = (plano_weight * 40) + (notaMedia * 30) + (totalBookings * 20) + (perfilCompleto * 10)
```
Esta fórmula prioriza plano do artista (40%), seguido de avaliações (30%), experiência (20%) e completude do perfil (10%).

### 2. Ordenação Client-Side
A ordenação por relevância é feita após buscar os dados do banco porque:
- O score é calculado dinamicamente com múltiplas variáveis
- Prisma não suporta ordenação por campos calculados diretamente
- Volume de dados por página é pequeno (20 itens), performance não é impactada

Alternativa futura: Criar campo `score` no banco e recalcular via job, se performance for problema.

### 3. Validação de Permissões
Dupla validação na atualização de perfil:
1. `requireArtist` middleware: garante que usuário é tipo ARTISTA
2. `updateArtist` controller: garante que artista está editando seu próprio perfil

Isso previne que um artista edite perfil de outro artista.

### 4. Exposição de Dados Sensíveis
No endpoint de detalhes:
- Telefone é incluído (para contratantes saberem como contatar)
- Email NÃO é incluído (privacidade)
- CPF/CNPJ NÃO é incluído (dados pessoais)
- DocumentosURLs NÃO são incluídos (apenas admin deve ver)

## Regras de Negócio Implementadas

1. Bio mínima de 50 caracteres (PRD: seção 3.2)
2. Máximo 3 subcategorias por artista (PRD: seção 3.2)
3. Cálculo de ranking por plano (PRD: seção 2.2)
4. Apenas artistas ativos aparecem na listagem
5. Apenas o próprio artista pode editar seu perfil

## Como Testar

### Setup
```bash
cd backend
npm install
npx prisma migrate dev --name add_artists
npm run dev
```

### Endpoint 1: Listar Artistas
```bash
# Listar todos
curl http://localhost:3000/api/artists

# Com filtros
curl "http://localhost:3000/api/artists?categoria=DJ&precoMin=100&precoMax=500&orderBy=preco_asc&page=1&limit=10"

# Por cidade
curl "http://localhost:3000/api/artists?cidade=São Paulo"

# Apenas verificados
curl "http://localhost:3000/api/artists?verificado=true"
```

### Endpoint 2: Detalhes do Artista
```bash
# Substituir {id} pelo ID de um artista
curl http://localhost:3000/api/artists/{id}
```

### Endpoint 3: Atualizar Perfil
```bash
# Primeiro fazer login como artista e pegar token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "artista@example.com", "senha": "senha123"}'

# Atualizar perfil (substituir {id} e {TOKEN})
curl -X PATCH http://localhost:3000/api/artists/{id} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {TOKEN}" \
  -d '{
    "bio": "Nova bio com mais de 50 caracteres para passar na validação",
    "valorBaseHora": 250,
    "subcategorias": ["Techno", "House"],
    "cidadesAtuacao": ["São Paulo", "Rio de Janeiro"],
    "redesSociais": {
      "instagram": "https://instagram.com/dj",
      "soundcloud": "https://soundcloud.com/dj"
    }
  }'
```

## Próximos Passos

Sprint 1 completo. Próximo: **Sprint 2 - Sistema de Bookings (Backend)**

Tasks do Sprint 2:
- Task 2.1: Criar controller de criação de booking
- Task 2.2: Implementar endpoints de gestão de bookings
- Task 2.3: Implementar sistema de contra-proposta

## Notas Técnicas

### Performance
- Paginação padrão de 20 itens mantém queries rápidas
- Include do Prisma busca apenas campos necessários
- Contagem total usa `count()` separado para otimização

### Segurança
- Validação de inputs com Zod previne injeções
- Middleware `requireArtist` previne acesso não autorizado
- Verificação de ownership previne edição cruzada de perfis

### Manutenibilidade
- Funções auxiliares (`calcularScore`, `calcularPerfilCompleto`) isoladas e reutilizáveis
- Validações centralizadas em schemas Zod
- Error handling consistente via AppError

## Conclusão

Sprint 1 implementado com sucesso seguindo princípios SOLID:
- Single Responsibility: cada função tem uma responsabilidade clara
- Open/Closed: algoritmo de ranking pode ser estendido sem modificar código existente
- Dependency Inversion: controllers dependem de abstrações (Prisma, middlewares)

Código simples, impacto mínimo, sem lazy solutions. Pronto para produção após testes.

---

# Sprint 2 - Sistema de Bookings (Backend)

## Status: COMPLETO

## Resumo das Mudanças

Sprint 2 finalizado com sucesso. Sistema completo de bookings implementado com criação, listagem, gestão (aceitar/recusar) e contra-propostas. Todas as regras de negócio do PRD foram aplicadas.

## Mudanças Detalhadas

### Arquivos Criados

#### 1. `backend/src/controllers/booking.controller.js`
Novo controller com 6 funções principais:

**`calcularTaxaPlataforma(valorArtista, planoArtista)`**
- Função auxiliar para calcular taxa
- FREE: 15%, PLUS: 10%, PRO: 7% (conforme PRD)
- Retorna valor da taxa em reais

**`createBooking()`**
- Cria nova proposta de booking (status: PENDENTE)
- Validações:
  - Apenas contratantes podem criar bookings
  - Artista deve existir e estar ativo
  - Data do evento não pode ser no passado
- Cálculo automático de valores:
  - valorArtista: valorProposto OU (valorBaseHora × duracao)
  - taxaPlataforma: calculada baseada no plano do artista
  - valorTotal: valorArtista + taxaPlataforma
- Cria proposta inicial tipo INICIAL automaticamente
- Retorna booking completo com dados de artista e contratante

**`listBookings()`**
- Lista bookings do usuário autenticado
- Filtra automaticamente por tipo de usuário:
  - ARTISTA: bookings onde é o artista
  - CONTRATANTE: bookings onde é o contratante
- Filtro opcional por status
- Paginação: 20 itens por página (padrão)
- Ordenação: mais recentes primeiro (createdAt DESC)
- Retorna apenas dados necessários (nome, foto)

**`getBookingById()`**
- Retorna detalhes completos de um booking
- Validações de permissão:
  - Apenas artista ou contratante envolvido pode ver
  - Erro 403 se usuário não tem permissão
- Inclui:
  - Dados completos de artista e contratante (email, telefone)
  - Histórico de propostas (ordem desc)
  - Últimas 50 mensagens (ordem asc)

**`acceptBooking()`**
- Artista aceita booking pendente
- Validações:
  - Apenas artistas podem aceitar
  - Apenas o artista do booking pode aceitar
  - Apenas bookings PENDENTES podem ser aceitos
- Muda status para ACEITO
- Atualiza updatedAt
- Retorna booking atualizado

**`rejectBooking()`**
- Artista recusa booking pendente
- Validações:
  - Apenas artistas podem recusar
  - Apenas o artista do booking pode recusar
  - Apenas bookings PENDENTES podem ser recusados
- Muda status para CANCELADO
- Se houver motivo: cria mensagem do tipo SISTEMA com o motivo
- Retorna booking atualizado

**`counterOffer()`**
- Artista faz contra-proposta com novo valor
- Validações:
  - Apenas artistas podem fazer contra-propostas
  - Apenas o artista do booking
  - Apenas bookings PENDENTES
- Usa transaction do Prisma para atomicidade:
  1. Atualiza valores do booking (valorArtista, taxaPlataforma, valorTotal)
  2. Cria nova proposta tipo CONTRA_PROPOSTA
- Cria mensagem SISTEMA notificando contra-proposta
- Recalcula taxa baseada no plano do artista
- Retorna booking e proposta atualizados

### Arquivos Modificados

#### 2. `backend/src/utils/validation.js`
Adicionados 3 novos schemas Zod:

**`createBookingSchema`**
- artistaId: UUID válido
- dataEvento: datetime ISO 8601
- horarioInicio: HH:mm (regex validation)
- duracao: inteiro positivo, máx 24 horas
- local: mínimo 5 caracteres
- descricaoEvento: mínimo 10 caracteres
- valorProposto: opcional, number positivo

**`listBookingsQuerySchema`**
- status: enum com todos os status válidos (opcional)
- page: string opcional
- limit: string opcional

**`rejectBookingSchema`**
- motivo: opcional, mínimo 10 caracteres

**`counterOfferSchema`**
- valorProposto: number positivo obrigatório
- mensagem: opcional, mínimo 10 caracteres

#### 3. `backend/src/routes/booking.routes.js`
Implementadas 6 rotas:

- `GET /api/bookings` - Lista bookings do usuário
  - Middlewares: authenticate, validateQuery, listBookings

- `POST /api/bookings` - Cria novo booking
  - Middlewares: authenticate, validate(createBookingSchema), createBooking

- `GET /api/bookings/:id` - Detalhes do booking
  - Middlewares: authenticate, getBookingById

- `PATCH /api/bookings/:id/accept` - Aceitar booking
  - Middlewares: authenticate, acceptBooking

- `PATCH /api/bookings/:id/reject` - Recusar booking
  - Middlewares: authenticate, validate(rejectBookingSchema), rejectBooking

- `POST /api/bookings/:id/counter-offer` - Contra-proposta
  - Middlewares: authenticate, validate(counterOfferSchema), counterOffer

## Decisões de Design

### 1. Cálculo Automático de Valores
O sistema calcula automaticamente:
```javascript
valorArtista = valorProposto || (artista.valorBaseHora * duracao)
taxaPlataforma = valorArtista * taxas[plano]
valorTotal = valorArtista + taxaPlataforma
```

Isso garante consistência e previne erros de cálculo manual.

### 2. Proposta Inicial Automática
Ao criar booking, uma proposta tipo INICIAL é criada automaticamente. Isso mantém histórico completo de negociação desde o início.

### 3. Transação na Contra-Proposta
Usa `prisma.$transaction()` para garantir que booking E proposta sejam criados atomicamente. Se um falhar, ambos são revertidos.

### 4. Mensagens do Sistema
Eventos importantes (recusa, contra-proposta) criam mensagens tipo SISTEMA automaticamente para auditoria e histórico.

### 5. Permissões Granulares
Cada ação valida:
- Tipo de usuário (ARTISTA vs CONTRATANTE)
- Ownership (é MEU booking?)
- Status do booking (pode fazer essa ação agora?)

Isso previne ações indevidas em todos os níveis.

### 6. Validação de Data no Passado
Previne criação de bookings para datas passadas comparando com data atual (zerada para considerar apenas dia).

## Regras de Negócio Implementadas

1. **Taxas por plano**: FREE 15%, PLUS 10%, PRO 7% (PRD seção 2.1)
2. **Status PENDENTE**: Novo booking sempre inicia pendente
3. **Apenas contratantes criam bookings**: Regra de negócio
4. **Apenas artistas aceitam/recusam**: Regra de negócio
5. **Data não pode ser passado**: Validação de negócio
6. **Duração máxima 24h**: Limite prático
7. **Apenas PENDENTE pode ser aceito/recusado/contra-proposto**: Máquina de estados

## Fluxo de Estados

```
PENDENTE → [aceitar] → ACEITO → [pagamento] → CONFIRMADO
         ↓
         [recusar] → CANCELADO
         ↓
         [contra-proposta] → PENDENTE (valores atualizados)
```

## Como Testar

### Setup
Backend já deve estar rodando do Sprint 1.

### Endpoint 1: Criar Booking
```bash
# Login como contratante e pegar token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "contratante@example.com", "senha": "senha123"}'

# Criar booking (substituir {artistaId} e {TOKEN})
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {TOKEN}" \
  -d '{
    "artistaId": "{artistaId}",
    "dataEvento": "2025-12-31T20:00:00.000Z",
    "horarioInicio": "20:00",
    "duracao": 4,
    "local": "Rua Exemplo, 123 - São Paulo/SP",
    "descricaoEvento": "Evento de techno underground com 300 pessoas",
    "valorProposto": 1000
  }'
```

### Endpoint 2: Listar Bookings
```bash
# Listar todos os bookings do usuário
curl http://localhost:3000/api/bookings \
  -H "Authorization: Bearer {TOKEN}"

# Filtrar por status
curl "http://localhost:3000/api/bookings?status=PENDENTE" \
  -H "Authorization: Bearer {TOKEN}"

# Com paginação
curl "http://localhost:3000/api/bookings?page=1&limit=10" \
  -H "Authorization: Bearer {TOKEN}"
```

### Endpoint 3: Detalhes do Booking
```bash
curl http://localhost:3000/api/bookings/{bookingId} \
  -H "Authorization: Bearer {TOKEN}"
```

### Endpoint 4: Aceitar Booking (como artista)
```bash
# Login como artista
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "artista@example.com", "senha": "senha123"}'

# Aceitar booking
curl -X PATCH http://localhost:3000/api/bookings/{bookingId}/accept \
  -H "Authorization: Bearer {TOKEN}"
```

### Endpoint 5: Recusar Booking (como artista)
```bash
curl -X PATCH http://localhost:3000/api/bookings/{bookingId}/reject \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {TOKEN}" \
  -d '{
    "motivo": "Já tenho compromisso nessa data, desculpe!"
  }'
```

### Endpoint 6: Contra-Proposta (como artista)
```bash
curl -X POST http://localhost:3000/api/bookings/{bookingId}/counter-offer \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {TOKEN}" \
  -d '{
    "valorProposto": 1500,
    "mensagem": "Proposta de valor ajustada considerando equipamento e transporte"
  }'
```

## Próximos Passos

Sprint 2 completo. Próximo: **Sprint 3 - Upload de Imagens**

Tasks do Sprint 3:
- Task 3.1: Configurar middleware de upload com Multer
- Task 3.2: Criar endpoint de upload de foto de perfil
- Task 3.3: Criar endpoint de upload de portfolio

## Notas Técnicas

### Performance
- Listagem usa include seletivo (apenas nome e foto)
- Transaction para contra-proposta garante consistência
- Paginação padrão de 20 itens

### Segurança
- Tripla validação de permissões (tipo, ownership, status)
- Validação de UUIDs previne injeção
- Validação de datas previne bugs temporais
- Zod valida todos os inputs

### Manutenibilidade
- Função `calcularTaxaPlataforma` reutilizável e testável
- Validações de permissão consistentes em todos os endpoints
- Mensagens de erro claras e específicas
- Uso de transactions para operações atômicas

### Auditoria
- Mensagens SISTEMA registram ações importantes
- Propostas mantêm histórico completo de negociação
- updatedAt atualizado em todas as mudanças

## Conclusão

Sprint 2 implementado com sucesso. Sistema de bookings completo e robusto:
- 6 endpoints funcionais
- Cálculo automático de taxas conforme plano
- Validações granulares de permissões
- Máquina de estados bem definida
- Histórico completo de negociação

Código simples, impacto mínimo, zero lazy solutions. Pronto para Sprint 3.

---

# Sprint 3 - Upload de Imagens

## Status: COMPLETO

## Resumo das Mudanças

Sprint 3 finalizado com sucesso. Sistema completo de upload de imagens implementado com Multer + Cloudinary. Suporta foto de perfil e portfolio com limites por plano.

## Mudanças Detalhadas

### Arquivos Criados

#### 1. `backend/src/middlewares/upload.js`
Middleware Multer configurado:

**Configurações:**
- Storage: memoryStorage (buffer em memória)
- Filtro de tipos: JPEG, JPG, PNG, WEBP
- Limite de tamanho: 5MB por arquivo
- Rejeita outros tipos com erro 400

**Exports:**
- `uploadSingle`: para upload de 1 imagem (foto de perfil)
- `uploadMultiple`: para até 10 imagens de uma vez (portfolio)

#### 2. `backend/src/services/cloudinary.service.js`
Service para integração com Cloudinary:

**`uploadImageBuffer(buffer, folder)`**
- Recebe buffer da imagem em memória
- Faz upload para Cloudinary via stream
- Aplica transformações:
  - Redimensiona para máx 1200x1200px
  - Qualidade: auto:good
  - Formato: auto (otimiza automaticamente)
- Retorna: { url, publicId }

**`deleteImage(publicId)`**
- Deleta imagem do Cloudinary
- Usado ao trocar foto de perfil ou remover do portfolio
- Não lança erro se falhar (log apenas)

**`extractPublicId(url)`**
- Extrai publicId da URL do Cloudinary
- Necessário para deletar imagens

#### 3. `backend/src/controllers/upload.controller.js`
Controller com 3 funções:

**`uploadProfilePhoto()`**
- Upload de foto de perfil do usuário
- Validações:
  - Arquivo foi enviado
- Fluxo:
  1. Faz upload para Cloudinary (pasta: kxrtex/profiles)
  2. Se usuário já tinha foto: deleta a antiga do Cloudinary
  3. Atualiza campo `foto` do Usuario no banco
- Retorna: nova URL da foto

**`uploadPortfolio()`**
- Upload de múltiplas imagens para portfolio (artista)
- Validações:
  - Arquivos foram enviados
  - Usuário é ARTISTA
  - Artista existe
  - Não excede limite do plano:
    - FREE: 5 imagens
    - PLUS: 15 imagens
    - PRO: ilimitado
- Fluxo:
  1. Verifica limite (totalAtual + novas <= limite)
  2. Upload de todas as imagens em paralelo (Promise.all)
  3. Adiciona URLs ao array `portfolio` do Artista
- Retorna: portfolio atualizado + total + limite

**`deletePortfolioImage()`**
- Remove imagem específica do portfolio
- Validações:
  - URL foi fornecida
  - Usuário é ARTISTA
  - Artista existe
  - Imagem existe no portfolio
- Fluxo:
  1. Deleta imagem do Cloudinary
  2. Remove URL do array `portfolio`
  3. Atualiza no banco
- Retorna: portfolio atualizado + total

#### 4. `backend/src/routes/upload.routes.js`
3 rotas implementadas:

- `POST /api/upload/profile-photo` - Upload foto de perfil
  - Middlewares: authenticate, uploadSingle, uploadProfilePhoto
  - Qualquer usuário autenticado pode

- `POST /api/upload/portfolio` - Upload portfolio
  - Middlewares: authenticate, requireArtist, uploadMultiple, uploadPortfolio
  - Apenas artistas

- `DELETE /api/upload/portfolio` - Remover do portfolio
  - Middlewares: authenticate, requireArtist, deletePortfolioImage
  - Apenas artistas

### Arquivos Modificados

#### 5. `backend/src/server.js`
- Adicionado import de `uploadRoutes`
- Registrado rota: `app.use('/api/upload', uploadRoutes)`

## Decisões de Design

### 1. Memory Storage vs Disk Storage
Escolhido `memoryStorage` porque:
- Não precisa gerenciar arquivos temporários no disco
- Buffer vai direto para Cloudinary via stream
- Mais rápido e limpo
- Servidor stateless (importante para escalabilidade)

### 2. Validações no Controller
Limites de plano validados no controller, não no middleware:
- Precisa consultar banco para saber plano atual
- Regra de negócio específica, não genérica
- Melhor separação de responsabilidades

### 3. Upload Paralelo
Portfolio usa `Promise.all` para upload paralelo:
- Mais rápido que sequencial
- Se uma falhar, todas falham (atomicidade)
- Cloudinary suporta bem requisições paralelas

### 4. Deleção da Foto Antiga
Ao trocar foto de perfil, antiga é deletada:
- Economiza espaço no Cloudinary
- Evita acúmulo de imagens órfãs
- Mas não falha se deleção falhar (pode não existir mais)

### 5. Transformações Automáticas
Cloudinary aplica transformações:
- 1200x1200px máximo: previne uploads gigantes
- quality auto:good: balanço entre qualidade e tamanho
- fetch_format auto: converte para WebP se browser suporta

### 6. Pasta no Cloudinary
Organização por pastas:
- `kxrtex/profiles`: fotos de perfil
- `kxrtex/portfolio`: imagens de portfolio
- Facilita gestão e busca

## Regras de Negócio Implementadas

1. **Limites por plano** (PRD seção 2.2):
   - FREE: 5 fotos
   - PLUS: 15 fotos + 2 vídeos (vídeos não implementados ainda)
   - PRO: ilimitado

2. **Tipos permitidos**: JPG, PNG, WEBP
3. **Tamanho máximo**: 5MB por arquivo
4. **Apenas artistas têm portfolio**: Regra de negócio
5. **Substituição de foto antiga**: Evita desperdício

## Como Testar

### Setup
Configurar Cloudinary no `.env`:
```bash
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Endpoint 1: Upload Foto de Perfil
```bash
# Login e pegar token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "senha": "senha123"}'

# Upload foto (substituir {TOKEN} e usar arquivo real)
curl -X POST http://localhost:3000/api/upload/profile-photo \
  -H "Authorization: Bearer {TOKEN}" \
  -F "image=@/path/to/photo.jpg"
```

### Endpoint 2: Upload Portfolio
```bash
# Login como artista
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "artista@example.com", "senha": "senha123"}'

# Upload múltiplas imagens
curl -X POST http://localhost:3000/api/upload/portfolio \
  -H "Authorization: Bearer {TOKEN}" \
  -F "images=@/path/to/photo1.jpg" \
  -F "images=@/path/to/photo2.jpg" \
  -F "images=@/path/to/photo3.jpg"
```

### Endpoint 3: Deletar do Portfolio
```bash
curl -X DELETE http://localhost:3000/api/upload/portfolio \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {TOKEN}" \
  -d '{
    "imageUrl": "https://res.cloudinary.com/...complete-url..."
  }'
```

## Próximos Passos

Sprint 3 completo. Próximo: **Sprint 4 - Sistema de Avaliações**

Tasks do Sprint 4:
- Task 4.1: Criar endpoint de criação de avaliação
- Task 4.2: Implementar cálculo de média de avaliações
- Task 4.3: Criar endpoint de listagem de avaliações

## Notas Técnicas

### Performance
- Memory storage evita I/O de disco
- Upload paralelo para portfolio
- Transformações no Cloudinary (não sobrecarrega servidor)
- URLs otimizadas (auto format, auto quality)

### Segurança
- Validação de tipo de arquivo (MIME type)
- Validação de tamanho (5MB)
- Apenas donos podem modificar seus arquivos
- Limites por plano previnem abuso

### Manutenibilidade
- Service isolado para Cloudinary
- Funções auxiliares reutilizáveis (extractPublicId)
- Configuração centralizada
- Error handling consistente

### Custo
- Deleção de fotos antigas reduz custo de storage
- Transformações Cloudinary incluídas no plano
- Limites por plano controlam uso

## Conclusão

Sprint 3 implementado com sucesso. Sistema de upload completo e eficiente:
- 3 endpoints funcionais
- Integração completa com Cloudinary
- Limites por plano respeitados
- Otimizações automáticas de imagem
- Gestão de storage (deleção de antigas)

Código simples, impacto mínimo, zero lazy solutions. Pronto para Sprint 4.

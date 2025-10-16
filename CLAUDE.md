# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

KXRTEX is a booking platform for underground artists (DJs, MCs, Performers) that connects artists with event organizers. The platform features secure payment intermediation, real-time chat, review systems, and advance payment options for out-of-city events.

## Development Commands

```bash
# Backend development
cd backend
npm install                    # Install dependencies
npm run dev                   # Start development server with hot reload
npm start                     # Start production server
npm test                      # Run all tests
npm run test:watch           # Run tests in watch mode

# Database operations
npm run migrate              # Run database migrations (node-pg-migrate)
npm run migrate:up           # Apply pending migrations
npm run migrate:down         # Rollback last migration
npm run seed                 # Run database seeders

# Environment setup
cp .env.example .env         # Copy environment template
```

## Architecture Overview

### Technology Stack
- **Backend**: Node.js 18+ with Express.js
- **Database**: PostgreSQL 14+ with Sequelize ORM
- **Cache**: Redis for sessions and caching
- **Real-time**: Socket.io for chat functionality
- **Authentication**: JWT with refresh tokens
- **File Storage**: Cloudinary integration
- **Payments**: ASAAS payment gateway integration

### Core Architecture Patterns

**Request Flow**:
Express middleware → Rate limiting → JWT auth → Route handlers → Controllers → Services → Models → Database

**Authentication System**:
- JWT tokens with Redis-backed blacklisting
- User caching in Redis for performance
- Role-based access control (contratante/artista/admin)
- Token refresh mechanism with separate secrets

**Database Design**:
- Core entities: User (usuarios), Profissional, Booking, Categoria/Subcategoria
- User can have one Profissional profile (1:1 relationship)
- Users can create multiple Bookings as contratante (1:N)
- Profissionais can have multiple Bookings (1:N)
- Categories have multiple Subcategories (1:N)

**Real-time Communication**:
- Socket.io rooms based on booking IDs (`booking_${bookingId}`)
- JWT authentication for socket connections
- User online status tracking in Redis
- Typing indicators and message read receipts

### Key Architectural Decisions

**Error Handling**: Centralized error handling with `AppError` class and custom error middleware that provides consistent API responses with success/error structure.

**Rate Limiting**: Multi-tier rate limiting with Redis backing:
- General API: 100 requests/15 min
- Auth endpoints: 5 requests/15 min
- Upload endpoints: 20 uploads/hour

**Data Validation**: Express-validator for request validation with custom validation rules in route files.

**Logging**: Winston-based logging with different transports for development/production, file rotation, and structured JSON logging.

## Business Logic

### User Types and Permissions
- **Contratante**: Can search artists, send booking requests, make payments
- **Artista**: Can receive bookings, accept/reject requests, request advances
- **Admin**: Full system access, user management, dispute resolution

### Booking Workflow
1. Contratante searches and selects artist
2. Creates booking request (expires in 48h)
3. Artist accepts/rejects/counter-proposes
4. Payment processing upon acceptance
5. Optional advance payment for out-of-city events
6. Event execution with check-in/check-out
7. Mutual review system after completion

### Fee Structure
Platform takes percentage based on artist's plan:
- Free plan: 15% fee
- Plus plan (R$49/month): 10% fee
- Pro plan (R$99/month): 7% fee

## Code Organization

### Models (`backend/src/models/`)
Models include business logic methods (e.g., `isEligibleForAdvance()`, `calculatePlatformFee()`) and use Sequelize hooks for data processing.

### Controllers (`backend/src/controllers/`)
Currently contain stub implementations that need to be completed. Follow the pattern established in `AuthController.js` for validation, error handling, and response formatting.

### Middlewares (`backend/src/middlewares/`)
- `auth.js`: JWT verification, role checks, ownership validation
- `rateLimiter.js`: Redis-backed rate limiting with custom stores
- `errorHandler.js`: Centralized error processing with AppError class

### Configuration (`backend/src/config/`)
- `database.js`: Sequelize configuration with environment-specific settings
- `redis.js`: Redis client with helper functions for caching operations

### Socket Handlers (`backend/src/sockets/`)
Real-time functionality with authentication middleware, room management, and event handlers for messaging.

## Environment Configuration

Required environment variables include database credentials, Redis configuration, JWT secrets, Cloudinary settings, ASAAS payment gateway configuration, and CORS origins. The `.env.example` file provides a complete template.

## Development Status

This is an initial setup with:
- ✅ Complete authentication system
- ✅ Database models and associations
- ✅ Socket.io real-time infrastructure
- ✅ Middleware and error handling
- ⚠️ Controller implementations are stubs
- ⚠️ Database migrations not yet created
- ⚠️ Payment integration pending
- ⚠️ File upload functionality pending

## API Response Format

All API responses follow this structure:
```json
// Success
{
  "success": true,
  "message": "Operation description",
  "data": {...}
}

// Error
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  }
}
```

# KXRTEX - DOCUMENTAÇÃO TÉCNICA COMPLETA

**Versão:** 1.0  
**Data:** Outubro 2025  
**Produto:** Plataforma de Booking para Artistas Underground  
**Coletivo:** KXNTRALEI

---

## ÍNDICE

1. [Visão Geral](#1-visão-geral)
2. [Identidade Visual](#2-identidade-visual)
3. [Arquitetura do Sistema](#3-arquitetura-do-sistema)
4. [Modelo de Negócio](#4-modelo-de-negócio)
5. [Tipos de Usuário](#5-tipos-de-usuário)
6. [Banco de Dados](#6-banco-de-dados)
7. [API Endpoints](#7-api-endpoints)
8. [Fluxos de Usuário](#8-fluxos-de-usuário)
9. [Regras de Negócio](#9-regras-de-negócio)
10. [Sistema de Pagamentos](#10-sistema-de-pagamentos)
11. [Sistema de Adiantamento](#11-sistema-de-adiantamento)
12. [Moderação e Segurança](#12-moderação-e-segurança)
13. [Notificações](#13-notificações)
14. [Gamificação](#14-gamificação)
15. [Painel Admin](#15-painel-admin)
16. [Stack Tecnológica](#16-stack-tecnológica)
17. [Estrutura de Pastas](#17-estrutura-de-pastas)
18. [Roadmap](#18-roadmap)
19. [Checklist de Desenvolvimento](#19-checklist-de-desenvolvimento)

---

## 1. VISÃO GERAL

### 1.1 Propósito
KXRTEX é uma plataforma de intermediação entre contratantes e artistas underground (DJs, MCs, Performers) que oferece:
- Descoberta de artistas por categoria e localização
- Negociação e fechamento de contratos
- Intermediação segura de pagamentos
- Chat em tempo real
- Sistema de avaliações
- Proteção para ambas as partes

### 1.2 Diferenciais
- **Underground First:** Foco em artistas e cena underground
- **Pagamento Seguro:** Intermediação com retenção até conclusão do evento
- **Adiantamento Inteligente:** Sistema de pré-pagamento para eventos em outras cidades
- **Anti-Contorno:** Proteções contra negociações fora da plataforma
- **Gamificação:** Sistema de seguir, indicações e recompensas

### 1.3 Público-Alvo

**Contratantes:**
- Organizadores de eventos (festas, raves, clubes)
- Casas noturnas
- Eventos privados (aniversários, casamentos, corporativos)
- Marcas e empresas

**Artistas (Fase 1):**
- DJs (Techno, House, Hardtechno, UK Garage, Hip-Hop, Funk, etc.)
- MCs (Hip-Hop, Funk, Apresentadores)
- Dançarinos e Performers (Go-Go, Performance Art, etc.)

### 1.4 Modelo de Receita
- Taxa de intermediação sobre bookings (7-15% dependendo do plano)
- Assinaturas mensais para artistas (PLUS R$49, PRO R$99)
- Sistema híbrido que incentiva assinaturas através de taxas reduzidas

---

## 2. IDENTIDADE VISUAL

### 2.1 Nome e Conceito
**KXRTEX** - Cortex modificado com K, representando o núcleo/mente da cena underground.

**Tagline:** "O núcleo da cena underground"

### 2.2 Paleta de Cores

**Primária:**
- Dark Red / Vermelho Sangue: `#8B0000`
- Uso: Elementos principais, CTAs, destaques

**Secundária:**
- Preto Profundo: `#0D0D0D`
- Uso: Backgrounds, textos principais

**Accent:**
- Vermelho Vibrante: `#FF4444`
- Uso: Botões de ação, notificações, hover states

**Glass Effects:**
```css
background: rgba(139, 0, 0, 0.1);
border: 1px solid rgba(255, 68, 68, 0.2);
backdrop-filter: blur(20px);
box-shadow: 0 8px 32px rgba(139, 0, 0, 0.3);
```

### 2.3 Estilo Visual
- **Liquid Glass / Glassmorphism:** Elementos com blur, transparência e bordas sutis
- **Dark Mode:** Interface predominantemente escura
- **Minimalista:** Ícones simples, tipografia limpa
- **Underground:** Visual rebelde, moderno, tech

### 2.4 Tipografia
- **Headings:** Inter Bold / Montserrat Bold
- **Body:** Inter Regular / Roboto
- **Tamanhos:** 
  - H1: 32px
  - H2: 24px
  - H3: 20px
  - Body: 16px
  - Small: 14px

---

## 3. ARQUITETURA DO SISTEMA

### 3.1 Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENTE (Frontend)                    │
│  ┌──────────────────┐         ┌──────────────────┐     │
│  │  Mobile App      │         │   Web App        │     │
│  │  React Native    │         │   React.js       │     │
│  └──────────────────┘         └──────────────────┘     │
└─────────────────────────────────────────────────────────┘
                           │
                           │ HTTPS / WSS
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    BACKEND (API Layer)                   │
│  ┌──────────────────────────────────────────────────┐  │
│  │            Node.js + Express.js                   │  │
│  │  ┌─────────┐  ┌─────────┐  ┌──────────────┐    │  │
│  │  │  REST   │  │ Socket  │  │   Auth       │    │  │
│  │  │  API    │  │  .io    │  │   JWT        │    │  │
│  │  └─────────┘  └─────────┘  └──────────────┘    │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  PostgreSQL  │  │    Redis     │  │   Storage    │
│   Database   │  │    Cache     │  │  Cloudinary  │
└──────────────┘  └──────────────┘  └──────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────┐
│              SERVIÇOS EXTERNOS (Integrações)             │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐     │
│  │  ASAAS   │  │ Firebase │  │    Notificações   │     │
│  │Pagamentos│  │   Push   │  │   Email (SMTP)    │     │
│  └──────────┘  └──────────┘  └──────────────────┘     │
└─────────────────────────────────────────────────────────┘
```

### 3.2 Camadas da Aplicação

**Frontend (Mobile + Web):**
- Interface do usuário
- Validações client-side
- Cache local de dados
- Comunicação com API

**Backend (API):**
- Autenticação e autorização
- Lógica de negócio
- Validações server-side
- Integração com serviços externos

**Banco de Dados:**
- PostgreSQL para dados relacionais
- Redis para cache e sessões

**Storage:**
- Cloudinary para imagens e vídeos
- CDN para performance

**Serviços Externos:**
- ASAAS para pagamentos
- Firebase para notificações push
- SMTP para emails

---

## 4. MODELO DE NEGÓCIO

### 4.1 Taxas de Intermediação

**Estrutura:**
- Contratante paga: Valor do artista + Taxa da plataforma
- Artista recebe: Valor acordado (100%)
- Plataforma recebe: Taxa de intermediação

**Percentuais por Plano:**

| Plano Artista | Taxa Plataforma | Exemplo (Booking R$1.000) |
|---------------|-----------------|---------------------------|
| FREE          | 15%             | Contratante paga R$1.150  |
| PLUS (R$49/mês)| 10%            | Contratante paga R$1.100  |
| PRO (R$99/mês) | 7%             | Contratante paga R$1.070  |

### 4.2 Planos de Assinatura

**FREE (Gratuito)**
- Perfil básico
- Portfolio até 5 fotos
- Receber propostas
- Chat básico
- Taxa: 15%
- Sem selo de destaque
- Aparece por último nas buscas

**PLUS (R$ 49/mês)**
- Tudo do FREE
- Selo "PLUS" no perfil
- Portfolio até 15 fotos + 2 vídeos
- Prioridade nas buscas
- Estatísticas básicas
- Links redes sociais ilimitados
- Taxa reduzida: 10%

**PRO (R$ 99/mês)**
- Tudo do PLUS
- Selo "PRO" premium
- Portfolio ilimitado
- Destaque no topo das buscas
- Presskit profissional (PDF)
- Dashboard analítico completo
- Suporte prioritário
- Badge "Verificado" facilitado
- Personalização de perfil
- Criar cupons próprios
- Taxa reduzida: 7%

### 4.3 Sistema Verificado

**Como conseguir selo "Verificado":**

**Opção 1 - Orgânico:**
1. Ser assinante PLUS ou PRO
2. Completar mínimo 10 bookings
3. Avaliação média ≥ 4.5
4. Perfil 100% preenchido
5. Documentação completa (RG, CPF, comprovantes)
6. Sem reclamações/disputas

**Opção 2 - Pago (PRO apenas):**
- Taxa única: R$ 199
- Análise prioritária em 24h
- Requer documentação completa

### 4.4 Projeção de Receita

**Exemplo de Cálculo:**

Cenário Conservador (Mês 6):
- 200 artistas cadastrados
  - 150 FREE
  - 30 PLUS (R$49) = R$1.470
  - 20 PRO (R$99) = R$1.980
- 100 bookings/mês
  - Ticket médio: R$800
  - Taxa média: 12% = R$96 por booking
  - Receita bookings: R$9.600

**Receita Total Mensal:** R$13.050

**Objetivo Ano 1:**
- 1.000 artistas (200 pagantes)
- 500 bookings/mês
- Receita: R$60.000+/mês

---

## 5. TIPOS DE USUÁRIO

### 5.1 Contratantes

**Perfil:**
- Nome completo
- Email
- Telefone
- CPF/CNPJ (opcional, obrigatório para pagamento)
- Tipo: Pessoa Física / Empresa
- Foto de perfil

**Permissões:**
- Buscar artistas
- Ver perfis completos
- Enviar propostas de booking
- Negociar via chat
- Realizar pagamentos
- Avaliar artistas
- Seguir artistas
- Gerenciar bookings
- Indicar amigos

**Dashboard:**
- Propostas enviadas (pendentes, aceitas, recusadas)
- Bookings confirmados (próximos, passados)
- Artistas seguidos
- Histórico de buscas
- Créditos de indicação

### 5.2 Artistas

**Perfil:**
- Nome artístico
- Nome real (não público)
- Email
- Telefone
- CPF/CNPJ (obrigatório)
- Categoria principal (DJ, MC, Performer)
- Subcategorias (até 3)
- Cidades de atuação
- Bio (mínimo 50 caracteres)
- Valor base por hora
- Portfolio (fotos/vídeos)
- Links redes sociais
- Documento de identificação (para adiantamento)

**Permissões:**
- Criar/editar perfil
- Receber propostas
- Aceitar/recusar/contra-propor
- Negociar via chat
- Solicitar adiantamento
- Receber pagamentos
- Sacar valores
- Avaliar contratantes
- Ver estatísticas
- Criar cupons (PRO)

**Dashboard:**
- Propostas recebidas
- Bookings confirmados
- Ganhos (mês, total, disponível para saque)
- Avaliações
- Visualizações do perfil
- Taxa de conversão
- Analytics

### 5.3 Admin

**Permissões:**
- Acesso total ao sistema
- Gerenciar usuários (suspender, banir, verificar)
- Moderar conteúdo
- Resolver disputas
- Criar cupons
- Ver todas transações
- Relatórios financeiros
- Analytics completo
- Configurações do sistema

---

## 6. BANCO DE DADOS

### 6.1 Schema Completo

**Tecnologia:** PostgreSQL 14+

**Diagrama de Relacionamentos:**

```
usuarios (1) ──── (0..1) profissionais
    │                        │
    │                        ├─── (N) portfolio
    │                        ├─── (N) disponibilidade
    │                        └─── (N) subcategorias_profissional
    │
    ├─── (N) bookings (como contratante)
    ├─── (N) bookings (como artista)
    ├─── (N) avaliacoes (como avaliador)
    ├─── (N) avaliacoes (como avaliado)
    ├─── (N) mensagens
    ├─── (N) notificacoes
    ├─── (N) seguindo
    └─── (N) indicacoes

bookings (1) ──── (N) mensagens
         (1) ──── (0..1) pagamentos
         (1) ──── (0..1) adiantamentos
         (1) ──── (N) avaliacoes
         (1) ──── (0..N) disputas
```

### 6.2 Tabelas Detalhadas

#### 6.2.1 usuarios
```sql
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('contratante', 'artista', 'admin')),
    foto_perfil_url TEXT,
    cpf_cnpj VARCHAR(18) UNIQUE,
    documento_verificado BOOLEAN DEFAULT FALSE,
    verificado BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'suspenso', 'banido')),
    motivo_suspensao TEXT,
    data_suspensao_ate TIMESTAMP,
    score_confiabilidade INTEGER DEFAULT 50,
    ultimo_login TIMESTAMP,
    criado_em TIMESTAMP DEFAULT NOW(),
    atualizado_em TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_tipo ON usuarios(tipo);
CREATE INDEX idx_usuarios_status ON usuarios(status);
```

#### 6.2.2 profissionais
```sql
CREATE TABLE profissionais (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
    nome_artistico VARCHAR(100) NOT NULL,
    categoria_id UUID REFERENCES categorias(id),
    bio TEXT,
    video_apresentacao_url TEXT,
    valor_base_hora DECIMAL(10,2) NOT NULL,
    valor_base_minimo DECIMAL(10,2),
    valor_base_maximo DECIMAL(10,2),
    cidades_atuacao TEXT[], -- Array de cidades
    plano VARCHAR(20) DEFAULT 'free' CHECK (plano IN ('free', 'plus', 'pro')),
    data_assinatura TIMESTAMP,
    data_proxima_cobranca TIMESTAMP,
    avaliacao_media DECIMAL(3,2) DEFAULT 0,
    total_avaliacoes INTEGER DEFAULT 0,
    total_bookings INTEGER DEFAULT 0,
    taxa_cancelamento DECIMAL(5,2) DEFAULT 0,
    tempo_medio_resposta INTEGER, -- em minutos
    ultima_alteracao_preco TIMESTAMP,
    perfil_completo_percentual INTEGER DEFAULT 0,
    total_seguidores INTEGER DEFAULT 0,
    criado_em TIMESTAMP DEFAULT NOW(),
    atualizado_em TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_profissionais_categoria ON profissionais(categoria_id);
CREATE INDEX idx_profissionais_plano ON profissionais(plano);
CREATE INDEX idx_profissionais_avaliacao ON profissionais(avaliacao_media);
```

#### 6.2.3 categorias
```sql
CREATE TABLE categorias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    icone VARCHAR(50),
    ordem INTEGER,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT NOW()
);

-- Dados iniciais
INSERT INTO categorias (nome, slug, ordem) VALUES
('DJ', 'dj', 1),
('MC', 'mc', 2),
('Performer', 'performer', 3);
```

#### 6.2.4 subcategorias
```sql
CREATE TABLE subcategorias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    categoria_id UUID REFERENCES categorias(id) ON DELETE CASCADE,
    nome VARCHAR(50) NOT NULL,
    slug VARCHAR(50) NOT NULL,
    ordem INTEGER,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT NOW()
);

-- Dados iniciais para DJs
INSERT INTO subcategorias (categoria_id, nome, slug, ordem) VALUES
((SELECT id FROM categorias WHERE slug='dj'), 'House', 'house', 1),
((SELECT id FROM categorias WHERE slug='dj'), 'Techno', 'techno', 2),
((SELECT id FROM categorias WHERE slug='dj'), 'Hardtechno', 'hardtechno', 3),
((SELECT id FROM categorias WHERE slug='dj'), 'UK Garage', 'uk-garage', 4),
((SELECT id FROM categorias WHERE slug='dj'), 'Hip-Hop/Rap', 'hip-hop', 5),
((SELECT id FROM categorias WHERE slug='dj'), 'Funk', 'funk', 6),
((SELECT id FROM categorias WHERE slug='dj'), 'EDM/Electro', 'edm', 7),
((SELECT id FROM categorias WHERE slug='dj'), 'Trance/Psy', 'trance', 8),
((SELECT id FROM categorias WHERE slug='dj'), 'Drum and Bass', 'dnb', 9),
((SELECT id FROM categorias WHERE slug='dj'), 'Breaks/Breakbeat', 'breaks', 10),
((SELECT id FROM categorias WHERE slug='dj'), 'Dubstep/Bass', 'dubstep', 11),
((SELECT id FROM categorias WHERE slug='dj'), 'Ambient/Downtempo', 'ambient', 12),
((SELECT id FROM categorias WHERE slug='dj'), 'Industrial/EBM', 'industrial', 13),
((SELECT id FROM categorias WHERE slug='dj'), 'Open Format', 'open-format', 14),
((SELECT id FROM categorias WHERE slug='dj'), 'Outro', 'outro', 99);
```

#### 6.2.5 subcategorias_profissional
```sql
CREATE TABLE subcategorias_profissional (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profissional_id UUID REFERENCES profissionais(id) ON DELETE CASCADE,
    subcategoria_id UUID REFERENCES subcategorias(id) ON DELETE CASCADE,
    criado_em TIMESTAMP DEFAULT NOW(),
    UNIQUE(profissional_id, subcategoria_id)
);

CREATE INDEX idx_subcat_prof_profissional ON subcategorias_profissional(profissional_id);
```

#### 6.2.6 portfolio
```sql
CREATE TABLE portfolio (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profissional_id UUID REFERENCES profissionais(id) ON DELETE CASCADE,
    tipo VARCHAR(10) CHECK (tipo IN ('foto', 'video')),
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    ordem INTEGER,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_portfolio_profissional ON portfolio(profissional_id);
```

#### 6.2.7 redes_sociais
```sql
CREATE TABLE redes_sociais (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profissional_id UUID REFERENCES profissionais(id) ON DELETE CASCADE,
    plataforma VARCHAR(30) CHECK (plataforma IN ('instagram', 'soundcloud', 'spotify', 'youtube', 'tiktok', 'twitter', 'facebook', 'outro')),
    url TEXT NOT NULL,
    ordem INTEGER,
    criado_em TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_redes_profissional ON redes_sociais(profissional_id);
```

#### 6.2.8 bookings
```sql
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contratante_id UUID REFERENCES usuarios(id),
    profissional_id UUID REFERENCES profissionais(id),
    data_evento DATE NOT NULL,
    horario_inicio TIME NOT NULL,
    horario_fim TIME,
    duracao_horas DECIMAL(4,2),
    local_endereco TEXT NOT NULL,
    local_cidade VARCHAR(100) NOT NULL,
    local_estado VARCHAR(2) NOT NULL,
    tipo_evento VARCHAR(50),
    descricao TEXT,
    
    -- Valores
    orcamento_cliente DECIMAL(10,2), -- Quanto cliente ofereceu inicialmente
    valor_proposto_artista DECIMAL(10,2), -- Contra-proposta do artista
    valor_final DECIMAL(10,2), -- Valor acordado
    taxa_plataforma_percentual DECIMAL(5,2), -- % da taxa
    taxa_plataforma_valor DECIMAL(10,2), -- Valor em R$ da taxa
    valor_total DECIMAL(10,2), -- valor_final + taxa_plataforma_valor
    
    -- Status e datas
    status VARCHAR(30) DEFAULT 'pendente' CHECK (status IN (
        'pendente', -- Aguardando resposta do artista
        'em_negociacao', -- Artista contra-propôs
        'aceito', -- Artista aceitou, aguardando pagamento
        'confirmado', -- Pago e confirmado
        'em_andamento', -- Check-in feito
        'concluido', -- Evento finalizado
        'cancelado_contratante',
        'cancelado_artista',
        'expirado', -- Proposta expirou
        'em_disputa'
    )),
    
    expira_em TIMESTAMP, -- Prazo para resposta
    confirmado_em TIMESTAMP,
    cancelado_em TIMESTAMP,
    concluido_em TIMESTAMP,
    motivo_cancelamento TEXT,
    
    -- Check-in
    checkin_artista_em TIMESTAMP,
    checkin_artista_lat DECIMAL(10,8),
    checkin_artista_lng DECIMAL(11,8),
    checkin_contratante_em TIMESTAMP,
    
    -- Cupom aplicado
    cupom_codigo VARCHAR(50),
    cupom_desconto DECIMAL(10,2),
    
    criado_em TIMESTAMP DEFAULT NOW(),
    atualizado_em TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_bookings_contratante ON bookings(contratante_id);
CREATE INDEX idx_bookings_profissional ON bookings(profissional_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_data_evento ON bookings(data_evento);
```

#### 6.2.9 mensagens
```sql
CREATE TABLE mensagens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    remetente_id UUID REFERENCES usuarios(id),
    destinatario_id UUID REFERENCES usuarios(id),
    mensagem TEXT NOT NULL,
    tipo VARCHAR(20) DEFAULT 'texto' CHECK (tipo IN ('texto', 'imagem', 'documento', 'sistema')),
    url_anexo TEXT,
    lida BOOLEAN DEFAULT FALSE,
    lida_em TIMESTAMP,
    bloqueada BOOLEAN DEFAULT FALSE, -- Mensagem bloqueada por conter contato externo
    motivo_bloqueio TEXT,
    enviada_em TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_mensagens_booking ON mensagens(booking_id);
CREATE INDEX idx_mensagens_remetente ON mensagens(remetente_id);
CREATE INDEX idx_mensagens_destinatario ON mensagens(destinatario_id);
```

#### 6.2.10 pagamentos
```sql
CREATE TABLE pagamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
    valor_total DECIMAL(10,2) NOT NULL, -- Valor total pago pelo contratante
    valor_artista DECIMAL(10,2) NOT NULL, -- Valor que vai para o artista
    taxa_plataforma DECIMAL(10,2) NOT NULL, -- Taxa da plataforma
    
    metodo_pagamento VARCHAR(20) CHECK (metodo_pagamento IN ('pix', 'cartao_credito')),
    parcelas INTEGER DEFAULT 1,
    
    status VARCHAR(30) DEFAULT 'pendente' CHECK (status IN (
        'pendente', -- Aguardando pagamento
        'processando', -- Pagamento em processamento
        'aprovado', -- Pagamento aprovado
        'liberado_artista', -- Valor liberado para o artista
        'cancelado',
        'reembolsado',
        'em_disputa'
    )),
    
    -- Integração ASAAS
    asaas_payment_id VARCHAR(100) UNIQUE,
    asaas_invoice_url TEXT,
    asaas_pix_qrcode TEXT,
    asaas_pix_payload TEXT,
    
    pago_em TIMESTAMP,
    liberado_em TIMESTAMP,
    reembolsado_em TIMESTAMP,
    motivo_reembolso TEXT,
    
    criado_em TIMESTAMP DEFAULT NOW(),
    atualizado_em TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_pagamentos_booking ON pagamentos(booking_id);
CREATE INDEX idx_pagamentos_status ON pagamentos(status);
```

#### 6.2.11 adiantamentos
```sql
CREATE TABLE adiantamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
    profissional_id UUID REFERENCES profissionais(id),
    
    valor_adiantamento DECIMAL(10,2) NOT NULL,
    percentual_adiantamento DECIMAL(5,2) NOT NULL, -- 30, 40 ou 50
    valor_restante DECIMAL(10,2) NOT NULL,
    
    motivo TEXT, -- Justificativa do artista
    
    status VARCHAR(30) DEFAULT 'solicitado' CHECK (status IN (
        'solicitado', -- Artista solicitou
        'analise', -- Em análise anti-fraude (24h)
        'aprovado', -- Aprovado, aguardando liberação
        'liberado', -- Dinheiro liberado para artista
        'devolvido', -- Artista cancelou e devolveu
        'retido' -- Não compareceu, valor retido
    )),
    
    solicitado_em TIMESTAMP DEFAULT NOW(),
    aprovado_em TIMESTAMP,
    liberado_em TIMESTAMP,
    
    -- Score de risco no momento da solicitação
    score_confiabilidade INTEGER,
    
    criado_em TIMESTAMP DEFAULT NOW(),
    atualizado_em TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_adiantamentos_booking ON adiantamentos(booking_id);
CREATE INDEX idx_adiantamentos_profissional ON adiantamentos(profissional_id);
CREATE INDEX idx_adiantamentos_status ON adiantamentos(status);
```

#### 6.2.12 avaliacoes
```sql
CREATE TABLE avaliacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    avaliador_id UUID REFERENCES usuarios(id),
    avaliado_id UUID REFERENCES usuarios(id),
    
    nota_geral INTEGER CHECK (nota_geral BETWEEN 1 AND 5),
    
    -- Critérios específicos (1-5 cada)
    nota_comunicacao INTEGER CHECK (nota_comunicacao BETWEEN 1 AND 5),
    nota_pontualidade INTEGER CHECK (nota_pontualidade BETWEEN 1 AND 5),
    nota_profissionalismo INTEGER CHECK (nota_profissionalismo BETWEEN 1 AND 5),
    nota_qualidade INTEGER CHECK (nota_qualidade BETWEEN 1 AND 5), -- Para artistas
    nota_pagamento INTEGER CHECK (nota_pagamento BETWEEN 1 AND 5), -- Para contratantes
    nota_organizacao INTEGER CHECK (nota_organizacao BETWEEN 1 AND 5), -- Para contratantes
    
    comentario TEXT,
    recomendaria BOOLEAN,
    
    visivel BOOLEAN DEFAULT FALSE, -- Fica invisível até ambos avaliarem ou 7 dias
    
    criado_em TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_avaliacoes_booking ON avaliacoes(booking_id);
CREATE INDEX idx_avaliacoes_avaliado ON avaliacoes(avaliado_id);
CREATE UNIQUE INDEX idx_avaliacoes_unico ON avaliacoes(booking_id, avaliador_id);
```

#### 6.2.13 disputas
```sql
CREATE TABLE disputas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    solicitante_id UUID REFERENCES usuarios(id),
    
    motivo VARCHAR(50) CHECK (motivo IN (
        'nao_comparecimento_artista',
        'nao_comparecimento_contratante',
        'servico_diferente',
        'equipamento_problema',
        'comportamento_inadequado',
        'pagamento_nao_recebido',
        'outro'
    )),
    
    descricao TEXT NOT NULL,
    evidencias_urls TEXT[], -- Array de URLs (fotos, vídeos, prints)
    solucao_desejada TEXT,
    
    status VARCHAR(30) DEFAULT 'aberta' CHECK (status IN (
        'aberta', -- Aguardando resposta da outra parte
        'em_analise', -- Admin analisando
        'resolvida', -- Disputa resolvida
        'rejeitada' -- Disputa improcedente
    )),
    
    resposta_outra_parte TEXT,
    resposta_evidencias_urls TEXT[],
    
    decisao_admin TEXT,
    decisao_tipo VARCHAR(30) CHECK (decisao_tipo IN (
        'reembolso_total',
        'reembolso_parcial',
        'pagamento_artista',
        'acordo_partes',
        'banimento',
        'improcedente'
    )),
    
    valor_reembolso DECIMAL(10,2),
    
    aberta_em TIMESTAMP DEFAULT NOW(),
    respondida_em TIMESTAMP,
    resolvida_em TIMESTAMP,
    admin_responsavel_id UUID REFERENCES usuarios(id)
);

CREATE INDEX idx_disputas_booking ON disputas(booking_id);
CREATE INDEX idx_disputas_status ON disputas(status);
```

#### 6.2.14 notificacoes
```sql
CREATE TABLE notificacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    
    tipo VARCHAR(50) CHECK (tipo IN (
        'nova_proposta',
        'proposta_aceita',
        'proposta_recusada',
        'contra_proposta',
        'proposta_expirando',
        'nova_mensagem',
        'pagamento_recebido',
        'pagamento_confirmado',
        'evento_amanha',
        'evento_hoje',
        'avaliar_usuario',
        'nova_avaliacao',
        'adiantamento_liberado',
        'saque_processado',
        'artista_seguido_disponivel',
        'novo_seguidor',
        'cupom_disponivel',
        'indicacao_concluida',
        'outro'
    )),
    
    titulo VARCHAR(100) NOT NULL,
    mensagem TEXT NOT NULL,
    
    -- Dados relacionados
    booking_id UUID REFERENCES bookings(id),
    outro_usuario_id UUID REFERENCES usuarios(id), -- O outro usuário envolvido
    
    lida BOOLEAN DEFAULT FALSE,
    lida_em TIMESTAMP,
    
    -- Push notification
    enviada_push BOOLEAN DEFAULT FALSE,
    enviada_push_em TIMESTAMP,
    
    criado_em TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notificacoes_usuario ON notificacoes(usuario_id);
CREATE INDEX idx_notificacoes_lida ON notificacoes(lida);
CREATE INDEX idx_notificacoes_tipo ON notificacoes(tipo);
```

#### 6.2.15 seguindo
```sql
CREATE TABLE seguindo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seguidor_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    profissional_id UUID REFERENCES profissionais(id) ON DELETE CASCADE,
    
    notificacoes_ativas BOOLEAN DEFAULT TRUE,
    
    criado_em TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(seguidor_id, profissional_id)
);

CREATE INDEX idx_seguindo_seguidor ON seguindo(seguidor_id);
CREATE INDEX idx_seguindo_profissional ON seguindo(profissional_id);
```

#### 6.2.16 historico_buscas
```sql
CREATE TABLE historico_buscas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    
    -- Filtros da busca
    categoria_id UUID REFERENCES categorias(id),
    subcategoria_ids UUID[],
    cidade VARCHAR(100),
    estado VARCHAR(2),
    preco_minimo DECIMAL(10,2),
    preco_maximo DECIMAL(10,2),
    avaliacao_minima DECIMAL(3,2),
    plano VARCHAR(20),
    data_evento DATE,
    
    -- Metadados
    total_resultados INTEGER,
    perfis_clicados UUID[], -- Array de IDs dos profissionais clicados
    propostas_enviadas UUID[], -- Array de IDs dos bookings criados a partir desta busca
    
    criado_em TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_historico_usuario ON historico_buscas(usuario_id);
CREATE INDEX idx_historico_criado ON historico_buscas(criado_em);
```

#### 6.2.17 buscas_salvas
```sql
CREATE TABLE buscas_salvas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    
    nome VARCHAR(100) NOT NULL, -- Nome dado pelo usuário
    
    -- Filtros salvos (mesmos da busca)
    categoria_id UUID REFERENCES categorias(id),
    subcategoria_ids UUID[],
    cidade VARCHAR(100),
    estado VARCHAR(2),
    preco_minimo DECIMAL(10,2),
    preco_maximo DECIMAL(10,2),
    avaliacao_minima DECIMAL(3,2),
    plano VARCHAR(20),
    
    alertas_ativos BOOLEAN DEFAULT FALSE, -- Notificar sobre novos matches
    
    criado_em TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT max_buscas_salvas CHECK (
        (SELECT COUNT(*) FROM buscas_salvas WHERE usuario_id = buscas_salvas.usuario_id) <= 10
    )
);

CREATE INDEX idx_buscas_salvas_usuario ON buscas_salvas(usuario_id);
```

#### 6.2.18 cupons
```sql
CREATE TABLE cupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    codigo VARCHAR(50) UNIQUE NOT NULL,
    
    tipo VARCHAR(30) CHECK (tipo IN (
        'desconto_taxa_percentual', -- % off na taxa da plataforma
        'desconto_taxa_fixo', -- R$ off na taxa
        'cashback', -- Devolve R$ após conclusão
        'taxa_zero', -- Remove a taxa completamente
        'primeiro_booking' -- Específico para primeiro booking
    )),
    
    valor DECIMAL(10,2) NOT NULL, -- Valor do desconto (% ou R$)
    
    -- Restrições
    uso_tipo VARCHAR(30) CHECK (uso_tipo IN ('unico', 'multiplo', 'ilimitado')),
    usos_maximos INTEGER,
    usos_atuais INTEGER DEFAULT 0,
    uso_por_usuario INTEGER DEFAULT 1, -- Quantas vezes cada usuário pode usar
    
    valor_minimo_compra DECIMAL(10,2), -- Valor mínimo do booking
    apenas_novos_usuarios BOOLEAN DEFAULT FALSE,
    categorias_permitidas UUID[], -- NULL = todas
    
    valido_de DATE NOT NULL,
    valido_ate DATE NOT NULL,
    
    ativo BOOLEAN DEFAULT TRUE,
    
    -- Tracking
    criado_por_usuario_id UUID REFERENCES usuarios(id), -- Se foi criado por artista PRO
    criado_por_admin BOOLEAN DEFAULT TRUE,
    
    criado_em TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_cupons_codigo ON cupons(codigo);
CREATE INDEX idx_cupons_ativo ON cupons(ativo);
```

#### 6.2.19 cupons_utilizados
```sql
CREATE TABLE cupons_utilizados (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cupom_id UUID REFERENCES cupons(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id),
    
    desconto_aplicado DECIMAL(10,2) NOT NULL,
    
    utilizado_em TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(cupom_id, usuario_id, booking_id)
);

CREATE INDEX idx_cupons_utilizados_cupom ON cupons_utilizados(cupom_id);
CREATE INDEX idx_cupons_utilizados_usuario ON cupons_utilizados(usuario_id);
```

#### 6.2.20 indicacoes
```sql
CREATE TABLE indicacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    indicador_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    indicado_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    
    codigo_indicacao VARCHAR(50) NOT NULL, -- Ex: MARIA2024
    
    status VARCHAR(30) DEFAULT 'pendente' CHECK (status IN (
        'pendente', -- Indicado se cadastrou, mas não fez booking
        'concluido', -- Indicado fez primeiro booking
        'expirado' -- 90 dias sem atividade
    )),
    
    -- Recompensas
    recompensa_indicador DECIMAL(10,2) DEFAULT 25.00,
    recompensa_paga BOOLEAN DEFAULT FALSE,
    recompensa_paga_em TIMESTAMP,
    
    desconto_indicado_percentual DECIMAL(5,2) DEFAULT 15.00,
    
    primeiro_booking_id UUID REFERENCES bookings(id), -- Primeiro booking do indicado
    
    expira_em TIMESTAMP, -- 90 dias após cadastro
    
    criado_em TIMESTAMP DEFAULT NOW(),
    concluido_em TIMESTAMP
);

CREATE INDEX idx_indicacoes_indicador ON indicacoes(indicador_id);
CREATE INDEX idx_indicacoes_indicado ON indicacoes(indicado_id);
CREATE INDEX idx_indicacoes_status ON indicacoes(status);
CREATE UNIQUE INDEX idx_indicacoes_codigo ON indicacoes(codigo_indicacao);
```

#### 6.2.21 creditos
```sql
CREATE TABLE creditos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    
    tipo VARCHAR(30) CHECK (tipo IN (
        'indicacao', -- Ganhou por indicar alguém
        'cashback', -- Cashback de cupom
        'bonus', -- Bônus da plataforma
        'reembolso' -- Reembolso de booking cancelado
    )),
    
    valor DECIMAL(10,2) NOT NULL,
    
    saldo_anterior DECIMAL(10,2) NOT NULL,
    saldo_novo DECIMAL(10,2) NOT NULL,
    
    descricao TEXT,
    
    relacionado_a_id UUID, -- ID da indicação, booking, etc.
    
    expira_em TIMESTAMP, -- Créditos expiram em 1 ano
    usado BOOLEAN DEFAULT FALSE,
    usado_em TIMESTAMP,
    
    criado_em TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_creditos_usuario ON creditos(usuario_id);
CREATE INDEX idx_creditos_usado ON creditos(usado);
```

#### 6.2.22 saques
```sql
CREATE TABLE saques (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profissional_id UUID REFERENCES profissionais(id) ON DELETE CASCADE,
    
    valor_solicitado DECIMAL(10,2) NOT NULL,
    taxa_saque DECIMAL(10,2) DEFAULT 3.00, -- Taxa fixa R$3
    valor_liquido DECIMAL(10,2) NOT NULL, -- valor_solicitado - taxa_saque
    
    -- Dados bancários
    banco VARCHAR(100) NOT NULL,
    agencia VARCHAR(10) NOT NULL,
    conta VARCHAR(20) NOT NULL,
    tipo_conta VARCHAR(20) CHECK (tipo_conta IN ('corrente', 'poupanca')),
    cpf_cnpj_titular VARCHAR(18) NOT NULL,
    
    status VARCHAR(30) DEFAULT 'solicitado' CHECK (status IN (
        'solicitado',
        'processando',
        'concluido',
        'falhou',
        'cancelado'
    )),
    
    -- Integração ASAAS
    asaas_transfer_id VARCHAR(100),
    
    solicitado_em TIMESTAMP DEFAULT NOW(),
    processado_em TIMESTAMP,
    concluido_em TIMESTAMP,
    
    motivo_falha TEXT
);

CREATE INDEX idx_saques_profissional ON saques(profissional_id);
CREATE INDEX idx_saques_status ON saques(status);
```

#### 6.2.23 infrações
```sql
CREATE TABLE infracoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    
    tipo VARCHAR(50) CHECK (tipo IN (
        'contato_externo',
        'linguagem_ofensiva',
        'spam',
        'cancelamento_sem_justificativa',
        'nao_comparecimento',
        'perfil_falso',
        'fraude',
        'assedio',
        'discriminacao',
        'outro'
    )),
    
    gravidade VARCHAR(20) CHECK (gravidade IN ('leve', 'media', 'grave')),
    
    descricao TEXT NOT NULL,
    evidencias_urls TEXT[],
    
    acao_tomada VARCHAR(30) CHECK (acao_tomada IN (
        'advertencia',
        'suspensao_7d',
        'suspensao_15d',
        'suspensao_30d',
        'banimento'
    )),
    
    relacionado_a_booking_id UUID REFERENCES bookings(id),
    relacionado_a_mensagem_id UUID REFERENCES mensagens(id),
    
    admin_responsavel_id UUID REFERENCES usuarios(id),
    
    criado_em TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_infracoes_usuario ON infracoes(usuario_id);
CREATE INDEX idx_infracoes_tipo ON infracoes(tipo);
```

#### 6.2.24 configuracoes_sistema
```sql
CREATE TABLE configuracoes_sistema (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT NOT NULL,
    tipo VARCHAR(20) CHECK (tipo IN ('string', 'number', 'boolean', 'json')),
    descricao TEXT,
    atualizado_em TIMESTAMP DEFAULT NOW(),
    atualizado_por_id UUID REFERENCES usuarios(id)
);

-- Configurações iniciais
INSERT INTO configuracoes_sistema (chave, valor, tipo, descricao) VALUES
('taxa_free', '15', 'number', 'Taxa para usuários FREE (%)'),
('taxa_plus', '10', 'number', 'Taxa para usuários PLUS (%)'),
('taxa_pro', '7', 'number', 'Taxa para usuários PRO (%)'),
('preco_plus', '49', 'number', 'Preço assinatura PLUS (R$)'),
('preco_pro', '99', 'number', 'Preço assinatura PRO (R$)'),
('valor_minimo_booking', '200', 'number', 'Valor mínimo de booking (R$)'),
('valor_minimo_saque', '100', 'number', 'Valor mínimo para saque (R$)'),
('taxa_saque', '3', 'number', 'Taxa fixa por saque (R$)'),
('prazo_resposta_proposta', '48', 'number', 'Prazo para artista responder proposta (horas)'),
('prazo_resposta_contraproposta', '24', 'number', 'Prazo para contratante responder contra-proposta (horas)'),
('periodo_disputa', '48', 'number', 'Período de disputa após evento (horas)'),
('max_propostas_ativas_contratante', '5', 'number', 'Máximo de propostas ativas para contratante'),
('max_propostas_pendentes_artista', '20', 'number', 'Máximo de propostas pendentes para artista'),
('recompensa_indicacao', '25', 'number', 'Valor de recompensa por indicação (R$)'),
('desconto_indicado', '15', 'number', 'Desconto para indicado (%)'),
('expiracao_indicacao', '90', 'number', 'Dias para expirar indicação'),
('expiracao_creditos', '365', 'number', 'Dias para expirar créditos');
```

---

## 7. API ENDPOINTS

### 7.1 Autenticação

**Base URL:** `/api/v1`

#### POST /auth/register
Cadastro de novo usuário
```json
Request:
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "senha": "senha123",
  "telefone": "11999999999",
  "tipo": "contratante", // ou "artista"
  "codigo_indicacao": "MARIA2024" // opcional
}

Response 201:
{
  "success": true,
  "data": {
    "usuario": {
      "id": "uuid",
      "nome": "João Silva",
      "email": "joao@email.com",
      "tipo": "contratante"
    },
    "token": "jwt_token_aqui"
  }
}
```

#### POST /auth/login
Login
```json
Request:
{
  "email": "joao@email.com",
  "senha": "senha123"
}

Response 200:
{
  "success": true,
  "data": {
    "usuario": {
      "id": "uuid",
      "nome": "João Silva",
      "tipo": "contratante",
      "foto_perfil_url": "https://..."
    },
    "token": "jwt_token_aqui"
  }
}
```

#### POST /auth/refresh
Renovar token
```json
Request:
{
  "refresh_token": "refresh_token_aqui"
}

Response 200:
{
  "success": true,
  "data": {
    "token": "novo_jwt_token"
  }
}
```

#### POST /auth/forgot-password
Esqueci minha senha
```json
Request:
{
  "email": "joao@email.com"
}

Response 200:
{
  "success": true,
  "message": "Email de recuperação enviado"
}
```

---

### 7.2 Usuários

#### GET /users/me
Buscar perfil do usuário logado
```json
Response 200:
{
  "success": true,
  "data": {
    "id": "uuid",
    "nome": "João Silva",
    "email": "joao@email.com",
    "tipo": "artista",
    "profissional": {
      "nome_artistico": "DJ João",
      "plano": "plus",
      "avaliacao_media": 4.8,
      "total_bookings": 47
    }
  }
}
```

#### PUT /users/me
Atualizar perfil
```json
Request:
{
  "nome": "João Silva Santos",
  "telefone": "11988888888"
}

Response 200:
{
  "success": true,
  "data": {
    "id": "uuid",
    "nome": "João Silva Santos",
    "telefone": "11988888888"
  }
}
```

#### POST /users/me/avatar
Upload de foto de perfil
```
Content-Type: multipart/form-data
foto: [arquivo]

Response 200:
{
  "success": true,
  "data": {
    "foto_perfil_url": "https://cloudinary.com/..."
  }
}
```

#### PUT /users/me/documento
Upload de documento (para verificação)
```
Content-Type: multipart/form-data
documento_frente: [arquivo]
documento_verso: [arquivo]
selfie_com_documento: [arquivo]

Response 200:
{
  "success": true,
  "message": "Documento enviado para análise"
}
```

---

### 7.3 Profissionais (Artistas)

#### GET /profissionais
Buscar artistas (pública - sem autenticação)
```
Query params:
- categoria: uuid
- subcategorias: uuid[] (comma separated)
- cidade: string
- estado: string (2 chars)
- preco_min: number
- preco_max: number
- avaliacao_min: number (1-5)
- plano: free|plus|pro
- verificado: boolean
- data_evento: date (YYYY-MM-DD)
- ordenar: relevancia|preco_asc|preco_desc|avaliacao|bookings|recente
- pagina: number (default: 1)
- limite: number (default: 20, max: 50)

Response 200:
{
  "success": true,
  "data": {
    "profissionais": [
      {
        "id": "uuid",
        "nome_artistico": "DJ João",
        "categoria": "DJ",
        "subcategorias": ["Techno", "House"],
        "cidades_atuacao": ["São Paulo", "Campinas"],
        "valor_base_minimo": 800,
        "valor_base_maximo": 1500,
        "avaliacao_media": 4.8,
        "total_bookings": 47,
        "total_seguidores": 234,
        "plano": "plus",
        "verificado": true,
        "foto_perfil_url": "https://...",
        "badges": ["plus", "verificado", "popular"]
      }
    ],
    "paginacao": {
      "total": 150,
      "pagina_atual": 1,
      "total_paginas": 8,
      "limite": 20
    }
  }
}
```

#### GET /profissionais/:id
Ver perfil completo de artista
```json
Response 200:
{
  "success": true,
  "data": {
    "id": "uuid",
    "usuario_id": "uuid",
    "nome_artistico": "DJ João",
    "categoria": "DJ",
    "subcategorias": ["Techno", "House"],
    "bio": "DJ com 10 anos de experiência...",
    "video_apresentacao_url": "https://...",
    "valor_base_minimo": 800,
    "valor_base_maximo": 1500,
    "cidades_atuacao": ["São Paulo", "Campinas"],
    "plano": "plus",
    "verificado": true,
    "avaliacao_media": 4.8,
    "total_avaliacoes": 45,
    "total_bookings": 47,
    "total_seguidores": 234,
    "foto_perfil_url": "https://...",
    "portfolio": [
      {
        "id": "uuid",
        "tipo": "foto",
        "url": "https://...",
        "ordem": 1
      }
    ],
    "redes_sociais": [
      {
        "plataforma": "instagram",
        "url": "https://instagram.com/djjoao"
      }
    ],
    "avaliacoes_recentes": [
      {
        "id": "uuid",
        "avaliador_nome": "Maria S.",
        "nota_geral": 5,
        "comentario": "Excelente DJ!",
        "criado_em": "2025-01-15T20:00:00Z"
      }
    ],
    "estatisticas": {
      "taxa_aceitacao": 85,
      "tempo_medio_resposta_horas": 3,
      "ultima_atividade": "2025-01-20T10:00:00Z"
    }
  }
}
```

#### POST /profissionais (autenticado como artista)
Criar perfil de artista (após cadastro como usuário)
```json
Request:
{
  "nome_artistico": "DJ João",
  "categoria_id": "uuid",
  "subcategoria_ids": ["uuid1", "uuid2"],
  "bio": "DJ com 10 anos de experiência...",
  "valor_base_hora": 300,
  "cidades_atuacao": ["São Paulo", "Campinas"]
}

Response 201:
{
  "success": true,
  "data": {
    "id": "uuid",
    "nome_artistico": "DJ João",
    "perfil_completo_percentual": 60
  }
}
```

#### PUT /profissionais/me
Atualizar perfil de artista
```json
Request:
{
  "bio": "Nova bio...",
  "valor_base_hora": 350,
  "cidades_atuacao": ["São Paulo", "Campinas", "Santos"]
}

Response 200:
{
  "success": true,
  "data": {
    "id": "uuid",
    "perfil_completo_percentual": 85
  }
}
```

#### POST /profissionais/me/portfolio
Upload de foto/vídeo para portfolio
```
Content-Type: multipart/form-data
tipo: foto|video
arquivo: [file]
ordem: number

Response 201:
{
  "success": true,
  "data": {
    "id": "uuid",
    "tipo": "foto",
    "url": "https://...",
    "ordem": 1
  }
}
```

#### DELETE /profissionais/me/portfolio/:id
Remover item do portfolio
```json
Response 200:
{
  "success": true,
  "message": "Item removido"
}
```

#### POST /profissionais/me/redes-sociais
Adicionar rede social
```json
Request:
{
  "plataforma": "instagram",
  "url": "https://instagram.com/djjoao"
}

Response 201:
{
  "success": true,
  "data": {
    "id": "uuid",
    "plataforma": "instagram",
    "url": "https://instagram.com/djjoao"
  }
}
```

#### GET /profissionais/me/dashboard
Dashboard do artista (analytics)
```json
Response 200:
{
  "success": true,
  "data": {
    "ganhos_este_mes": 4500,
    "total_propostas": 23,
    "taxa_aceitacao": 85,
    "avaliacao_media": 4.8,
    "visualizacoes_perfil": 456,
    "crescimento_mes_anterior": 15,
    "propostas": {
      "pendentes": 3,
      "em_negociacao": 2,
      "confirmadas": 5,
      "concluidas": 47,
      "recusadas": 12
    },
    "performance": {
      "tempo_medio_resposta_horas": 3,
      "taxa_conversao": 65,
      "bookings_este_mes": 8,
      "proximo_evento": {
        "data": "2025-02-01",
        "local": "Clube XYZ"
      }
    },
    "financeiro": {
      "saldo_disponivel": 850,
      "aguardando_liberacao": 2100,
      "total_recebido": 45000
    }
  }
}
```

---

### 7.4 Categorias

#### GET /categorias
Listar todas categorias
```json
Response 200:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "nome": "DJ",
      "slug": "dj",
      "icone": "🎧",
      "subcategorias": [
        {
          "id": "uuid",
          "nome": "Techno",
          "slug": "techno"
        }
      ]
    }
  ]
}
```

---

### 7.5 Bookings

#### POST /bookings
Criar proposta de booking (contratante)
```json
Request:
{
  "profissional_id": "uuid",
  "data_evento": "2025-03-15",
  "horario_inicio": "22:00",
  "horario_fim": "04:00",
  "local_endereco": "Rua XYZ, 123",
  "local_cidade": "São Paulo",
  "local_estado": "SP",
  "tipo_evento": "Festa Privada",
  "descricao": "Aniversário de 30 anos...",
  "orcamento_cliente": 1200,
  "cupom_codigo": "BEMVINDO20" // opcional
}

Response 201:
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "pendente",
    "valor_sugerido": 1200,
    "taxa_plataforma": 120,
    "valor_total": 1320,
    "desconto_cupom": 24,
    "valor_total_com_desconto": 1296,
    "expira_em": "2025-01-22T20:00:00Z"
  }
}
```

# KXRTEX - DOCUMENTAÇÃO TÉCNICA (Parte 2)

## 7. API ENDPOINTS (Continuação)

### 7.5 Bookings (Continuação)

#### GET /bookings
Listar bookings do usuário
```
Query params:
- status: pendente|em_negociacao|confirmado|concluido|cancelado
- tipo: enviados|recebidos (para artistas)
- pagina: number
- limite: number

Response 200:
{
  "success": true,
  "data": {
    "bookings": [
      {
        "id": "uuid",
        "status": "confirmado",
        "data_evento": "2025-03-15",
        "horario_inicio": "22:00",
        "local_cidade": "São Paulo",
        "valor_final": 1200,
        "contratante": {
          "id": "uuid",
          "nome": "Maria Silva",
          "foto_perfil_url": "https://..."
        },
        "profissional": {
          "id": "uuid",
          "nome_artistico": "DJ João",
          "foto_perfil_url": "https://..."
        },
        "mensagens_nao_lidas": 2,
        "expira_em": null,
        "criado_em": "2025-01-20T10:00:00Z"
      }
    ],
    "paginacao": {
      "total": 47,
      "pagina_atual": 1,
      "total_paginas": 3,
      "limite": 20
    }
  }
}
```

#### GET /bookings/:id
Ver detalhes de um booking
```json
Response 200:
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "confirmado",
    "data_evento": "2025-03-15",
    "horario_inicio": "22:00",
    "horario_fim": "04:00",
    "duracao_horas": 6,
    "local_endereco": "Rua XYZ, 123",
    "local_cidade": "São Paulo",
    "local_estado": "SP",
    "tipo_evento": "Festa Privada",
    "descricao": "Aniversário de 30 anos...",
    "orcamento_cliente": 1200,
    "valor_proposto_artista": null,
    "valor_final": 1200,
    "taxa_plataforma_percentual": 10,
    "taxa_plataforma_valor": 120,
    "valor_total": 1320,
    "contratante": {
      "id": "uuid",
      "nome": "Maria Silva",
      "telefone": "11999999999",
      "foto_perfil_url": "https://...",
      "avaliacao_media": 4.9
    },
    "profissional": {
      "id": "uuid",
      "usuario_id": "uuid",
      "nome_artistico": "DJ João",
      "foto_perfil_url": "https://...",
      "telefone": "11988888888"
    },
    "pagamento": {
      "id": "uuid",
      "status": "aprovado",
      "metodo_pagamento": "pix",
      "pago_em": "2025-01-21T15:30:00Z"
    },
    "adiantamento": {
      "id": "uuid",
      "valor_adiantamento": 480,
      "percentual_adiantamento": 40,
      "status": "liberado",
      "liberado_em": "2025-01-22T10:00:00Z"
    },
    "contrato_url": "https://storage.../contrato_uuid.pdf",
    "expira_em": null,
    "confirmado_em": "2025-01-21T15:30:00Z",
    "criado_em": "2025-01-20T10:00:00Z"
  }
}
```

#### PUT /bookings/:id/aceitar (artista)
Aceitar proposta
```json
Request:
{
  "solicitar_adiantamento": true, // opcional
  "percentual_adiantamento": 40, // 30, 40 ou 50
  "motivo_adiantamento": "Evento em outra cidade, preciso cobrir transporte"
}

Response 200:
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "aceito",
    "adiantamento": {
      "valor_adiantamento": 480,
      "valor_restante": 720,
      "status": "solicitado"
    }
  }
}
```

#### PUT /bookings/:id/contra-propor (artista)
Enviar contra-proposta
```json
Request:
{
  "valor_proposto_artista": 1500,
  "mensagem": "Posso fazer por R$1.500, inclui equipamento adicional"
}

Response 200:
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "em_negociacao",
    "valor_proposto_artista": 1500,
    "expira_em": "2025-01-22T10:00:00Z"
  }
}
```

#### PUT /bookings/:id/recusar (artista)
Recusar proposta
```json
Request:
{
  "motivo": "data_indisponivel", // data_indisponivel|tipo_evento|valor_baixo|distancia|ferias|outro
  "mensagem": "Infelizmente já tenho compromisso nesta data",
  "sugerir_outra_data": "2025-03-22" // opcional
}

Response 200:
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "cancelado_artista"
  }
}
```

#### PUT /bookings/:id/aceitar-contraproposta (contratante)
Aceitar contra-proposta do artista
```json
Response 200:
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "aceito",
    "valor_final": 1500,
    "taxa_plataforma_valor": 150,
    "valor_total": 1650
  }
}
```

#### PUT /bookings/:id/cancelar
Cancelar booking (ambos podem cancelar)
```json
Request:
{
  "motivo": "Preciso cancelar por motivos pessoais",
  "motivo_categoria": "pessoal" // pessoal|clima|saude|outro
}

Response 200:
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "cancelado_contratante",
    "reembolso": {
      "valor_reembolso": 990, // 75% (exemplo: 15-29 dias antes)
      "valor_artista": 330, // 25% de compensação
      "processado_em": "2025-01-23T10:00:00Z"
    }
  }
}
```

#### PUT /bookings/:id/checkin (ambos)
Fazer check-in no dia do evento
```json
Request:
{
  "latitude": -23.550520,
  "longitude": -46.633308
}

Response 200:
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "em_andamento",
    "checkin_artista_em": "2025-03-15T22:05:00Z",
    "checkin_contratante_em": "2025-03-15T22:00:00Z"
  }
}
```

#### PUT /bookings/:id/concluir (contratante)
Marcar evento como concluído
```json
Response 200:
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "concluido",
    "concluido_em": "2025-03-16T04:30:00Z",
    "liberacao_pagamento_em": "2025-03-18T04:30:00Z" // +48h
  }
}
```

---

### 7.6 Mensagens (Chat)

#### GET /bookings/:booking_id/mensagens
Listar mensagens de um booking
```
Query params:
- limite: number (default: 50)
- antes_de: timestamp (para paginação)

Response 200:
{
  "success": true,
  "data": {
    "mensagens": [
      {
        "id": "uuid",
        "remetente_id": "uuid",
        "remetente_nome": "Maria Silva",
        "remetente_foto": "https://...",
        "mensagem": "Olá, tudo bem?",
        "tipo": "texto",
        "url_anexo": null,
        "lida": true,
        "lida_em": "2025-01-20T10:05:00Z",
        "bloqueada": false,
        "enviada_em": "2025-01-20T10:00:00Z"
      },
      {
        "id": "uuid",
        "remetente_id": "uuid2",
        "remetente_nome": "DJ João",
        "remetente_foto": "https://...",
        "mensagem": "Oi! Tudo sim, e você?",
        "tipo": "texto",
        "lida": false,
        "enviada_em": "2025-01-20T10:02:00Z"
      }
    ],
    "tem_mais": false
  }
}
```

#### POST /bookings/:booking_id/mensagens
Enviar mensagem
```json
Request:
{
  "mensagem": "Perfeito! Vamos confirmar os detalhes",
  "tipo": "texto" // texto|imagem|documento
}

Response 201:
{
  "success": true,
  "data": {
    "id": "uuid",
    "mensagem": "Perfeito! Vamos confirmar os detalhes",
    "enviada_em": "2025-01-20T10:10:00Z",
    "bloqueada": false
  }
}

// Se mensagem bloqueada por conter contato:
Response 400:
{
  "success": false,
  "error": {
    "code": "MENSAGEM_BLOQUEADA",
    "message": "Detectamos tentativa de compartilhar contato externo. Por favor, mantenha todas negociações dentro da plataforma.",
    "detalhes": "Compartilhar contatos externos viola nossos termos de uso e pode resultar em suspensão."
  }
}
```

#### POST /bookings/:booking_id/mensagens/upload
Upload de imagem/documento no chat
```
Content-Type: multipart/form-data
tipo: imagem|documento
arquivo: [file]

Response 201:
{
  "success": true,
  "data": {
    "id": "uuid",
    "tipo": "imagem",
    "url_anexo": "https://storage.../arquivo.jpg",
    "enviada_em": "2025-01-20T10:15:00Z"
  }
}
```

#### PUT /mensagens/:id/marcar-lida
Marcar mensagem como lida
```json
Response 200:
{
  "success": true,
  "data": {
    "id": "uuid",
    "lida": true,
    "lida_em": "2025-01-20T10:20:00Z"
  }
}
```

#### PUT /mensagens/marcar-todas-lidas/:booking_id
Marcar todas mensagens de um booking como lidas
```json
Response 200:
{
  "success": true,
  "message": "5 mensagens marcadas como lidas"
}
```

---

### 7.7 Pagamentos

#### POST /pagamentos/:booking_id/criar
Criar pagamento (após aceite da proposta)
```json
Request:
{
  "metodo_pagamento": "pix", // pix|cartao_credito
  "parcelas": 1 // apenas para cartão, máx 3x
}

Response 201:
{
  "success": true,
  "data": {
    "id": "uuid",
    "valor_total": 1320,
    "status": "pendente",
    "metodo_pagamento": "pix",
    "asaas_payment_id": "pay_xxxxx",
    
    // Se PIX:
    "pix": {
      "qrcode": "00020126....",
      "qrcode_image_url": "https://asaas.com/qrcode/xxxxx.png",
      "payload": "00020126...",
      "expira_em": "2025-01-20T11:00:00Z"
    },
    
    // Se Cartão:
    "cartao": {
      "invoice_url": "https://asaas.com/invoice/xxxxx"
    }
  }
}
```

#### GET /pagamentos/:booking_id
Ver status do pagamento
```json
Response 200:
{
  "success": true,
  "data": {
    "id": "uuid",
    "booking_id": "uuid",
    "valor_total": 1320,
    "valor_artista": 1200,
    "taxa_plataforma": 120,
    "status": "aprovado",
    "metodo_pagamento": "pix",
    "pago_em": "2025-01-20T10:30:00Z",
    "liberado_em": null // Será liberado após evento + 48h
  }
}
```

#### POST /pagamentos/webhook
Webhook ASAAS (chamado pelo ASAAS, não pelo cliente)
```json
Request (exemplo):
{
  "event": "PAYMENT_RECEIVED",
  "payment": {
    "id": "pay_xxxxx",
    "status": "RECEIVED",
    "value": 1320,
    "netValue": 1320,
    "description": "Booking #xxxxx"
  }
}

Response 200:
{
  "success": true
}
```

---

### 7.8 Adiantamentos

#### GET /adiantamentos/:booking_id
Ver detalhes do adiantamento
```json
Response 200:
{
  "success": true,
  "data": {
    "id": "uuid",
    "booking_id": "uuid",
    "valor_adiantamento": 480,
    "percentual_adiantamento": 40,
    "valor_restante": 720,
    "motivo": "Evento em outra cidade",
    "status": "liberado",
    "solicitado_em": "2025-01-20T10:00:00Z",
    "aprovado_em": "2025-01-21T16:00:00Z",
    "liberado_em": "2025-01-21T16:00:00Z",
    "score_confiabilidade": 75
  }
}
```

#### POST /adiantamentos/:booking_id/solicitar (artista)
Solicitar adiantamento (se não foi solicitado no aceite)
```json
Request:
{
  "percentual_adiantamento": 30,
  "motivo": "Preciso alugar equipamento adicional"
}

Response 201:
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "analise",
    "valor_adiantamento": 360,
    "aprovacao_estimada_em": "2025-01-21T16:00:00Z" // +24h
  }
}

// Se não elegível:
Response 400:
{
  "success": false,
  "error": {
    "code": "NAO_ELEGIVEL_ADIANTAMENTO",
    "message": "Você ainda não é elegível para solicitar adiantamento",
    "detalhes": "Requisitos: valor ≥ R$500, evento em outra cidade, mínimo 3 bookings concluídos",
    "seu_status": {
      "valor_booking": 400,
      "mesma_cidade": true,
      "total_bookings": 2
    }
  }
}
```

---

### 7.9 Avaliações

#### POST /avaliacoes/:booking_id
Criar avaliação após evento concluído
```json
Request:
{
  "nota_geral": 5,
  "nota_comunicacao": 5,
  "nota_pontualidade": 5,
  "nota_profissionalismo": 5,
  "nota_qualidade": 5, // apenas se avaliar artista
  "comentario": "Excelente profissional! Recomendo muito",
  "recomendaria": true
}

Response 201:
{
  "success": true,
  "data": {
    "id": "uuid",
    "nota_geral": 5,
    "visivel": false, // Ficará invisível até a outra parte avaliar ou 7 dias
    "sera_visivel_em": "2025-03-23T04:30:00Z"
  }
}
```

#### GET /avaliacoes/profissional/:profissional_id
Listar avaliações de um profissional
```
Query params:
- pagina: number
- limite: number (default: 10)
- ordenar: recente|nota_alta|nota_baixa

Response 200:
{
  "success": true,
  "data": {
    "estatisticas": {
      "avaliacao_media": 4.8,
      "total_avaliacoes": 45,
      "percentual_recomendacoes": 95,
      "breakdown": {
        "comunicacao": 4.9,
        "pontualidade": 4.7,
        "profissionalismo": 4.8,
        "qualidade": 4.9
      },
      "distribuicao": {
        "5_estrelas": 35,
        "4_estrelas": 8,
        "3_estrelas": 2,
        "2_estrelas": 0,
        "1_estrela": 0
      }
    },
    "avaliacoes": [
      {
        "id": "uuid",
        "avaliador_nome": "Maria S.",
        "avaliador_foto": "https://...",
        "nota_geral": 5,
        "comentario": "Excelente profissional!",
        "recomendaria": true,
        "criado_em": "2025-01-15T20:00:00Z"
      }
    ],
    "paginacao": {
      "total": 45,
      "pagina_atual": 1,
      "total_paginas": 5
    }
  }
}
```

---

### 7.10 Notificações

#### GET /notificacoes
Listar notificações do usuário
```
Query params:
- lida: boolean (filtrar por lidas/não lidas)
- tipo: string (filtrar por tipo)
- limite: number (default: 20)

Response 200:
{
  "success": true,
  "data": {
    "nao_lidas": 5,
    "notificacoes": [
      {
        "id": "uuid",
        "tipo": "nova_proposta",
        "titulo": "Nova proposta recebida!",
        "mensagem": "Maria Silva enviou uma proposta para 15/03/2025",
        "booking_id": "uuid",
        "outro_usuario": {
          "id": "uuid",
          "nome": "Maria Silva",
          "foto": "https://..."
        },
        "lida": false,
        "criado_em": "2025-01-20T10:00:00Z"
      }
    ]
  }
}
```

#### PUT /notificacoes/:id/marcar-lida
Marcar notificação como lida
```json
Response 200:
{
  "success": true,
  "data": {
    "id": "uuid",
    "lida": true
  }
}
```

#### PUT /notificacoes/marcar-todas-lidas
Marcar todas como lidas
```json
Response 200:
{
  "success": true,
  "message": "8 notificações marcadas como lidas"
}
```

#### GET /notificacoes/configuracoes
Ver configurações de notificação
```json
Response 200:
{
  "success": true,
  "data": {
    "push_nova_mensagem": true,
    "push_nova_proposta": true,
    "push_proposta_aceita": true,
    "push_pagamento": true,
    "push_avaliacao": true,
    "push_evento_amanha": true,
    "email_backup": true,
    "nao_perturbe_inicio": "22:00",
    "nao_perturbe_fim": "08:00"
  }
}
```

#### PUT /notificacoes/configuracoes
Atualizar configurações
```json
Request:
{
  "push_nova_mensagem": false,
  "nao_perturbe_inicio": "23:00",
  "nao_perturbe_fim": "09:00"
}

Response 200:
{
  "success": true,
  "data": {
    "push_nova_mensagem": false,
    "nao_perturbe_inicio": "23:00",
    "nao_perturbe_fim": "09:00"
  }
}
```

---

### 7.11 Seguir Artistas

#### POST /seguir/:profissional_id
Seguir um artista
```json
Response 201:
{
  "success": true,
  "data": {
    "id": "uuid",
    "profissional_id": "uuid",
    "seguindo": true,
    "notificacoes_ativas": true,
    "criado_em": "2025-01-20T10:00:00Z"
  }
}
```

#### DELETE /seguir/:profissional_id
Deixar de seguir
```json
Response 200:
{
  "success": true,
  "message": "Você deixou de seguir este artista"
}
```

#### GET /seguindo
Listar artistas que sigo
```
Query params:
- pagina: number
- limite: number

Response 200:
{
  "success": true,
  "data": {
    "total_seguindo": 15,
    "artistas": [
      {
        "id": "uuid",
        "nome_artistico": "DJ João",
        "categoria": "DJ",
        "foto_perfil_url": "https://...",
        "avaliacao_media": 4.8,
        "total_bookings": 47,
        "plano": "plus",
        "verificado": true,
        "ultima_atividade": "2025-01-19T15:00:00Z",
        "seguindo_desde": "2024-12-01T10:00:00Z"
      }
    ]
  }
}
```

#### GET /seguidores (artista)
Ver quem me segue
```
Query params:
- pagina: number
- limite: number

Response 200:
{
  "success": true,
  "data": {
    "total_seguidores": 234,
    "seguidores": [
      {
        "id": "uuid",
        "nome": "Maria Silva",
        "foto_perfil_url": "https://...",
        "seguindo_desde": "2024-11-15T10:00:00Z"
      }
    ]
  }
}
```

---

### 7.12 Histórico e Buscas Salvas

#### GET /historico-buscas
Ver histórico de buscas
```
Query params:
- limite: number (default: 20)

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "categoria": "DJ",
      "subcategorias": ["Techno", "House"],
      "cidade": "São Paulo",
      "preco_minimo": 500,
      "preco_maximo": 1500,
      "total_resultados": 23,
      "criado_em": "2025-01-20T10:00:00Z"
    }
  ]
}
```

#### POST /buscas-salvas
Salvar busca atual
```json
Request:
{
  "nome": "DJs de Techno em SP",
  "categoria_id": "uuid",
  "subcategoria_ids": ["uuid1", "uuid2"],
  "cidade": "São Paulo",
  "preco_minimo": 500,
  "preco_maximo": 1500,
  "alertas_ativos": true
}

Response 201:
{
  "success": true,
  "data": {
    "id": "uuid",
    "nome": "DJs de Techno em SP",
    "alertas_ativos": true,
    "criado_em": "2025-01-20T10:00:00Z"
  }
}
```

#### GET /buscas-salvas
Listar buscas salvas
```json
Response 200:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "nome": "DJs de Techno em SP",
      "categoria": "DJ",
      "subcategorias": ["Techno", "House"],
      "cidade": "São Paulo",
      "alertas_ativos": true,
      "novos_resultados": 3, // Artistas novos desde última busca
      "criado_em": "2025-01-15T10:00:00Z"
    }
  ]
}
```

#### DELETE /buscas-salvas/:id
Deletar busca salva
```json
Response 200:
{
  "success": true,
  "message": "Busca removida"
}
```

---

### 7.13 Cupons

#### POST /cupons/validar
Validar cupom antes de aplicar
```json
Request:
{
  "codigo": "BEMVINDO20",
  "booking_id": "uuid"
}

Response 200:
{
  "success": true,
  "data": {
    "codigo": "BEMVINDO20",
    "tipo": "desconto_taxa_percentual",
    "valor": 20,
    "desconto_calculado": 24, // R$ 24 de desconto
    "valido": true,
    "mensagem": "Cupom válido! Você economizará R$ 24"
  }
}

// Se inválido:
Response 400:
{
  "success": false,
  "error": {
    "code": "CUPOM_INVALIDO",
    "message": "Este cupom não é válido",
    "motivo": "expirado" // expirado|usos_excedidos|valor_minimo|usuario_ja_usou|categoria_invalida
  }
}
```

#### GET /cupons/disponiveis
Listar cupons disponíveis para o usuário
```json
Response 200:
{
  "success": true,
  "data": [
    {
      "codigo": "BEMVINDO20",
      "tipo": "desconto_taxa_percentual",
      "valor": 20,
      "descricao": "20% de desconto na taxa para novos usuários",
      "valido_ate": "2025-03-31",
      "valor_minimo_compra": 500
    }
  ]
}
```

#### POST /cupons (admin)
Criar novo cupom
```json
Request:
{
  "codigo": "VERAO2025",
  "tipo": "desconto_taxa_percentual",
  "valor": 15,
  "uso_tipo": "multiplo",
  "usos_maximos": 100,
  "valor_minimo_compra": 500,
  "apenas_novos_usuarios": false,
  "valido_de": "2025-01-01",
  "valido_ate": "2025-03-31"
}

Response 201:
{
  "success": true,
  "data": {
    "id": "uuid",
    "codigo": "VERAO2025",
    "ativo": true
  }
}
```

---

### 7.14 Indicações (Referal)

#### GET /indicacoes/meu-codigo
Ver código de indicação do usuário
```json
Response 200:
{
  "success": true,
  "data": {
    "codigo": "MARIA2024",
    "link": "https://kxrtex.com/ref/MARIA2024",
    "total_indicacoes": 12,
    "indicacoes_pendentes": 3,
    "indicacoes_concluidas": 9,
    "creditos_totais": 225,
    "creditos_disponiveis": 75,
    "proximo_bonus": {
      "tipo": "10_indicacoes",
      "faltam": 1,
      "premio": "R$ 100 extra"
    }
  }
}
```

#### GET /indicacoes/minhas
Listar minhas indicações
```
Query params:
- status: pendente|concluido|expirado
- pagina: number

Response 200:
{
  "success": true,
  "data": {
    "indicacoes": [
      {
        "id": "uuid",
        "indicado_nome": "João S.",
        "status": "concluido",
        "bookings_realizados": 3,
        "recompensa": 25,
        "recompensa_paga": true,
        "criado_em": "2024-12-01T10:00:00Z",
        "concluido_em": "2024-12-15T18:00:00Z"
      },
      {
        "id": "uuid",
        "indicado_nome": "Maria L.",
        "status": "pendente",
        "bookings_realizados": 0,
        "expira_em": "2025-03-20T10:00:00Z",
        "criado_em": "2024-12-20T10:00:00Z"
      }
    ],
    "estatisticas": {
      "taxa_conversao": 75,
      "tempo_medio_primeira_compra_dias": 8
    }
  }
}
```

#### GET /indicacoes/leaderboard
Ver ranking de indicadores do mês
```json
Response 200:
{
  "success": true,
  "data": {
    "meu_ranking": 4,
    "minhas_indicacoes_mes": 12,
    "top_10": [
      {
        "posicao": 1,
        "nome": "Maria S.",
        "foto": "https://...",
        "total_indicacoes": 23,
        "eh_voce": false
      },
      {
        "posicao": 2,
        "nome": "João M.",
        "foto": "https://...",
        "total_indicacoes": 18,
        "eh_voce": false
      }
    ],
    "premio_primeiro_lugar": "R$ 500"
  }
}
```

---

### 7.15 Créditos e Saques

#### GET /creditos
Ver saldo de créditos
```json
Response 200:
{
  "success": true,
  "data": {
    "saldo_disponivel": 75,
    "saldo_expirado": 0,
    "total_recebido": 225,
    "total_usado": 150,
    "historico": [
      {
        "id": "uuid",
        "tipo": "indicacao",
        "valor": 25,
        "descricao": "Indicação de João S. concluída",
        "saldo_novo": 75,
        "expira_em": "2026-01-20T10:00:00Z",
        "criado_em": "2025-01-20T10:00:00Z"
      }
    ]
  }
}
```

#### POST /creditos/usar
Usar créditos em um booking
```json
Request:
{
  "booking_id": "uuid",
  "valor": 50 // Máximo: saldo disponível
}

Response 200:
{
  "success": true,
  "data": {
    "booking_id": "uuid",
    "valor_usado": 50,
    "novo_valor_total": 1270, // Era R$1320, agora R$1270
    "saldo_restante": 25
  }
}
```

#### POST /saques (artista)
Solicitar saque
```json
Request:
{
  "valor": 850,
  "banco": "Banco do Brasil",
  "agencia": "1234",
  "conta": "12345-6",
  "tipo_conta": "corrente",
  "cpf_cnpj_titular": "123.456.789-00"
}

Response 201:
{
  "success": true,
  "data": {
    "id": "uuid",
    "valor_solicitado": 850,
    "taxa_saque": 3,
    "valor_liquido": 847,
    "status": "solicitado",
    "previsao_credito": "2025-01-22T10:00:00Z" // 1-2 dias úteis
  }
}

// Se saldo insuficiente:
Response 400:
{
  "success": false,
  "error": {
    "code": "SALDO_INSUFICIENTE",
    "message": "Saldo insuficiente para saque",
    "saldo_disponivel": 650,
    "valor_minimo": 100
  }
}
```

#### GET /saques
Listar histórico de saques
```json
Response 200:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "valor_solicitado": 850,
      "valor_liquido": 847,
      "status": "concluido",
      "banco": "Banco do Brasil",
      "conta": "*****12345-6",
      "solicitado_em": "2025-01-20T10:00:00Z",
      "concluido_em": "2025-01-22T08:00:00Z"
    }
  ]
}
```

---

### 7.16 Disputas

#### POST /disputas/:booking_id
Abrir disputa
```json
Request:
{
  "motivo": "nao_comparecimento_artista",
  "descricao": "O artista não compareceu ao evento e não deu satisfação",
  "solucao_desejada": "Solicito reembolso total do valor pago"
}

Response 201:
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "aberta",
    "prazo_resposta_outra_parte": "2025-01-22T10:00:00Z", // 48h
    "aberta_em": "2025-01-20T10:00:00Z"
  }
}
```

#### POST /disputas/:id/evidencias
Upload de evidências
```
Content-Type: multipart/form-data
evidencias: [arquivo1, arquivo2, ...]

Response 200:
{
  "success": true,
  "data": {
    "evidencias_urls": [
      "https://storage.../evidencia1.jpg",
      "https://storage.../evidencia2.jpg"
    ]
  }
}
```

#### POST /disputas/:id/responder
Responder a uma disputa (outra parte)
```json
Request:
{
  "resposta": "Infelizmente tive um problema de saúde de última hora. Tenho atestado médico.",
  "evidencias_urls": ["https://storage.../atestado.pdf"]
}

Response 200:
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "em_analise",
    "respondida_em": "2025-01-21T14:00:00Z"
  }
}
```

#### GET /disputas
Listar disputas do usuário
```json
Response 200:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "booking_id": "uuid",
      "motivo": "nao_comparecimento_artista",
      "status": "resolvida",
      "decisao_tipo": "reembolso_total",
      "valor_reembolso": 1320,
      "aberta_em": "2025-01-20T10:00:00Z",
      "resolvida_em": "2025-01-23T15:00:00Z"
    }
  ]
}
```

---

### 7.17 Admin

#### GET /admin/dashboard
Dashboard principal do admin
```json
Response 200:
{
  "success": true,
  "data": {
    "hoje": {
      "receita": 2450,
      "bookings": 18,
      "novos_usuarios": 23,
      "disputas_abertas": 2
    },
    "mes_atual": {
      "receita": 48750,
      "bookings": 387,
      "usuarios_ativos": 1234,
      "taxa_conversao": 68
    },
    "metricas_gerais": {
      "total_usuarios": 5432,
      "total_artistas": 1234,
      "artistas_verificados": 245,
      "assinantes_plus": 180,
      "assinantes_pro": 65,
      "gmv_total": 1250000,
      "receita_total": 125000
    },
    "alertas": [
      {
        "tipo": "disputa",
        "mensagem": "2 disputas aguardando análise",
        "prioridade": "alta"
      },
      {
        "tipo": "verificacao",
        "mensagem": "12 artistas aguardando verificação",
        "prioridade": "media"
      }
    ]
  }
}
```

#### GET /admin/usuarios
Listar todos usuários
```
Query params:
- tipo: contratante|artista
- status: ativo|suspenso|banido
- verificado: boolean
- busca: string (nome ou email)
- pagina: number

Response 200:
{
  "success": true,
  "data": {
    "usuarios": [
      {
        "id": "uuid",
        "nome": "João Silva",
        "email": "joao@email.com",
        "tipo": "artista",
        "status": "ativo",
        "verificado": true,
        "total_bookings": 47,
        "score_confiabilidade": 85,
        "criado_em": "2024-06-15T10:00:00Z"
      }
    ],
    "paginacao": {
      "total": 5432,
      "pagina_atual": 1,
      "total_paginas": 272
    }
  }
}
```

#### PUT /admin/usuarios/:id/suspender
Suspender usuário
```json
Request:
{
  "motivo": "Tentativa repetida de compartilhar contato externo",
  "dias": 7 // 7, 15 ou 30
}

Response 200:
{
  "success": true,
  "data": {
    "usuario_id": "uuid",
    "status": "suspenso",
    "data_suspensao_ate": "2025-01-27T10:00:00Z"
  }
}
```

#### PUT /admin/usuarios/:id/banir
Banir usuário permanentemente
```json
Request:
{
  "motivo": "Fraude comprovada"
}

Response 200:
{
  "success": true,
  "data": {
    "usuario_id": "uuid",
    "status": "banido"
  }
}
```

#### PUT /admin/profissionais/:id/verificar
Verificar artista
```json
Request:
{
  "aprovado": true,
  "observacoes": "Documentos conferidos e validados"
}

Response 200:
{
  "success": true,
  "data": {
    "profissional_id": "uuid",
    "verificado": true,
    "verificado_em": "2025-01-20T10:00:00Z"
  }
}
```

#### GET /admin/disputas
Listar todas disputas
```
Query params:
- status: aberta|em_analise|resolvida
- prioridade: alta|media|baixa
- pagina: number

Response 200:
{
  "success": true,
  "data": {
    "disputas": [
      {
        "id": "uuid",
        "booking_id": "uuid",
        "solicitante_nome": "Maria Silva",
        "motivo": "nao_comparecimento_artista",
        "status": "aberta",
        "prioridade": "alta",
        "aberta_em": "2025-01-20T10:00:00Z"
      }
    ]
  }
}
```

#### PUT /admin/disputas/:id/resolver
Resolver disputa
```json
Request:
{
  "decisao_tipo": "reembolso_total",
  "decisao_admin": "Após análise das evidências, fica comprovado o não comparecimento do artista sem justificativa válida. Reembolso total aprovado.",
  "valor_reembolso": 1320
}

Response 200:
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "resolvida",
    "decisao_tipo": "reembolso_total",
    "resolvida_em": "2025-01-23T15:00:00Z"
  }
}
```

#### GET /admin/relatorios/financeiro
Relatório financeiro detalhado
```
Query params:
- data_inicio: date
- data_fim: date
- tipo: diario|semanal|mensal

Response 200:
{
  "success": true,
  "data": {
    "periodo": {
      "inicio": "2025-01-01",
      "fim": "2025-01-31"
    },
    "receita": {
      "total": 48750,
      "taxas_bookings": 35000,
      "assinaturas_plus": 8820,
      "assinaturas_pro": 6435,
      "verificacoes": 1990
    },
    "despesas": {
      "gateway_pagamento": 1950,
      "infraestrutura": 850,
      "suporte": 2000
    },
    "lucro_liquido": 43950,
    "por_dia": [
      {
        "data": "2025-01-01",
        "receita": 1580,
        "bookings": 12
      }
    ]
  }
}
```

---

## 8. FLUXOS DE USUÁRIO

### 8.1 Fluxo Completo: Contratante → Booking → Avaliação

```
1. CADASTRO
   Contratante acessa app → Clica "Cadastrar" → Preenche dados → 
   Confirma email → Login automático

2. ONBOARDING
   Tutorial rápido (3 telas):
   - Como funciona a plataforma
   - Como buscar artistas
   - Proteção nos pagamentos
   
3. BUSCA DE ARTISTAS
   Home → Campo de busca → "Buscar DJs em São Paulo"
   Aplica filtros:
   - Categoria: DJ
   - Subcategoria: Techno
   - Cidade: São Paulo
   - Faixa de preço: R$800-1500
   - Avaliação: 4.5+
   
   Vê resultados ordenados por relevância
   
4. VISUALIZAR PERFIL
   Clica em "DJ João" → Vê perfil completo:
   - Portfolio (fotos/vídeos)
   - Bio
   - Avaliações (4.8 ⭐ - 47 bookings)
   - Faixa de preço: A partir de R$900
   - Badge: PLUS + Verificado
   
   Opções:
   - ⭐ Seguir artista
   - 💬 Solicitar Booking
   
5. SOLICITAR BOOKING
   Clica "Solicitar Booking" → Preenche formulário:
   - Data: 15/03/2025
   - Horário: 22:00 - 04:00
   - Local: Rua XYZ, 123 - São Paulo, SP
   - Tipo de evento: Festa Privada
   - Descrição: Aniversário de 30 anos, esperamos 100 pessoas
   - Orçamento: R$1.200
   
   Sistema calcula:
   - Valor: R$1.200
   - Taxa (10% - artista PLUS): R$120
   - Total: R$1.320
   
   Tem cupom? [BEMVINDO20] → Desconto R$24
   Total final: R$1.296
   
   Confirma e envia proposta
   
6. AGUARDANDO RESPOSTA
   Status: "Aguardando resposta do artista"
   Prazo: 48 horas
   
   Notificação push: "Proposta enviada para DJ João!"
   
7. ARTISTA RESPONDE
   Cenário A: ACEITA
   - Notificação: "DJ João aceitou sua proposta!"
   - Status: "Aceito - Aguardando pagamento"
   - Chat liberado
   
   Cenário B: CONTRA-PROPÕE
   - Notificação: "DJ João enviou uma contra-proposta"
   - Nova proposta: R$1.400
   - Mensagem: "Posso fazer por R$1.400, incluo equipamento de som"
   - Contratante tem 24h para aceitar/recusar
   
   Cenário C: RECUSA
   - Notificação: "DJ João não pode atender nesta data"
   - Motivo: "Já tenho compromisso"
   - Sugestão: "Posso fazer dia 22/03"
   
8. NEGOCIAÇÃO (se houver contra-proposta)
   Contratante e artista trocam mensagens via chat
   - "Consigo fazer R$1.300?"
   - "Fechado em R$1.350"
   - "Perfeito!"
   
   Artista envia proposta final de R$1.350
   Contratante aceita
   
9. PAGAMENTO
   Status: "Proposta aceita - Realizar pagamento"
   
   Resumo:
   - Valor do artista: R$1.350
   - Taxa plataforma: R$135
   - Total: R$1.485
   
   Escolhe método: [PIX] [Cartão]
   Seleciona PIX → QR Code aparece
   
   Realiza pagamento no banco → Retorna ao app
   
   Sistema confirma pagamento (via webhook ASAAS)
   Status: "Confirmado e Pago"
   
10. ADIANTAMENTO (se solicitado)
    Artista solicitou 40% de adiantamento
    - R$540 liberado imediatamente para o artista
    - R$810 retido até após o evento
    
11. PRÉ-EVENTO
    7 dias antes:
    - Notificação: "Seu evento com DJ João é na próxima semana!"
    
    1 dia antes:
    - Notificação: "Lembrete: Evento amanhã com DJ João"
    - Chat: Últimos ajustes e confirmações
    
12. DIA DO EVENTO
    2 horas antes:
    - Notificação: "Seu evento começa em 2 horas!"
    
    No horário:
    - App solicita check-in geolocalizado
    - Contratante faz check-in
    - Artista faz check-in
    - Status: "Em andamento"
    
13. PÓS-EVENTO
    No dia seguinte:
    - Notificação: "Como foi o evento? Marque como concluído"
    - Contratante clica "Evento Concluído"
    - Status: "Concluído"
    
    Sistema inicia contagem de 48h (período de disputa)
    
14. LIBERAÇÃO DE PAGAMENTO
    Após 48h sem disputas:
    - Restante do valor (R$810) liberado para artista
    - Notificação para artista: "Pagamento disponível para saque"
    
15. AVALIAÇÃO
    Notificação: "Avalie DJ João"
    
    Contratante avalia:
    - Nota geral: 5 estrelas
    - Comunicação: 5
    - Pontualidade: 5
    - Profissionalismo: 5
    - Qualidade: 5
    - Comentário: "Excelente! Recomendo muito"
    - Recomendaria? Sim
    
    Envia avaliação
    
    Artista também avalia contratante:
    - Nota geral: 5
    - Comunicação: 5
    - Pagamento: 5
    - Organização: 5
    
    Ambas avaliações ficam visíveis
    
16. FIM
    Status final: "Avaliado"
    
    Contratante pode:
    - Ver perfil do artista novamente
    - Contratar novamente
    - Indicar amigos
```

---

### 8.2 Fluxo: Artista → Criação de Perfil → Primeiro Booking

```
1. CADASTRO
   Usuário acessa app → "Sou Artista" → Preenche dados básicos
   
2. ONBOARDING ARTISTA
   "Complete seu perfil para começar a receber propostas"
   
   Checklist:
   □ Foto de perfil
   □ Nome artístico
   □ Categoria e subcategorias
   □ Bio (mínimo 50 caracteres)
   □ Cidades de atuação
   □ Valor base por hora
   □ Portfolio (mínimo 3 fotos)
   □ Redes sociais
   
   Barra de progresso: 0% → 100%
   
3. PREENCHIMENTO DO PERFIL
   
   Passo 1: Foto e nome
   - Upload foto de perfil
   - Nome artístico: "DJ João"
   
   Passo 2: Categoria
   - Seleciona: DJ
   - Subcategorias: Techno, House, Breaks
   
   Passo 3: Bio
   - "DJ com 10 anos de experiência na cena underground paulista..."
   
   Passo 4: Atuação e Preço
   - Cidades: São Paulo, Campinas, Santos
   - Valor base/hora: R$300
   - Sistema calcula faixa: "A partir de R$600"
   
   Passo 5: Portfolio
   - Upload 5 fotos de eventos anteriores
   - Upload 1 vídeo (opcional)
   
   Passo 6: Redes Sociais
   - Instagram: @djjoao
   - SoundCloud: /djjoao
   
   Perfil 100% completo! ✓
   
4. PERFIL ATIVO
   Status: "Perfil ativo - Você já pode receber propostas!"
   
   Dashboard mostra:
   - Visualizações: 0
   - Propostas: 0
   - Ranking: #234 em São Paulo
   
5. PRIMEIRA PROPOSTA RECEBIDA
   3 dias depois...
   
   🔴 Notificação: "Você recebeu uma nova proposta!"
   
   Detalhes:
   - Contratante: Maria Silva
   - Evento: Festa Privada - Aniversário
   - Data: 15/03/2025
   - Horário: 22:00 - 04:00 (6 horas)
   - Local: São Paulo, SP
   - Valor oferecido: R$1.200
   - Prazo para responder: 48 horas
   
6. ANÁLISE DA PROPOSTA
   Artista revisa:
   - Perfil do contratante (avaliação 4.9)
   - Detalhes do evento
   - Valor oferecido vs seu valor base
   - Distância do local
   
   Opções:
   [✓ Aceitar]
   [🔄 Contra-propor]
   [✗ Recusar]
   
7. DECISÃO: ACEITAR COM ADIANTAMENTO
   Artista percebe que é em outra cidade
   
   Marca:
   ☑ Solicitar adiantamento de 40%
   Motivo: "Evento em São Paulo, preciso cobrir transporte e hospedagem"
   
   Clica "Aceitar Proposta"
   
   Sistema analisa elegibilidade:
   - Valor ≥ R$500? ✓ Sim (R$1.200)
   - Cidade diferente? ✓ Sim
   - Score: 50 (novato, mas perfil completo)
   - Decisão: Aprovado para 30% (máximo para novatos)
   
   Ajusta para 30% → R$360 de adiantamento
   
8. PROPOSTA ACEITA
   Status: "Aceito - Aguardando pagamento do contratante"
   
   Chat liberado com contratante
   
   Artista: "Olá Maria! Aceitei sua proposta. Vamos confirmar os detalhes?"
   Contratante: "Oi João! Perfeito! Vou realizar o pagamento agora."
   
9. PAGAMENTO CONFIRMADO
   Notificação: "Pagamento confirmado! R$360 em análise para liberação"
   
   Sistema aguarda 24h (anti-fraude)
   
10. ADIANTAMENTO LIBERADO
    24h depois:
    🟢 Notificação: "Adiantamento de R$360 disponível para saque!"
    
    Dashboard financeiro:
    - Saldo disponível: R$360
    - Aguardando liberação: R$840 (após evento)
    
    Artista solicita saque:
    - Valor: R$360
    - Taxa: R$3
    - Líquido: R$357
    - Conta: Banco do Brasil - Ag 1234 - Conta 12345-6
    
    Confirma saque
    
11. PRÉ-EVENTO
    7 dias antes:
    - Notificação: "Lembrete: Evento em São Paulo dia 15/03"
    
    1 dia antes:
    - Artista e contratante trocam mensagens finais
    - Confirma equipamento necessário
    - Confirma endereço exato
    
12. DIA DO EVENTO
    App solicita confirmação 2h antes
    Artista confirma: "A caminho do evento"
    
    Ao chegar no local:
    - Check-in geolocalizado
    - Status: "Em andamento"
    
13. EVENTO ACONTECE
    Artista toca das 22h às 04h
    Festa é um sucesso
    
14. PÓS-EVENTO
    No dia seguinte:
    Contratante marca como "Concluído"
    
    Status: "Aguardando liberação do pagamento (48h)"
    
    Dashboard:
    - Aguardando liberação: R$840
    - Data prevista: 18/03/2025
    
15. PAGAMENTO LIBERADO
    Após 48h:
    🟢 Notificação: "Pagamento de R$840 disponível!"
    
    Total do booking:
    - Adiantamento: R$360 (já sacado)
    - Restante: R$840 (disponível agora)
    - Total recebido: R$1.200
    - Taxa plataforma: R$180 (paga pelo contratante)
    
16. AVALIAÇÃO
    Notificação: "Avalie Maria Silva"
    
    Artista avalia:
    - Nota: 5 estrelas
    - Comunicação: 5
    - Pagamento: 5
    - Organização: 5
    - Comentário: "Ótima contratante, evento bem organizado!"
    
    Contratante também avalia artista com 5 estrelas
    
17. PRIMEIRO BOOKING CONCLUÍDO
    Dashboard atualiza:
    - Total bookings: 1
    - Avaliação média: 5.0 ⭐
    - Total recebido: R$1.200
    - Score confiabilidade: 50 → 55
    
    Badge desbloqueado: "Primeiro Booking ✓"
    
18. PRÓXIMOS PASSOS
    Sistema sugere:
    - "Complete mais 2 bookings para desbloquear adiantamento de 40%"
    - "Atualize seu portfolio com fotos deste evento"
    - "Considere assinar o PLUS para reduzir a taxa para 10%"
```

---

## 9. REGRAS DE NEGÓCIO

### 9.1 Regras de Precificação

**Alteração de Preço:**
- Artista pode alterar valor base a cada **15 dias**
- Sistema registra histórico de alterações
- Se alterar >30% em relação à média da categoria → alerta ao artista
- Valor mínimo absoluto: **R$200** para qualquer categoria

**Faixa de Preço Pública:**
- Perfil mostra: "A partir de R$XXX"
- Baseado no valor base por hora × mínimo de horas por tipo de evento
- Não mostra valor exato, apenas faixa

**Proteção Anti-Desvalorização:**
- Sistema calcula média de preços por:
  - Categoria
  - Subcategoria
  - Cidade
  - Experiência (nº de bookings)
- Se artista definir <30% da média → alerta
- Dashboard mostra: "Artistas similares cobram em média R$XXX"

---

# KXRTEX - DOCUMENTAÇÃO TÉCNICA (Parte 3)

## 9. REGRAS DE NEGÓCIO (Continuação)

### 9.2 Regras de Booking (Continuação)

**Valor Mínimo:**
- Booking mínimo: **R$200**
- Se contratante tentar enviar proposta <R$200 → bloqueado
- Exceção: Cupons podem reduzir valor final, mas valor base deve ser ≥R$200

**Antecedência Mínima:**
- Eventos devem ser agendados com mínimo **24 horas** de antecedência
- Sistema bloqueia datas no passado ou com <24h
- Exceção: Admin pode criar bookings retroativos (para casos especiais)

**Duração:**
- Mínimo: **2 horas**
- Máximo: **12 horas** em um único booking
- Se precisar mais → dividir em múltiplos bookings

**Disponibilidade:**
- Artista NÃO precisa manter calendário atualizado
- Recebe proposta para qualquer data
- Pode aceitar, recusar ou sugerir outra data
- Sistema registra taxa de recusa por "data indisponível"
- Se >50% das recusas por indisponibilidade → sugestão de atualizar calendário (futuro)

---

### 9.3 Regras de Cancelamento

**Por Contratante:**

```
Mais de 30 dias antes:
├─ Reembolso: 100%
├─ Artista recebe: 0%
└─ Taxa administrativa: R$0

15-29 dias antes:
├─ Reembolso: 75%
├─ Artista recebe: 25% (compensação)
└─ Taxa administrativa: 0%

7-14 dias antes:
├─ Reembolso: 50%
├─ Artista recebe: 50%
└─ Taxa administrativa: 0%

Menos de 7 dias:
├─ Reembolso: 0%
├─ Artista recebe: 100%
└─ Penalidade adicional: Não pode enviar propostas por 7 dias
```

**Por Artista:**

```
Mais de 30 dias antes:
├─ Sem penalidade
├─ Contratante: reembolso 100%
└─ Nota no perfil: "Cancelou com antecedência adequada"

15-29 dias antes:
├─ Artista perde: 25% do valor (vai para plataforma)
├─ Contratante: reembolso 100%
├─ Warning no perfil (temporário - 30 dias)
└─ Score confiabilidade: -10 pontos

7-14 dias antes:
├─ Artista perde: 50% do valor
├─ Contratante: reembolso 100%
├─ Suspensão: 7 dias
├─ Badge temporário: "Cancelou recentemente"
└─ Score confiabilidade: -20 pontos

Menos de 7 dias:
├─ Artista perde: 100% do valor + R$200 de multa
├─ Contratante: reembolso 100% + R$200 de compensação
├─ Suspensão: 15 dias
└─ Score confiabilidade: -30 pontos

No dia do evento (não comparecimento):
├─ Artista perde: 100% + multa R$500
├─ Contratante: reembolso 150% (valor + 50% de compensação)
├─ Banimento permanente (exceto se comprovar força maior)
└─ Score confiabilidade: -100 pontos (banimento automático)
```

**Casos de Força Maior (sem penalidade):**
- Doença/acidente com atestado médico
- Falecimento familiar (com certidão)
- Catástrofe natural
- Ordem judicial
- Covid-19 ou outra doença infectocontagiosa

**Processo:**
1. Artista solicita cancelamento
2. Seleciona motivo (checkbox)
3. Se força maior: anexa comprovante
4. Admin analisa em até 24h
5. Se aprovado: sem penalidades
6. Se negado: penalidades aplicadas

---

### 9.4 Regras de Adiantamento

**Elegibilidade:**

```
Para solicitar adiantamento, TODOS os critérios devem ser atendidos:

1. Valor do booking: ≥ R$500
2. Evento em cidade diferente da cadastrada pelo artista
3. Antecedência: ≥ 15 dias do evento
4. Documentos: CPF/CNPJ verificado + selfie com documento
5. Experiência mínima:
   - Novato (0-2 bookings): NÃO elegível
   - Iniciante (3-9 bookings): Elegível para até 30%
   - Experiente (10-29 bookings + aval. 4.5+): Até 40%
   - Veterano (30+ bookings + aval. 4.7+): Até 50%
6. Plano (para iniciantes):
   - FREE: NÃO elegível
   - PLUS ou PRO: Elegível
```

**Score de Confiabilidade:**

```
Sistema calcula score (0-100) baseado em:

Pontos POSITIVOS:
├─ Cada booking concluído: +5 pontos
├─ Avaliação 5 estrelas: +3 pontos
├─ Avaliação 4-4.9 estrelas: +2 pontos
├─ Assinatura PLUS ativa: +15 pontos
├─ Assinatura PRO ativa: +20 pontos
├─ Documento verificado: +10 pontos
├─ Conta com 6+ meses: +5 pontos
├─ Conta com 1+ ano: +10 pontos
├─ Zero cancelamentos: +5 pontos
└─ Responde <6h média: +3 pontos

Pontos NEGATIVOS:
├─ Cada cancelamento: -15 pontos
├─ Avaliação <4.0: -10 pontos
├─ Não comparecimento: -100 pontos (banimento)
├─ Suspensão: -30 pontos
├─ Disputa perdida: -20 pontos
└─ Advertência: -5 pontos

Limites de Adiantamento por Score:
├─ 0-30 pontos: NÃO elegível
├─ 31-60 pontos: Até 30%
├─ 61-80 pontos: Até 40%
└─ 81-100 pontos: Até 50%
```

**Processo de Liberação:**

```
1. Artista solicita adiantamento (ao aceitar proposta ou depois)
2. Sistema valida elegibilidade AUTOMATICAMENTE
3. Se aprovado:
   a) Booking status → "aceito"
   b) Adiantamento status → "solicitado"
4. Contratante paga valor total
5. Sistema divide:
   - X% → Subconta temporária (adiantamento)
   - (100-X)% → Retido
   - Taxa → Plataforma
6. Sistema inicia análise anti-fraude (24h)
   - Valida documento novamente
   - Verifica padrões suspeitos
   - Checa score
7. Após 24h sem alertas:
   - Adiantamento status → "liberado"
   - Valor disponível para saque imediato
8. Artista pode sacar
```

**Limites Simultâneos:**

```
Artista pode ter no máximo:
├─ FREE: 1 adiantamento ativo
├─ PLUS: 3 adiantamentos ativos
└─ PRO: 5 adiantamentos ativos

Valor total em adiantamentos pendentes:
├─ FREE: R$1.500
├─ PLUS: R$5.000
└─ PRO: R$15.000

"Adiantamento ativo" = liberado mas evento ainda não aconteceu
```

**Proteções da Plataforma:**

```
1. Período de análise de 24h (anti-fraude)
2. Validação de documento obrigatória
3. CPF deve corresponder à conta bancária
4. Geolocalização no check-in (obrigatório para eventos com adiantamento)
5. Se não fazer check-in → disputa automática
6. Histórico de adiantamentos monitorado
7. Se 2+ não comparecimentos com adiantamento → banimento permanente
```

---

### 9.5 Regras de Chat e Moderação

**Bloqueio Automático de Mensagens:**

```
Sistema detecta e bloqueia mensagens contendo:

1. Números de telefone:
   - Regex: (\d{2})\s*\d{4,5}-?\d{4}
   - Exemplos bloqueados:
     - "11 99999-9999"
     - "(11) 98888-8888"
     - "11999999999"

2. WhatsApp:
   - Palavras: whatsapp, whats, wpp, zap, zapzap
   - "Me chama no whats"
   - "Adiciona no wpp"

3. Instagram/Redes Sociais:
   - "@usuario"
   - "me segue no insta"
   - "me add no Instagram"

4. Email:
   - Regex: [\w.-]+@[\w.-]+\.\w+
   - "joao@email.com"

5. Links externos:
   - http, https, www.
   - ".com", ".br", etc.
   - Exceção: Links das redes sociais no PERFIL são permitidos

6. Palavras-chave suspeitas:
   - "fora do app"
   - "fora da plataforma"
   - "contato direto"
   - "sem taxa"
   - "pagar por fora"
   - "combinar por fora"
```

**Ação ao Detectar:**

```
1ª Tentativa:
├─ Mensagem bloqueada (não é enviada)
├─ Aviso no chat: "Detectamos tentativa de compartilhar contato externo"
├─ Explicação: "Mantenha negociações dentro da plataforma"
├─ Notificação para admin (log)
├─ Warning registrado (invisível para outros usuários)
└─ Conta: 1 strike

2ª Tentativa (dentro de 30 dias):
├─ Mensagem bloqueada
├─ Suspensão automática: 7 dias
├─ Email explicando infração
├─ Badge "Suspenso" (invisível publicamente)
├─ Não pode enviar mensagens/propostas durante suspensão
└─ Conta: 2 strikes

3ª Tentativa (dentro de 90 dias):
├─ Banimento permanente
├─ Todos bookings futuros cancelados
├─ Reembolso para contratantes afetados
├─ Valor retido para artistas afetados
└─ Conta: 3 strikes = BANIMENTO
```

**Denúncias Manuais:**

```
Usuário pode denunciar:
├─ Mensagem específica
├─ Perfil
├─ Comportamento inadequado

Processo:
1. Clica "Denunciar" na mensagem/perfil
2. Seleciona motivo:
   - Tentando contato externo
   - Linguagem ofensiva
   - Assédio
   - Perfil falso
   - Golpe/fraude
   - Spam
   - Outro (descrever)
3. Opcional: Anexa screenshot
4. Envia denúncia
5. Admin recebe em fila prioritária
6. Admin analisa em até 24h
7. Decisão:
   - Advertência (email)
   - Suspensão (7/15/30 dias)
   - Banimento permanente
   - Denúncia improcedente
```

---

### 9.6 Regras de Avaliação

**Quando Avaliar:**
- Após evento marcado como "concluído"
- Ambos (contratante e artista) devem avaliar
- Prazo: **7 dias** após conclusão
- Se não avaliar em 7 dias → perde direito de avaliar

**Visibilidade:**
- Avaliações ficam **invisíveis** até:
  - Ambos avaliarem OU
  - 7 dias passarem
- Depois: ambas ficam visíveis simultaneamente
- Objetivo: evitar avaliações tendenciosas por retaliação

**Obrigatoriedade:**
- Não é obrigatório avaliar
- MAS: Avaliação conta como "boa prática"
- Usuários que sempre avaliam ganham badge "Avaliador Confiável"
- Score de confiabilidade: +1 ponto por avaliação dada

**Regras de Avaliação:**

```
Nota Geral: 1-5 estrelas (obrigatório)

Critérios específicos (1-5 cada):

Se avaliando ARTISTA:
├─ Comunicação (obrigatório)
├─ Pontualidade (obrigatório)
├─ Profissionalismo (obrigatório)
└─ Qualidade do serviço (obrigatório)

Se avaliando CONTRATANTE:
├─ Comunicação (obrigatório)
├─ Pagamento (obrigatório)
└─ Organização do evento (obrigatório)

Comentário:
├─ Opcional
├─ Máximo 500 caracteres
└─ Moderado por IA (detecta ofensas)

Recomendaria? Sim/Não (obrigatório)
```

**Edição:**
- Não pode editar após enviar
- Exceção: Admin pode remover se houver denúncia comprovada

**Resposta a Avaliações:**
- Avaliado NÃO pode responder avaliações (para evitar conflitos)
- Se discordar: pode abrir ticket com admin
- Admin analisa e pode remover se avaliação for injusta/falsa

**Impacto:**
- Avaliação média calculada automaticamente
- Aparece no perfil e nas buscas
- Artistas com <4.0 aparecem por último nas buscas
- Artistas com 4.8+ ganham badge "Top Avaliado"
- Avaliações <3.0 → admin revisa automaticamente

---

### 9.7 Regras de Verificação

**Selo "Verificado" - Critérios:**

**Opção 1: Orgânica (Gratuita)**
```
Requisitos (TODOS):
1. Ser assinante PLUS ou PRO (ativo)
2. Mínimo 10 bookings concluídos
3. Avaliação média ≥ 4.5
4. Zero disputas perdidas
5. Zero suspensões
6. Perfil 100% completo
7. Documentos enviados e validados:
   - Foto do RG/CNH (frente e verso)
   - Selfie segurando documento
   - Comprovante de endereço (até 3 meses)
   - CPF regularizado
8. Fotos de eventos reais (mínimo 5)
9. Link para redes sociais ativas

Processo:
1. Artista solicita verificação (botão no perfil)
2. Sistema valida critérios automaticamente
3. Se todos atendidos → vai para fila de análise manual
4. Admin analisa documentos em até 5 dias úteis
5. Aprovado → Selo "Verificado" ✓
6. Negado → Email com motivos + pode reenviar após 30 dias
```

**Opção 2: Paga (Apenas PRO)**
```
Requisitos mínimos:
1. Assinante PRO ativo
2. Documentos válidos
3. Perfil 100% completo
4. Nenhuma suspensão ativa

Processo:
1. Paga taxa única de R$199
2. Análise prioritária em 24h
3. Aprovado → Selo "Verificado" ✓

Vantagens:
- Não precisa dos 10 bookings
- Não precisa da avaliação 4.5+
- Análise muito mais rápida
```

**Perda do Selo:**
- Suspensão: Selo removido temporariamente
- Banimento: Selo removido permanentemente
- Downgrade para FREE: Selo removido (pode recuperar ao voltar PLUS/PRO)
- Avaliação cair para <4.0: Selo em revisão
- Disputa perdida grave: Selo removido

---

### 9.8 Regras de Cupons

**Criação (Admin):**
```
Campos obrigatórios:
├─ Código: Único, 5-20 caracteres, letras e números
├─ Tipo: desconto_taxa_percentual, desconto_taxa_fixo, cashback, taxa_zero
├─ Valor: Percentual ou valor fixo
├─ Validade: Data início e fim
├─ Uso: único, múltiplo (com limite), ilimitado

Campos opcionais:
├─ Valor mínimo de compra (em R$)
├─ Apenas novos usuários (boolean)
├─ Categorias permitidas (array)
├─ Uso por usuário (default: 1)
└─ Descrição pública
```

**Criação (Artista PRO):**
```
Artista PRO pode criar cupons para DESCONTO NO PRÓPRIO CACHÊ

Limitações:
├─ Máximo 1 cupom ativo por vez
├─ Desconto máximo: 20%
├─ Válido apenas para o próprio perfil
├─ Não reduz taxa da plataforma
├─ Duração máxima: 30 dias

Exemplo:
- Artista cobra R$1.000
- Cria cupom "JANEIRO20" com 20% off
- Contratante usa cupom
- Paga: R$800 (artista) + R$80 (taxa 10%) = R$880
- Artista recebe: R$800 (não R$1.000)
```

**Validação:**
```
Sistema valida na hora do pagamento:

1. Cupom existe? ✓
2. Está ativo? ✓
3. Dentro da validade? ✓
4. Ainda tem usos disponíveis? ✓
5. Usuário já usou antes? (verifica limite por usuário)
6. Valor do booking atende mínimo? ✓
7. Categoria do artista está permitida? ✓
8. Se "apenas novos": usuário tem 0 bookings? ✓

Se todas ✓ → Cupom aplicado
Se alguma ✗ → Erro específico retornado
```

**Stacking:**
- Apenas 1 cupom por booking
- Não pode combinar cupons

**Tracking:**
- Sistema registra cada uso
- Admin vê estatísticas:
  - Quantos usos
  - GMV gerado
  - Taxa de conversão
  - ROI do cupom

---

### 9.9 Regras de Indicação (Referal)

**Como Funciona:**

```
1. Usuário recebe código único ao se cadastrar
   Exemplo: MARIA2024

2. Compartilha link: kxrtex.com/ref/MARIA2024

3. Amigo clica no link e se cadastra
   - Cookie/session registra o indicador
   - Novo usuário ganha 15% off no primeiro booking

4. Novo usuário faz primeiro booking
   - Desconto aplicado automaticamente (15% na taxa)
   - Booking é concluído com sucesso

5. Indicador recebe recompensa
   - R$25 em créditos
   - Créditos disponíveis em 48h após evento
   - Válidos por 1 ano
```

**Recompensas Progressivas:**

```
Marcos:
├─ 5 indicações concluídas: Bônus +R$50
├─ 10 indicações: Bônus +R$100
├─ 25 indicações: Assinatura PRO grátis por 1 mês
├─ 50 indicações: Upgrade PRO vitalício ✨
└─ 100 indicações: R$500 + Badge "Embaixador"

Leaderboard mensal:
├─ 1º lugar: R$500
├─ 2º lugar: R$300
├─ 3º lugar: R$200
└─ Reset todo mês (contagem do zero)
```

**Regras Anti-Fraude:**

```
Indicação NÃO é válida se:
├─ Email/CPF já cadastrado antes
├─ Mesmo IP do indicador (suspeita de auto-indicação)
├─ Mesmo device ID
├─ Padrão suspeito (ex: 10 cadastros no mesmo dia do mesmo IP)
└─ Indicado não faz booking em 90 dias (expira)

Sistema detecta e bloqueia automaticamente

Penalidades por fraude:
├─ 1ª vez: Warning + remoção das indicações fraudulentas
├─ 2ª vez: Suspensão 30 dias + perda de todos créditos
└─ 3ª vez: Banimento permanente
```

**Limites:**
- Máximo 10 indicações pendentes simultâneas
- Após 90 dias sem primeiro booking → indicação expira
- Créditos expiram em 1 ano se não usados

**Uso de Créditos:**

```
Créditos podem ser usados para:
1. Abater na taxa de bookings futuros
   - Apenas na taxa, não no valor do artista
   
2. Pagar assinatura PLUS/PRO (se for artista)
   - R$25 de crédito = R$25 de desconto na assinatura
   
3. Transferir para conta bancária
   - Mínimo: R$100
   - Taxa: R$3
   - Só para artistas verificados
```

---

### 9.10 Regras de Busca e Ranking

**Algoritmo de Relevância:**

```
Score de Relevância (0-100 pontos):

Match de Filtros (50 pontos):
├─ Categoria exata: +15
├─ Subcategoria exata: +15
├─ Cidade exata: +10
├─ Dentro da faixa de preço: +10
└─ Disponível na data (se filtrado): +5

Qualidade do Perfil (30 pontos):
├─ Perfil 100% completo: +10
├─ Avaliação ≥4.8: +10
├─ Avaliação 4.5-4.7: +7
├─ Avaliação 4.0-4.4: +5
├─ Portfolio rico (10+ itens): +5
├─ Vídeo de apresentação: +3
└─ Verificado: +2

Plano e Atividade (15 pontos):
├─ PRO: +10
├─ PLUS: +5
├─ FREE: +0
├─ Responde rápido (<6h): +3
└─ Ativo recentemente (última semana): +2

Popularidade (5 pontos):
├─ Mais de 50 bookings: +3
├─ Mais de 100 seguidores: +2
└─ Taxa de conversão >70%: +2

PENALIDADES (reduzem score):
├─ Perfil incompleto (<80%): -15
├─ Sem foto de perfil: -20
├─ Avaliação <4.0: -10
├─ Taxa de cancelamento >10%: -15
├─ Suspensão recente: -30
└─ Tempo de resposta >24h: -5
```

**Ordenação:**

```
Usuário pode ordenar por:

1. Relevância (padrão)
   - Usa algoritmo acima
   - Balanceia todos fatores
   
2. Menor preço
   - Ordena por valor_base_minimo ASC
   - Empate: maior avaliação
   
3. Maior preço
   - Ordena por valor_base_maximo DESC
   - Usado por quem quer "premium"
   
4. Melhor avaliação
   - Ordena por avaliacao_media DESC
   - Mínimo 5 avaliações para aparecer
   
5. Mais contratados
   - Ordena por total_bookings DESC
   - Mostra experiência
   
6. Mais recentes
   - Ordena por criado_em DESC
   - Descobre novos talentos
```

**Filtros Combinados:**

```
Filtros se somam (AND):
- Categoria DJ + Subcategoria Techno + São Paulo + R$500-1000
- Retorna apenas artistas que atendem TODOS os critérios

Exceção - Subcategorias:
- Se selecionar múltiplas subcategorias → OR
- Techno OU House OU Hardtechno
```

---

### 9.11 Regras de Seguir/Favoritar

**Seguir Artista:**
```
Ao seguir:
├─ Contador do artista +1
├─ Artista recebe notificação (se ativada)
├─ Contratante pode ativar alertas

Alertas disponíveis:
├─ Artista atualizou portfolio
├─ Artista baixou preço
├─ Artista disponível em nova cidade
├─ Artista está com agenda aberta
└─ Artista alcançou marco (100 bookings, etc.)

Frequência de alertas:
├─ Máximo 1 alerta por artista por semana
├─ Contratante pode desativar alertas individualmente
└─ Pode deixar de seguir a qualquer momento
```

**Limites:**
- Contratante pode seguir até **100 artistas**
- Após 100 → deve deixar de seguir alguns para seguir novos

**Notificação para Artista:**
```
Artista vê:
├─ Total de seguidores
├─ Novos seguidores esta semana
├─ Quem me segue (opcional - privacidade)
└─ Botão: "Notificar seguidores" (1x por mês)
```

---

## 10. SISTEMA DE PAGAMENTOS (ASAAS)

### 10.1 Integração ASAAS

**Tecnologia:**
- Gateway: ASAAS (https://asaas.com)
- API: REST v3
- Webhook: Notificações em tempo real

**Fluxo Completo:**

```
1. CRIAÇÃO DO PAGAMENTO
   Backend → ASAAS API
   POST /v3/payments
   
   {
     "customer": "cus_xxx", // ID do cliente no ASAAS
     "billingType": "PIX", // ou CREDIT_CARD
     "value": 1320.00,
     "dueDate": "2025-01-21",
     "description": "Booking #xxx - DJ João - 15/03/2025",
     "externalReference": "booking_uuid",
     "split": [
       {
         "walletId": "wal_artista_xxx",
         "fixedValue": 1200.00 // Valor do artista
       },
       {
         "walletId": "wal_plataforma",
         "fixedValue": 120.00 // Taxa da plataforma
       }
     ]
   }
   
   ASAAS retorna:
   - payment_id
   - invoice_url (para cartão)
   - pix payload + QR Code (para PIX)
   
2. CONTRATANTE PAGA
   - Se PIX: Escaneia QR Code → Paga no app do banco
   - Se Cartão: Preenche dados → Paga
   
3. WEBHOOK ASAAS NOTIFICA
   POST /api/webhooks/asaas
   
   {
     "event": "PAYMENT_RECEIVED",
     "payment": {
       "id": "pay_xxx",
       "status": "RECEIVED",
       "value": 1320.00,
       "netValue": 1295.00, // Após taxas ASAAS
       "confirmedDate": "2025-01-20T10:30:00Z"
     }
   }
   
4. BACKEND PROCESSA
   - Valida webhook (assinatura)
   - Atualiza pagamento no BD
   - Atualiza booking → "confirmado"
   - Notifica artista e contratante
   
5. SPLIT AUTOMÁTICO
   ASAAS já dividiu:
   - R$1.200 → Wallet do artista
   - R$120 → Wallet da plataforma
   
6. RETENÇÃO ATÉ EVENTO
   - Valor fica na wallet ASAAS
   - Artista não pode sacar ainda
   
7. APÓS EVENTO + 48H
   Backend → ASAAS API
   POST /v3/transfers
   
   Libera R$1.200 para conta bancária do artista
   
8. SAQUE PROCESSADO
   ASAAS transfere → Conta do artista
   1-2 dias úteis
```

### 10.2 Métodos de Pagamento

**PIX:**
```
Vantagens:
├─ Instantâneo
├─ Sem taxas para contratante
├─ QR Code + payload (copia e cola)
└─ Confirmação em segundos

Fluxo:
1. Contratante escolhe PIX
2. Backend gera pagamento via ASAAS
3. ASAAS retorna QR Code
4. App exibe QR Code + botão "copiar código"
5. Contratante abre app do banco → paga
6. Webhook confirma → Booking confirmado

Expiração:
- QR Code válido por 30 minutos
- Após 30min → gera novo
```

**Cartão de Crédito:**
```
Vantagens:
├─ Parcelamento em até 3x sem juros
├─ Não precisa sair do app
└─ Confirmação imediata

Fluxo:
1. Contratante escolhe Cartão
2. Backend gera payment via ASAAS
3. ASAAS retorna invoice_url
4. App abre WebView com formulário ASAAS
5. Contratante preenche dados do cartão
6. ASAAS processa
7. Webhook confirma → Booking confirmado

Parcelamento:
- 1x: sem juros
- 2x: sem juros
- 3x: sem juros
- Juros cobrados pela plataforma (embutidos no valor)

Taxas ASAAS (absorvidas pela plataforma):
- À vista: 2,99%
- Parcelado: 3,99% + R$0,50 por parcela
```

### 10.3 Split de Pagamento

**Como Funciona:**
```
Ao criar pagamento, já definimos split:

Exemplo - Booking de R$1.200 + taxa R$120 = R$1.320

Split:
├─ Wallet Artista: R$1.200 (90,9%)
└─ Wallet Plataforma: R$120 (9,1%)

ASAAS automaticamente:
1. Recebe R$1.320 do contratante
2. Desconta taxas próprias (~R$25 = 2% do PIX)
3. Divide:
   - R$1.200 → Artista (fica retido)
   - R$95 → Plataforma (R$120 - taxa ASAAS)
   
Assim:
- Artista SEMPRE recebe R$1.200 integral
- Plataforma absorve as taxas do gateway
```

**Adiantamento no Split:**
```
Se há adiantamento de 40% (R$480):

Split diferente:
├─ Subconta Adiantamento: R$480 (liberação imediata após 24h)
├─ Subconta Retida: R$720 (liberação após evento)
└─ Wallet Plataforma: R$120

Processo:
1. Pagamento entra: R$1.320
2. ASAAS divide em 3 partes
3. Após 24h: libera R$480 para saque
4. Após evento + 48h: libera R$720
5. Plataforma já recebeu R$120
```

### 10.4 Reembolsos

**Processo:**
```
1. Booking é cancelado (por qualquer motivo)
2. Sistema calcula valor de reembolso (baseado em regras)
3. Backend chama ASAAS API:
   POST /v3/payments/{payment_id}/refund
   {
     "value": 990.00, // Valor a reembolsar
     "description": "Cancelamento 20 dias antes do evento"
   }
4. ASAAS processa:
   - Se PIX: Devolve para mesma chave
   - Se Cartão: Estorna na fatura
5. Prazo:
   - PIX: Até 1 dia útil
   - Cartão: 5-7 dias úteis (depende da operadora)
6. Webhook confirma conclusão
7. Sistema notifica contratante
```

**Reembolso Parcial:**
```
Se artista tem direito a compensação:

Exemplo: Cancelamento 20 dias antes
- Contratante pagou: R$1.320
- Reembolso contratante: 75% = R$990
- Artista recebe: 25% = R$330

Fluxo:
1. Reembolsa R$990 ao contratante
2. Transfere R$330 para artista
3. Plataforma perde R$120 (taxa)
```

---

## 11. SISTEMA DE ADIANTAMENTO (Detalhado)

### 11.1 Fluxo Técnico Completo

```
FASE 1: SOLICITAÇÃO
┌─────────────────────────────────────────────────┐
│ Artista aceita proposta + solicita adiantamento │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ Sistema valida elegibilidade AUTOMATICAMENTE:   │
│ ✓ Valor ≥ R$500?                               │
│ ✓ Cidade diferente?                             │
│ ✓ Antecedência ≥ 15 dias?                      │
│ ✓ Documento verificado?                         │
│ ✓ Score suficiente?                             │
│ ✓ Dentro dos limites?                           │
└─────────────────────────────────────────────────┘
                    ↓
        ┌───────────┴───────────┐
        │                       │
    ✓ APROVADO            ✗ NEGADO
        │                       │
        │                       └─→ Erro retornado
        │                           + Motivos específicos
        ↓
┌────────────────────────────────┐
│ Adiantamento criado no BD      │
│ Status: "solicitado"           │
│ Booking status: "aceito"       │
└────────────────────────────────┘

FASE 2: PAGAMENTO
        ↓
┌────────────────────────────────┐
│ Contratante realiza pagamento  │
└────────────────────────────────┘
        ↓
┌────────────────────────────────┐
│ ASAAS divide com split:        │
│ - Adiantamento → subconta A    │
│ - Restante → subconta B        │
│ - Taxa → plataforma            │
└────────────────────────────────┘
        ↓
┌────────────────────────────────┐
│ Adiantamento status: "analise" │
│ Inicia timer de 24h            │
└────────────────────────────────┘

FASE 3: ANÁLISE ANTI-FRAUDE (24h)
        ↓
┌────────────────────────────────┐
│ Sistema verifica:              │
│ - CPF válido na Receita?       │
│ - Conta bancária corresponde?  │
│ - Padrão suspeito?             │
│ - Histórico limpo?             │
└────────────────────────────────┘
        ↓
        ┌───────────┴───────────┐
        │                       │
    ✓ OK                    ✗ ALERTA
        │                       │
        │                       └─→ Admin analisa manualmente
        │                           Decide em 12h
        ↓
┌────────────────────────────────┐
│ Após 24h sem alertas:          │
│ Status: "aprovado"             │
└────────────────────────────────┘

FASE 4: LIBERAÇÃO
        ↓
┌────────────────────────────────┐
│ Backend → ASAAS                │
│ POST /v3/transfers             │
│ Transfere subconta A →         │
│ Wallet do artista              │
└────────────────────────────────┘
        ↓
┌────────────────────────────────┐
│ Status: "liberado"             │
│ Valor disponível para saque    │
│ Notificação push para artista  │
└────────────────────────────────┘
        ↓
┌────────────────────────────────┐
│ Artista solicita saque         │
│ R$480 - R$3 taxa = R$477      │
└────────────────────────────────┘
        ↓
┌────────────────────────────────┐
│ ASAAS transfere para conta     │
│ Prazo: 1-2 dias úteis          │
└────────────────────────────────┘

FASE 5: EVENTO
        ↓
┌────────────────────────────────┐
│ Dia do evento: Check-in        │
│ GPS valida presença            │
└────────────────────────────────┘
        ↓
┌────────────────────────────────┐
│ Evento acontece                │
│ Contratante marca "concluído"  │
└────────────────────────────────┘
        ↓
┌────────────────────────────────┐
│ Aguarda 48h (período disputa)  │
└────────────────────────────────┘

FASE 6: LIBERAÇÃO FINAL
        ↓
┌────────────────────────────────┐
│ Sem disputas após 48h          │
│ Backend → ASAAS                │
│ Transfere subconta B →         │
│ Wallet do artista              │
│ R$720 disponível               │
└────────────────────────────────┘
        ↓
┌────────────────────────────────┐
│ Artista já tinha sacado R$480  │
│ Agora saca R$720               │
│ Total recebido: R$1.200 ✓     │
└────────────────────────────────┘
```

### 11.2 Tabelas SQL Específicas

```sql
-- Já definida anteriormente, mas detalhamento do uso:

CREATE TABLE adiantamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID UNIQUE REFERENCES bookings(id),
    profissional_id UUID REFERENCES profissionais(id),
    
    -- Valores
    valor_adiantamento DECIMAL(10,2) NOT NULL,
    percentual_adiantamento DECIMAL(5,2) NOT NULL,
    valor_restante DECIMAL(10,2) NOT NULL,
    
    -- Status
    status VARCHAR(30) DEFAULT 'solicitado' CHECK (status IN (
        'solicitado', -- Artista solicitou
        'analise',    -- Em análise anti-fraude (24h)
        'aprovado',   -- Aprovado, pronto para liberar
        'liberado',   -- Dinheiro liberado para artista
        'devolvido',  -- Artista cancelou e devolveu
        'retido'      -- Não compareceu, valor retido
    )),
    
    -- Timestamps
    solicitado_em TIMESTAMP DEFAULT NOW(),
    aprovado_em TIMESTAMP,
    liberado_em TIMESTAMP,
    
    -- Score no momento da solicitação (para auditoria)
    score_confiabilidade INTEGER,
    
    -- IDs ASAAS (para rastreamento)
    asaas_split_subconta_id VARCHAR(100),
    asaas_transfer_id VARCHAR(100),
    
    criado_em TIMESTAMP DEFAULT NOW(),
    atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_adiant_booking ON adiantamentos(booking_id);
CREATE INDEX idx_adiant_prof ON adiantamentos(profissional_id);
CREATE INDEX idx_adiant_status ON adiantamentos(status);
CREATE INDEX idx_adiant_aprovado ON adiantamentos(aprovado_em) 
  WHERE status = 'aprovado';
```

### 11.3 Jobs Automatizados

**Job 1: Liberar Adiantamentos**
```javascript
// Roda a cada 1 hora
// Verifica adiantamentos aprovados há 24h+

async function liberarAdiantamentos() {
  const adiantamentos = await db.query(`
    SELECT a.*, b.id as booking_id, p.usuario_id
    FROM adiantamentos a
    JOIN bookings b ON a.booking_id = b.id
    JOIN profissionais p ON a.profissional_id = p.id
    WHERE a.status = 'aprovado'
      AND a.aprovado_em <= NOW() - INTERVAL '24 hours'
  `);
  
  for (const adiant of adiantamentos) {
    try {
      // Transfere de subconta para wallet do artista no ASAAS
      const transfer = await asaasAPI.createTransfer({
        fromWallet: adiant.asaas_split_subconta_id,
        toWallet: adiant.asaas_wallet_artista_id,
        value: adiant.valor_adiantamento
      });
      
      // Atualiza status
      await db.query(`
        UPDATE adiantamentos
        SET status = 'liberado',
            liberado_em = NOW(),
            asaas_transfer_id = $1
        WHERE id = $2
      `, [transfer.id, adiant.id]);
      
      // Notifica artista
      await notificationService.send({
        usuario_id: adiant.usuario_id,
        tipo: 'adiantamento_liberado',
        titulo: 'Adiantamento disponível!',
        mensagem: `R$ ${adiant.valor_adiantamento} disponível para saque`,
        booking_id: adiant.booking_id
      });
      
      console.log(`Adiantamento ${adiant.id} liberado`);
    } catch (error) {
      console.error(`Erro ao liberar adiantamento ${adiant.id}:`, error);
      // Admin será notificado para verificar manualmente
    }
  }
}
```

**Job 2: Liberar Valor Restante**
```javascript
// Roda a cada 1 hora
// Libera valor restante após evento + 48h sem disputa

async function liberarValorRestante() {
  const adiantamentos = await db.query(`
    SELECT a.*, b.id as booking_id, b.concluido_em
    FROM adiantamentos a
    JOIN bookings b ON a.booking_id = b.id
    WHERE a.status = 'liberado'
      AND b.status = 'concluido'
      AND b.concluido_em <= NOW() - INTERVAL '48 hours'
      AND NOT EXISTS (
        SELECT 1 FROM disputas d
        WHERE d.booking_id = b.id
          AND d.status IN ('aberta', 'em_analise')
      )
  `);
  
  for (const adiant of adiantamentos) {
    try {
      // Transfere valor restante
      const transfer = await asaasAPI.createTransfer({
        fromWallet: adiant.asaas_subconta_restante_id,
        toWallet: adiant.asaas_wallet_artista_id,
        value: adiant.valor_restante
      });
      
      // Marca pagamento como liberado
      await db.query(`
        UPDATE pagamentos
        SET status = 'liberado_artista',
            liberado_em = NOW()
        WHERE booking_id = $1
      `, [adiant.booking_id]);
      
      // Notifica artista
      await notificationService.send({
        usuario_id: adiant.usuario_id,
        tipo: 'pagamento_liberado',
        titulo: 'Pagamento completo recebido!',
        mensagem: `R$ ${adiant.valor_restante} disponível para saque`,
        booking_id: adiant.booking_id
      });
      
      console.log(`Valor restante do adiantamento ${adiant.id} liberado`);
    } catch (error) {
      console.error(`Erro:`, error);
    }
  }
}
```

**Job 3: Alertar Check-in Pendente**
```javascript
// Roda a cada 30 minutos no dia dos eventos
// Alerta se artista não fez check-in

async function alertarCheckinPendente() {
  const bookingsHoje = await db.query(`
    SELECT b.*, u.id as artista_usuario_id
    FROM bookings b
    JOIN profissionais p ON b.profissional_id = p.id
    JOIN usuarios u ON p.usuario_id = u.id
    WHERE b.data_evento = CURRENT_DATE
      AND b.status = 'confirmado'
      AND b.checkin_artista_em IS NULL
      AND b.horario_inicio <= CURRENT_TIME + INTERVAL '2 hours'
      AND EXISTS (
        SELECT 1 FROM adiantamentos a
        WHERE a.booking_id = b.id
          AND a.status = 'liberado'
      )
  `);
  
  for (const booking of bookingsHoje) {
    // Notifica artista e contratante
    await notificationService.send({
      usuario_id: booking.artista_usuario_id,
      tipo: 'evento_hoje',
      titulo: '⚠️ Lembrete: Evento começa em breve!',
      mensagem: 'Não esqueça de fazer check-in ao chegar no local',
      booking_id: booking.id
    });
    
    // Se faltar 1h e ainda não fez check-in → alerta mais forte
    if (/* 1h antes */) {
      await notificationService.send({
        usuario_id: booking.contratante_id,
        tipo: 'alerta_checkin',
        titulo: 'Artista ainda não fez check-in',
        mensagem: 'O evento começa em 1h. Entre em contato se necessário.',
        booking_id: booking.id
      });
    }
  }
}
# KXRTEX - DOCUMENTAÇÃO TÉCNICA (Parte 4)

## 11. SISTEMA DE ADIANTAMENTO (Continuação)

### 11.3 Jobs Automatizados (Continuação)

**Job 3: Alertar Check-in Pendente**
```javascript
// Roda a cada 30 minutos no dia dos eventos
// Alerta se artista não fez check-in

async function alertarCheckinPendente() {
  const bookingsHoje = await db.query(`
    SELECT b.*, 
           u.id as artista_usuario_id,
           u.nome as artista_nome,
           p.nome_artistico,
           uc.id as contratante_usuario_id,
           uc.nome as contratante_nome
    FROM bookings b
    JOIN profissionais p ON b.profissional_id = p.id
    JOIN usuarios u ON p.usuario_id = u.id
    JOIN usuarios uc ON b.contratante_id = uc.id
    WHERE b.data_evento = CURRENT_DATE
      AND b.status = 'confirmado'
      AND b.checkin_artista_em IS NULL
      AND b.horario_inicio <= CURRENT_TIME + INTERVAL '2 hours'
      AND EXISTS (
        SELECT 1 FROM adiantamentos a
        WHERE a.booking_id = b.id
          AND a.status = 'liberado'
      )
  `);
  
  for (const booking of bookingsHoje) {
    const minutosAteEvento = calcularMinutosAteEvento(booking.horario_inicio);
    
    // 2 horas antes - alerta amigável
    if (minutosAteEvento <= 120 && minutosAteEvento > 60) {
      await notificationService.send({
        usuario_id: booking.artista_usuario_id,
        tipo: 'evento_hoje',
        titulo: '🎵 Seu evento começa em breve!',
        mensagem: `Não esqueça de fazer check-in ao chegar no local`,
        booking_id: booking.id
      });
    }
    
    // 1 hora antes - alerta mais enfático
    if (minutosAteEvento <= 60 && minutosAteEvento > 30) {
      await notificationService.send({
        usuario_id: booking.artista_usuario_id,
        tipo: 'alerta_checkin',
        titulo: '⚠️ IMPORTANTE: Evento em 1 hora!',
        mensagem: `Faça check-in ao chegar no local para confirmar presença`,
        booking_id: booking.id,
        prioridade: 'alta'
      });
      
      // Avisa contratante também
      await notificationService.send({
        usuario_id: booking.contratante_usuario_id,
        tipo: 'evento_hoje',
        titulo: '🎉 Seu evento começa em 1 hora!',
        mensagem: `${booking.nome_artistico} foi alertado`,
        booking_id: booking.id
      });
    }
    
    // 30 minutos antes E sem check-in - alerta crítico
    if (minutosAteEvento <= 30 && minutosAteEvento > 0) {
      await notificationService.send({
        usuario_id: booking.artista_usuario_id,
        tipo: 'alerta_critico',
        titulo: '🚨 CRÍTICO: Check-in pendente!',
        mensagem: `Seu evento começa em ${minutosAteEvento} minutos. FAÇA CHECK-IN AGORA!`,
        booking_id: booking.id,
        prioridade: 'urgente'
      });
      
      // Avisa contratante que artista não fez check-in
      await notificationService.send({
        usuario_id: booking.contratante_usuario_id,
        tipo: 'alerta_checkin',
        titulo: '⚠️ Artista ainda não fez check-in',
        mensagem: `${booking.nome_artistico} ainda não confirmou presença. Entre em contato se necessário.`,
        booking_id: booking.id
      });
    }
    
    // Passou do horário E sem check-in - possível não comparecimento
    if (minutosAteEvento < 0 && Math.abs(minutosAteEvento) <= 60) {
      // Marca como potencial problema
      await db.query(`
        UPDATE bookings
        SET status = 'alerta_nao_comparecimento'
        WHERE id = $1
      `, [booking.id]);
      
      // Notifica admin para monitorar
      await notificationService.sendAdmin({
        tipo: 'possivel_nao_comparecimento',
        titulo: '🚨 Possível não comparecimento',
        mensagem: `${booking.nome_artistico} não fez check-in para evento de ${booking.contratante_nome}`,
        booking_id: booking.id,
        dados: {
          adiantamento_liberado: true,
          tempo_atraso_minutos: Math.abs(minutosAteEvento)
        }
      });
    }
  }
}
```

**Job 4: Processar Eventos Concluídos**
```javascript
// Roda a cada 1 hora
// Processa eventos que aconteceram mas não foram marcados como concluídos

async function processarEventosConcluidos() {
  const eventosOntem = await db.query(`
    SELECT b.*, p.nome_artistico, u.nome as contratante_nome
    FROM bookings b
    JOIN profissionais p ON b.profissional_id = p.id
    JOIN usuarios u ON b.contratante_id = u.id
    WHERE b.data_evento = CURRENT_DATE - INTERVAL '1 day'
      AND b.status IN ('confirmado', 'em_andamento')
      AND b.checkin_artista_em IS NOT NULL
  `);
  
  for (const booking of eventosOntem) {
    // Envia lembrete para contratante marcar como concluído
    await notificationService.send({
      usuario_id: booking.contratante_id,
      tipo: 'avaliar_usuario',
      titulo: 'Como foi o evento?',
      mensagem: `Por favor, marque o evento com ${booking.nome_artistico} como concluído`,
      booking_id: booking.id
    });
    
    // Se passou 48h e não marcou → marca automaticamente
    if (booking.data_evento <= CURRENT_DATE - INTERVAL '2 days') {
      await db.query(`
        UPDATE bookings
        SET status = 'concluido',
            concluido_em = $1
        WHERE id = $2
      `, [new Date(), booking.id]);
      
      await notificationService.send({
        usuario_id: booking.contratante_id,
        tipo: 'sistema',
        titulo: 'Evento marcado como concluído',
        mensagem: 'O evento foi automaticamente marcado como concluído. Você ainda pode avaliá-lo.',
        booking_id: booking.id
      });
      
      console.log(`Booking ${booking.id} marcado automaticamente como concluído`);
    }
  }
}
```

**Job 5: Expirar Indicações**
```javascript
// Roda diariamente às 3h da manhã
// Expira indicações pendentes após 90 dias

async function expirarIndicacoesPendentes() {
  const indicacoesExpiradas = await db.query(`
    UPDATE indicacoes
    SET status = 'expirado'
    WHERE status = 'pendente'
      AND criado_em <= NOW() - INTERVAL '90 days'
    RETURNING *
  `);
  
  console.log(`${indicacoesExpiradas.rows.length} indicações expiradas`);
  
  // Notifica indicadores
  for (const indicacao of indicacoesExpiradas.rows) {
    await notificationService.send({
      usuario_id: indicacao.indicador_id,
      tipo: 'indicacao_expirada',
      titulo: 'Indicação expirou',
      mensagem: `Sua indicação para ${indicacao.codigo_indicacao} expirou após 90 dias sem atividade`
    });
  }
}
```

---

## 12. MODERAÇÃO E SEGURANÇA

### 12.1 Sistema de Detecção Automática

**Regex Patterns para Detecção:**

```javascript
const DETECTION_PATTERNS = {
  // Telefones
  telefone: [
    /(\d{2})\s*\d{4,5}[-\s]?\d{4}/g,
    /\(?\d{2}\)?\s*\d{4,5}[-\s]?\d{4}/g,
    /\d{10,11}/g
  ],
  
  // WhatsApp
  whatsapp: [
    /whats?app/gi,
    /\bwpp\b/gi,
    /\bzap\b/gi,
    /zapzap/gi
  ],
  
  // Instagram
  instagram: [
    /@[\w.]+/g,
    /\binstagram\b/gi,
    /\binsta\b/gi,
    /\big\b/gi
  ],
  
  // Email
  email: [
    /[\w.-]+@[\w.-]+\.\w+/g
  ],
  
  // Links
  links: [
    /https?:\/\/[^\s]+/g,
    /www\.[^\s]+/g,
    /\.(com|br|net|org)[^\s]*/g
  ],
  
  // Frases suspeitas
  frasesProibidas: [
    /fora do app/gi,
    /fora da plataforma/gi,
    /contato direto/gi,
    /sem taxa/gi,
    /pagar por fora/gi,
    /combinar por fora/gi,
    /me add/gi,
    /me adiciona/gi,
    /chama no/gi,
    /me chama/gi
  ]
};

function detectarContatoExterno(mensagem) {
  const violacoes = [];
  
  // Testa cada pattern
  for (const [tipo, patterns] of Object.entries(DETECTION_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(mensagem)) {
        violacoes.push({
          tipo,
          pattern: pattern.toString(),
          match: mensagem.match(pattern)
        });
      }
    }
  }
  
  return {
    detectado: violacoes.length > 0,
    violacoes,
    confianca: calcularConfianca(violacoes)
  };
}

function calcularConfianca(violacoes) {
  // Calcula confiança da detecção (0-100)
  let confianca = 0;
  
  for (const v of violacoes) {
    if (v.tipo === 'telefone') confianca += 40;
    if (v.tipo === 'email') confianca += 40;
    if (v.tipo === 'whatsapp') confianca += 30;
    if (v.tipo === 'instagram') confianca += 25;
    if (v.tipo === 'links') confianca += 35;
    if (v.tipo === 'frasesProibidas') confianca += 20;
  }
  
  return Math.min(confianca, 100);
}
```

**Middleware de Validação:**

```javascript
async function validarMensagem(req, res, next) {
  const { mensagem, booking_id, remetente_id } = req.body;
  
  // Detecta contato externo
  const deteccao = detectarContatoExterno(mensagem);
  
  if (deteccao.detectado && deteccao.confianca >= 60) {
    // Bloqueia mensagem
    await db.query(`
      INSERT INTO mensagens (
        booking_id, remetente_id, destinatario_id, 
        mensagem, tipo, bloqueada, motivo_bloqueio
      ) VALUES ($1, $2, $3, $4, 'texto', true, $5)
    `, [
      booking_id, 
      remetente_id, 
      req.destinatario_id,
      mensagem,
      JSON.stringify(deteccao.violacoes)
    ]);
    
    // Registra infração
    await registrarInfracao({
      usuario_id: remetente_id,
      tipo: 'contato_externo',
      gravidade: deteccao.confianca >= 80 ? 'grave' : 'media',
      descricao: `Tentativa de compartilhar contato externo`,
      evidencias: deteccao.violacoes,
      relacionado_a_booking_id: booking_id
    });
    
    // Verifica histórico de infrações
    const infracoesRecentes = await db.query(`
      SELECT COUNT(*) as total
      FROM infracoes
      WHERE usuario_id = $1
        AND tipo = 'contato_externo'
        AND criado_em >= NOW() - INTERVAL '90 days'
    `, [remetente_id]);
    
    const totalInfracoes = parseInt(infracoesRecentes.rows[0].total) + 1;
    
    // Aplica penalidade progressiva
    if (totalInfracoes === 1) {
      // 1ª vez: apenas warning
      return res.status(400).json({
        success: false,
        error: {
          code: 'MENSAGEM_BLOQUEADA',
          message: 'Detectamos tentativa de compartilhar contato externo.',
          detalhes: 'Por favor, mantenha todas negociações dentro da plataforma para sua segurança.',
          strikes: 1,
          acao: 'warning'
        }
      });
    } else if (totalInfracoes === 2) {
      // 2ª vez: suspensão 7 dias
      await suspenderUsuario(remetente_id, 7, 'Tentativa repetida de compartilhar contato externo');
      
      return res.status(403).json({
        success: false,
        error: {
          code: 'USUARIO_SUSPENSO',
          message: 'Sua conta foi suspensa por 7 dias.',
          detalhes: 'Tentativa repetida de compartilhar contato externo viola nossos termos.',
          strikes: 2,
          acao: 'suspensao_7d',
          liberacao_em: moment().add(7, 'days').toISOString()
        }
      });
    } else if (totalInfracoes >= 3) {
      // 3ª vez: banimento
      await banirUsuario(remetente_id, 'Tentativa repetida de contornar plataforma');
      
      return res.status(403).json({
        success: false,
        error: {
          code: 'USUARIO_BANIDO',
          message: 'Sua conta foi banida permanentemente.',
          detalhes: 'Violação repetida dos termos de uso.',
          strikes: 3,
          acao: 'banimento'
        }
      });
    }
  }
  
  // Se passou todas validações, continua
  next();
}
```

### 12.2 Sistema de Infrações e Punições

**Tipos de Infrações:**

```javascript
const TIPOS_INFRACOES = {
  // LEVES (warning)
  contato_externo_primeira: {
    gravidade: 'leve',
    acao: 'warning',
    descricao: 'Primeira tentativa de compartilhar contato'
  },
  linguagem_inadequada: {
    gravidade: 'leve',
    acao: 'warning',
    descricao: 'Uso de linguagem ofensiva'
  },
  spam_mensagens: {
    gravidade: 'leve',
    acao: 'warning',
    descricao: 'Envio excessivo de mensagens'
  },
  
  // MÉDIAS (suspensão temporária)
  contato_externo_repetido: {
    gravidade: 'media',
    acao: 'suspensao_7d',
    descricao: 'Tentativa repetida de contornar plataforma'
  },
  cancelamento_sem_justificativa_repetido: {
    gravidade: 'media',
    acao: 'suspensao_15d',
    descricao: 'Múltiplos cancelamentos sem justificativa válida'
  },
  perfil_incompleto_proposital: {
    gravidade: 'media',
    acao: 'suspensao_7d',
    descricao: 'Perfil com informações falsas ou enganosas'
  },
  
  // GRAVES (banimento)
  nao_comparecimento_com_adiantamento: {
    gravidade: 'grave',
    acao: 'banimento',
    descricao: 'Não comparecimento ao evento após receber adiantamento'
  },
  fraude_comprovada: {
    gravidade: 'grave',
    acao: 'banimento',
    descricao: 'Tentativa de fraude comprovada'
  },
  perfil_falso: {
    gravidade: 'grave',
    acao: 'banimento',
    descricao: 'Uso de identidade falsa'
  },
  assedio: {
    gravidade: 'grave',
    acao: 'banimento',
    descricao: 'Assédio ou ameaças'
  },
  discriminacao: {
    gravidade: 'grave',
    acao: 'banimento',
    descricao: 'Discriminação ou discurso de ódio'
  }
};

async function registrarInfracao(dados) {
  const {
    usuario_id,
    tipo,
    gravidade,
    descricao,
    evidencias,
    relacionado_a_booking_id,
    relacionado_a_mensagem_id
  } = dados;
  
  const infracao = await db.query(`
    INSERT INTO infracoes (
      usuario_id, tipo, gravidade, descricao,
      evidencias_urls, relacionado_a_booking_id,
      relacionado_a_mensagem_id
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `, [
    usuario_id, tipo, gravidade, descricao,
    JSON.stringify(evidencias),
    relacionado_a_booking_id,
    relacionado_a_mensagem_id
  ]);
  
  // Notifica admin se grave
  if (gravidade === 'grave') {
    await notificationService.sendAdmin({
      tipo: 'infracao_grave',
      titulo: '🚨 Infração Grave Detectada',
      mensagem: `Usuário ${usuario_id} - ${descricao}`,
      usuario_id,
      dados: infracao.rows[0]
    });
  }
  
  return infracao.rows[0];
}
```

**Funções de Punição:**

```javascript
async function suspenderUsuario(usuario_id, dias, motivo) {
  const data_suspensao_ate = moment().add(dias, 'days').toDate();
  
  await db.query(`
    UPDATE usuarios
    SET status = 'suspenso',
        motivo_suspensao = $1,
        data_suspensao_ate = $2
    WHERE id = $3
  `, [motivo, data_suspensao_ate, usuario_id]);
  
  // Cancela bookings futuros como artista
  await db.query(`
    UPDATE bookings b
    SET status = 'cancelado_artista',
        motivo_cancelamento = 'Artista suspenso pela plataforma'
    WHERE b.profissional_id IN (
      SELECT id FROM profissionais WHERE usuario_id = $1
    )
    AND b.status IN ('pendente', 'em_negociacao', 'aceito', 'confirmado')
    AND b.data_evento > CURRENT_DATE
  `, [usuario_id]);
  
  // Notifica usuário
  await notificationService.send({
    usuario_id,
    tipo: 'suspensao',
    titulo: 'Conta Suspensa',
    mensagem: `Sua conta foi suspensa por ${dias} dias. Motivo: ${motivo}`,
    dados: { liberacao_em: data_suspensao_ate }
  });
  
  // Envia email
  await emailService.send({
    to: usuario_id,
    template: 'suspensao',
    data: {
      dias,
      motivo,
      data_liberacao: data_suspensao_ate
    }
  });
  
  console.log(`Usuário ${usuario_id} suspenso por ${dias} dias`);
}

async function banirUsuario(usuario_id, motivo) {
  await db.query(`
    UPDATE usuarios
    SET status = 'banido',
        motivo_suspensao = $1
    WHERE id = $2
  `, [motivo, usuario_id]);
  
  // Cancela TODOS os bookings futuros
  await db.query(`
    UPDATE bookings b
    SET status = CASE 
      WHEN b.contratante_id = $1 THEN 'cancelado_contratante'
      ELSE 'cancelado_artista'
    END,
    motivo_cancelamento = 'Usuário banido da plataforma'
    WHERE (b.contratante_id = $1 OR b.profissional_id IN (
      SELECT id FROM profissionais WHERE usuario_id = $1
    ))
    AND b.status NOT IN ('concluido', 'cancelado_contratante', 'cancelado_artista')
    AND b.data_evento >= CURRENT_DATE
  `, [usuario_id]);
  
  // Processa reembolsos para contratantes afetados
  // (implementar lógica de reembolso)
  
  // Notifica usuário
  await notificationService.send({
    usuario_id,
    tipo: 'banimento',
    titulo: 'Conta Banida',
    mensagem: `Sua conta foi banida permanentemente. Motivo: ${motivo}`
  });
  
  await emailService.send({
    to: usuario_id,
    template: 'banimento',
    data: { motivo }
  });
  
  console.log(`Usuário ${usuario_id} BANIDO permanentemente`);
}

async function advertirUsuario(usuario_id, motivo) {
  await notificationService.send({
    usuario_id,
    tipo: 'advertencia',
    titulo: '⚠️ Advertência',
    mensagem: motivo
  });
  
  await emailService.send({
    to: usuario_id,
    template: 'advertencia',
    data: { motivo }
  });
}
```

### 12.3 Painel de Moderação (Admin)

**Fila de Denúncias:**

```javascript
// GET /admin/denuncias
async function listarDenuncias(req, res) {
  const { status, prioridade, tipo, pagina = 1, limite = 20 } = req.query;
  
  let query = `
    SELECT 
      d.*,
      u_denunciante.nome as denunciante_nome,
      u_denunciado.nome as denunciado_nome,
      u_denunciado.tipo as denunciado_tipo,
      b.id as booking_id,
      (
        SELECT COUNT(*) 
        FROM infracoes i 
        WHERE i.usuario_id = d.denunciado_id
          AND i.criado_em >= NOW() - INTERVAL '90 days'
      ) as infracoes_recentes
    FROM denuncias d
    JOIN usuarios u_denunciante ON d.denunciante_id = u_denunciante.id
    JOIN usuarios u_denunciado ON d.denunciado_id = u_denunciado.id
    LEFT JOIN bookings b ON d.relacionado_a_booking_id = b.id
    WHERE 1=1
  `;
  
  const params = [];
  let paramIndex = 1;
  
  if (status) {
    query += ` AND d.status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }
  
  if (prioridade) {
    query += ` AND d.prioridade = $${paramIndex}`;
    params.push(prioridade);
    paramIndex++;
  }
  
  if (tipo) {
    query += ` AND d.tipo = $${paramIndex}`;
    params.push(tipo);
    paramIndex++;
  }
  
  query += ` ORDER BY 
    CASE d.prioridade
      WHEN 'urgente' THEN 1
      WHEN 'alta' THEN 2
      WHEN 'media' THEN 3
      ELSE 4
    END,
    d.criado_em DESC
  `;
  
  query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limite, (pagina - 1) * limite);
  
  const denuncias = await db.query(query, params);
  
  res.json({
    success: true,
    data: denuncias.rows
  });
}

// PUT /admin/denuncias/:id/analisar
async function analisarDenuncia(req, res) {
  const { id } = req.params;
  const { decisao, observacoes, acao_tomada } = req.body;
  const admin_id = req.user.id;
  
  // Atualiza denúncia
  await db.query(`
    UPDATE denuncias
    SET status = 'analisada',
        decisao = $1,
        observacoes_admin = $2,
        acao_tomada = $3,
        analisada_em = NOW(),
        admin_responsavel_id = $4
    WHERE id = $5
  `, [decisao, observacoes, acao_tomada, admin_id, id]);
  
  // Busca dados da denúncia
  const denuncia = await db.query(`
    SELECT * FROM denuncias WHERE id = $1
  `, [id]);
  
  const d = denuncia.rows[0];
  
  // Aplica ação
  switch (acao_tomada) {
    case 'advertencia':
      await advertirUsuario(d.denunciado_id, d.motivo);
      break;
    case 'suspensao_7d':
      await suspenderUsuario(d.denunciado_id, 7, d.motivo);
      break;
    case 'suspensao_15d':
      await suspenderUsuario(d.denunciado_id, 15, d.motivo);
      break;
    case 'suspensao_30d':
      await suspenderUsuario(d.denunciado_id, 30, d.motivo);
      break;
    case 'banimento':
      await banirUsuario(d.denunciado_id, d.motivo);
      break;
    case 'denuncia_improcedente':
      // Não faz nada, apenas registra
      break;
  }
  
  // Notifica denunciante sobre resultado
  await notificationService.send({
    usuario_id: d.denunciante_id,
    tipo: 'denuncia_resolvida',
    titulo: 'Denúncia Analisada',
    mensagem: `Sua denúncia foi analisada. Ação tomada: ${acao_tomada}`
  });
  
  res.json({
    success: true,
    message: 'Denúncia analisada com sucesso'
  });
}
```

---

## 13. NOTIFICAÇÕES (Detalhado)

### 13.1 Tipos de Notificações

**Matriz Completa:**

```javascript
const NOTIFICATION_TYPES = {
  // BOOKINGS - Urgente (🔴)
  nova_proposta: {
    categoria: 'booking',
    prioridade: 'urgente',
    titulo: 'Nova proposta recebida!',
    template: '{contratante_nome} enviou uma proposta para {data_evento}',
    push: true,
    email: true,
    som: 'notification_high.mp3'
  },
  proposta_aceita: {
    categoria: 'booking',
    prioridade: 'urgente',
    titulo: 'Proposta aceita! 🎉',
    template: '{artista_nome} aceitou sua proposta',
    push: true,
    email: true,
    som: 'notification_success.mp3'
  },
  proposta_expirando: {
    categoria: 'booking',
    prioridade: 'urgente',
    titulo: '⏰ Proposta expira em 6h!',
    template: 'Responda a proposta de {usuario_nome}',
    push: true,
    email: false
  },
  
  // BOOKINGS - Importante (🟡)
  contra_proposta: {
    categoria: 'booking',
    prioridade: 'importante',
    titulo: 'Contra-proposta recebida',
    template: '{artista_nome} enviou uma contra-proposta de R$ {valor}',
    push: true,
    email: true
  },
  proposta_recusada: {
    categoria: 'booking',
    prioridade: 'importante',
    titulo: 'Proposta recusada',
    template: '{artista_nome} não pode atender nesta data',
    push: true,
    email: false
  },
  
  // MENSAGENS (🔵)
  nova_mensagem: {
    categoria: 'mensagem',
    prioridade: 'normal',
    titulo: 'Nova mensagem',
    template: '{remetente_nome}: {preview_mensagem}',
    push: true,
    email: false,
    badge: true
  },
  
  // PAGAMENTOS (💰)
  pagamento_confirmado: {
    categoria: 'pagamento',
    prioridade: 'urgente',
    titulo: 'Pagamento confirmado! ✓',
    template: 'R$ {valor} recebido com sucesso',
    push: true,
    email: true,
    som: 'notification_money.mp3'
  },
  adiantamento_liberado: {
    categoria: 'pagamento',
    prioridade: 'urgente',
    titulo: 'Adiantamento disponível! 💰',
    template: 'R$ {valor} disponível para saque',
    push: true,
    email: true
  },
  saque_processado: {
    categoria: 'pagamento',
    prioridade: 'importante',
    titulo: 'Saque concluído',
    template: 'R$ {valor} transferido para sua conta',
    push: true,
    email: true
  },
  
  // EVENTOS (📅)
  evento_amanha: {
    categoria: 'evento',
    prioridade: 'importante',
    titulo: '📅 Lembrete: Evento amanhã!',
    template: 'Seu evento com {usuario_nome} é amanhã às {horario}',
    push: true,
    email: true
  },
  evento_hoje: {
    categoria: 'evento',
    prioridade: 'urgente',
    titulo: '🎵 Seu evento é hoje!',
    template: 'Evento às {horario} - {local_cidade}',
    push: true,
    email: false
  },
  
  // AVALIAÇÕES (⭐)
  nova_avaliacao: {
    categoria: 'avaliacao',
    prioridade: 'normal',
    titulo: 'Nova avaliação recebida',
    template: '{avaliador_nome} te avaliou com {nota} estrelas',
    push: true,
    email: false
  },
  avaliar_usuario: {
    categoria: 'avaliacao',
    prioridade: 'normal',
    titulo: 'Avalie {usuario_nome}',
    template: 'Como foi sua experiência?',
    push: true,
    email: false
  },
  
  // SEGUIR (⭐)
  novo_seguidor: {
    categoria: 'social',
    prioridade: 'baixa',
    titulo: 'Novo seguidor!',
    template: '{seguidor_nome} começou a te seguir',
    push: true,
    email: false
  },
  artista_seguido_atualizou: {
    categoria: 'social',
    prioridade: 'baixa',
    titulo: '{artista_nome} atualizou o perfil',
    template: 'Confira as novidades',
    push: true,
    email: false
  },
  
  // INDICAÇÕES (👥)
  indicacao_concluida: {
    categoria: 'indicacao',
    prioridade: 'normal',
    titulo: 'Indicação concluída! 🎉',
    template: '{indicado_nome} fez o primeiro booking. Você ganhou R$ 25!',
    push: true,
    email: true
  },
  
  // SISTEMA/ADMIN (🔧)
  verificacao_aprovada: {
    categoria: 'sistema',
    prioridade: 'importante',
    titulo: 'Perfil verificado! ✓',
    template: 'Parabéns! Seu perfil agora tem o selo verificado',
    push: true,
    email: true
  },
  suspensao: {
    categoria: 'sistema',
    prioridade: 'urgente',
    titulo: 'Conta Suspensa',
    template: 'Sua conta foi suspensa. Verifique seu email.',
    push: true,
    email: true,
    som: 'notification_alert.mp3'
  }
};
```

### 13.2 Sistema de Envio

**Service de Notificações:**

```javascript
class NotificationService {
  
  // Envia notificação individual
  async send(dados) {
    const {
      usuario_id,
      tipo,
      titulo,
      mensagem,
      booking_id = null,
      outro_usuario_id = null,
      dados_extras = null
    } = dados;
    
    // Verifica configurações do usuário
    const config = await this.getUsuarioConfig(usuario_id);
    const tipoConfig = NOTIFICATION_TYPES[tipo];
    
    if (!config || !tipoConfig) return;
    
    // Verifica modo "não perturbe"
    if (this.isNaoPertube(config)) {
      console.log(`Usuário ${usuario_id} em modo não perturbe - notificação agendada`);
      await this.agendarParaDepois(dados);
      return;
    }
    
    // Salva no banco
    const notif = await db.query(`
      INSERT INTO notificacoes (
        usuario_id, tipo, titulo, mensagem,
        booking_id, outro_usuario_id, dados_extras
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      usuario_id, tipo, titulo, mensagem,
      booking_id, outro_usuario_id,
      JSON.stringify(dados_extras)
    ]);
    
    // Push notification
    if (tipoConfig.push && config.push_enabled) {
      await this.sendPush(usuario_id, {
        title: titulo,
        body: mensagem,
        data: {
          tipo,
          booking_id,
          notificacao_id: notif.rows[0].id
        },
        sound: tipoConfig.som || 'default',
        badge: tipoConfig.badge ? await this.getBadgeCount(usuario_id) : null
      });
      
      await db.query(`
        UPDATE notificacoes
        SET enviada_push = true,
            enviada_push_em = NOW()
        WHERE id = $1
      `, [notif.rows[0].id]);
    }
    
    // Email (apenas para tipos importantes)
    if (tipoConfig.email && config.email_enabled) {
      await emailService.send({
        to: usuario_id,
        template: `notificacao_${tipo}`,
        subject: titulo,
        data: {
          mensagem,
          booking_id,
          dados_extras
        }
      });
    }
    
    return notif.rows[0];
  }
  
  // Envia push via Firebase
  async sendPush(usuario_id, payload) {
    // Busca token do dispositivo
    const tokens = await db.query(`
      SELECT fcm_token FROM dispositivos
      WHERE usuario_id = $1 AND ativo = true
    `, [usuario_id]);
    
    if (tokens.rows.length === 0) {
      console.log(`Usuário ${usuario_id} sem tokens FCM`);
      return;
    }
    
    const messages = tokens.rows.map(t => ({
      token: t.fcm_token,
      notification: {
        title: payload.title,
        body: payload.body
      },
      data: payload.data,
      android: {
        notification: {
          sound: payload.sound,
          channelId: 'kxrtex_notifications'
        }
      },
      apns: {
        payload: {
          aps: {
            badge: payload.badge,
            sound: payload.sound
          }
        }
      }
    }));
    
    try {
      const response = await admin.messaging().sendAll(messages);
      console.log(`Push enviado: ${response.successCount} sucesso, ${response.failureCount} falhas`);
      
      // Remove tokens inválidos
      response.responses.forEach((resp, idx) => {
        if (!resp.success && 
            (resp.error.code === 'messaging/invalid-registration-token' ||
             resp.error.code === 'messaging/registration-token-not-registered')) {
          this.removeToken(tokens.rows[idx].fcm_token);
        }
      });
      
      return response;
    } catch (error) {
      console.error('Erro ao enviar push:', error);
      throw error;
    }
  }
  
  // Verifica se está em horário "não perturbe"
  isNaoPertube(config) {
    if (!config.nao_perturbe_ativo) return false;
    
    const agora = moment();
    const inicio = moment(config.nao_perturbe_inicio, 'HH:mm');
    const fim = moment(config.nao_perturbe_fim, 'HH:mm');
    
    // Se início > fim, cruza meia-noite
    if (inicio.isAfter(fim)) {
      return agora.isAfter(inicio) || agora.isBefore(fim);
    } else {
      return agora.isBetween(inicio, fim);
    }
  }
  
  // Agenda notificação para depois do período "não perturbe"
  async agendarParaDepois(dados) {
    await db.query(`
      INSERT INTO notificacoes_agendadas (dados, enviar_em)
      VALUES ($1, $2)
    `, [
      JSON.stringify(dados),
      moment().add(1, 'hour').toDate() // Tenta em 1h
    ]);
  }
  
  // Conta notificações não lidas (para badge)
  async getBadgeCount(usuario_id) {
    const result = await db.query(`
      SELECT COUNT(*) as total
      FROM notificacoes
      WHERE usuario_id = $1 AND lida = false
    `, [usuario_id]);
    
    return parseInt(result.rows[0].total);
  }
  
  // Busca configurações do usuário
  async getUsuarioConfig(usuario_id) {
    const config = await db.query(`
      SELECT * FROM notificacoes_config
      WHERE usuario_id = $1
    `, [usuario_id]);
    
    if (config.rows.length === 0) {
      // Retorna config padrão
      return {
        push_enabled: true,
        email_enabled: true,
        nao_perturbe_ativo: false
      };
    }
    
    return config.rows[0];
  }
  
  // Envia notificação em lote
  async sendBatch(notificacoes) {
    const promises = notificacoes.map(n => this.send(n));
    return Promise.all(promises);
  }
  
  // Envia para admin
  async sendAdmin(dados) {
    const admins = await db.query(`
      SELECT id FROM usuarios WHERE tipo = 'admin'
    `);
    
    const notificacoes = admins.rows.map(admin => ({
      usuario_id: admin.id,
      ...dados
    }));
    
    return this.sendBatch(notificacoes);
  }
}

module.exports = new NotificationService();
```

### 13.3 Jobs de Notificações Automáticas

**Job: Lembretes de Eventos**
```javascript
// Roda a cada 1 hora
async function enviarLembretesEventos() {
  // Eventos amanhã
  const eventosAmanha = await db.query(`
    SELECT b.*, 
           uc.id as contratante_id,
           p.usuario_id as artista_usuario_id,
           p.nome_artistico
    FROM bookings b
    JOIN usuarios uc ON b.contratante_id = uc.id
    JOIN profissionais p ON b.profissional_id = p.id
    WHERE b.data_evento = CURRENT_DATE + INTERVAL '1 day'
      AND b.status = 'confirmado'
      AND NOT EXISTS (
        SELECT 1 FROM notificacoes n
        WHERE n.booking_id = b.id
          AND n.tipo = 'evento_amanha'
          AND n.criado_em >= CURRENT_DATE
      )
  `);
  
  for (const booking of eventosAmanha.rows) {
    // Notifica contratante
    await notificationService.send({
      usuario_id: booking.contratante_id,
      tipo: 'evento_amanha',
      titulo: '📅 Lembrete: Evento amanhã!',
      mensagem: `Seu evento com ${booking.nome_artistico} é amanhã às ${booking.horario_inicio}`,
      booking_id: booking.id
    });
    
    // Notifica artista
    await notificationService.send({
      usuario_id: booking.artista_usuario_id,
      tipo: 'evento_amanha',
      titulo: '🎵 Lembrete: Você tem um evento amanhã!',
      mensagem: `Evento às ${booking.horario_inicio} em ${booking.local_cidade}`,
      booking_id: booking.id
    });
  }
  
  console.log(`${eventosAmanha.rows.length} lembretes de eventos enviados`);
}
```

**Job: Processar Notificações Agendadas**
```javascript
// Roda a cada 15 minutos
async function processarNotificacoesAgendadas() {
  const agendadas = await db.query(`
    SELECT * FROM notificacoes_agendadas
    WHERE enviar_em <= NOW()
      AND enviada = false
    LIMIT 100
  `);
  
  for (const agendada of agendadas.rows) {
    try {
      const dados = JSON.parse(agendada.dados);
      await notificationService.send(dados);
      
      await db.query(`
        UPDATE notificacoes_agendadas
        SET enviada = true,
            enviada_em = NOW()
        WHERE id = $1
      `, [agendada.id]);
    } catch (error) {
      console.error(`Erro ao enviar notificação agendada ${agendada.id}:`, error);
    }
  }
}
```

---

## 14. GAMIFICAÇÃO

### 14.1 Sistema de Badges

**Badges Disponíveis:**

```javascript
const BADGES = {
  // Onboarding
  perfil_completo: {
    nome: 'Perfil Completo',
    descricao: 'Completou 100% do perfil',
    icone: '✓',
    tipo: 'bronze'
  },
  primeiro_booking: {
    nome: 'Primeira Vez',
    descricao: 'Completou o primeiro booking',
    icone: '🎵',
    tipo: 'bronze'
  },
  
  // Experiência
  novato: {
    nome: 'Novato',
    descricao: '5 bookings concluídos',
    icone: '🌱',
    tipo: 'bronze',
    requisito: { bookings: 5 }
  },
  experiente: {
    nome: 'Experiente',
    descricao: '25 bookings concluídos',
    icone: '🎸',
    tipo: 'prata',
    requisito: { bookings: 25 }
  },
  veterano: {
    nome: 'Veterano',
    descricao: '50 bookings concluídos',
    icone: '🎹',
    tipo: 'ouro',
    requisito: { bookings: 50 }
  },
  lendario: {
    nome: 'Lendário',
    descricao: '100 bookings concluídos',
    icone: '👑',
    tipo: 'diamante',
    requisito: { bookings: 100 }
  },
  
  // Qualidade
  top_avaliado: {
    nome: 'Top Avaliado',
    descricao: 'Avaliação média 4.8+',
    icone: '⭐',
    tipo: 'ouro',
    requisito: { avaliacao_min: 4.8, total_avaliacoes_min: 10 }
  },
  cinco_estrelas: {
    nome: '5 Estrelas',
    descricao: '10 avaliações 5 estrelas consecutivas',
    icone: '🌟',
    tipo: 'diamante',
    requisito: { cinco_estrelas_consecutivas: 10 }
  },
  
  // Popularidade
  promissor: {
    nome: 'Promissor',
    descricao: '10 seguidores',
    icone: '🌟',
    tipo: 'bronze',
    requisito: { seguidores: 10 }
  },
  em_alta: {
    nome: 'Em Alta',
    descricao: '50 seguidores',
    icone: '⭐',
    tipo: 'prata',
    requisito: { seguidores: 50 }
  },
  popular: {
    nome: 'Popular',
    descricao: '100 seguidores',
    icone: '🔥',
    tipo: 'ouro',
    requisito: { seguidores: 100 }
  },
  
  // Especiais
  verificado: {
    nome: 'Verificado',
    descricao: 'Perfil verificado oficialmente',
    icone: '✓',
    tipo: 'especial'
  },
  embaixador: {
    nome: 'Embaixador',
    descricao: '100 indicações concluídas',
    icone: '👥',
    tipo: 'especial',
    requisito: { indicacoes: 100 }
  },
  avaliador_confiavel: {
    nome: 'Avaliador Confiável',
    descricao: 'Avaliou 50+ bookings',
    icone: '📝',
    tipo: 'prata',
    requisito: { avaliacoes_dadas: 50 }
  },
  
  // Engajamento
  ativo: {
    nome: 'Sempre Ativo',
    descricao: '30 dias consecutivos com login',
    icone: '🔥',
    tipo: 'ouro',
    requisito: { dias_consecutivos: 30 }
  }
};
```

**Sistema de Verificação de Badges:**

```javascript
async function verificarEConcederBadges(usuario_id) {
  const usuario = await db.query(`
    SELECT u.*, p.*
    FROM usuarios u
    LEFT JOIN profissionais p ON u.id = p.usuario_id
    WHERE u.id = $1
  `, [usuario_id]);
  
  if (usuario.rows.length === 0) return;
  
  const user = usuario.rows[0];
  const badgesConcedidos = [];
  
  // Verifica cada badge
  for (const [key, badge] of Object.entries(BADGES)) {
    // Já tem este badge?
    const jatem = await db.query(`
      SELECT 1 FROM usuarios_badges
      WHERE usuario_id = $1 AND badge_key = $2
    `, [usuario_id, key]);
    
    if (jatem.rows.length > 0) continue; // Já tem
    
    // Verifica requisitos
    if (await verificarRequisitos(user, badge.requisito)) {
      // Concede badge
      await db.query(`
        INSERT INTO usuarios_badges (usuario_id, badge_key)
        VALUES ($1, $2)
      `, [usuario_id, key]);
      
      badgesConcedidos.push(badge);
      
      // Notifica usuário
      await notificationService.send({
        usuario_id,
        tipo: 'badge_conquistado',
        titulo: `🏆 Badge Desbloqueado: ${badge.nome}!`,
        mensagem: badge.descricao
      });
    }
  }
  
  return badgesConcedidos;
}

async function verificarRequisitos(user, requisito) {
  if (!requisito) return true; // Sem requisitos
  
  if (requisito.bookings) {
    if (user.total_bookings < requisito.bookings) return false;
  }
  
  if (requisito.avaliacao_min && requisito.total_avaliacoes_min) {
    if (user.avaliacao_media < requisito.avaliacao_min) return false;
    if (user.total_avaliacoes < requisito.total_avaliacoes_min) return false;
  }
  
  if (requisito.seguidores) {
    if (user.total_seguidores < requisito.seguidores) return false;
  }
  
  if (requisito.indicacoes) {
    const indicacoes = await db.query(`
      SELECT COUNT(*) as total
      FROM indicacoes
      WHERE indicador_id = $1 AND status = 'concluido'
    `, [user.id]);
    
    if (parseInt(indicacoes.rows[0].total) < requisito.indicacoes) return false;
  }
  
  if (requisito.avaliacoes_dadas) {
    const avaliacoes = await db.query(`
      SELECT COUNT(*) as total
      FROM avaliacoes
      WHERE avaliador_id = $1
    `, [user.id]);
    
    if (parseInt(avaliacoes.rows[0].total) < requisito.avaliacoes_dadas) return false;
  }
  
  // Outros requisitos específicos...
  
  return true;
}
```

### 14.2 Leaderboards

**Ranking Mensal de Indicadores:**

```javascript
// GET /leaderboard/indicadores
async function getLeaderboardIndicadores(req, res) {
  const { mes = moment().month() + 1, ano = moment().year() } = req.query;
  const usuario_id = req.user.id;
  
  const ranking = await db.query(`
    SELECT 
      u.id,
      u.nome,
      u.foto_perfil_url,
      COUNT(i.id) as total_indicacoes,
      ROW_NUMBER() OVER (ORDER BY COUNT(i.id) DESC) as posicao
    FROM usuarios u
    INNER JOIN indicacoes i ON u.id = i.indicador_id
    WHERE i.status = 'concluido'
      AND EXTRACT(MONTH FROM i.concluido_em) = $1
      AND EXTRACT(YEAR FROM i.concluido_em) = $2
    GROUP BY u.id
    ORDER BY total_indicacoes DESC
    LIMIT 100
  `, [mes, ano]);
  
  // Busca posição do usuário logado
  const minhaPosicao = ranking.rows.findIndex(r => r.id === usuario_id) + 1;
  
  res.json({
    success: true,
    data: {
      mes,
      ano,
      minha_posicao: minhaPosicao || null,
      minhas_indicacoes: minhaPosicao ? ranking.rows[minhaPosicao - 1].total_indicacoes : 0,
      top_10: ranking.rows.slice(0, 10).map(r => ({
        posicao: parseInt(r.posicao),
        nome: r.nome,
        foto: r.foto_perfil_url,
        total_indicacoes: parseInt(r.total_indicacoes),
        eh_voce: r.id === usuario_id
      })),
      premio_primeiro_lugar: 'R$ 500'
    }
  });
}
```

**Ranking de Artistas por Cidade:**

```javascript
// GET /leaderboard/artistas/:cidade
async function getLeaderboardArtistas(req, res) {
  const { cidade } = req.params;
  const { categoria_id } = req.query;
  
  let query = `
    SELECT 
      p.id,
      p.nome_artistico,
      u.foto_perfil_url,
      p.avaliacao_media,
      p.total_bookings,
      p.total_seguidores,
      c.nome as categoria,
      ROW_NUMBER() OVER (ORDER BY p.total_bookings DESC, p.avaliacao_media DESC) as posicao
    FROM profissionais p
    JOIN usuarios u ON p.usuario_id = u.id
    JOIN categorias c ON p.categoria_id = c.id
    WHERE $1 = ANY(p.cidades_atuacao)
      AND u.status = 'ativo'
      AND p.total_bookings >= 5
  `;
  
  const params = [cidade];
  
  if (categoria_id) {
    query += ` AND p.categoria_id = $2`;
    params.push(categoria_id);
  }
  
  query += ` ORDER BY p.total_bookings DESC, p.avaliacao_media DESC LIMIT 50`;
  
  const ranking = await db.query(query, params);
  
  res.json({
    success: true,
    data: {
      cidade,
      categoria: categoria_id,
      artistas: ranking.rows.map(r => ({
        posicao: parseInt(r.posicao),
        id: r.id,
        nome_artistico: r.nome_artistico,
        foto: r.foto_perfil_url,
        categoria: r.categoria,
        avaliacao: parseFloat(r.avaliacao_media),
        total_bookings: parseInt(r.total_bookings),
        seguidores: parseInt(r.total_seguidores)
      }))
    }
  });
}
```

# KXRTEX - DOCUMENTAÇÃO TÉCNICA (Parte 5 - Final)

## 15. PAINEL ADMIN

### 15.1 Dashboard Principal

**Métricas em Tempo Real:**

```javascript
// GET /admin/dashboard
async function getDashboardAdmin(req, res) {
  const { periodo = 'hoje' } = req.query; // hoje, semana, mes, ano
  
  // Define intervalo de datas
  let dataInicio, dataFim;
  switch (periodo) {
    case 'hoje':
      dataInicio = moment().startOf('day');
      dataFim = moment().endOf('day');
      break;
    case 'semana':
      dataInicio = moment().startOf('week');
      dataFim = moment().endOf('week');
      break;
    case 'mes':
      dataInicio = moment().startOf('month');
      dataFim = moment().endOf('month');
      break;
    case 'ano':
      dataInicio = moment().startOf('year');
      dataFim = moment().endOf('year');
      break;
  }
  
  // RECEITAS
  const receitas = await db.query(`
    SELECT 
      COALESCE(SUM(p.taxa_plataforma), 0) as taxa_bookings,
      COALESCE(
        (SELECT SUM(CASE 
          WHEN prof.plano = 'plus' THEN 49 
          WHEN prof.plano = 'pro' THEN 99 
          ELSE 0 END)
        FROM profissionais prof
        WHERE prof.data_assinatura >= $1
          AND prof.data_assinatura <= $2
        ), 0
      ) as assinaturas,
      COALESCE(
        (SELECT SUM(199)
        FROM profissionais prof
        WHERE prof.verificado = true
          AND prof.verificado_em >= $1
          AND prof.verificado_em <= $2
        ), 0
      ) as verificacoes
    FROM pagamentos p
    WHERE p.pago_em >= $1 AND p.pago_em <= $2
      AND p.status IN ('aprovado', 'liberado_artista')
  `, [dataInicio.toDate(), dataFim.toDate()]);
  
  const receitaTotal = 
    parseFloat(receitas.rows[0].taxa_bookings) +
    parseFloat(receitas.rows[0].assinaturas) +
    parseFloat(receitas.rows[0].verificacoes);
  
  // USUÁRIOS
  const usuarios = await db.query(`
    SELECT 
      (SELECT COUNT(*) FROM usuarios WHERE tipo = 'contratante') as total_contratantes,
      (SELECT COUNT(*) FROM usuarios WHERE tipo = 'artista') as total_artistas,
      (SELECT COUNT(*) FROM usuarios 
       WHERE criado_em >= $1 AND criado_em <= $2) as novos_usuarios,
      (SELECT COUNT(*) FROM usuarios 
       WHERE ultimo_login >= $1 AND ultimo_login <= $2) as usuarios_ativos,
      (SELECT COUNT(*) FROM profissionais WHERE verificado = true) as artistas_verificados,
      (SELECT COUNT(*) FROM profissionais WHERE plano = 'plus') as assinantes_plus,
      (SELECT COUNT(*) FROM profissionais WHERE plano = 'pro') as assinantes_pro
  `, [dataInicio.toDate(), dataFim.toDate()]);
  
  // BOOKINGS
  const bookings = await db.query(`
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'pendente') as pendentes,
      COUNT(*) FILTER (WHERE status = 'confirmado') as confirmados,
      COUNT(*) FILTER (WHERE status = 'concluido') as concluidos,
      COUNT(*) FILTER (WHERE status LIKE 'cancelado%') as cancelados,
      COALESCE(AVG(valor_final), 0) as ticket_medio,
      COALESCE(SUM(valor_final), 0) as gmv
    FROM bookings
    WHERE criado_em >= $1 AND criado_em <= $2
  `, [dataInicio.toDate(), dataFim.toDate()]);
  
  // ADIANTAMENTOS
  const adiantamentos = await db.query(`
    SELECT 
      COALESCE(SUM(valor_adiantamento), 0) as total_adiantado,
      COUNT(*) as total_adiantamentos,
      COUNT(*) FILTER (WHERE status = 'liberado') as liberados
    FROM adiantamentos
    WHERE solicitado_em >= $1 AND solicitado_em <= $2
  `, [dataInicio.toDate(), dataFim.toDate()]);
  
  // DISPUTAS E PROBLEMAS
  const problemas = await db.query(`
    SELECT 
      (SELECT COUNT(*) FROM disputas WHERE status IN ('aberta', 'em_analise')) as disputas_pendentes,
      (SELECT COUNT(*) FROM infracoes 
       WHERE criado_em >= NOW() - INTERVAL '7 days') as infracoes_semana,
      (SELECT COUNT(*) FROM usuarios WHERE status = 'suspenso') as usuarios_suspensos,
      (SELECT COUNT(*) FROM denuncias WHERE status = 'pendente') as denuncias_pendentes
  `);
  
  // TAXA DE CONVERSÃO
  const conversao = await db.query(`
    SELECT 
      COUNT(*) FILTER (WHERE status NOT IN ('expirado', 'cancelado_contratante', 'cancelado_artista')) as propostas_totais,
      COUNT(*) FILTER (WHERE status IN ('confirmado', 'concluido')) as propostas_convertidas
    FROM bookings
    WHERE criado_em >= $1 AND criado_em <= $2
  `, [dataInicio.toDate(), dataFim.toDate()]);
  
  const taxaConversao = conversao.rows[0].propostas_totais > 0 
    ? (conversao.rows[0].propostas_convertidas / conversao.rows[0].propostas_totais * 100).toFixed(2)
    : 0;
  
  // CRESCIMENTO (vs período anterior)
  const periodoAnteriorInicio = moment(dataInicio).subtract(dataFim.diff(dataInicio, 'days'), 'days');
  const periodoAnteriorFim = moment(dataInicio).subtract(1, 'day');
  
  const receitaAnterior = await db.query(`
    SELECT COALESCE(SUM(p.taxa_plataforma), 0) as total
    FROM pagamentos p
    WHERE p.pago_em >= $1 AND p.pago_em <= $2
      AND p.status IN ('aprovado', 'liberado_artista')
  `, [periodoAnteriorInicio.toDate(), periodoAnteriorFim.toDate()]);
  
  const crescimento = receitaAnterior.rows[0].total > 0
    ? ((receitaTotal - receitaAnterior.rows[0].total) / receitaAnterior.rows[0].total * 100).toFixed(2)
    : 0;
  
  // ALERTAS
  const alertas = [];
  
  if (problemas.rows[0].disputas_pendentes > 0) {
    alertas.push({
      tipo: 'disputa',
      prioridade: 'alta',
      mensagem: `${problemas.rows[0].disputas_pendentes} disputas aguardando análise`,
      link: '/admin/disputas?status=pendente'
    });
  }
  
  if (problemas.rows[0].denuncias_pendentes > 5) {
    alertas.push({
      tipo: 'denuncia',
      prioridade: 'media',
      mensagem: `${problemas.rows[0].denuncias_pendentes} denúncias para revisar`,
      link: '/admin/denuncias?status=pendente'
    });
  }
  
  if (problemas.rows[0].infracoes_semana > 10) {
    alertas.push({
      tipo: 'infracoes',
      prioridade: 'media',
      mensagem: `${problemas.rows[0].infracoes_semana} infrações detectadas esta semana`,
      link: '/admin/infracoes'
    });
  }
  
  res.json({
    success: true,
    data: {
      periodo,
      data_inicio: dataInicio.format('YYYY-MM-DD'),
      data_fim: dataFim.format('YYYY-MM-DD'),
      
      receitas: {
        total: parseFloat(receitaTotal.toFixed(2)),
        taxa_bookings: parseFloat(receitas.rows[0].taxa_bookings),
        assinaturas: parseFloat(receitas.rows[0].assinaturas),
        verificacoes: parseFloat(receitas.rows[0].verificacoes),
        crescimento: parseFloat(crescimento)
      },
      
      usuarios: {
        total: usuarios.rows[0].total_contratantes + usuarios.rows[0].total_artistas,
        contratantes: parseInt(usuarios.rows[0].total_contratantes),
        artistas: parseInt(usuarios.rows[0].total_artistas),
        novos: parseInt(usuarios.rows[0].novos_usuarios),
        ativos: parseInt(usuarios.rows[0].usuarios_ativos),
        verificados: parseInt(usuarios.rows[0].artistas_verificados),
        assinantes_plus: parseInt(usuarios.rows[0].assinantes_plus),
        assinantes_pro: parseInt(usuarios.rows[0].assinantes_pro)
      },
      
      bookings: {
        total: parseInt(bookings.rows[0].total),
        pendentes: parseInt(bookings.rows[0].pendentes),
        confirmados: parseInt(bookings.rows[0].confirmados),
        concluidos: parseInt(bookings.rows[0].concluidos),
        cancelados: parseInt(bookings.rows[0].cancelados),
        ticket_medio: parseFloat(bookings.rows[0].ticket_medio).toFixed(2),
        gmv: parseFloat(bookings.rows[0].gmv).toFixed(2),
        taxa_conversao: parseFloat(taxaConversao)
      },
      
      adiantamentos: {
        total_adiantado: parseFloat(adiantamentos.rows[0].total_adiantado).toFixed(2),
        total: parseInt(adiantamentos.rows[0].total_adiantamentos),
        liberados: parseInt(adiantamentos.rows[0].liberados)
      },
      
      problemas: {
        disputas_pendentes: parseInt(problemas.rows[0].disputas_pendentes),
        infracoes_semana: parseInt(problemas.rows[0].infracoes_semana),
        usuarios_suspensos: parseInt(problemas.rows[0].usuarios_suspensos),
        denuncias_pendentes: parseInt(problemas.rows[0].denuncias_pendentes)
      },
      
      alertas
    }
  });
}
```

### 15.2 Relatórios Financeiros

**Relatório Detalhado:**

```javascript
// GET /admin/relatorios/financeiro
async function getRelatorioFinanceiro(req, res) {
  const { data_inicio, data_fim, formato = 'json' } = req.query;
  
  const inicio = moment(data_inicio).startOf('day');
  const fim = moment(data_fim).endOf('day');
  
  // Receitas por dia
  const receitasDiarias = await db.query(`
    SELECT 
      DATE(p.pago_em) as data,
      COUNT(DISTINCT p.booking_id) as bookings,
      COALESCE(SUM(p.taxa_plataforma), 0) as receita_taxas,
      COALESCE(SUM(p.valor_total), 0) as gmv
    FROM pagamentos p
    WHERE p.pago_em >= $1 AND p.pago_em <= $2
      AND p.status IN ('aprovado', 'liberado_artista')
    GROUP BY DATE(p.pago_em)
    ORDER BY data
  `, [inicio.toDate(), fim.toDate()]);
  
  // Assinaturas por plano
  const assinaturas = await db.query(`
    SELECT 
      plano,
      COUNT(*) as total,
      SUM(CASE 
        WHEN plano = 'plus' THEN 49 
        WHEN plano = 'pro' THEN 99 
        ELSE 0 
      END) as receita_mensal_recorrente
    FROM profissionais
    WHERE plano IN ('plus', 'pro')
      AND data_assinatura IS NOT NULL
    GROUP BY plano
  `);
  
  // Despesas estimadas
  const despesas = await db.query(`
    SELECT 
      COALESCE(SUM(p.valor_total * 0.029), 0) as gateway_fees,
      500 as infraestrutura_estimada,
      1000 as equipe_estimada
    FROM pagamentos p
    WHERE p.pago_em >= $1 AND p.pago_em <= $2
  `, [inicio.toDate(), fim.toDate()]);
  
  // Consolidado
  const receitaTotal = receitasDiarias.rows.reduce((acc, r) => acc + parseFloat(r.receita_taxas), 0);
  const receitaAssinaturas = assinaturas.rows.reduce((acc, a) => acc + parseFloat(a.receita_mensal_recorrente), 0);
  const despesasTotal = 
    parseFloat(despesas.rows[0].gateway_fees) + 
    parseFloat(despesas.rows[0].infraestrutura_estimada) +
    parseFloat(despesas.rows[0].equipe_estimada);
  
  const lucroLiquido = receitaTotal + receitaAssinaturas - despesasTotal;
  const margemLucro = ((lucroLiquido / (receitaTotal + receitaAssinaturas)) * 100).toFixed(2);
  
  const relatorio = {
    periodo: {
      inicio: inicio.format('YYYY-MM-DD'),
      fim: fim.format('YYYY-MM-DD'),
      dias: fim.diff(inicio, 'days') + 1
    },
    
    receitas: {
      taxas_bookings: parseFloat(receitaTotal.toFixed(2)),
      assinaturas: parseFloat(receitaAssinaturas.toFixed(2)),
      total: parseFloat((receitaTotal + receitaAssinaturas).toFixed(2))
    },
    
    despesas: {
      gateway: parseFloat(despesas.rows[0].gateway_fees.toFixed(2)),
      infraestrutura: parseFloat(despesas.rows[0].infraestrutura_estimada),
      equipe: parseFloat(despesas.rows[0].equipe_estimada),
      total: parseFloat(despesasTotal.toFixed(2))
    },
    
    lucro: {
      liquido: parseFloat(lucroLiquido.toFixed(2)),
      margem: parseFloat(margemLucro)
    },
    
    detalhamento_diario: receitasDiarias.rows.map(r => ({
      data: r.data,
      bookings: parseInt(r.bookings),
      receita: parseFloat(r.receita_taxas).toFixed(2),
      gmv: parseFloat(r.gmv).toFixed(2)
    })),
    
    assinaturas: assinaturas.rows.map(a => ({
      plano: a.plano,
      total: parseInt(a.total),
      mrr: parseFloat(a.receita_mensal_recorrente).toFixed(2)
    }))
  };
  
  if (formato === 'csv') {
    // Gera CSV
    const csv = generateCSV(relatorio);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=relatorio_${inicio.format('YYYYMMDD')}_${fim.format('YYYYMMDD')}.csv`);
    res.send(csv);
  } else {
    res.json({
      success: true,
      data: relatorio
    });
  }
}
```

### 15.3 Gestão de Configurações

**Atualizar Configurações do Sistema:**

```javascript
// PUT /admin/configuracoes
async function atualizarConfiguracoes(req, res) {
  const { chave, valor } = req.body;
  const admin_id = req.user.id;
  
  // Validações específicas por tipo de config
  const configsPermitidas = [
    'taxa_free', 'taxa_plus', 'taxa_pro',
    'preco_plus', 'preco_pro',
    'valor_minimo_booking', 'valor_minimo_saque',
    'taxa_saque', 'prazo_resposta_proposta',
    'prazo_resposta_contraproposta', 'periodo_disputa',
    'max_propostas_ativas_contratante',
    'max_propostas_pendentes_artista',
    'recompensa_indicacao', 'desconto_indicado',
    'expiracao_indicacao', 'expiracao_creditos'
  ];
  
  if (!configsPermitidas.includes(chave)) {
    return res.status(400).json({
      success: false,
      error: 'Configuração não permitida'
    });
  }
  
  await db.query(`
    UPDATE configuracoes_sistema
    SET valor = $1,
        atualizado_em = NOW(),
        atualizado_por_id = $2
    WHERE chave = $3
  `, [valor, admin_id, chave]);
  
  // Log de auditoria
  await db.query(`
    INSERT INTO logs_admin (
      admin_id, acao, descricao, dados
    ) VALUES ($1, 'config_atualizada', $2, $3)
  `, [
    admin_id,
    `Configuração ${chave} alterada`,
    JSON.stringify({ chave, valor_novo: valor })
  ]);
  
  res.json({
    success: true,
    message: 'Configuração atualizada com sucesso'
  });
}
```

---

## 16. STACK TECNOLÓGICA

### 16.1 Frontend (Mobile)

**React Native + Expo**

```json
{
  "dependencies": {
    "expo": "~50.0.0",
    "react": "18.2.0",
    "react-native": "0.73.0",
    
    // Navegação
    "@react-navigation/native": "^6.1.9",
    "@react-navigation/stack": "^6.3.20",
    "@react-navigation/bottom-tabs": "^6.5.11",
    
    // Estado Global
    "@reduxjs/toolkit": "^2.0.1",
    "react-redux": "^9.0.4",
    
    // API e HTTP
    "axios": "^1.6.2",
    "socket.io-client": "^4.6.0",
    
    // UI Components
    "react-native-paper": "^5.11.3",
    "react-native-vector-icons": "^10.0.3",
    "react-native-gesture-handler": "~2.14.0",
    "react-native-reanimated": "~3.6.0",
    
    // Forms e Validação
    "formik": "^2.4.5",
    "yup": "^1.3.3",
    
    // Imagens
    "expo-image-picker": "~14.7.1",
    "expo-image-manipulator": "~11.8.0",
    "react-native-fast-image": "^8.6.3",
    
    // Mapa e Localização
    "react-native-maps": "1.10.0",
    "expo-location": "~16.5.3",
    
    // Notificações
    "expo-notifications": "~0.27.6",
    
    // Storage Local
    "@react-native-async-storage/async-storage": "1.21.0",
    
    // Utils
    "moment": "^2.30.1",
    "lodash": "^4.17.21"
  }
}
```

**Estrutura de Pastas:**

```
mobile/
├── src/
│   ├── screens/          # Telas do app
│   │   ├── Auth/
│   │   │   ├── LoginScreen.js
│   │   │   ├── RegisterScreen.js
│   │   │   └── ForgotPasswordScreen.js
│   │   ├── Onboarding/
│   │   │   ├── WelcomeScreen.js
│   │   │   └── TutorialScreen.js
│   │   ├── Home/
│   │   │   ├── HomeScreen.js
│   │   │   └── SearchScreen.js
│   │   ├── Perfil/
│   │   │   ├── PerfilScreen.js
│   │   │   ├── EditarPerfilScreen.js
│   │   │   └── ConfiguracoesScreen.js
│   │   ├── Artista/
│   │   │   ├── PerfilArtistaScreen.js
│   │   │   ├── CriarPerfilArtistaScreen.js
│   │   │   ├── PortfolioScreen.js
│   │   │   └── DashboardArtistaScreen.js
│   │   ├── Booking/
│   │   │   ├── SolicitarBookingScreen.js
│   │   │   ├── DetalhesBookingScreen.js
│   │   │   ├── MeusBookingsScreen.js
│   │   │   └── ChatScreen.js
│   │   └── Pagamento/
│   │       ├── PagamentoScreen.js
│   │       └── FinanceiroScreen.js
│   │
│   ├── components/       # Componentes reutilizáveis
│   │   ├── common/
│   │   │   ├── Button.js
│   │   │   ├── Input.js
│   │   │   ├── Card.js
│   │   │   └── Loading.js
│   │   ├── ArtistCard.js
│   │   ├── BookingCard.js
│   │   ├── ChatBubble.js
│   │   └── RatingStars.js
│   │
│   ├── navigation/       # Configuração de navegação
│   │   ├── AppNavigator.js
│   │   ├── AuthNavigator.js
│   │   └── MainNavigator.js
│   │
│   ├── services/         # Serviços e APIs
│   │   ├── api.js
│   │   ├── auth.js
│   │   ├── booking.js
│   │   ├── socket.js
│   │   └── notifications.js
│   │
│   ├── store/            # Redux store
│   │   ├── index.js
│   │   ├── slices/
│   │   │   ├── authSlice.js
│   │   │   ├── userSlice.js
│   │   │   ├── bookingSlice.js
│   │   │   └── chatSlice.js
│   │   └── middleware/
│   │
│   ├── utils/            # Funções utilitárias
│   │   ├── validation.js
│   │   ├── formatting.js
│   │   ├── constants.js
│   │   └── helpers.js
│   │
│   ├── hooks/            # Custom hooks
│   │   ├── useAuth.js
│   │   ├── useBooking.js
│   │   └── useNotifications.js
│   │
│   ├── assets/           # Imagens, fontes, etc
│   │   ├── images/
│   │   ├── fonts/
│   │   └── icons/
│   │
│   └── styles/           # Estilos globais
│       ├── colors.js
│       ├── typography.js
│       └── theme.js
│
├── App.js
├── app.json
└── package.json
```

### 16.2 Backend (API)

**Node.js + Express**

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "compression": "^1.7.4",
    
    // Database
    "pg": "^8.11.3",
    "sequelize": "^6.35.2",
    
    // Authentication
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    
    // Validation
    "joi": "^17.11.0",
    "express-validator": "^7.0.1",
    
    // File Upload
    "multer": "^1.4.5-lts.1",
    "cloudinary": "^1.41.1",
    
    // Real-time
    "socket.io": "^4.6.0",
    
    // Cache
    "redis": "^4.6.11",
    "ioredis": "^5.3.2",
    
    // Jobs/Cron
    "node-cron": "^3.0.3",
    "bull": "^4.12.0",
    
    // Payment
    "axios": "^1.6.2",
    
    // Email
    "nodemailer": "^6.9.7",
    
    // Utils
    "moment": "^2.30.1",
    "lodash": "^4.17.21",
    "dotenv": "^16.3.1",
    "winston": "^3.11.0"
  }
}
```

**Estrutura de Pastas:**

```
backend/
├── src/
│   ├── config/           # Configurações
│   │   ├── database.js
│   │   ├── redis.js
│   │   ├── cloudinary.js
│   │   └── asaas.js
│   │
│   ├── models/           # Models Sequelize
│   │   ├── Usuario.js
│   │   ├── Profissional.js
│   │   ├── Booking.js
│   │   ├── Pagamento.js
│   │   ├── Adiantamento.js
│   │   ├── Mensagem.js
│   │   ├── Avaliacao.js
│   │   └── index.js
│   │
│   ├── controllers/      # Controladores
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── profissionalController.js
│   │   ├── bookingController.js
│   │   ├── mensagemController.js
│   │   ├── pagamentoController.js
│   │   ├── avaliacaoController.js
│   │   └── adminController.js
│   │
│   ├── routes/           # Rotas
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── profissionais.js
│   │   ├── bookings.js
│   │   ├── mensagens.js
│   │   ├── pagamentos.js
│   │   ├── avaliacoes.js
│   │   ├── admin.js
│   │   └── index.js
│   │
│   ├── middlewares/      # Middlewares
│   │   ├── auth.js
│   │   ├── validate.js
│   │   ├── errorHandler.js
│   │   ├── rateLimit.js
│   │   └── upload.js
│   │
│   ├── services/         # Serviços
│   │   ├── asaasService.js
│   │   ├── emailService.js
│   │   ├── notificationService.js
│   │   ├── cloudinaryService.js
│   │   └── cacheService.js
│   │
│   ├── jobs/             # Jobs agendados
│   │   ├── liberarAdiantamentos.js
│   │   ├── processarEventos.js
│   │   ├── enviarLembretes.js
│   │   └── index.js
│   │
│   ├── utils/            # Utilitários
│   │   ├── validation.js
│   │   ├── logger.js
│   │   ├── helpers.js
│   │   └── constants.js
│   │
│   ├── validators/       # Schemas de validação
│   │   ├── authValidators.js
│   │   ├── bookingValidators.js
│   │   └── userValidators.js
│   │
│   ├── sockets/          # Socket.IO handlers
│   │   ├── chatHandler.js
│   │   └── notificationHandler.js
│   │
│   └── server.js         # Entry point
│
├── migrations/           # Migrações do DB
├── seeders/              # Seeds
├── tests/                # Testes
│   ├── unit/
│   └── integration/
│
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

### 16.3 Banco de Dados

**PostgreSQL 14+**

```
Hosting: Supabase / Railway / AWS RDS

Configurações recomendadas:
- Max connections: 100
- Shared buffers: 256MB
- Effective cache size: 1GB
- Maintenance work mem: 64MB
- Random page cost: 1.1 (para SSD)
- Effective IO concurrency: 200

Backups:
- Automático diário (retenção 30 dias)
- Point-in-time recovery habilitado
```

**Redis**

```
Hosting: Redis Cloud / Railway / AWS ElastiCache

Uso:
- Cache de queries frequentes (TTL: 5-15min)
- Sessões de usuário (TTL: 7 dias)
- Rate limiting
- Filas de jobs (Bull)

Configurações:
- Max memory: 512MB
- Eviction policy: allkeys-lru
```

### 16.4 Storage e CDN

**Cloudinary**

```
Plano: Plus ($99/mês)
- Storage: 200GB
- Bandwidth: 200GB/mês
- Transformações: Ilimitadas

Uso:
- Fotos de perfil
- Portfolio dos artistas
- Vídeos de apresentação
- Documentos (comprovantes)

Otimizações:
- Auto-format (WebP/AVIF)
- Auto-quality
- Lazy loading
- Responsive breakpoints
```

### 16.5 Integrações Externas

**ASAAS (Pagamentos)**
```
Plano: Taxas por transação
- PIX: 0,99%
- Boleto: R$3,49
- Cartão: 2,99% (à vista) / 3,99% (parcelado)

API: REST v3
Webhook: https://api.kxrtex.com/webhooks/asaas
```

**Firebase (Notificações)**
```
Plano: Spark (Free)
- Cloud Messaging: Ilimitado
- Analytics: Ilimitado

Uso:
- Push notifications
- Analytics de eventos
```

**SendGrid (Email)**
```
Plano: Essentials ($19,95/mês)
- 50.000 emails/mês
- Templates
- Analytics

Uso:
- Confirmações de booking
- Notificações importantes
- Recuperação de senha
- Marketing (newsletter)
```

---

## 17. ESTRUTURA DE PASTAS COMPLETA

```
kxrtex/
├── docs/                          # Documentação
│   ├── requisitos.md
│   ├── database-schema.md
│   ├── api-endpoints.md
│   ├── fluxos-usuario.md
│   └── architecture.md
│
├── backend/                       # API Node.js
│   ├── src/
│   │   ├── config/
│   │   ├── models/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   ├── services/
│   │   ├── jobs/
│   │   ├── utils/
│   │   ├── validators/
│   │   ├── sockets/
│   │   └── server.js
│   ├── migrations/
│   ├── seeders/
│   ├── tests/
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
├── mobile/                        # App React Native
│   ├── src/
│   │   ├── screens/
│   │   ├── components/
│   │   ├── navigation/
│   │   ├── services/
│   │   ├── store/
│   │   ├── utils/
│   │   ├── hooks/
│   │   ├── assets/
│   │   └── styles/
│   ├── App.js
│   ├── app.json
│   ├── package.json
│   └── README.md
│
├── web/                           # Web App (futuro)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── README.md
│
├── admin/                         # Painel Admin (futuro)
│   ├── src/
│   ├── package.json
│   └── README.md
│
├── scripts/                       # Scripts utilitários
│   ├── deploy.sh
│   ├── backup-db.sh
│   └── seed-data.js
│
├── .github/                       # CI/CD
│   └── workflows/
│       ├── backend-tests.yml
│       └── deploy.yml
│
├── .gitignore
├── README.md
└── LICENSE
```

---

## 18. ROADMAP DE DESENVOLVIMENTO

### Fase 1: MVP Core (12-14 semanas)

**Semanas 1-2: Setup e Fundação**
- [x] Estrutura de pastas
- [x] Setup do backend (Node + Express + PostgreSQL)
- [x] Setup do mobile (React Native + Expo)
- [x] Configuração de ambientes (dev, staging, prod)
- [x] CI/CD básico
- [x] Documentação técnica completa

**Semanas 3-4: Autenticação e Usuários**
- [ ] Sistema de cadastro e login
- [ ] JWT authentication
- [ ] Recuperação de senha
- [ ] Perfil de usuário básico
- [ ] Upload de foto de perfil

**Semanas 5-6: Perfil de Artista**
- [ ] Criação de perfil de artista
- [ ] Upload de portfolio (fotos)
- [ ] Categorias e subcategorias
- [ ] Sistema de precificação
- [ ] Links para redes sociais

**Semanas 7-8: Busca e Descoberta**
- [ ] Sistema de busca com filtros
- [ ] Algoritmo de relevância
- [ ] Visualização de perfil completo
- [ ] Sistema de seguir artistas
- [ ] Histórico de buscas

**Semanas 9-10: Sistema de Booking**
- [ ] Fluxo completo de solicitação
- [ ] Aceitar/recusar/contra-propor
- [ ] Status e expiração de propostas
- [ ] Notificações de booking

**Semanas 11-12: Chat em Tempo Real**
- [ ] Socket.IO setup
- [ ] Envio/recebimento de mensagens
- [ ] Indicador online/offline
- [ ] Notificações de mensagens
- [ ] Sistema de detecção de contato externo

**Semanas 13-14: Pagamentos**
- [ ] Integração ASAAS
- [ ] Fluxo de pagamento PIX
- [ ] Fluxo de pagamento Cartão
- [ ] Split de pagamento
- [ ] Sistema de reembolsos

**Semanas 15-16: Sistema de Adiantamento**
- [ ] Elegibilidade e validação
- [ ] Score de confiabilidade
- [ ] Fluxo de liberação (24h)
- [ ] Sistema de saques
- [ ] Jobs automatizados

**Semanas 17-18: Avaliações e Finalização**
- [ ] Sistema de avaliações mútuas
- [ ] Check-in geolocalizado
- [ ] Conclusão de eventos
- [ ] Liberação de pagamentos
- [ ] Período de disputa

**Semanas 19-20: Testes e Ajustes**
- [ ] Testes end-to-end
- [ ] Correção de bugs
- [ ] Otimizações de performance
- [ ] Ajustes de UI/UX
- [ ] Preparação para lançamento

---

### Fase 2: Lançamento e Validação (4-8 semanas)

**Semana 1-2: Soft Launch**
- [ ] Lançamento beta fechado (50 usuários)
- [ ] Coletar feedback inicial
- [ ] Ajustes críticos
- [ ] Monitoramento intensivo

**Semana 3-4: Lançamento Público**
- [ ] Lançamento em São Paulo
- [ ] Campanha de marketing inicial
- [ ] Onboarding de primeiros artistas (200+)
- [ ] Primeiros bookings reais

**Semana 5-8: Iteração e Crescimento**
- [ ] Análise de métricas
- [ ] Ajustes baseados em feedback
- [ ] Expansão para outras cidades (RJ, BH)
- [ ] Otimizações de conversão

---

### Fase 3: Expansão de Features (8-12 semanas)

**Recursos Adicionais:**
- [ ] Sistema de cupons e promoções
- [ ] Programa de indicação completo
- [ ] Leaderboards e gamificação
- [ ] Buscas salvas com alertas
- [ ] Dashboard analytics avançado
- [ ] Presskit em PDF
- [ ] Contratos digitais avançados
- [ ] Sistema de disputas robusto
- [ ] Painel admin completo

**Melhorias:**
- [ ] Vídeos no portfolio
- [ ] Calendário de disponibilidade
- [ ] Integração com Google Calendar
- [ ] Importação de mídia do Instagram
- [ ] Sistema de pacotes de bookings
- [ ] Chat com áudio/vídeo

---

### Fase 4: Escala (Contínuo)

**Infraestrutura:**
- [ ] Migração para Kubernetes
- [ ] Auto-scaling
- [ ] CDN global
- [ ] Múltiplas regiões

**Produto:**
- [ ] Expansão de categorias (fotógrafos, VJs)
- [ ] Marketplace de equipamentos
- [ ] Sistema de agenciamento
- [ ] Internacionalização (PT-BR, EN, ES)
- [ ] App Web completo
- [ ] API pública para parceiros

**Monetização:**
- [ ] Planos enterprise
- [ ] Publicidade para marcas
- [ ] Premium features
- [ ] Comissões sobre equipamentos

---

## 19. CHECKLIST DE DESENVOLVIMENTO

### 19.1 Backend

**Setup Inicial**
```
[ ] Inicializar projeto Node.js
[ ] Configurar Express
[ ] Configurar PostgreSQL + Sequelize
[ ] Configurar Redis
[ ] Configurar variáveis de ambiente
[ ] Setup de logging (Winston)
[ ] Setup de error handling global
[ ] Configurar CORS
[ ] Configurar Helmet (security)
[ ] Configurar rate limiting
```

**Database**
```
[ ] Criar todas as migrations
[ ] Criar seeders para categorias
[ ] Criar seeders para configurações
[ ] Criar índices necessários
[ ] Testar relacionamentos
[ ] Configurar backups automáticos
```

**Autenticação**
```
[ ] POST /auth/register
[ ] POST /auth/login
[ ] POST /auth/refresh
[ ] POST /auth/forgot-password
[ ] POST /auth/reset-password
[ ] Middleware de autenticação JWT
[ ] Testes unitários
```

**Usuários**
```
[ ] GET /users/me
[ ] PUT /users/me
[ ] POST /users/me/avatar
[ ] PUT /users/me/documento
[ ] DELETE /users/me
[ ] Testes
```

**Profissionais**
```
[ ] GET /profissionais (busca pública)
[ ] GET /profissionais/:id
[ ] POST /profissionais
[ ] PUT /profissionais/me
[ ] POST /profissionais/me/portfolio
[ ] DELETE /profissionais/me/portfolio/:id
[ ] POST /profissionais/me/redes-sociais
[ ] GET /profissionais/me/dashboard
[ ] Testes
```

**Bookings**
```
[ ] POST /bookings
[ ] GET /bookings
[ ] GET /bookings/:id
[ ] PUT /bookings/:id/aceitar
[ ] PUT /bookings/:id/contra-propor
[ ] PUT /bookings/:id/recusar
[ ] PUT /bookings/:id/cancelar
[ ] PUT /bookings/:id/checkin
[ ] PUT /bookings/:id/concluir
[ ] Testes
```

**Mensagens**
```
[ ] GET /bookings/:id/mensagens
[ ] POST /bookings/:id/mensagens
[ ] POST /bookings/:id/mensagens/upload
[ ] PUT /mensagens/:id/marcar-lida
[ ] Middleware de detecção de contato externo
[ ] Testes
```

**Pagamentos**
```
[ ] POST /pagamentos/:booking_id/criar
[ ] GET /pagamentos/:booking_id
[ ] POST /pagamentos/webhook (ASAAS)
[ ] Service ASAAS (criar pagamento, reembolso, etc)
[ ] Testes
```

**Adiantamentos**
```
[ ] GET /adiantamentos/:booking_id
[ ] POST /adiantamentos/:booking_id/solicitar
[ ] Job: Liberar adiantamentos (24h)
[ ] Job: Liberar valor restante (evento + 48h)
[ ] Job: Alertar check-in pendente
[ ] Testes
```

**Avaliações**
```
[ ] POST /avaliacoes/:booking_id
[ ] GET /avaliacoes/profissional/:id
[ ] Testes
```

**Notificações**
```
[ ] GET /notificacoes
[ ] PUT /notificacoes/:id/marcar-lida
[ ] PUT /notificacoes/marcar-todas-lidas
[ ] GET /notificacoes/configuracoes
[ ] PUT /notificacoes/configuracoes
[ ] Service de notificações (push, email)
[ ] Testes
```

**Socket.IO**
```
[ ] Setup do Socket.IO
[ ] Chat handler
[ ] Notification handler
[ ] Auth middleware para sockets
[ ] Rooms por booking
[ ] Testes
```

**Jobs/Cron**
```
[ ] Job: Liberar adiantamentos
[ ] Job: Liberar valor restante
[ ] Job: Alertar check-in
[ ] Job: Processar eventos concluídos
[ ] Job: Expirar indicações
[ ] Job: Enviar lembretes de eventos
[ ] Job: Processar notificações agendadas
[ ] Testes
```

**Admin**
```
[ ] GET /admin/dashboard
[ ] GET /admin/usuarios
[ ] PUT /admin/usuarios/:id/suspender
[ ] PUT /admin/usuarios/:id/banir
[ ] PUT /admin/profissionais/:id/verificar
[ ] GET /admin/disputas
[ ] PUT /admin/disputas/:id/resolver
[ ] GET /admin/relatorios/financeiro
[ ] PUT /admin/configuracoes
[ ] Testes
```

### 19.2 Mobile

**Setup Inicial**
```
[ ] Inicializar projeto React Native + Expo
[ ] Configurar navegação
[ ] Configurar Redux
[ ] Configurar axios
[ ] Configurar socket.io-client
[ ] Configurar notificações (Firebase)
[ ] Setup de temas e cores
```

**Autenticação**
```
[ ] LoginScreen
[ ] RegisterScreen
[ ] ForgotPasswordScreen
[ ] Salvar token no AsyncStorage
[ ] Auto-login
[ ] Logout
```

**Onboarding**
```
[ ] WelcomeScreen
[ ] TutorialScreen (3 slides)
[ ] Escolha de tipo (contratante/artista)
```

**Home e Busca**
```
[ ] HomeScreen
[ ] SearchScreen
[ ] Filtros (modal)
[ ] Lista de resultados
[ ] ArtistCard component
```

**Perfil de Artista**
```
[ ] PerfilArtistaScreen (visualização)
[ ] CriarPerfilArtistaScreen
[ ] EditarPerfilArtistaScreen
[ ] PortfolioScreen
[ ] Upload de fotos
[ ] Upload de vídeo
[ ] DashboardArtistaScreen
```

**Booking**
```
[ ] SolicitarBookingScreen
[ ] DetalhesBookingScreen
[ ] MeusBookingsScreen
[ ] Status indicator
[ ] Ações (aceitar, recusar, cancelar)
```

**Chat**
```
[ ] ChatScreen
[ ] ChatBubble component
[ ] Envio de mensagens
[ ] Envio de imagens
[ ] Indicador de digitação
[ ] Socket.IO integration
```

**Pagamento**
```
[ ] PagamentoScreen
[ ] Exibir QR Code PIX
[ ] WebView para cartão
[ ] Confirmação de pagamento
[ ] FinanceiroScreen
[ ] Solicitar saque
```

**Notificações**
```
[ ] Setup FCM
[ ] Pedir permissão
[ ] Salvar token no backend
[ ] Listar notificações
[ ] Badge de não lidas
[ ] Deep linking (abrir tela específica)
```

**Perfil e Configurações**
```
[ ] PerfilScreen
[ ] EditarPerfilScreen
[ ] ConfiguracoesScreen
[ ] Configurações de notificações
[ ] Logout
```

### 19.3 Deploy e Infraestrutura

**Backend**
```
[ ] Setup no Railway/Render
[ ] Configurar variáveis de ambiente
[ ] Deploy automático (GitHub Actions)
[ ] Monitoramento (Sentry)
[ ] Logs centralizados
[ ] Backup automático do DB
```

**Database**
```
[ ] Provisionar PostgreSQL
[ ] Configurar connection pooling
[ ] Setup de backups diários
[ ] Point-in-time recovery
```

**Redis**
```
[ ] Provisionar Redis
[ ] Configurar eviction policy
```

**Storage**
```
[ ] Setup Cloudinary
[ ] Configurar transformações
[ ] CDN
```

**Domínio e SSL**
```
[ ] Registrar domínio kxrtex.com
[ ] Configurar DNS
[ ] SSL certificate (Let's Encrypt)
[ ] Configurar subdomínios (api.kxrtex.com)
```

**Monitoramento**
```
[ ] Setup Sentry (error tracking)
[ ] Setup analytics
[ ] Setup uptime monitoring
[ ] Alertas por email/Slack
```

### 19.4 Testes

**Backend**
```
[ ] Testes unitários (controllers)
[ ] Testes de integração (rotas)
[ ] Testes de serviços (ASAAS mock)
[ ] Testes de jobs
[ ] Cobertura mínima: 70%
```

**Mobile**
```
[ ] Testes unitários (utils)
[ ] Testes de componentes
[ ] Testes de navegação
[ ] Testes E2E (Detox) - principais fluxos
```

### 19.5 Documentação

```
[ ] README.md do projeto
[ ] README.md do backend
[ ] README.md do mobile
[ ] API documentation (Swagger/Postman)
[ ] Guia de contribuição
[ ] Changelog
[ ] Documentação de deploy
```

### 19.6 Legal e Compliance

```
[ ] Termos de Uso
[ ] Política de Privacidade (LGPD)
[ ] Política de Cookies
[ ] Regras da Comunidade
[ ] Política de Cancelamento
[ ] FAQ
[ ] Contrato padrão de booking
```

---

## 20. PRÓXIMOS PASSOS

### Para Começar o Desenvolvimento com Claude Code:

1. **Criar estrutura de pastas**
```bash
mkdir kxrtex
cd kxrtex
mkdir -p backend/src/{config,models,controllers,routes,middlewares,services,jobs,utils,validators,sockets}
mkdir -p mobile/src/{screens,components,navigation,services,store,utils,hooks,assets,styles}
mkdir docs
```

2. **Inicializar Backend**
```bash
cd backend
npm init -y
npm install express pg sequelize bcryptjs jsonwebtoken cors helmet compression dotenv
npm install --save-dev nodemon
```

3. **Inicializar Mobile**
```bash
cd ../mobile
npx create-expo-app@latest . --template blank
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install axios socket.io-client @reduxjs/toolkit react-redux
```

4. **Criar .env.example**
```bash
cd ../backend
cat > .env.example << EOF
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:pass@localhost:5432/kxrtex
JWT_SECRET=your-secret-key
REDIS_URL=redis://localhost:6379
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
ASAAS_API_KEY=
ASAAS_WALLET_ID=
SENDGRID_API_KEY=
EOF
```

5. **Começar com Autenticação (Primeiro Módulo)**
- Use esta documentação como referência
- Implemente endpoint por endpoint
- Teste cada endpoint antes de prosseguir
- Commit frequente

---

## CONCLUSÃO

Esta documentação técnica completa cobre todos os aspectos do KXRTEX:

✅ Visão geral e identidade  
✅ Arquitetura completa  
✅ Modelo de negócio detalhado  
✅ Schema de banco de dados (22+ tabelas)  
✅ API endpoints completos (60+ endpoints)  
✅ Fluxos de usuário detalhados  
✅ Regras de negócio (precificação, cancelamento, adiantamento, etc.)  
✅ Sistema de pagamentos (ASAAS)  
✅ Sistema de adiantamento com proteções  
✅ Moderação e segurança  
✅ Notificações completas  
✅ Gamificação e badges  
✅ Painel admin  
✅ Stack tecnológica  
✅ Estrutura de pastas  
✅ Roadmap de 20 semanas  
✅ Checklist completo  

**Você está pronto para começar o desenvolvimento com Claude Code!**

Use esta documentação como referência constante durante todo o desenvolvimento. Ela foi criada para ser completa, técnica e prática.

Boa sorte com o KXRTEX! 🎵🚀

Claude's Code Rules:
First, think about the problem, read the code base for the relevant files, and write a plan in tasks/todo.md.
The plan should have a list of tasks that you can mark as complete as you finish them.
Before you start working, contact me and I will check the plan.
Then start working on the tasks, marking them as complete as you go.
Please, every step of the way, just give me a detailed explanation of the changes you've made.
Make each task and code change as simple as possible. We want to avoid large or complex changes. Each change should impact as little code as possible. It all comes down to simplicity.
Finally, add a review section to the all.md file with a summary of the changes made and any other relevant information.
DON'T BE LAZY. NEVER BE LAZY. IF THERE IS A BUG, FIND THE ROOT CAUSE AND FIX IT. NO TEMPORARY FIXES. YOU ARE A SENIOR DEVELOPER. NEVER BE LAZY.
MAKE ALL CORRECTIONS AND CODE CHANGES AS SIMPLE AS POSSIBLE. THEY SHOULD ONLY IMPACT THE CODE THAT IS NECESSARY AND RELEVANT TO THE TASK AND NOTHING ELSE. IT SHOULD IMPACT AS LITTLE CODE AS POSSIBLE. YOUR GOAL IS TO NOT INTRODUCE ANY BUGS. IT'S ALL ABOUT SIMPLICITY.
Sempre foque na otimização do aplicativo para que tudo seja facil de navegar e sem demorar para carregar
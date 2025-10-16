-- Up migration: Create profissionais table

CREATE TYPE profissional_plano AS ENUM ('free', 'plus', 'pro');

CREATE TABLE profissionais (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID UNIQUE NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nome_artistico VARCHAR(100) NOT NULL,
    categoria_id UUID REFERENCES categorias(id),
    bio TEXT,
    video_apresentacao_url TEXT,
    valor_base_hora DECIMAL(10,2) NOT NULL CHECK (valor_base_hora >= 50),
    valor_base_minimo DECIMAL(10,2) CHECK (valor_base_minimo >= 50),
    valor_base_maximo DECIMAL(10,2),
    cidades_atuacao TEXT[],
    plano profissional_plano DEFAULT 'free',
    data_assinatura TIMESTAMP,
    data_proxima_cobranca TIMESTAMP,
    avaliacao_media DECIMAL(3,2) DEFAULT 0 CHECK (avaliacao_media >= 0 AND avaliacao_media <= 5),
    total_avaliacoes INTEGER DEFAULT 0,
    total_bookings INTEGER DEFAULT 0,
    taxa_cancelamento DECIMAL(5,2) DEFAULT 0 CHECK (taxa_cancelamento >= 0 AND taxa_cancelamento <= 100),
    tempo_medio_resposta INTEGER, -- em minutos
    ultima_alteracao_preco TIMESTAMP,
    perfil_completo_percentual INTEGER DEFAULT 0 CHECK (perfil_completo_percentual >= 0 AND perfil_completo_percentual <= 100),
    total_seguidores INTEGER DEFAULT 0,
    instagram_url VARCHAR(255),
    tiktok_url VARCHAR(255),
    youtube_url VARCHAR(255),
    spotify_url VARCHAR(255),
    soundcloud_url VARCHAR(255),
    website_url VARCHAR(255),
    presskit_url TEXT,
    aceita_eventos_privados BOOLEAN DEFAULT TRUE,
    aceita_eventos_corporativos BOOLEAN DEFAULT TRUE,
    aceita_eventos_outras_cidades BOOLEAN DEFAULT TRUE,
    equipamento_proprio BOOLEAN DEFAULT FALSE,
    descricao_equipamento TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_profissionais_usuario_id ON profissionais(usuario_id);
CREATE INDEX idx_profissionais_categoria_id ON profissionais(categoria_id);
CREATE INDEX idx_profissionais_plano ON profissionais(plano);
CREATE INDEX idx_profissionais_avaliacao_media ON profissionais(avaliacao_media);
CREATE INDEX idx_profissionais_total_bookings ON profissionais(total_bookings);
CREATE INDEX idx_profissionais_cidades_atuacao ON profissionais USING GIN(cidades_atuacao);

-- Trigger for updated_at
CREATE TRIGGER update_profissionais_updated_at BEFORE UPDATE ON profissionais
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Up migration: Create portfolio table

CREATE TYPE portfolio_tipo AS ENUM ('foto', 'video', 'audio', 'presskit');

CREATE TABLE portfolio (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profissional_id UUID NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
    tipo portfolio_tipo NOT NULL,
    titulo VARCHAR(200),
    descricao TEXT,
    arquivo_url TEXT NOT NULL,
    arquivo_nome VARCHAR(255),
    arquivo_tamanho INTEGER,
    thumbnail_url TEXT,
    ordem INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_portfolio_profissional_id ON portfolio(profissional_id);
CREATE INDEX idx_portfolio_tipo ON portfolio(tipo);
CREATE INDEX idx_portfolio_ativo ON portfolio(ativo);
CREATE INDEX idx_portfolio_ordem ON portfolio(ordem);

-- Trigger for updated_at
CREATE TRIGGER update_portfolio_updated_at BEFORE UPDATE ON portfolio
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
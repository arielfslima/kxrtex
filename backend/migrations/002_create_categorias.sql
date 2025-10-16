-- Up migration: Create categorias table

CREATE TABLE categorias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    icone VARCHAR(50),
    ordem INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_categorias_slug ON categorias(slug);
CREATE INDEX idx_categorias_ativo ON categorias(ativo);
CREATE INDEX idx_categorias_ordem ON categorias(ordem);

-- Trigger for updated_at
CREATE TRIGGER update_categorias_updated_at BEFORE UPDATE ON categorias
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial data
INSERT INTO categorias (nome, slug, ordem) VALUES
('DJ', 'dj', 1),
('MC', 'mc', 2),
('Performer', 'performer', 3);
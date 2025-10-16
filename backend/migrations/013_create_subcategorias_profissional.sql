-- Up migration: Create junction table for profissional subcategorias

CREATE TABLE subcategorias_profissional (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profissional_id UUID NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
    subcategoria_id UUID NOT NULL REFERENCES subcategorias(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),

    -- Ensure unique combinations
    UNIQUE(profissional_id, subcategoria_id)
);

-- Indexes
CREATE INDEX idx_subcategorias_profissional_profissional_id ON subcategorias_profissional(profissional_id);
CREATE INDEX idx_subcategorias_profissional_subcategoria_id ON subcategorias_profissional(subcategoria_id);
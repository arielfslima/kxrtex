-- Up migration: Create seguindo table

CREATE TABLE seguindo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seguidor_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    profissional_id UUID NOT NULL REFERENCES profissionais(id) ON DELETE CASCADE,
    notificacoes_ativas BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Ensure one follow relationship per user-profissional pair
    UNIQUE(seguidor_id, profissional_id)
);

-- Indexes
CREATE INDEX idx_seguindo_seguidor_id ON seguindo(seguidor_id);
CREATE INDEX idx_seguindo_profissional_id ON seguindo(profissional_id);
CREATE INDEX idx_seguindo_notificacoes_ativas ON seguindo(notificacoes_ativas);

-- Trigger for updated_at
CREATE TRIGGER update_seguindo_updated_at BEFORE UPDATE ON seguindo
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
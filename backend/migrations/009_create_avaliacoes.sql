-- Up migration: Create avaliacoes table

CREATE TABLE avaliacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    avaliador_id UUID NOT NULL REFERENCES usuarios(id),
    avaliado_id UUID NOT NULL REFERENCES usuarios(id),
    nota_geral INTEGER NOT NULL CHECK (nota_geral >= 1 AND nota_geral <= 5),
    nota_comunicacao INTEGER CHECK (nota_comunicacao >= 1 AND nota_comunicacao <= 5),
    nota_pontualidade INTEGER CHECK (nota_pontualidade >= 1 AND nota_pontualidade <= 5),
    nota_profissionalismo INTEGER CHECK (nota_profissionalismo >= 1 AND nota_profissionalismo <= 5),
    nota_qualidade INTEGER CHECK (nota_qualidade >= 1 AND nota_qualidade <= 5),
    comentario TEXT,
    recomendaria BOOLEAN,
    visivel BOOLEAN DEFAULT FALSE,
    sera_visivel_em TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Ensure one evaluation per user per booking
    UNIQUE(booking_id, avaliador_id)
);

-- Indexes
CREATE INDEX idx_avaliacoes_booking_id ON avaliacoes(booking_id);
CREATE INDEX idx_avaliacoes_avaliador_id ON avaliacoes(avaliador_id);
CREATE INDEX idx_avaliacoes_avaliado_id ON avaliacoes(avaliado_id);
CREATE INDEX idx_avaliacoes_visivel ON avaliacoes(visivel);
CREATE INDEX idx_avaliacoes_nota_geral ON avaliacoes(nota_geral);

-- Trigger for updated_at
CREATE TRIGGER update_avaliacoes_updated_at BEFORE UPDATE ON avaliacoes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
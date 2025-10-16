-- Up migration: Create adiantamentos table

CREATE TYPE adiantamento_status AS ENUM ('solicitado', 'analise', 'aprovado', 'rejeitado', 'liberado');

CREATE TABLE adiantamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID UNIQUE NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    valor_adiantamento DECIMAL(10,2) NOT NULL,
    percentual_adiantamento DECIMAL(5,2) NOT NULL CHECK (percentual_adiantamento >= 10 AND percentual_adiantamento <= 40),
    valor_restante DECIMAL(10,2) NOT NULL,
    motivo TEXT NOT NULL,
    status adiantamento_status DEFAULT 'solicitado',
    score_confiabilidade INTEGER NOT NULL,
    solicitado_em TIMESTAMP DEFAULT NOW(),
    aprovado_em TIMESTAMP,
    rejeitado_em TIMESTAMP,
    motivo_rejeicao TEXT,
    liberado_em TIMESTAMP,
    aprovacao_estimada_em TIMESTAMP,
    observacoes_admin TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_adiantamentos_booking_id ON adiantamentos(booking_id);
CREATE INDEX idx_adiantamentos_status ON adiantamentos(status);
CREATE INDEX idx_adiantamentos_solicitado_em ON adiantamentos(solicitado_em);

-- Trigger for updated_at
CREATE TRIGGER update_adiantamentos_updated_at BEFORE UPDATE ON adiantamentos
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
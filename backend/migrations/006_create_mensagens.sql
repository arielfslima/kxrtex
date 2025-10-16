-- Up migration: Create mensagens table

CREATE TYPE mensagem_tipo AS ENUM ('texto', 'imagem', 'audio', 'documento', 'sistema');

CREATE TABLE mensagens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    remetente_id UUID NOT NULL REFERENCES usuarios(id),
    mensagem TEXT NOT NULL,
    tipo mensagem_tipo DEFAULT 'texto',
    arquivo_url TEXT,
    arquivo_nome VARCHAR(255),
    arquivo_tamanho INTEGER,
    lida BOOLEAN DEFAULT FALSE,
    lida_em TIMESTAMP,
    editada BOOLEAN DEFAULT FALSE,
    editada_em TIMESTAMP,
    respondendo_id UUID REFERENCES mensagens(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_mensagens_booking_id ON mensagens(booking_id);
CREATE INDEX idx_mensagens_remetente_id ON mensagens(remetente_id);
CREATE INDEX idx_mensagens_lida ON mensagens(lida);
CREATE INDEX idx_mensagens_created_at ON mensagens(created_at);

-- Trigger for updated_at
CREATE TRIGGER update_mensagens_updated_at BEFORE UPDATE ON mensagens
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
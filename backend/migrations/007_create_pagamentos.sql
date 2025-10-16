-- Up migration: Create pagamentos table

CREATE TYPE pagamento_status AS ENUM ('pendente', 'processando', 'aprovado', 'rejeitado', 'estornado', 'liberado');
CREATE TYPE pagamento_metodo AS ENUM ('pix', 'cartao_credito', 'boleto');

CREATE TABLE pagamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID UNIQUE NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    valor_total DECIMAL(10,2) NOT NULL,
    valor_artista DECIMAL(10,2) NOT NULL,
    taxa_plataforma DECIMAL(10,2) NOT NULL,
    status pagamento_status DEFAULT 'pendente',
    metodo_pagamento pagamento_metodo NOT NULL,
    parcelas INTEGER DEFAULT 1 CHECK (parcelas >= 1 AND parcelas <= 12),
    asaas_payment_id VARCHAR(100),
    asaas_invoice_url TEXT,
    pix_qrcode TEXT,
    pix_qrcode_image_url TEXT,
    pix_payload TEXT,
    pix_expira_em TIMESTAMP,
    pago_em TIMESTAMP,
    valor_pago DECIMAL(10,2),
    liberado_em TIMESTAMP,
    estornado_em TIMESTAMP,
    valor_estornado DECIMAL(10,2),
    motivo_estorno TEXT,
    webhook_events JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_pagamentos_booking_id ON pagamentos(booking_id);
CREATE INDEX idx_pagamentos_status ON pagamentos(status);
CREATE INDEX idx_pagamentos_asaas_payment_id ON pagamentos(asaas_payment_id);
CREATE INDEX idx_pagamentos_pago_em ON pagamentos(pago_em);

-- Trigger for updated_at
CREATE TRIGGER update_pagamentos_updated_at BEFORE UPDATE ON pagamentos
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
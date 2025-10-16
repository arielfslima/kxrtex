-- Up migration: Create notificacoes table

CREATE TYPE notificacao_tipo AS ENUM (
    'nova_proposta',
    'proposta_aceita',
    'proposta_rejeitada',
    'proposta_expirada',
    'pagamento_aprovado',
    'pagamento_rejeitado',
    'evento_amanha',
    'evento_hoje',
    'adiantamento_aprovado',
    'adiantamento_rejeitado',
    'nova_avaliacao',
    'nova_mensagem',
    'sistema'
);

CREATE TABLE notificacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo notificacao_tipo NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    mensagem TEXT NOT NULL,
    booking_id UUID REFERENCES bookings(id),
    outro_usuario_id UUID REFERENCES usuarios(id),
    dados_extras JSONB DEFAULT '{}',
    lida BOOLEAN DEFAULT FALSE,
    lida_em TIMESTAMP,
    push_enviado BOOLEAN DEFAULT FALSE,
    push_enviado_em TIMESTAMP,
    email_enviado BOOLEAN DEFAULT FALSE,
    email_enviado_em TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notificacoes_usuario_id ON notificacoes(usuario_id);
CREATE INDEX idx_notificacoes_tipo ON notificacoes(tipo);
CREATE INDEX idx_notificacoes_lida ON notificacoes(lida);
CREATE INDEX idx_notificacoes_booking_id ON notificacoes(booking_id);
CREATE INDEX idx_notificacoes_created_at ON notificacoes(created_at);

-- Trigger for updated_at
CREATE TRIGGER update_notificacoes_updated_at BEFORE UPDATE ON notificacoes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
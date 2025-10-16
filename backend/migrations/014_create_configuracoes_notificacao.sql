-- Up migration: Create configuracoes_notificacao table

CREATE TABLE configuracoes_notificacao (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID UNIQUE NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    push_nova_mensagem BOOLEAN DEFAULT TRUE,
    push_nova_proposta BOOLEAN DEFAULT TRUE,
    push_proposta_aceita BOOLEAN DEFAULT TRUE,
    push_pagamento BOOLEAN DEFAULT TRUE,
    push_avaliacao BOOLEAN DEFAULT TRUE,
    push_evento_amanha BOOLEAN DEFAULT TRUE,
    email_backup BOOLEAN DEFAULT TRUE,
    nao_perturbe_inicio TIME DEFAULT '22:00',
    nao_perturbe_fim TIME DEFAULT '08:00',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_configuracoes_notificacao_usuario_id ON configuracoes_notificacao(usuario_id);

-- Trigger for updated_at
CREATE TRIGGER update_configuracoes_notificacao_updated_at BEFORE UPDATE ON configuracoes_notificacao
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
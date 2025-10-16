-- Up migration: Create bookings table

CREATE TYPE booking_status AS ENUM ('pendente', 'confirmado', 'cancelado', 'rejeitado', 'concluido', 'em_disputa');
CREATE TYPE evento_tipo AS ENUM ('festa', 'casamento', 'aniversario', 'corporativo', 'rave', 'clube', 'bar', 'outro');
CREATE TYPE cancelamento_origem AS ENUM ('contratante', 'artista', 'admin');

CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contratante_id UUID NOT NULL REFERENCES usuarios(id),
    profissional_id UUID NOT NULL REFERENCES profissionais(id),
    titulo_evento VARCHAR(200) NOT NULL,
    descricao_evento TEXT,
    tipo_evento evento_tipo NOT NULL,
    data_evento DATE NOT NULL,
    horario_inicio TIME NOT NULL,
    horario_fim TIME NOT NULL,
    endereco_evento TEXT NOT NULL,
    cidade_evento VARCHAR(100) NOT NULL,
    estado_evento VARCHAR(2) NOT NULL,
    valor_booking DECIMAL(10,2) NOT NULL CHECK (valor_booking >= 50),
    valor_original DECIMAL(10,2),
    horas_evento DECIMAL(3,1) NOT NULL CHECK (horas_evento >= 1),
    status booking_status DEFAULT 'pendente',
    mensagem_contratante TEXT,
    equipamento_fornecido BOOLEAN DEFAULT FALSE,
    descricao_equipamento TEXT,
    numero_convidados INTEGER CHECK (numero_convidados > 0),
    expira_em TIMESTAMP NOT NULL,
    respondido_em TIMESTAMP,
    confirmado_em TIMESTAMP,
    cancelado_em TIMESTAMP,
    motivo_cancelamento TEXT,
    quem_cancelou cancelamento_origem,
    taxa_cancelamento DECIMAL(5,2) DEFAULT 0,
    concluido_em TIMESTAMP,
    checkin_artista_em TIMESTAMP,
    checkin_lat DECIMAL(10,8),
    checkin_lng DECIMAL(11,8),
    checkout_artista_em TIMESTAMP,
    requer_adiantamento BOOLEAN DEFAULT FALSE,
    percentual_adiantamento INTEGER CHECK (percentual_adiantamento >= 10 AND percentual_adiantamento <= 40),
    motivo_adiantamento TEXT,
    observacoes_internas TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_bookings_contratante_id ON bookings(contratante_id);
CREATE INDEX idx_bookings_profissional_id ON bookings(profissional_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_data_evento ON bookings(data_evento);
CREATE INDEX idx_bookings_cidade_evento ON bookings(cidade_evento);
CREATE INDEX idx_bookings_expira_em ON bookings(expira_em);

-- Trigger for updated_at
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
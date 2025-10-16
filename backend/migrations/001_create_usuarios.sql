-- Up migration: Create usuarios table
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE usuario_tipo AS ENUM ('contratante', 'artista', 'admin');
CREATE TYPE usuario_status AS ENUM ('ativo', 'suspenso', 'banido');

CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    tipo usuario_tipo NOT NULL DEFAULT 'contratante',
    foto_perfil_url TEXT,
    cpf_cnpj VARCHAR(18) UNIQUE,
    documento_verificado BOOLEAN DEFAULT FALSE,
    verificado BOOLEAN DEFAULT FALSE,
    status usuario_status DEFAULT 'ativo',
    motivo_suspensao TEXT,
    data_suspensao_ate TIMESTAMP,
    score_confiabilidade INTEGER DEFAULT 50 CHECK (score_confiabilidade >= 0 AND score_confiabilidade <= 100),
    ultimo_login TIMESTAMP,
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMP,
    email_verification_token VARCHAR(255),
    email_verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_tipo ON usuarios(tipo);
CREATE INDEX idx_usuarios_status ON usuarios(status);
CREATE INDEX idx_usuarios_cpf_cnpj ON usuarios(cpf_cnpj);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
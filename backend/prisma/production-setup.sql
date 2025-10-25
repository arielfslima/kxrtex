-- KXRTEX Production Database Setup
-- Este arquivo documenta o que será executado pelas migrations
-- Não execute diretamente - use: npx prisma migrate deploy

-- Migration: 20251023231834_init
-- Tabelas principais do sistema

-- Migration: 20251024203516_add_infracoes_table
-- Tabela de infrações para anti-circumvention

-- Migration: 20251024234226_add_admin_user_type
-- Adiciona tipo ADMIN ao enum TipoUsuario

-- Migration: 20251025000058_add_device_tokens
-- Tabela de tokens de dispositivos para push notifications

-- ATENÇÃO: Para aplicar as migrations em produção, execute:
-- railway run npx prisma migrate deploy
-- OU conecte via Railway CLI e execute: npx prisma migrate deploy

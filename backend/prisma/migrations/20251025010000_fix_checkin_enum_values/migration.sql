-- Recriar o enum com os novos valores
-- Primeiro, converter para text temporariamente
ALTER TABLE "check_ins" ALTER COLUMN "tipo" TYPE TEXT;

-- Atualizar valores existentes
UPDATE "check_ins" SET "tipo" = 'CHEGADA' WHERE "tipo" = 'EVENTO';
UPDATE "check_ins" SET "tipo" = 'SAIDA' WHERE "tipo" = 'HOTEL';

-- Dropar enum antigo e criar novo
DROP TYPE IF EXISTS "TipoCheckIn";
CREATE TYPE "TipoCheckIn" AS ENUM ('CHEGADA', 'SAIDA');

-- Converter coluna de volta para o enum
ALTER TABLE "check_ins" ALTER COLUMN "tipo" TYPE "TipoCheckIn" USING ("tipo"::"TipoCheckIn");

-- AlterTable Booking - Adiciona campos para QR Code (futuro)
ALTER TABLE "bookings" ADD COLUMN "qrCodeCheckIn" TEXT;
ALTER TABLE "bookings" ADD COLUMN "qrCodeGeradoEm" TIMESTAMP(3);
ALTER TABLE "bookings" ADD COLUMN "qrCodeExpiracaoEm" TIMESTAMP(3);

-- AlterTable CheckIn - Sistema de validação bilateral
-- Tornar latitude e longitude opcionais
ALTER TABLE "check_ins" ALTER COLUMN "latitude" DROP NOT NULL;
ALTER TABLE "check_ins" ALTER COLUMN "longitude" DROP NOT NULL;

-- Tornar foto obrigatória (se já não for)
UPDATE "check_ins" SET "fotoUrl" = '' WHERE "fotoUrl" IS NULL;
ALTER TABLE "check_ins" ALTER COLUMN "fotoUrl" SET NOT NULL;

-- Adicionar campos de validação e aprovação
ALTER TABLE "check_ins" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'PENDENTE';
ALTER TABLE "check_ins" ADD COLUMN "aprovadoEm" TIMESTAMP(3);
ALTER TABLE "check_ins" ADD COLUMN "validadoPor" TEXT;
ALTER TABLE "check_ins" ADD COLUMN "rejeitadoPor" TEXT;
ALTER TABLE "check_ins" ADD COLUMN "motivoRejeicao" TEXT;

-- Adicionar metadados para análise de fraude
ALTER TABLE "check_ins" ADD COLUMN "distanciaDoLocal" DOUBLE PRECISION;
ALTER TABLE "check_ins" ADD COLUMN "dentroJanela" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "check_ins" ADD COLUMN "scoreConfiabilidade" INTEGER;

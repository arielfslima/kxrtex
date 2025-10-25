-- AlterTable Booking - Adicionar campos estruturados de localização
ALTER TABLE "bookings" ADD COLUMN "localEndereco" TEXT;
ALTER TABLE "bookings" ADD COLUMN "localCidade" TEXT;
ALTER TABLE "bookings" ADD COLUMN "localEstado" TEXT;
ALTER TABLE "bookings" ADD COLUMN "localCEP" TEXT;
ALTER TABLE "bookings" ADD COLUMN "localLatitude" DOUBLE PRECISION;
ALTER TABLE "bookings" ADD COLUMN "localLongitude" DOUBLE PRECISION;

-- Comentário: O campo 'local' continua existindo para compatibilidade
-- e armazena o endereço formatado completo para exibição

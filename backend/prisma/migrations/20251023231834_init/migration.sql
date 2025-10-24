-- CreateEnum
CREATE TYPE "TipoUsuario" AS ENUM ('CONTRATANTE', 'ARTISTA');

-- CreateEnum
CREATE TYPE "StatusUsuario" AS ENUM ('ATIVO', 'SUSPENSO', 'BANIDO');

-- CreateEnum
CREATE TYPE "PlanoArtista" AS ENUM ('FREE', 'PLUS', 'PRO');

-- CreateEnum
CREATE TYPE "StatusVerificacao" AS ENUM ('NAO_VERIFICADO', 'VERIFICADO', 'PENDENTE');

-- CreateEnum
CREATE TYPE "CategoriaArtista" AS ENUM ('DJ', 'MC', 'PERFORMER');

-- CreateEnum
CREATE TYPE "StatusBooking" AS ENUM ('PENDENTE', 'ACEITO', 'CONFIRMADO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO', 'DISPUTA');

-- CreateEnum
CREATE TYPE "TipoProposta" AS ENUM ('INICIAL', 'CONTRA_PROPOSTA');

-- CreateEnum
CREATE TYPE "StatusTransacao" AS ENUM ('PENDENTE', 'CONFIRMADO', 'FALHADO', 'REEMBOLSADO');

-- CreateEnum
CREATE TYPE "MetodoPagamento" AS ENUM ('PIX', 'CARTAO');

-- CreateEnum
CREATE TYPE "StatusSaque" AS ENUM ('SOLICITADO', 'PROCESSANDO', 'CONCLUIDO', 'FALHADO');

-- CreateEnum
CREATE TYPE "TipoCheckIn" AS ENUM ('EVENTO', 'HOTEL');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "tipo" "TipoUsuario" NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "cpfCnpj" TEXT NOT NULL,
    "foto" TEXT,
    "status" "StatusUsuario" NOT NULL DEFAULT 'ATIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "artistas" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "nomeArtistico" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "valorBaseHora" DOUBLE PRECISION NOT NULL,
    "categoria" "CategoriaArtista" NOT NULL,
    "subcategorias" TEXT[],
    "cidadesAtuacao" TEXT[],
    "portfolio" TEXT[],
    "redesSociais" JSONB,
    "plano" "PlanoArtista" NOT NULL DEFAULT 'FREE',
    "statusVerificacao" "StatusVerificacao" NOT NULL DEFAULT 'NAO_VERIFICADO',
    "documentos" TEXT[],
    "notaMedia" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalBookings" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "artistas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contratantes" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tipoPessoa" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contratantes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "artistaId" TEXT NOT NULL,
    "contratanteId" TEXT NOT NULL,
    "dataEvento" TIMESTAMP(3) NOT NULL,
    "horarioInicio" TEXT NOT NULL,
    "duracao" INTEGER NOT NULL,
    "local" TEXT NOT NULL,
    "descricaoEvento" TEXT NOT NULL,
    "valorArtista" DOUBLE PRECISION NOT NULL,
    "taxaPlataforma" DOUBLE PRECISION NOT NULL,
    "valorTotal" DOUBLE PRECISION NOT NULL,
    "status" "StatusBooking" NOT NULL DEFAULT 'PENDENTE',
    "distanciaKm" DOUBLE PRECISION,
    "precisaAdiantamento" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "propostas" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "tipo" "TipoProposta" NOT NULL,
    "valorProposto" DOUBLE PRECISION NOT NULL,
    "mensagem" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "propostas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "check_ins" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "tipo" "TipoCheckIn" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "fotoUrl" TEXT,

    CONSTRAINT "check_ins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transacoes" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "metodo" "MetodoPagamento" NOT NULL,
    "status" "StatusTransacao" NOT NULL DEFAULT 'PENDENTE',
    "asaasId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saques" (
    "id" TEXT NOT NULL,
    "artistaId" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "pixChave" TEXT NOT NULL,
    "status" "StatusSaque" NOT NULL DEFAULT 'SOLICITADO',
    "asaasId" TEXT,
    "solicitadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processadoEm" TIMESTAMP(3),

    CONSTRAINT "saques_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adiantamentos" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "liberadoEm" TIMESTAMP(3),
    "fotoCheckinUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "adiantamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avaliacoes" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "avaliadorId" TEXT NOT NULL,
    "avaliadoId" TEXT NOT NULL,
    "profissionalismo" INTEGER NOT NULL,
    "pontualidade" INTEGER NOT NULL,
    "performance" INTEGER,
    "comunicacao" INTEGER NOT NULL,
    "condicoes" INTEGER,
    "respeito" INTEGER,
    "comentario" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "avaliacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seguindo" (
    "id" TEXT NOT NULL,
    "seguidorId" TEXT NOT NULL,
    "seguidoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seguindo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "indicacoes" (
    "id" TEXT NOT NULL,
    "indicadorId" TEXT NOT NULL,
    "indicadoId" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "creditoGerado" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "indicacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mensagens" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "remetenteId" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'TEXTO',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mensagens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificacoes" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "link" TEXT,
    "lida" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificacoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_cpfCnpj_key" ON "usuarios"("cpfCnpj");

-- CreateIndex
CREATE UNIQUE INDEX "artistas_usuarioId_key" ON "artistas"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "contratantes_usuarioId_key" ON "contratantes"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "adiantamentos_bookingId_key" ON "adiantamentos"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "seguindo_seguidorId_seguidoId_key" ON "seguindo"("seguidorId", "seguidoId");

-- CreateIndex
CREATE UNIQUE INDEX "indicacoes_indicadoId_key" ON "indicacoes"("indicadoId");

-- CreateIndex
CREATE UNIQUE INDEX "indicacoes_codigo_key" ON "indicacoes"("codigo");

-- AddForeignKey
ALTER TABLE "artistas" ADD CONSTRAINT "artistas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contratantes" ADD CONSTRAINT "contratantes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_artistaId_fkey" FOREIGN KEY ("artistaId") REFERENCES "artistas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_contratanteId_fkey" FOREIGN KEY ("contratanteId") REFERENCES "contratantes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propostas" ADD CONSTRAINT "propostas_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transacoes" ADD CONSTRAINT "transacoes_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saques" ADD CONSTRAINT "saques_artistaId_fkey" FOREIGN KEY ("artistaId") REFERENCES "artistas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adiantamentos" ADD CONSTRAINT "adiantamentos_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avaliacoes" ADD CONSTRAINT "avaliacoes_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avaliacoes" ADD CONSTRAINT "avaliacoes_avaliadorId_fkey" FOREIGN KEY ("avaliadorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avaliacoes" ADD CONSTRAINT "avaliacoes_avaliadoId_fkey" FOREIGN KEY ("avaliadoId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seguindo" ADD CONSTRAINT "seguindo_seguidorId_fkey" FOREIGN KEY ("seguidorId") REFERENCES "contratantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seguindo" ADD CONSTRAINT "seguindo_seguidoId_fkey" FOREIGN KEY ("seguidoId") REFERENCES "artistas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "indicacoes" ADD CONSTRAINT "indicacoes_indicadorId_fkey" FOREIGN KEY ("indicadorId") REFERENCES "contratantes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "indicacoes" ADD CONSTRAINT "indicacoes_indicadoId_fkey" FOREIGN KEY ("indicadoId") REFERENCES "contratantes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensagens" ADD CONSTRAINT "mensagens_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensagens" ADD CONSTRAINT "mensagens_remetenteId_fkey" FOREIGN KEY ("remetenteId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificacoes" ADD CONSTRAINT "notificacoes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

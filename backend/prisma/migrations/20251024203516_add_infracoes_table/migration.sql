-- CreateTable
CREATE TABLE "infracoes" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "gravidade" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "conteudoOriginal" TEXT,
    "bookingId" TEXT,
    "acaoTomada" TEXT NOT NULL,
    "diasSuspensao" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "infracoes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "infracoes" ADD CONSTRAINT "infracoes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

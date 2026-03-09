DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'AdminRole' AND e.enumlabel = 'LEITOR_CATRACA'
  ) THEN
    ALTER TYPE "AdminRole" ADD VALUE 'LEITOR_CATRACA';
  END IF;
END $$;

CREATE TABLE "Evento" (
  "id" UUID NOT NULL,
  "nomeEvento" TEXT NOT NULL,
  "isGratuito" BOOLEAN NOT NULL DEFAULT true,
  "ativo" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Evento_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DescarbonizacaoRegistro" (
  "id" UUID NOT NULL,
  "credenciadoId" UUID NOT NULL,
  "cidadeOrigem" TEXT NOT NULL,
  "cidadeDestino" TEXT NOT NULL DEFAULT 'Franca',
  "combustivel" TEXT NOT NULL,
  "distanciaKm" DOUBLE PRECISION NOT NULL,
  "emissaoKgCo2" DOUBLE PRECISION NOT NULL,
  "fatorEmissao" DOUBLE PRECISION NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DescarbonizacaoRegistro_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Credenciado" ADD COLUMN IF NOT EXISTS "eventoId" UUID;
ALTER TABLE "Credenciado" ADD COLUMN IF NOT EXISTS "tipoCombustivel" TEXT;

CREATE INDEX IF NOT EXISTS "Credenciado_eventoId_idx" ON "Credenciado"("eventoId");
CREATE INDEX IF NOT EXISTS "DescarbonizacaoRegistro_credenciadoId_createdAt_idx" ON "DescarbonizacaoRegistro"("credenciadoId", "createdAt");

ALTER TABLE "Credenciado"
ADD CONSTRAINT "Credenciado_eventoId_fkey"
FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "DescarbonizacaoRegistro"
ADD CONSTRAINT "DescarbonizacaoRegistro_credenciadoId_fkey"
FOREIGN KEY ("credenciadoId") REFERENCES "Credenciado"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "Evento" ("id", "nomeEvento", "isGratuito", "ativo", "createdAt", "updatedAt")
VALUES ('11111111-1111-1111-1111-111111111111', 'OpsFlow Core - Demo Event', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

UPDATE "Credenciado"
SET "eventoId" = '11111111-1111-1111-1111-111111111111'
WHERE "eventoId" IS NULL;

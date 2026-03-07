DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'AdminRole' AND e.enumlabel = 'MASTER_ADMIN'
  ) THEN
    ALTER TYPE "AdminRole" ADD VALUE 'MASTER_ADMIN';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'AdminRole' AND e.enumlabel = 'OPERADOR_QR'
  ) THEN
    ALTER TYPE "AdminRole" ADD VALUE 'OPERADOR_QR';
  END IF;
END $$;

ALTER TABLE "AdminUser" ADD COLUMN IF NOT EXISTS "permissoesCustomizadas" JSONB;

ALTER TABLE "Credenciado" ADD COLUMN IF NOT EXISTS "cidadeOrigem" TEXT;
ALTER TABLE "Credenciado" ADD COLUMN IF NOT EXISTS "combustivel" TEXT;
ALTER TABLE "Credenciado" ADD COLUMN IF NOT EXISTS "distanciaKm" DOUBLE PRECISION;
ALTER TABLE "Credenciado" ADD COLUMN IF NOT EXISTS "pegadaCarbonoEstimada" DOUBLE PRECISION;

ALTER TABLE "AccessAttempt" ADD COLUMN IF NOT EXISTS "operatorId" UUID;
ALTER TABLE "AccessAttempt" ADD COLUMN IF NOT EXISTS "operatorNome" TEXT;
ALTER TABLE "AccessAttempt" ADD COLUMN IF NOT EXISTS "operatorRole" TEXT;
ALTER TABLE "AccessAttempt" ADD COLUMN IF NOT EXISTS "deviceId" TEXT;
ALTER TABLE "AccessAttempt" ADD COLUMN IF NOT EXISTS "deviceInfo" JSONB;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'AccessAttempt_operatorId_fkey'
      AND table_name = 'AccessAttempt'
  ) THEN
    ALTER TABLE "AccessAttempt"
      ADD CONSTRAINT "AccessAttempt_operatorId_fkey"
      FOREIGN KEY ("operatorId") REFERENCES "AdminUser"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "AccessAttempt_operatorId_createdAt_idx"
  ON "AccessAttempt"("operatorId", "createdAt");

CREATE INDEX IF NOT EXISTS "AccessAttempt_deviceId_createdAt_idx"
  ON "AccessAttempt"("deviceId", "createdAt");

UPDATE "AdminUser"
SET "role" = 'OPERADOR_QR'
WHERE "role" IN ('APP_GATE', 'LEITOR_CATRACA');

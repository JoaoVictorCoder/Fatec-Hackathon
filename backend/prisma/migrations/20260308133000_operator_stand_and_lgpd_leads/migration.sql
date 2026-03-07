ALTER TABLE "Credenciado"
ADD COLUMN "aceitouCompartilhamentoComExpositores" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "AdminUser"
ADD COLUMN "standId" TEXT,
ADD COLUMN "standName" TEXT,
ADD COLUMN "empresaNome" TEXT;

ALTER TABLE "AccessAttempt"
ADD COLUMN "operatorEmail" TEXT,
ADD COLUMN "standId" TEXT,
ADD COLUMN "standName" TEXT,
ADD COLUMN "empresaNome" TEXT;

CREATE INDEX "AccessAttempt_standId_createdAt_idx" ON "AccessAttempt"("standId", "createdAt");

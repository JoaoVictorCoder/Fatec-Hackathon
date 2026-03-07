import { prisma } from "../src/prisma.js";
import { exportOperationalBackup } from "../src/services/backupService.js";

try {
  const result = await exportOperationalBackup({
    id: "system-script",
    email: "system@local",
    role: "SYSTEM"
  });
  console.log("Backup gerado:", result.filePath);
} catch (error) {
  console.error("Falha ao gerar backup:", error.message);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}

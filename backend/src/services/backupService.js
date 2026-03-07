import fs from "node:fs/promises";
import path from "node:path";
import { prisma } from "../prisma.js";

const backupDir = path.resolve(process.cwd(), "backups");

function nowStamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

export async function exportOperationalBackup(actor) {
  await fs.mkdir(backupDir, { recursive: true });

  const [users, credenciados, credenciais, accessAttempts, auditLogs] = await Promise.all([
    prisma.adminUser.findMany(),
    prisma.credenciado.findMany(),
    prisma.credencial.findMany(),
    prisma.accessAttempt.findMany(),
    prisma.auditLog.findMany()
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    exportedBy: actor ? { id: actor.id, email: actor.email, role: actor.role } : null,
    counts: {
      users: users.length,
      credenciados: credenciados.length,
      credenciais: credenciais.length,
      accessAttempts: accessAttempts.length,
      auditLogs: auditLogs.length
    },
    data: {
      users,
      credenciados,
      credenciais,
      accessAttempts,
      auditLogs
    }
  };

  const fileName = `backup-${nowStamp()}.json`;
  const filePath = path.join(backupDir, fileName);
  await fs.writeFile(filePath, JSON.stringify(payload, null, 2), "utf-8");

  return {
    fileName,
    filePath,
    exportedAt: payload.exportedAt,
    counts: payload.counts
  };
}

export async function getBackupStatus() {
  await fs.mkdir(backupDir, { recursive: true });
  const files = (await fs.readdir(backupDir))
    .filter((item) => item.endsWith(".json"))
    .sort((a, b) => (a > b ? -1 : 1));

  const latest = files[0] || null;
  return {
    backupDir,
    totalFiles: files.length,
    latestFile: latest
  };
}

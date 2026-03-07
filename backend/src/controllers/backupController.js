import { createAuditLog } from "../repositories/auditLogRepository.js";
import { exportOperationalBackup, getBackupStatus } from "../services/backupService.js";

export async function backupStatusHandler(_req, res) {
  const data = await getBackupStatus();
  return res.json(data);
}

export async function backupExportHandler(req, res) {
  const data = await exportOperationalBackup(req.auth);

  await createAuditLog({
    actorType: "ADMIN_USER",
    actorId: req.auth?.id || null,
    acao: "BACKUP_EXPORT",
    recurso: "BACKUP",
    detalhes: { fileName: data.fileName, counts: data.counts }
  });

  return res.status(201).json(data);
}

import {
  findAccessAttemptById,
  listAccessAttempts
} from "../repositories/accessAttemptRepository.js";

export async function listAccessLogsAdminHandler(req, res) {
  const page = Math.max(Number(req.query.page || 1), 1);
  const pageSize = Math.min(Math.max(Number(req.query.pageSize || 20), 1), 100);

  const { items, total } = await listAccessAttempts({
    page,
    pageSize,
    resultado: typeof req.query.resultado === "string" ? req.query.resultado : undefined,
    categoria: typeof req.query.categoria === "string" ? req.query.categoria : undefined,
    operatorId: typeof req.query.operatorId === "string" ? req.query.operatorId : undefined,
    credenciadoId: typeof req.query.credenciadoId === "string" ? req.query.credenciadoId : undefined,
    dateFrom: typeof req.query.dateFrom === "string" ? req.query.dateFrom : undefined,
    dateTo: typeof req.query.dateTo === "string" ? req.query.dateTo : undefined
  });

  return res.json({
    items: items.map((item) => ({
      id: item.id,
      credencialId: item.credencialId,
      credenciadoId: item.credencial?.credenciado?.id || null,
      nomeCredenciado: item.credencial?.credenciado?.nomeCompleto || null,
      categoria: item.credencial?.credenciado?.categoria || null,
      operatorId: item.operatorId,
      operatorNome: item.operatorNome,
      operatorRole: item.operatorRole,
      deviceId: item.deviceId,
      deviceInfo: item.deviceInfo,
      accessPoint: item.accessPoint,
      gate: item.gateDevice
        ? {
            id: item.gateDevice.id,
            codigo: item.gateDevice.codigo,
            nome: item.gateDevice.nome
          }
        : null,
      resultado: item.resultado,
      motivo: item.motivo,
      createdAt: item.createdAt
    })),
    page,
    pageSize,
    total,
    totalPages: Math.max(Math.ceil(total / pageSize), 1)
  });
}

export async function getAccessLogByIdAdminHandler(req, res) {
  const item = await findAccessAttemptById(req.params.id);
  if (!item) {
    return res.status(404).json({ error: "log de acesso nao encontrado" });
  }

  return res.json({
    id: item.id,
    credencialId: item.credencialId,
    credenciadoId: item.credencial?.credenciado?.id || null,
    nomeCredenciado: item.credencial?.credenciado?.nomeCompleto || null,
    categoria: item.credencial?.credenciado?.categoria || null,
    operatorId: item.operatorId,
    operatorNome: item.operatorNome,
    operatorRole: item.operatorRole,
    deviceId: item.deviceId,
    deviceInfo: item.deviceInfo,
    accessPoint: item.accessPoint,
    gate: item.gateDevice,
    resultado: item.resultado,
    motivo: item.motivo,
    metadata: item.metadata,
    createdAt: item.createdAt
  });
}

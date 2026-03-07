import { prisma } from "../prisma.js";
import {
  StatusCredenciamento,
  StatusCredencial,
  TipoEventoSistema
} from "../domain/enums.js";
import { generateCredentialCode } from "../utils/codeGenerator.js";
import {
  findCredenciadoById,
  updateCredenciadoById
} from "../repositories/credenciadoRepository.js";
import {
  existsByCodigoUnico,
  findCredencialById,
  updateCredencialById,
  updateCredencialStatus
} from "../repositories/credencialRepository.js";
import { createEventoSistema } from "../repositories/eventoSistemaRepository.js";
import { createAuditLog } from "../repositories/auditLogRepository.js";

async function generateUniqueCredentialCode(tx) {
  for (let i = 0; i < 5; i += 1) {
    const code = generateCredentialCode();
    const exists = await existsByCodigoUnico(code, tx);
    if (!exists) {
      return code;
    }
  }
  throw new Error("nao foi possivel reemitir codigo unico");
}

function getActorType(auth) {
  return auth?.role === "APP_GATE" || auth?.role === "LEITOR_CATRACA" || auth?.role === "OPERADOR_QR"
    ? "APP_GATE"
    : "ADMIN_USER";
}

export async function updateCredenciadoAdmin(id, data, auth) {
  return prisma.$transaction(async (tx) => {
    const before = await findCredenciadoById(id);
    const updated = await updateCredenciadoById(id, data, tx);

    await createEventoSistema(
      {
        credenciadoId: id,
        tipoEvento: TipoEventoSistema.DADOS_ATUALIZADOS,
        descricao: "Cadastro atualizado por admin",
        metadata: { changedFields: Object.keys(data) }
      },
      tx
    );

    await createAuditLog(
      {
        actorType: getActorType(auth),
        actorId: auth?.id || null,
        acao: "CREDENCIADO_UPDATE",
        recurso: "CREDENCIADO",
        recursoId: id,
        detalhes: { before, after: updated, changedFields: Object.keys(data) }
      },
      tx
    );

    return updated;
  });
}

export async function updateCredenciadoStatusAdmin(id, status, reason, auth) {
  return prisma.$transaction(async (tx) => {
    const updated = await updateCredenciadoById(id, { statusCredenciamento: status }, tx);
    await createAuditLog(
      {
        actorType: getActorType(auth),
        actorId: auth?.id || null,
        acao: "CREDENCIADO_STATUS_UPDATE",
        recurso: "CREDENCIADO",
        recursoId: id,
        detalhes: { status, reason: reason || null }
      },
      tx
    );
    return updated;
  });
}

export async function softDeleteCredenciadoAdmin(id, reason, auth) {
  return updateCredenciadoStatusAdmin(id, StatusCredenciamento.INATIVO, reason, auth);
}

export async function updateCredencialStatusAdmin(id, statusCredencial, reason, auth) {
  return prisma.$transaction(async (tx) => {
    const updated = await updateCredencialStatus(id, statusCredencial, tx);
    await createAuditLog(
      {
        actorType: getActorType(auth),
        actorId: auth?.id || null,
        acao: "CREDENCIAL_STATUS_UPDATE",
        recurso: "CREDENCIAL",
        recursoId: id,
        detalhes: { statusCredencial, reason: reason || null }
      },
      tx
    );
    return updated;
  });
}

export async function updateCredencialAdmin(id, data, auth) {
  return prisma.$transaction(async (tx) => {
    const current = await findCredencialById(id, tx);
    if (!current) {
      return null;
    }

    const nextData = {};
    if (typeof data.codigoUnico === "string" && data.codigoUnico.trim()) {
      nextData.codigoUnico = data.codigoUnico.trim().toUpperCase();
    }
    if (typeof data.qrCodePayload === "string" && data.qrCodePayload.trim()) {
      nextData.qrCodePayload = data.qrCodePayload.trim();
    }
    if (
      typeof data.statusCredencial === "string" &&
      Object.values(StatusCredencial).includes(data.statusCredencial)
    ) {
      nextData.statusCredencial = data.statusCredencial;
    }
    if (data.emitidaEm) {
      const parsed = new Date(data.emitidaEm);
      if (!Number.isNaN(parsed.getTime())) {
        nextData.emitidaEm = parsed;
      }
    }

    // Se codigo mudar e payload nao vier, manter payload consistente automaticamente.
    if (nextData.codigoUnico && !nextData.qrCodePayload) {
      nextData.qrCodePayload = JSON.stringify({
        version: 2,
        credenciadoId: current.credenciadoId,
        credentialCode: nextData.codigoUnico,
        updatedAt: new Date().toISOString()
      });
    }

    const updated = await updateCredencialById(id, nextData, tx);

    await createEventoSistema(
      {
        credenciadoId: updated.credenciadoId,
        tipoEvento: TipoEventoSistema.DADOS_ATUALIZADOS,
        descricao: "Credencial atualizada por admin",
        metadata: {
          credencialId: updated.id,
          changedFields: Object.keys(nextData)
        }
      },
      tx
    );

    await createAuditLog(
      {
        actorType: getActorType(auth),
        actorId: auth?.id || null,
        acao: "CREDENCIAL_UPDATE",
        recurso: "CREDENCIAL",
        recursoId: id,
        detalhes: {
          changedFields: Object.keys(nextData)
        }
      },
      tx
    );

    return updated;
  });
}

export async function reissueCredencialAdmin(id, reason, auth) {
  return prisma.$transaction(async (tx) => {
    const credencial = await findCredencialById(id, tx);
    if (!credencial) {
      return null;
    }

    const codigoUnico = await generateUniqueCredentialCode(tx);
    const qrCodePayload = JSON.stringify({
      version: 2,
      credenciadoId: credencial.credenciadoId,
      credentialCode: codigoUnico,
      reissuedAt: new Date().toISOString()
    });

    const updated = await updateCredencialById(
      id,
      {
        codigoUnico,
        qrCodePayload,
        emitidaEm: new Date(),
        statusCredencial: "ATIVA"
      },
      tx
    );

    await createAuditLog(
      {
        actorType: getActorType(auth),
        actorId: auth?.id || null,
        acao: "CREDENCIAL_REEMITIR",
        recurso: "CREDENCIAL",
        recursoId: id,
        detalhes: { reason: reason || null, codigoUnico }
      },
      tx
    );

    return updated;
  });
}

import { prisma } from "../prisma.js";
import {
  AccessReason,
  AccessResult,
  StatusCredencial,
  StatusCredenciamento,
  TipoEventoSistema
} from "../domain/enums.js";
import {
  createAccessAttempt,
  countRecentAttemptsByCredencial
} from "../repositories/accessAttemptRepository.js";
import { findCredencialByCodigoUnico } from "../repositories/credencialRepository.js";
import { upsertGateDevice } from "../repositories/gateDeviceRepository.js";
import { createEventoSistema } from "../repositories/eventoSistemaRepository.js";
import { createAuditLog } from "../repositories/auditLogRepository.js";
import { MockGateProvider } from "../providers/gate/mockGateProvider.js";

const gateProvider = new MockGateProvider();

export async function validateAndCheckIn(
  { codigoUnico, gateCode, accessPoint, deviceId, deviceInfo, observacaoOperacional },
  actor
) {
  return prisma.$transaction(async (tx) => {
    const gateDevice = await upsertGateDevice(
      {
        codigo: gateCode,
        nome: `Gate ${gateCode}`,
        localizacao: accessPoint || gateCode
      },
      tx
    );

    const credencial = await findCredencialByCodigoUnico(codigoUnico, tx);
    if (!credencial) {
      await createAccessAttempt(
        {
          credencialId: null,
          gateDeviceId: gateDevice.id,
          accessPoint: accessPoint || gateCode,
          resultado: AccessResult.DENY,
          motivo: AccessReason.CREDENCIAL_INVALIDA,
          operatorId: actor?.actorId || null,
          operatorNome: actor?.actorName || null,
          operatorEmail: actor?.actorEmail || null,
          operatorRole: actor?.actorRole || null,
          standId: actor?.standId || null,
          standName: actor?.standName || null,
          empresaNome: actor?.empresaNome || null,
          deviceId: deviceId || null,
          deviceInfo: deviceInfo || null,
          metadata: { codigoUnico, observacaoOperacional: observacaoOperacional || null }
        },
        tx
      );
      await createAuditLog(
        {
          actorType: actor?.actorType || "SYSTEM",
          actorId: actor?.actorId || null,
          acao: "CHECKIN_VALIDATE",
          recurso: "CREDENCIAL",
          detalhes: {
            resultado: AccessResult.DENY,
            motivo: AccessReason.CREDENCIAL_INVALIDA,
            codigoUnico
          }
        },
        tx
      );
      return {
        allowed: false,
        reason: AccessReason.CREDENCIAL_INVALIDA,
        credencial: null,
        gateDevice,
        gateResponse: await gateProvider.sendAccessDecision({
          gateDevice,
          decision: AccessResult.DENY,
          reason: AccessReason.CREDENCIAL_INVALIDA,
          metadata: { codigoUnico }
        })
      };
    }

    let reason = AccessReason.ACESSO_PERMITIDO;
    let allowed = true;

    if (
      credencial.statusCredencial === StatusCredencial.INATIVA
    ) {
      reason = AccessReason.CREDENCIAL_INATIVA;
      allowed = false;
    } else if (credencial.statusCredencial === StatusCredencial.CANCELADA) {
      reason = AccessReason.CREDENCIAL_CANCELADA;
      allowed = false;
    } else if (
      credencial.credenciado.statusCredenciamento === StatusCredenciamento.BLOQUEADO ||
      credencial.credenciado.statusCredenciamento === StatusCredenciamento.INATIVO
    ) {
      reason = AccessReason.CREDENCIAL_BLOQUEADA;
      allowed = false;
    }

    const result = allowed ? AccessResult.ALLOW : AccessResult.DENY;

    await createAccessAttempt(
      {
        credencialId: credencial.id,
        gateDeviceId: gateDevice.id,
        operatorId: actor?.actorId || null,
        operatorNome: actor?.actorName || null,
        operatorEmail: actor?.actorEmail || null,
        operatorRole: actor?.actorRole || null,
        standId: actor?.standId || null,
        standName: actor?.standName || null,
        empresaNome: actor?.empresaNome || null,
        deviceId: deviceId || null,
        deviceInfo: deviceInfo || null,
        accessPoint: accessPoint || gateCode,
        resultado: result,
        motivo: reason,
        metadata: {
          credenciadoId: credencial.credenciado.id,
          categoria: credencial.credenciado.categoria,
          observacaoOperacional: observacaoOperacional || null
        }
      },
      tx
    );

    if (allowed) {
      await tx.credenciado.update({
        where: { id: credencial.credenciado.id },
        data: { statusCredenciamento: StatusCredenciamento.CHECKED_IN }
      });
      await createEventoSistema(
        {
          credenciadoId: credencial.credenciado.id,
          tipoEvento: TipoEventoSistema.ACESSO_VALIDADO,
          descricao: "Acesso validado no check-in",
          metadata: { gateCode, accessPoint: accessPoint || gateCode }
        },
        tx
      );
    } else {
      await createEventoSistema(
        {
          credenciadoId: credencial.credenciado.id,
          tipoEvento: TipoEventoSistema.ACESSO_NEGADO,
          descricao: "Acesso negado no check-in",
          metadata: { reason, gateCode, accessPoint: accessPoint || gateCode }
        },
        tx
      );
    }

    const attemptsLast5Min = await countRecentAttemptsByCredencial(
      {
        credencialId: credencial.id,
        sinceDate: new Date(Date.now() - 5 * 60 * 1000)
      },
      tx
    );

    await createAuditLog(
      {
        actorType: actor?.actorType || "SYSTEM",
        actorId: actor?.actorId || null,
        acao: "CHECKIN_VALIDATE",
        recurso: "CREDENCIAL",
        recursoId: credencial.id,
        detalhes: {
          resultado: result,
          motivo: reason,
          gateCode,
          deviceId: deviceId || null,
          attemptsLast5Min
        }
      },
      tx
    );

    const gateResponse = await gateProvider.sendAccessDecision({
      gateDevice,
      decision: result,
      reason,
      metadata: {
        credencialId: credencial.id,
        credenciadoId: credencial.credenciado.id
      }
    });

    return {
      allowed,
      reason,
      credencial,
      gateDevice,
      gateResponse
    };
  });
}

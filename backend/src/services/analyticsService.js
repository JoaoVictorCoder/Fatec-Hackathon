import { prisma } from "../prisma.js";
import {
  aggregateAccessAttempts,
  countRecentDeniedByGate
} from "../repositories/accessAttemptRepository.js";
import { toFraudInsightDTO } from "../mappers/identityMapper.js";

export async function getAnalyticsOverview() {
  const [totalCredenciados, totalCredenciaisGeradas, accessStats, byCategoria, auditCorrections, auditReissue, auditBlock] =
    await Promise.all([
      prisma.credenciado.count(),
      prisma.credencial.count(),
      aggregateAccessAttempts(),
      prisma.credenciado.groupBy({
        by: ["categoria"],
        _count: { _all: true }
      }),
      prisma.auditLog.count({ where: { acao: "CREDENCIADO_UPDATE" } }),
      prisma.auditLog.count({ where: { acao: "CREDENCIAL_REEMITIR" } }),
      prisma.auditLog.count({
        where: {
          OR: [
            { acao: "CREDENCIADO_STATUS_UPDATE" },
            { acao: "CREDENCIAL_STATUS_UPDATE" }
          ]
        }
      })
    ]);

  return {
    totalCredenciados,
    totalCredenciaisGeradas,
    totalEntradasPermitidas: accessStats.allowed,
    totalEntradasNegadas: accessStats.denied,
    totalCheckInsPermitidos: accessStats.allowed,
    totalCheckInsNegados: accessStats.denied,
    acessosPorCategoria: byCategoria.map((item) => ({
      categoria: item.categoria,
      total: item._count._all
    })),
    acessosPorFaixaHorario: accessStats.byHour,
    totalCadastrosCorrigidosManualmente: auditCorrections,
    totalCredenciaisReemitidas: auditReissue,
    totalBloqueios: auditBlock,
    principaisMotivosRecusa: accessStats.byReason
      .filter((item) => item.motivo !== "ACESSO_PERMITIDO")
      .map((item) => ({ motivo: item.motivo, total: item._count._all }))
  };
}

export async function getFraudInsights() {
  const sinceDate = new Date(Date.now() - 10 * 60 * 1000);
  const [blockedCredentialAttempts, deniedByGate] =
    await Promise.all([
      prisma.accessAttempt.findMany({
        where: {
          OR: [
            { motivo: "CREDENCIAL_BLOQUEADA" },
            { motivo: "CREDENCIAL_CANCELADA" },
            { motivo: "CREDENCIAL_INATIVA" }
          ],
          createdAt: { gte: sinceDate }
        },
        take: 20
      }),
      prisma.gateDevice.findMany({
        take: 20
      })
    ]);

  const insights = [];

  for (const item of blockedCredentialAttempts) {
    insights.push(
      toFraudInsightDTO({
        type: "BLOCKED_CREDENTIAL_ATTEMPT",
        severity: "MEDIUM",
        message: "Credencial bloqueada tentando acesso",
        credencialId: item.credencialId,
        count: 1
      })
    );
  }

  for (const gate of deniedByGate) {
    const denied = await countRecentDeniedByGate({
      gateDeviceId: gate.id,
      sinceDate
    });
    if (denied >= 5) {
      insights.push(
        toFraudInsightDTO({
          type: "EXCESSIVE_DENY_BY_GATE",
          severity: "MEDIUM",
          message: "Excesso de recusas por gate/device",
          gateDeviceId: gate.id,
          count: denied
        })
      );
    }
  }

  return insights;
}

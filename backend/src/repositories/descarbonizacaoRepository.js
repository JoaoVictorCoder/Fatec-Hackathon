import { prisma } from "../prisma.js";

export async function createDescarbonizacaoRegistro(data, tx = prisma) {
  return tx.descarbonizacaoRegistro.create({ data });
}

export async function listDescarbonizacaoRegistros({ limit = 50 } = {}) {
  return prisma.descarbonizacaoRegistro.findMany({
    include: {
      credenciado: {
        select: {
          id: true,
          nomeCompleto: true,
          categoria: true,
          municipio: true,
          uf: true
        }
      }
    },
    orderBy: { createdAt: "desc" },
    take: limit
  });
}

export async function getDescarbonizacaoResumo() {
  const [total, avg, topOrigens] = await Promise.all([
    prisma.descarbonizacaoRegistro.count(),
    prisma.descarbonizacaoRegistro.aggregate({
      _avg: { emissaoKgCo2: true, distanciaKm: true }
    }),
    prisma.descarbonizacaoRegistro.groupBy({
      by: ["cidadeOrigem"],
      _count: { _all: true },
      orderBy: { _count: { cidadeOrigem: "desc" } },
      take: 5
    })
  ]);

  return {
    totalRegistros: total,
    mediaEmissaoKgCo2: avg._avg.emissaoKgCo2 || 0,
    mediaDistanciaKm: avg._avg.distanciaKm || 0,
    topOrigens: topOrigens.map((item) => ({
      cidadeOrigem: item.cidadeOrigem,
      total: item._count._all
    }))
  };
}

import { prisma } from "../prisma.js";

const DEFAULT_EVENTO_ID = "11111111-1111-1111-1111-111111111111";
const DEFAULT_EVENTO_NOME = "OpsFlow Core - Default Event";

export async function findActiveEvento(tx = prisma) {
  return tx.evento.findFirst({
    where: { ativo: true },
    orderBy: { createdAt: "asc" }
  });
}

export async function findOrCreateDefaultEvento(tx = prisma) {
  const active = await findActiveEvento(tx);
  if (active) {
    return active;
  }

  return tx.evento.upsert({
    where: { id: DEFAULT_EVENTO_ID },
    update: { ativo: true },
    create: {
      id: DEFAULT_EVENTO_ID,
      nomeEvento: DEFAULT_EVENTO_NOME,
      isGratuito: true,
      ativo: true
    }
  });
}

export async function listEventos({ ativo } = {}, tx = prisma) {
  return tx.evento.findMany({
    where: { ativo: typeof ativo === "boolean" ? ativo : undefined },
    orderBy: { createdAt: "desc" }
  });
}

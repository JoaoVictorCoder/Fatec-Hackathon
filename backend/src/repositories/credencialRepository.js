import { prisma } from "../prisma.js";

export async function createCredencial(data, tx = prisma) {
  return tx.credencial.create({ data });
}

export async function findCredencialById(id, tx = prisma) {
  return tx.credencial.findUnique({
    where: { id },
    include: { credenciado: { include: { evento: true } } }
  });
}

export async function findCredencialByCodigoUnico(codigoUnico, tx = prisma) {
  return tx.credencial.findUnique({
    where: { codigoUnico },
    include: { credenciado: { include: { evento: true } } }
  });
}

export async function updateCredencialStatus(id, statusCredencial, tx = prisma) {
  return tx.credencial.update({
    where: { id },
    data: { statusCredencial }
  });
}

export async function updateCredencialById(id, data, tx = prisma) {
  return tx.credencial.update({
    where: { id },
    data,
    include: { credenciado: { include: { evento: true } } }
  });
}

export async function existsByCodigoUnico(codigoUnico, tx = prisma) {
  const found = await tx.credencial.findUnique({ where: { codigoUnico } });
  return Boolean(found);
}

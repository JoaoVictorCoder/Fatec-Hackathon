import { prisma } from "../prisma.js";

const includeIdentity = {
  evento: true,
  credencial: {
    include: {
      _count: {
        select: { accessAttempts: true }
      },
      accessAttempts: {
        orderBy: { createdAt: "desc" },
        take: 1
      }
    }
  }
};

export async function createCredenciado(data, tx = prisma) {
  return tx.credenciado.create({ data, include: includeIdentity });
}

export async function listCredenciados() {
  return prisma.credenciado.findMany({
    include: includeIdentity,
    orderBy: { createdAt: "desc" }
  });
}

export async function listCredenciadosPaginated({
  search,
  categoria,
  page,
  pageSize
}) {
  const where = {
    categoria: categoria || undefined,
    OR: search
      ? [
          { nomeCompleto: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { cpf: { contains: search.replace(/\D/g, "") || search, mode: "insensitive" } },
          { cnpj: { contains: search.replace(/\D/g, "") || search, mode: "insensitive" } },
          { credencial: { codigoUnico: { contains: search, mode: "insensitive" } } }
        ]
      : undefined
  };

  const [items, total] = await Promise.all([
    prisma.credenciado.findMany({
      where,
      include: includeIdentity,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.credenciado.count({ where })
  ]);

  return { items, total };
}

export async function findCredenciadoById(id) {
  return prisma.credenciado.findUnique({
    where: { id },
    include: includeIdentity
  });
}

export async function updateCredenciadoById(id, data, tx = prisma) {
  return tx.credenciado.update({
    where: { id },
    data,
    include: includeIdentity
  });
}

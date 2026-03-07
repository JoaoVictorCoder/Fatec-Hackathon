import { prisma } from "../prisma.js";

export async function findAdminByEmail(email) {
  return prisma.adminUser.findUnique({
    where: { email }
  });
}

export async function findAdminById(id) {
  return prisma.adminUser.findUnique({
    where: { id }
  });
}

export async function listInternalUsers() {
  return prisma.adminUser.findMany({
    orderBy: { createdAt: "desc" }
  });
}

export async function createInternalUser(data) {
  return prisma.adminUser.create({ data });
}

export async function updateInternalUser(id, data) {
  return prisma.adminUser.update({
    where: { id },
    data
  });
}

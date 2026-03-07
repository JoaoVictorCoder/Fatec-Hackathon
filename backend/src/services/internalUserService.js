import bcrypt from "bcryptjs";
import { AdminRole, defaultOperatorPermissions } from "../domain/enums.js";
import {
  createInternalUser,
  findAdminByEmail,
  findAdminById,
  listInternalUsers,
  updateInternalUser
} from "../repositories/adminUserRepository.js";
import { createAuditLog } from "../repositories/auditLogRepository.js";

function sanitizePermissions(role, permissions) {
  if (role !== AdminRole.OPERADOR_QR) {
    return null;
  }

  const defaults = defaultOperatorPermissions();
  const next = { ...defaults };
  for (const key of Object.keys(defaults)) {
    if (typeof permissions?.[key] === "boolean") {
      next[key] = permissions[key];
    }
  }
  return next;
}

export async function createInternalUserService(payload, actor) {
  const nome = (payload?.nome || "").trim();
  const email = (payload?.email || "").trim().toLowerCase();
  const senha = payload?.senha || "";
  const role = payload?.role;

  if (!nome || !email || !senha || !role) {
    return { error: "nome, email, senha e role sao obrigatorios" };
  }

  if (senha.length < 8) {
    return { error: "senha deve ter no minimo 8 caracteres" };
  }

  if (!Object.values(AdminRole).includes(role)) {
    return { error: "role invalida" };
  }
  if (![AdminRole.ADMIN, AdminRole.OPERADOR_QR].includes(role)) {
    return { error: "somente ADMIN ou OPERADOR_QR podem ser criados por esta rota" };
  }

  const exists = await findAdminByEmail(email);
  if (exists) {
    return { error: "ja existe usuario com este email" };
  }

  const passwordHash = await bcrypt.hash(senha, 10);
  const created = await createInternalUser({
    nome,
    email,
    passwordHash,
    role,
    ativo: true,
    permissoesCustomizadas: sanitizePermissions(role, payload?.permissoesCustomizadas)
  });

  await createAuditLog({
    actorType: "ADMIN_USER",
    actorId: actor?.id || null,
    acao: "INTERNAL_USER_CREATE",
    recurso: "ADMIN_USER",
    recursoId: created.id,
    detalhes: { role: created.role, email: created.email }
  });

  return { user: created };
}

export async function listInternalUsersService() {
  const users = await listInternalUsers();
  return users.map((user) => ({
    id: user.id,
    nome: user.nome,
    email: user.email,
    role: user.role,
    ativo: user.ativo,
    permissoesCustomizadas: user.permissoesCustomizadas,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  }));
}

export async function updateInternalUserService(id, payload, actor) {
  const current = await findAdminById(id);
  if (!current) {
    return { notFound: true };
  }

  const next = {};
  if (typeof payload?.nome === "string" && payload.nome.trim()) {
    next.nome = payload.nome.trim();
  }
  if (typeof payload?.role === "string") {
    if (!Object.values(AdminRole).includes(payload.role)) {
      return { error: "role invalida" };
    }
    if ([AdminRole.MASTER_ADMIN, AdminRole.SYSTEM].includes(payload.role)) {
      return { error: "nao e permitido elevar para MASTER_ADMIN/SYSTEM por esta rota" };
    }
    next.role = payload.role;
  }
  if (typeof payload?.senha === "string" && payload.senha) {
    if (payload.senha.length < 8) {
      return { error: "senha deve ter no minimo 8 caracteres" };
    }
    next.passwordHash = await bcrypt.hash(payload.senha, 10);
  }

  if (payload?.permissoesCustomizadas) {
    const role = next.role || current.role;
    next.permissoesCustomizadas = sanitizePermissions(role, payload.permissoesCustomizadas);
  }

  const updated = await updateInternalUser(id, next);

  await createAuditLog({
    actorType: "ADMIN_USER",
    actorId: actor?.id || null,
    acao: "INTERNAL_USER_UPDATE",
    recurso: "ADMIN_USER",
    recursoId: id,
    detalhes: { changedFields: Object.keys(next) }
  });

  return {
    user: {
      id: updated.id,
      nome: updated.nome,
      email: updated.email,
      role: updated.role,
      ativo: updated.ativo,
      permissoesCustomizadas: updated.permissoesCustomizadas,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt
    }
  };
}

export async function updateInternalUserActiveService(id, ativo, actor) {
  const current = await findAdminById(id);
  if (!current) {
    return { notFound: true };
  }

  const updated = await updateInternalUser(id, { ativo: Boolean(ativo) });

  await createAuditLog({
    actorType: "ADMIN_USER",
    actorId: actor?.id || null,
    acao: "INTERNAL_USER_ACTIVE_UPDATE",
    recurso: "ADMIN_USER",
    recursoId: id,
    detalhes: { ativo: Boolean(ativo) }
  });

  return { user: updated };
}

export async function updateInternalUserPermissionsService(id, permissions, actor) {
  const current = await findAdminById(id);
  if (!current) {
    return { notFound: true };
  }

  const normalized = sanitizePermissions(current.role, permissions);
  const updated = await updateInternalUser(id, {
    permissoesCustomizadas: normalized
  });

  await createAuditLog({
    actorType: "ADMIN_USER",
    actorId: actor?.id || null,
    acao: "INTERNAL_USER_PERMISSIONS_UPDATE",
    recurso: "ADMIN_USER",
    recursoId: id,
    detalhes: { permissoesCustomizadas: normalized }
  });

  return { user: updated };
}

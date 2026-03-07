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

function sanitizeStand(payload) {
  const standId = typeof payload?.standId === "string" ? payload.standId.trim() : "";
  const standName = typeof payload?.standName === "string" ? payload.standName.trim() : "";
  const empresaNome = typeof payload?.empresaNome === "string" ? payload.empresaNome.trim() : "";
  const autoStandId = !standId && (standName || empresaNome)
    ? buildStandId({ standName, empresaNome })
    : "";
  return {
    standId: standId || autoStandId || null,
    standName: standName || null,
    empresaNome: empresaNome || null
  };
}

function normalizeStandToken(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toUpperCase();
}

function buildStandId({ standName, empresaNome }) {
  const base = normalizeStandToken(standName || empresaNome || "STAND");
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `STAND-${base || "GERAL"}-${suffix}`;
}

function mapInternalUser(user) {
  return {
    id: user.id,
    nome: user.nome,
    email: user.email,
    role: user.role,
    ativo: user.ativo,
    standId: user.standId,
    standName: user.standName,
    empresaNome: user.empresaNome,
    permissoesCustomizadas: user.permissoesCustomizadas,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
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
    ...sanitizeStand(payload),
    permissoesCustomizadas: sanitizePermissions(role, payload?.permissoesCustomizadas)
  });

  await createAuditLog({
    actorType: "ADMIN_USER",
    actorId: actor?.id || null,
    acao: "INTERNAL_USER_CREATE",
    recurso: "ADMIN_USER",
    recursoId: created.id,
    detalhes: {
      role: created.role,
      email: created.email,
      standId: created.standId,
      standName: created.standName,
      empresaNome: created.empresaNome
    }
  });

  return { user: mapInternalUser(created) };
}

export async function listInternalUsersService() {
  const users = await listInternalUsers();
  return users.map(mapInternalUser);
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

  if ("standId" in (payload || {}) || "standName" in (payload || {}) || "empresaNome" in (payload || {})) {
    Object.assign(next, sanitizeStand(payload));
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

  return { user: mapInternalUser(updated) };
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

  return { user: mapInternalUser(updated) };
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

  return { user: mapInternalUser(updated) };
}

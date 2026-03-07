import jwt from "jsonwebtoken";
import { AUTH_TOKEN_COOKIE, getJwtSecret } from "../config/auth.js";
import { findAdminById } from "../repositories/adminUserRepository.js";
import { AdminRole, defaultOperatorPermissions } from "../domain/enums.js";

export async function requireAuth(req, res, next) {
  const bearer = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.slice(7)
    : null;
  const token = req.cookies?.[AUTH_TOKEN_COOKIE] || bearer;

  if (!token) {
    return res.status(401).json({ error: "nao autenticado" });
  }

  try {
    const payload = jwt.verify(token, getJwtSecret());
    const admin = await findAdminById(payload.sub);

    if (!admin || !admin.ativo) {
      return res.status(401).json({ error: "acesso invalido" });
    }

    req.auth = {
      id: admin.id,
      email: admin.email,
      nome: admin.nome,
      role: admin.role,
      standId: admin.standId || null,
      standName: admin.standName || null,
      empresaNome: admin.empresaNome || null,
      permissoesCustomizadas:
        admin.permissoesCustomizadas ||
        ((admin.role === AdminRole.OPERADOR_QR ||
        admin.role === AdminRole.LEITOR_CATRACA ||
        admin.role === AdminRole.APP_GATE)
          ? defaultOperatorPermissions()
          : null)
    };
    return next();
  } catch (_error) {
    return res.status(401).json({ error: "token invalido ou expirado" });
  }
}

export function requirePermission(permissionFlag) {
  return (req, res, next) => {
    if (!req.auth) {
      return res.status(401).json({ error: "nao autenticado" });
    }
    if (req.auth.role === AdminRole.MASTER_ADMIN || req.auth.role === AdminRole.SYSTEM) {
      return next();
    }
    const allowed = req.auth.permissoesCustomizadas?.[permissionFlag] === true;
    if (!allowed) {
      return res.status(403).json({ error: "sem permissao para esta acao" });
    }
    return next();
  };
}

export function requireRoles(allowedRoles) {
  return (req, res, next) => {
    if (!req.auth) {
      return res.status(401).json({ error: "nao autenticado" });
    }
    if (!allowedRoles.includes(req.auth.role)) {
      return res.status(403).json({ error: "sem permissao para esta acao" });
    }
    return next();
  };
}

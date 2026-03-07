import {
  AUTH_TOKEN_COOKIE,
  getCookieOptions
} from "../config/auth.js";
import { authenticateAdmin } from "../services/adminAuthService.js";
import { logAdminAction } from "../services/auditLogService.js";
import { AdminRole, mapRoleToOrganizationProfile } from "../domain/enums.js";

export async function loginAdminHandler(req, res) {
  const email = typeof req.body?.email === "string" ? req.body.email : "";
  const senha = typeof req.body?.senha === "string" ? req.body.senha : "";

  if (!email.trim() || !senha.trim()) {
    return res.status(400).json({ error: "email e senha sao obrigatorios" });
  }

  const auth = await authenticateAdmin({ email, senha });
  if (!auth) {
    return res.status(401).json({ error: "credenciais invalidas" });
  }

  const isOperatorLoginPath = req.path.includes("operator/login");
  if (
    isOperatorLoginPath &&
    ![
      AdminRole.OPERADOR_QR,
      AdminRole.LEITOR_CATRACA,
      AdminRole.APP_GATE,
      AdminRole.MASTER_ADMIN,
      AdminRole.SYSTEM
    ].includes(auth.admin.role)
  ) {
    return res.status(403).json({ error: "perfil sem acesso ao login de operador" });
  }

  res.cookie(AUTH_TOKEN_COOKIE, auth.token, getCookieOptions());
  await logAdminAction({
    actorId: auth.admin.id,
    acao: "LOGIN_SUCESSO",
    recurso: "AUTH"
  });
  return res.json({
    admin: {
      ...auth.admin,
      perfilOrganizacao: mapRoleToOrganizationProfile(auth.admin.role)
    }
  });
}

export async function meAdminHandler(req, res) {
  return res.json({
    admin: {
      ...req.auth,
      perfilOrganizacao: mapRoleToOrganizationProfile(req.auth.role)
    }
  });
}

export async function logoutAdminHandler(_req, res) {
  res.clearCookie(AUTH_TOKEN_COOKIE, getCookieOptions());
  return res.json({ ok: true });
}

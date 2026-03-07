import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getJwtExpiresIn, getJwtSecret } from "../config/auth.js";
import { findAdminByEmail } from "../repositories/adminUserRepository.js";

export async function authenticateAdmin({ email, senha }) {
  const normalizedEmail = (email || "").trim().toLowerCase();
  const user = await findAdminByEmail(normalizedEmail);

  if (!user || !user.ativo) {
    return null;
  }

  const ok = await bcrypt.compare(senha || "", user.passwordHash);
  if (!ok) {
    return null;
  }

  const token = jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role
    },
    getJwtSecret(),
    { expiresIn: getJwtExpiresIn() }
  );

  return {
    token,
    admin: {
      id: user.id,
      email: user.email,
      nome: user.nome,
      role: user.role,
      standId: user.standId || null,
      standName: user.standName || null,
      empresaNome: user.empresaNome || null,
      permissoesCustomizadas: user.permissoesCustomizadas
    }
  };
}

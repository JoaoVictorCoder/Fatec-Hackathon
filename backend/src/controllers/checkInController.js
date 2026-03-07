import { toCheckInResponseDTO } from "../mappers/identityMapper.js";
import { validateAndCheckIn } from "../services/checkInService.js";
import { validateCheckInRequestDTO } from "../validators/checkInValidator.js";
import { ValidateCheckInUseCase } from "../application/use-cases/validateCheckInUseCase.js";

const validateCheckInUseCase = new ValidateCheckInUseCase({ validateAndCheckIn });

export async function validateCheckInHandler(req, res) {
  const validation = validateCheckInRequestDTO(req.body || {});
  if (!validation.valid) {
    return res.status(400).json({ errors: validation.errors });
  }

  const result = await validateCheckInUseCase.execute(validation.data, {
    actorType:
      req.auth?.role === "APP_GATE" ||
      req.auth?.role === "LEITOR_CATRACA" ||
      req.auth?.role === "OPERADOR_QR"
        ? "APP_GATE"
        : "ADMIN_USER",
    actorId: req.auth?.id,
    actorName: req.auth?.nome,
    actorEmail: req.auth?.email,
    actorRole: req.auth?.role,
    standId: req.auth?.standId || null,
    standName: req.auth?.standName || null,
    empresaNome: req.auth?.empresaNome || null
  });

  return res.json(
    toCheckInResponseDTO({
      allowed: result.allowed,
      reason: result.reason,
      credencialId: result.credencial?.id,
      codigoUnico: result.credencial?.codigoUnico,
      credenciado: result.credencial?.credenciado
    })
  );
}

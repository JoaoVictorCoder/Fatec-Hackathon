import { toCheckInResponseDTO } from "../mappers/identityMapper.js";
import { ValidateCheckInUseCase } from "../application/use-cases/validateCheckInUseCase.js";
import { validateAndCheckIn } from "../services/checkInService.js";
import { validateCheckInRequestDTO } from "../validators/checkInValidator.js";
import { listAccessAttempts } from "../repositories/accessAttemptRepository.js";

const validateCheckInUseCase = new ValidateCheckInUseCase({ validateAndCheckIn });

export async function operatorMeHandler(req, res) {
  return res.json({
    operator: {
      id: req.auth.id,
      nome: req.auth.nome,
      email: req.auth.email,
      role: req.auth.role,
      permissoesCustomizadas: req.auth.permissoesCustomizadas || {}
    }
  });
}

export async function operatorCheckInValidateHandler(req, res) {
  const validation = validateCheckInRequestDTO(req.body || {});
  if (!validation.valid) {
    return res.status(400).json({ errors: validation.errors });
  }

  const result = await validateCheckInUseCase.execute(validation.data, {
    actorType: "APP_GATE",
    actorId: req.auth.id,
    actorName: req.auth.nome,
    actorRole: req.auth.role
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

export async function operatorHistoryBasicHandler(req, res) {
  const { items } = await listAccessAttempts({
    page: 1,
    pageSize: 30,
    operatorId: req.auth.id
  });

  return res.json({
    items: items.map((item) => ({
      id: item.id,
      resultado: item.resultado,
      motivo: item.motivo,
      nomeCredenciado: item.credencial?.credenciado?.nomeCompleto || null,
      categoria: item.credencial?.credenciado?.categoria || null,
      codigoUnico: item.credencial?.codigoUnico || null,
      createdAt: item.createdAt
    }))
  });
}

import { AccessReason } from "../domain/enums.js";

export function validateCheckInRequestDTO(payload) {
  const errors = [];
  const codigoUnico = typeof payload?.codigoUnico === "string" ? payload.codigoUnico.trim() : "";
  const gateCode = typeof payload?.gateCode === "string" ? payload.gateCode.trim() : "";
  const accessPoint = typeof payload?.accessPoint === "string" ? payload.accessPoint.trim() : "";
  const deviceId = typeof payload?.deviceId === "string" ? payload.deviceId.trim() : "";
  const deviceInfo =
    payload?.deviceInfo && typeof payload.deviceInfo === "object" ? payload.deviceInfo : null;
  const observacaoOperacional =
    typeof payload?.observacaoOperacional === "string"
      ? payload.observacaoOperacional.trim()
      : "";

  if (!codigoUnico) {
    errors.push("codigoUnico e obrigatorio");
  }
  if (!gateCode) {
    errors.push("gateCode e obrigatorio");
  }

  if (errors.length) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: {
      codigoUnico,
      gateCode,
      accessPoint: accessPoint || gateCode,
      deviceId: deviceId || null,
      deviceInfo,
      observacaoOperacional: observacaoOperacional || null
    }
  };
}

export const checkInReasons = Object.values(AccessReason);

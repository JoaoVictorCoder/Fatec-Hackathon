import { Router } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { requireAuth, requirePermission, requireRoles } from "../middlewares/authMiddleware.js";
import { AdminRole, OperatorPermission } from "../domain/enums.js";
import {
  operatorCheckInValidateHandler,
  operatorHistoryBasicHandler,
  operatorMeHandler
} from "../controllers/operatorController.js";

export const operatorRouter = Router();

operatorRouter.use(asyncHandler(requireAuth));
operatorRouter.use(
  asyncHandler(
    requireRoles([
      AdminRole.MASTER_ADMIN,
      AdminRole.OPERADOR_QR,
      AdminRole.LEITOR_CATRACA,
      AdminRole.APP_GATE,
      AdminRole.SYSTEM
    ])
  )
);

operatorRouter.get("/me", asyncHandler(operatorMeHandler));
operatorRouter.post(
  "/check-in/validate",
  asyncHandler(requirePermission(OperatorPermission.PODE_VALIDAR_ENTRADA)),
  asyncHandler(operatorCheckInValidateHandler)
);
operatorRouter.get(
  "/history-basic",
  asyncHandler(requirePermission(OperatorPermission.PODE_CONSULTAR_ULTIMAS_ENTRADAS)),
  asyncHandler(operatorHistoryBasicHandler)
);

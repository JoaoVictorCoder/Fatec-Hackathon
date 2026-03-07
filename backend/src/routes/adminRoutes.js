import { Router } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { requireAuth, requireRoles } from "../middlewares/authMiddleware.js";
import {
  createComissaoAdminHandler,
  getCredenciadoAdminByIdHandler,
  listCredenciadoEventosAdminHandler,
  listCredenciadosAdminHandler,
  softDeleteCredenciadoAdminHandler,
  updateCredenciadoAdminHandler,
  updateCredenciadoStatusAdminHandler
} from "../controllers/credenciadoController.js";
import {
  getCredencialAdminByIdHandler,
  reissueCredencialAdminHandler,
  updateCredencialAdminHandler,
  updateCredencialStatusAdminHandler
} from "../controllers/credencialController.js";
import { listEventosSistemaAdminHandler } from "../controllers/eventoSistemaController.js";
import { listEventosCadastroAdminHandler } from "../controllers/eventoController.js";
import { listAuditLogsAdminHandler } from "../controllers/auditLogController.js";
import { validateCheckInHandler } from "../controllers/checkInController.js";
import {
  analyticsFraudHandler,
  analyticsOverviewHandler
} from "../controllers/analyticsController.js";
import { getDescarbonizacaoAdminHandler } from "../controllers/descarbonizacaoController.js";
import {
  createInternalUserHandler,
  listInternalUsersHandler,
  updateInternalUserActiveHandler,
  updateInternalUserHandler,
  updateInternalUserPermissionsHandler
} from "../controllers/internalUserController.js";
import {
  getAccessLogByIdAdminHandler,
  listAccessLogsAdminHandler
} from "../controllers/accessLogController.js";
import { backupExportHandler, backupStatusHandler } from "../controllers/backupController.js";
import { AdminRole } from "../domain/enums.js";
import { standVisitorsReportHandler } from "../controllers/reportController.js";

export const adminRouter = Router();

adminRouter.use(asyncHandler(requireAuth));

adminRouter.get(
  "/credenciados",
  asyncHandler(requireRoles([AdminRole.MASTER_ADMIN, AdminRole.ADMIN, AdminRole.SYSTEM])),
  asyncHandler(listCredenciadosAdminHandler)
);
adminRouter.get(
  "/credenciados/:id",
  asyncHandler(requireRoles([AdminRole.MASTER_ADMIN, AdminRole.ADMIN, AdminRole.SYSTEM])),
  asyncHandler(getCredenciadoAdminByIdHandler)
);
adminRouter.get(
  "/credenciados/:id/eventos",
  asyncHandler(requireRoles([AdminRole.MASTER_ADMIN, AdminRole.ADMIN, AdminRole.SYSTEM])),
  asyncHandler(listCredenciadoEventosAdminHandler)
);
adminRouter.get(
  "/credenciados/:id/historico",
  asyncHandler(requireRoles([AdminRole.MASTER_ADMIN, AdminRole.ADMIN, AdminRole.SYSTEM])),
  asyncHandler(listCredenciadoEventosAdminHandler)
);
adminRouter.put(
  "/credenciados/:id",
  asyncHandler(requireRoles([AdminRole.MASTER_ADMIN, AdminRole.ADMIN, AdminRole.SYSTEM])),
  asyncHandler(updateCredenciadoAdminHandler)
);
adminRouter.patch(
  "/credenciados/:id/status",
  asyncHandler(requireRoles([AdminRole.MASTER_ADMIN, AdminRole.ADMIN, AdminRole.SYSTEM])),
  asyncHandler(updateCredenciadoStatusAdminHandler)
);
adminRouter.delete(
  "/credenciados/:id",
  asyncHandler(requireRoles([AdminRole.MASTER_ADMIN, AdminRole.ADMIN])),
  asyncHandler(softDeleteCredenciadoAdminHandler)
);
adminRouter.post(
  "/credenciados/comissao-organizadora",
  asyncHandler(requireRoles([AdminRole.MASTER_ADMIN, AdminRole.ADMIN])),
  asyncHandler(createComissaoAdminHandler)
);
adminRouter.get(
  "/credenciais/:id",
  asyncHandler(requireRoles([AdminRole.MASTER_ADMIN, AdminRole.ADMIN, AdminRole.SYSTEM])),
  asyncHandler(getCredencialAdminByIdHandler)
);
adminRouter.put(
  "/credenciais/:id",
  asyncHandler(requireRoles([AdminRole.MASTER_ADMIN, AdminRole.ADMIN, AdminRole.SYSTEM])),
  asyncHandler(updateCredencialAdminHandler)
);
adminRouter.patch(
  "/credenciais/:id/status",
  asyncHandler(requireRoles([AdminRole.MASTER_ADMIN, AdminRole.ADMIN, AdminRole.SYSTEM])),
  asyncHandler(updateCredencialStatusAdminHandler)
);
adminRouter.post(
  "/credenciais/:id/reemitir",
  asyncHandler(requireRoles([AdminRole.MASTER_ADMIN, AdminRole.ADMIN, AdminRole.SYSTEM])),
  asyncHandler(reissueCredencialAdminHandler)
);
adminRouter.get(
  "/eventos",
  asyncHandler(requireRoles([AdminRole.MASTER_ADMIN, AdminRole.ADMIN, AdminRole.SYSTEM])),
  asyncHandler(listEventosSistemaAdminHandler)
);
adminRouter.get(
  "/eventos-cadastro",
  asyncHandler(requireRoles([AdminRole.MASTER_ADMIN, AdminRole.ADMIN, AdminRole.SYSTEM])),
  asyncHandler(listEventosCadastroAdminHandler)
);
adminRouter.get(
  "/audit-logs",
  asyncHandler(requireRoles([AdminRole.MASTER_ADMIN, AdminRole.ADMIN, AdminRole.SYSTEM])),
  asyncHandler(listAuditLogsAdminHandler)
);
adminRouter.get(
  "/access-logs",
  asyncHandler(requireRoles([AdminRole.MASTER_ADMIN, AdminRole.ADMIN, AdminRole.SYSTEM])),
  asyncHandler(listAccessLogsAdminHandler)
);
adminRouter.get(
  "/access-logs/:id",
  asyncHandler(requireRoles([AdminRole.MASTER_ADMIN, AdminRole.ADMIN, AdminRole.SYSTEM])),
  asyncHandler(getAccessLogByIdAdminHandler)
);
adminRouter.get(
  "/reports/stand-visitors",
  asyncHandler(requireRoles([AdminRole.MASTER_ADMIN, AdminRole.ADMIN, AdminRole.SYSTEM])),
  asyncHandler(standVisitorsReportHandler)
);
adminRouter.post(
  "/check-in/validate",
  asyncHandler(
    requireRoles([
      AdminRole.MASTER_ADMIN,
      AdminRole.ADMIN,
      AdminRole.OPERADOR_QR,
      AdminRole.APP_GATE,
      AdminRole.LEITOR_CATRACA,
      AdminRole.SYSTEM
    ])
  ),
  asyncHandler(validateCheckInHandler)
);
adminRouter.get(
  "/analytics/overview",
  asyncHandler(requireRoles([AdminRole.MASTER_ADMIN, AdminRole.ADMIN, AdminRole.SYSTEM])),
  asyncHandler(analyticsOverviewHandler)
);
adminRouter.get(
  "/analytics/fraud",
  asyncHandler(requireRoles([AdminRole.MASTER_ADMIN, AdminRole.ADMIN, AdminRole.SYSTEM])),
  asyncHandler(analyticsFraudHandler)
);
adminRouter.get(
  "/analytics/descarbonizacao",
  asyncHandler(requireRoles([AdminRole.MASTER_ADMIN, AdminRole.ADMIN, AdminRole.SYSTEM])),
  asyncHandler(getDescarbonizacaoAdminHandler)
);

adminRouter.get(
  "/users",
  asyncHandler(requireRoles([AdminRole.MASTER_ADMIN, AdminRole.SYSTEM])),
  asyncHandler(listInternalUsersHandler)
);
adminRouter.post(
  "/users",
  asyncHandler(requireRoles([AdminRole.MASTER_ADMIN, AdminRole.SYSTEM])),
  asyncHandler(createInternalUserHandler)
);
adminRouter.put(
  "/users/:id",
  asyncHandler(requireRoles([AdminRole.MASTER_ADMIN, AdminRole.SYSTEM])),
  asyncHandler(updateInternalUserHandler)
);
adminRouter.patch(
  "/users/:id/active",
  asyncHandler(requireRoles([AdminRole.MASTER_ADMIN, AdminRole.SYSTEM])),
  asyncHandler(updateInternalUserActiveHandler)
);
adminRouter.patch(
  "/users/:id/permissions",
  asyncHandler(requireRoles([AdminRole.MASTER_ADMIN, AdminRole.SYSTEM])),
  asyncHandler(updateInternalUserPermissionsHandler)
);

adminRouter.get(
  "/backup/status",
  asyncHandler(requireRoles([AdminRole.MASTER_ADMIN, AdminRole.SYSTEM])),
  asyncHandler(backupStatusHandler)
);
adminRouter.post(
  "/backup/export",
  asyncHandler(requireRoles([AdminRole.MASTER_ADMIN, AdminRole.SYSTEM])),
  asyncHandler(backupExportHandler)
);

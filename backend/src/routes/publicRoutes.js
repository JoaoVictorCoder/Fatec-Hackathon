import { Router } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { createCredenciadoPublicHandler } from "../controllers/credenciadoController.js";
import {
  getCredencialPublicPdfHandler,
  getCredencialPublicQrHandler
} from "../controllers/credencialController.js";
import { createPublicWriteRateLimiter } from "../middlewares/rateLimitMiddleware.js";

export const publicRouter = Router();
const publicWriteRateLimiter = createPublicWriteRateLimiter();

publicRouter.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

publicRouter.get("/codorna", (_req, res) => {
  res.json({ animal: "codorna" });
});

publicRouter.post("/credenciados", publicWriteRateLimiter, asyncHandler(createCredenciadoPublicHandler));
publicRouter.get("/credenciais/:id/pdf", asyncHandler(getCredencialPublicPdfHandler));
publicRouter.get("/credenciais/:id/qrcode", asyncHandler(getCredencialPublicQrHandler));

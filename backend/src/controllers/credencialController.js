import { mapCredencialDetail } from "../mappers/identityMapper.js";
import { StatusCredencial } from "../domain/enums.js";
import { findCredencialById } from "../repositories/credencialRepository.js";
import {
  reissueCredencialAdmin,
  updateCredencialAdmin,
  updateCredencialStatusAdmin
} from "../services/adminManagementService.js";
import {
  getCredentialPdfById,
  getCredentialQrById
} from "../services/credentialAssetService.js";

export async function getCredencialAdminByIdHandler(req, res) {
  const credencial = await findCredencialById(req.params.id);
  if (!credencial) {
    return res.status(404).json({ error: "credencial nao encontrada" });
  }
  return res.json(mapCredencialDetail(credencial));
}

export async function getCredencialPublicQrHandler(req, res) {
  const data = await getCredentialQrById(req.params.id);
  if (!data) {
    return res.status(404).json({ error: "credencial nao encontrada" });
  }
  return res.json(data);
}

export async function getCredencialPublicPdfHandler(req, res) {
  const data = await getCredentialPdfById(req.params.id);
  if (!data) {
    return res.status(404).json({ error: "credencial nao encontrada" });
  }

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `inline; filename="credencial-${data.credencial.codigoUnico}.pdf"`
  );
  return res.send(data.pdfBuffer);
}

export async function updateCredencialStatusAdminHandler(req, res) {
  const statusCredencial = req.body?.statusCredencial;
  if (!statusCredencial) {
    return res.status(400).json({ error: "statusCredencial e obrigatorio" });
  }
  if (!Object.values(StatusCredencial).includes(statusCredencial)) {
    return res.status(400).json({ error: "statusCredencial invalido" });
  }
  const updated = await updateCredencialStatusAdmin(
    req.params.id,
    statusCredencial,
    req.body?.motivo,
    req.auth
  );
  return res.json({ id: updated.id, statusCredencial: updated.statusCredencial });
}

export async function updateCredencialAdminHandler(req, res) {
  const payload = req.body || {};

  if (
    payload.statusCredencial &&
    !Object.values(StatusCredencial).includes(payload.statusCredencial)
  ) {
    return res.status(400).json({ error: "statusCredencial invalido" });
  }

  if (payload.emitidaEm && Number.isNaN(new Date(payload.emitidaEm).getTime())) {
    return res.status(400).json({ error: "emitidaEm invalida" });
  }

  const updated = await updateCredencialAdmin(req.params.id, payload, req.auth);
  if (!updated) {
    return res.status(404).json({ error: "credencial nao encontrada" });
  }
  return res.json(mapCredencialDetail(updated));
}

export async function reissueCredencialAdminHandler(req, res) {
  const updated = await reissueCredencialAdmin(req.params.id, req.body?.motivo, req.auth);
  if (!updated) {
    return res.status(404).json({ error: "credencial nao encontrada" });
  }
  return res.json(mapCredencialDetail(updated));
}

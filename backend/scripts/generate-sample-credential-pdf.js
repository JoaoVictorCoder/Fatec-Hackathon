import fs from "node:fs/promises";
import path from "node:path";
import QRCode from "qrcode";
import { buildCredentialPdf } from "../src/providers/pdf/credentialPdfProvider.js";

const outDir = path.resolve("output");
const outFile = path.join(outDir, "credential-template-sample.pdf");

const credenciado = {
  nomeCompleto: "JOAO VICTOR CODER",
  municipio: "FRANCA",
  uf: "SP",
  categoria: "COMISSAO_ORGANIZADORA",
  nomeEmpresa: "ALTA CAFE NEGOCIOS"
};

const credencial = {
  codigoUnico: "ALTA-2026-000123",
  statusCredencial: "ATIVA"
};

const qrPngBuffer = await QRCode.toBuffer(JSON.stringify({
  codigoUnico: credencial.codigoUnico,
  nome: credenciado.nomeCompleto,
  categoria: credenciado.categoria
}));

const pdfBuffer = await buildCredentialPdf({
  credenciado,
  credencial,
  qrPngBuffer
});

await fs.mkdir(outDir, { recursive: true });
await fs.writeFile(outFile, pdfBuffer);

console.log(outFile);

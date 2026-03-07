import PDFDocument from "pdfkit";
import { getCategoryColor } from "../../utils/categoryPresentation.js";

function categoryExtraLabel(credenciado) {
  switch (credenciado.categoria) {
    case "EXPOSITOR":
      return credenciado.nomeEmpresa || null;
    case "CAFEICULTOR":
      return credenciado.nomePropriedade || null;
    case "IMPRENSA":
      return credenciado.nomeVeiculo || null;
    case "COMISSAO_ORGANIZADORA":
      return credenciado.funcaoCargo || null;
    case "COLABORADOR_TERCEIRIZADO":
      return [credenciado.nomeEmpresa, credenciado.funcaoCargo].filter(Boolean).join(" - ") || null;
    default:
      return null;
  }
}

export async function buildCredentialPdf({ credenciado, credencial, qrPngBuffer }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 20 });
    const chunks = [];
    const pageW = doc.page.width - 40;
    const pageH = doc.page.height - 40;
    const halfW = pageW / 2;
    const halfH = pageH / 2;
    const x0 = 20;
    const y0 = 20;
    const categoryColor = getCategoryColor(credenciado.categoria);
    const extra = categoryExtraLabel(credenciado);
    const nomeEvento = credenciado?.evento?.nomeEvento || "Credenciamento Setor Cafeeiro";
    const tipoEvento = credenciado?.evento?.isGratuito ? "Evento gratuito" : "Evento pago";

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Painel 1 - Frente credencial
    doc.rect(x0, y0, halfW, halfH).stroke("#d6dce5");
    doc.rect(x0, y0, halfW, 36).fill(categoryColor);
    doc.fillColor("#fff").fontSize(13).text(credenciado.categoria, x0 + 10, y0 + 10);
    doc.fillColor("#111").fontSize(20).text("Credencial", x0 + 10, y0 + 50);
    doc.fontSize(16).text(credenciado.nomeCompleto, x0 + 10, y0 + 86, { width: halfW - 140 });
    doc.fontSize(11).text(`${credenciado.municipio}/${credenciado.uf}`, x0 + 10, y0 + 132);
    if (credenciado.pcd) {
      doc.fillColor("#0a5").fontSize(10).text("PCD", x0 + 10, y0 + 150);
      doc.fillColor("#111");
    }
    if (extra) {
      doc.fontSize(10).text(extra, x0 + 10, y0 + 168, { width: halfW - 140 });
    }
    doc.image(qrPngBuffer, x0 + halfW - 120, y0 + 60, { fit: [95, 95] });
    doc.fontSize(9).text(credencial.codigoUnico, x0 + halfW - 120, y0 + 162);

    // Painel 2 - Institucional
    doc.rect(x0 + halfW, y0, halfW, halfH).stroke("#d6dce5");
    doc.fontSize(16).text("Institucional", x0 + halfW + 12, y0 + 14);
    doc.fontSize(10).fillColor("#444").text("Realizacao", x0 + halfW + 12, y0 + 48);
    doc.rect(x0 + halfW + 12, y0 + 64, halfW - 24, 40).dash(3, { space: 2 }).stroke("#b6c0cc").undash();
    doc.text("LOGO REALIZACAO", x0 + halfW + 20, y0 + 79);
    doc.text("Apoio", x0 + halfW + 12, y0 + 118);
    doc.rect(x0 + halfW + 12, y0 + 134, halfW - 24, 40).dash(3, { space: 2 }).stroke("#b6c0cc").undash();
    doc.text("LOGO APOIO", x0 + halfW + 20, y0 + 149);
    doc.text("Patrocinio", x0 + halfW + 12, y0 + 188);
    doc.rect(x0 + halfW + 12, y0 + 204, halfW - 24, 40).dash(3, { space: 2 }).stroke("#b6c0cc").undash();
    doc.text("LOGO PATROCINIO", x0 + halfW + 20, y0 + 219);

    // Painel 3 - Dados evento
    doc.rect(x0, y0 + halfH, halfW, halfH).stroke("#d6dce5");
    doc.fillColor("#111").fontSize(16).text("Dados do Evento", x0 + 12, y0 + halfH + 14);
    doc.fontSize(11).text(`Evento: ${nomeEvento}`, x0 + 12, y0 + halfH + 48);
    doc.text("Local: Centro de Eventos", x0 + 12, y0 + halfH + 70);
    doc.text("Data inicial: 10/06/2026", x0 + 12, y0 + halfH + 92);
    doc.text("Data final: 12/06/2026", x0 + 12, y0 + halfH + 114);
    doc.text("Status credencial: " + credencial.statusCredencial, x0 + 12, y0 + halfH + 136);
    doc.text(`Tipo: ${tipoEvento}`, x0 + 12, y0 + halfH + 158);
    if (credenciado.nacionalidade) {
      doc.text("Nacionalidade: " + credenciado.nacionalidade, x0 + 12, y0 + halfH + 180);
    }

    // Painel 4 - Instrucoes e termos
    doc.rect(x0 + halfW, y0 + halfH, halfW, halfH).stroke("#d6dce5");
    doc.fontSize(16).fillColor("#111").text("Instrucoes", x0 + halfW + 12, y0 + halfH + 14);
    doc.fontSize(10).text(
      "1. Imprima em A4 e dobre em 4 partes.\n2. Apresente a credencial na entrada.\n3. Credencial pessoal e intransferivel.\n4. O QR pode ser solicitado a qualquer momento.\n5. Seus dados sao tratados para operacao do evento conforme LGPD.",
      x0 + halfW + 12,
      y0 + halfH + 46,
      { width: halfW - 24, lineGap: 3 }
    );
    doc.fontSize(9).fillColor("#4b5563").text("www.evento-cafe.example", x0 + halfW + 12, y0 + halfH + halfH - 26);

    doc.end();
  });
}

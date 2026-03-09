import PDFDocument from "pdfkit";

// Provider responsavel pelo layout bruto da credencial em PDF.
// Ajustes visuais, patrocinadores, textos fixos e dimensoes devem ser feitos
// aqui. A assinatura de `buildCredentialPdf` deve permanecer estavel para que
// o restante do backend nao precise conhecer detalhes do PDF.
const COLORS = {
  darkGreen: "#1F5E3B",
  vividGreen: "#35A24C",
  lightGreen: "#EAF4E7",
  bg: "#F8F5EE",
  panelBorder: "#D5E3D1",
  text: "#111111",
  white: "#FFFFFF",
  bean: "#B06A2C"
};

const SPONSORS = [
  "SPONSOR 01",
  "SPONSOR 02",
  "SPONSOR 03",
  "SPONSOR 04",
  "SPONSOR 05",
  "SPONSOR 06",
  "SPONSOR 07",
  "SPONSOR 08"
];

const INSTRUCTIONS = [
  "Leve sua credencial impressa para o local da operacao;",
  "Dobre conforme o layout da credencial;",
  "Use em local visivel durante sua permanencia;",
  "Siga as orientacoes da equipe de operacao e seguranca;",
  "A organizacao pode registrar imagens para fins de seguranca e comunicacao institucional."
];

function formatUpper(value) {
  return String(value || "").trim().toUpperCase();
}

function categoryToProfile(categoria) {
  return String(categoria || "VISITANTE").replace(/_/g, " ");
}

function resolveCompany(credenciado) {
  return (
    credenciado?.nomeEmpresa ||
    credenciado?.nomePropriedade ||
    credenciado?.nomeVeiculo ||
    credenciado?.funcaoCargo ||
    "EMPRESA"
  );
}

function drawTexture(doc, x, y, w, h, density = 70) {
  doc.save();
  doc.rect(x, y, w, h).clip();
  for (let i = 0; i < density; i += 1) {
    const cx = x + ((i * 37) % Math.max(w, 1));
    const cy = y + ((i * 53 + 19) % Math.max(h, 1));
    const rw = 8 + (i % 6);
    const rh = 4 + (i % 4);
    doc.lineWidth(0.6).strokeColor(COLORS.bean).ellipse(cx, cy, rw, rh).stroke();
    doc.moveTo(cx - rw * 0.4, cy - rh * 0.8).lineTo(cx + rw * 0.4, cy + rh * 0.8).stroke();
  }
  doc.restore();
}

function drawFakeBarcode(doc, x, y, w, h, code) {
  const payload = String(code || "").padEnd(24, "0");
  const bars = [];
  for (const ch of payload) {
    const n = ch.charCodeAt(0);
    bars.push(1 + (n % 3));
    bars.push(1 + ((n >> 1) % 3));
  }

  const totalUnits = bars.reduce((sum, n) => sum + n + 1, 0);
  const unitW = Math.max(1, w / totalUnits);

  let cursor = x;
  doc.save();
  doc.rect(x, y, w, h).clip();
  for (let i = 0; i < bars.length; i += 1) {
    const bw = bars[i] * unitW;
    if (i % 2 === 0) {
      doc.rect(cursor, y, bw, h - 12).fill(COLORS.text);
    }
    cursor += bw + unitW;
  }
  doc.restore();

  doc.fillColor(COLORS.text).font("Helvetica-Bold").fontSize(8).text(payload, x, y + h - 10, {
    width: w,
    align: "center"
  });
}

function drawSponsors(doc, x, y, w) {
  const gap = 4;
  const cols = 4;
  const rows = 2;
  const cellW = (w - gap * (cols - 1)) / cols;
  const cellH = 22;

  doc.font("Helvetica-Bold").fontSize(7).fillColor("#666").text("APOIADORES / PATROCINADORES", x, y - 10);

  for (let i = 0; i < SPONSORS.length; i += 1) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const cx = x + col * (cellW + gap);
    const cy = y + row * (cellH + gap);
    doc.roundedRect(cx, cy, cellW, cellH, 6).lineWidth(0.8).strokeColor("#C5C5C5").fillAndStroke("#FAFAFA", "#C5C5C5");
    doc.fillColor("#333").font("Helvetica-Bold").fontSize(6).text(SPONSORS[i], cx + 3, cy + 7, {
      width: cellW - 6,
      align: "center"
    });
  }
}

function drawEventBrand(doc, x, y, w) {
  doc.circle(x + 14, y + 16, 10).lineWidth(1.2).strokeColor(COLORS.white).stroke();
  doc.fillColor(COLORS.white).font("Helvetica-Bold").fontSize(7).text("6a", x + 8, y + 12, { width: 12, align: "center" });

  doc.font("Helvetica-Bold").fontSize(12).fillColor(COLORS.white).text("OPSFLOW CORE", x + 30, y + 8);
  doc.font("Helvetica").fontSize(8).text("OPEN SOURCE OPERATIONS PLATFORM", x + 30, y + 24, {
    width: w - 34
  });
}

function drawHalfCredential(doc, data, x, y, w, h) {
  const nomeUsuario = formatUpper(data.nomeUsuario);
  const cidadeUf = formatUpper(data.cidadeUf);
  const empresa = formatUpper(data.empresa);
  const perfil = formatUpper(data.perfil);

  const headerH = 58;
  const nameH = 74;
  const empresaH = 42;
  const centerH = 190;
  const perfilH = 38;
  const footerTitleH = 56;
  const infoH = 176;
  const sponsorsH = 58;

  let cy = y;

  doc.roundedRect(x, y, w, h, 8).lineWidth(1).strokeColor(COLORS.panelBorder).fillAndStroke(COLORS.bg, COLORS.panelBorder);

  doc.rect(x, cy, w, headerH).fill(COLORS.darkGreen);
  drawEventBrand(doc, x + 10, cy + 10, w - 20);
  cy += headerH;

  doc.rect(x, cy, w, nameH).fill(COLORS.lightGreen);
  doc.fillColor(COLORS.text).font("Helvetica-Bold").fontSize(16).text(nomeUsuario, x + 8, cy + 16, {
    width: w - 16,
    align: "center"
  });
  doc.font("Helvetica-Bold").fontSize(10).text(cidadeUf, x + 8, cy + 46, {
    width: w - 16,
    align: "center"
  });
  cy += nameH;

  doc.rect(x, cy, w, empresaH).fill(COLORS.vividGreen);
  doc.fillColor(COLORS.white).font("Helvetica-Bold").fontSize(14).text(empresa, x + 8, cy + 13, {
    width: w - 16,
    align: "center"
  });
  cy += empresaH;

  doc.rect(x, cy, w, centerH).fill(COLORS.bg);
  drawTexture(doc, x + 4, cy + 4, w - 8, centerH - 8, 85);

  const qrBoxW = Math.floor((w - 30) * 0.46);
  const barcodeBoxW = Math.floor((w - 30) * 0.46);
  const boxH = 130;
  const contentY = cy + 28;

  const qrX = x + 10;
  const barX = qrX + qrBoxW + 10;

  doc.roundedRect(qrX, contentY, qrBoxW, boxH, 8).lineWidth(1).strokeColor("#A5C9A3").fillAndStroke("#F6FFF5", "#A5C9A3");
  doc.image(data.qrPngBuffer, qrX + 12, contentY + 14, { fit: [qrBoxW - 24, qrBoxW - 24], align: "center", valign: "center" });

  doc.roundedRect(barX, contentY, barcodeBoxW, boxH, 8).lineWidth(1).strokeColor("#A5C9A3").fillAndStroke("#F6FFF5", "#A5C9A3");
  drawFakeBarcode(doc, barX + 8, contentY + 34, barcodeBoxW - 16, 68, data.codigoUnico);

  doc.fillColor("#444").font("Helvetica-Bold").fontSize(8).text("QR CODE", qrX, contentY + boxH + 4, { width: qrBoxW, align: "center" });
  doc.text("CODIGO DE BARRAS", barX, contentY + boxH + 4, { width: barcodeBoxW, align: "center" });

  cy += centerH;

  doc.rect(x, cy, w, perfilH).fill(COLORS.vividGreen);
  doc.fillColor(COLORS.text).font("Helvetica-Bold").fontSize(16).text(`PERFIL: ${perfil}`, x + 8, cy + 11, {
    width: w - 16,
    align: "center"
  });
  cy += perfilH;

  doc.rect(x, cy, w / 2, footerTitleH).fill(COLORS.darkGreen);
  doc.rect(x + w / 2, cy, w / 2, footerTitleH).fill(COLORS.darkGreen);

  doc.fillColor(COLORS.white).font("Helvetica-Bold").fontSize(20).text("!", x + 10, cy + 10);
  doc.text("!", x + 24, cy + 10);
  doc.fontSize(8).text("ESTA E A SUA CREDENCIAL\nELA E PESSOAL E INTRANSFERIVEL", x + 40, cy + 14, {
    width: w / 2 - 46,
    align: "left"
  });

  doc.font("Helvetica-Bold").fontSize(8).text("INFORMACOES SOBRE O EVENTO", x + w / 2 + 8, cy + 22, {
    width: w / 2 - 16,
    align: "center"
  });
  cy += footerTitleH;

  doc.rect(x, cy, w, infoH).fill(COLORS.bg);
  drawTexture(doc, x + 4, cy + 4, w - 8, infoH - 8, 55);

  const infoGap = 10;
  const boxW = (w - infoGap - 16) / 2;
  const boxY = cy + 12;
  const boxH2 = infoH - 24;

  doc.roundedRect(x + 8, boxY, boxW, boxH2, 8).lineWidth(1).strokeColor("#BFD8BC").fillAndStroke(COLORS.lightGreen, "#BFD8BC");
  doc.roundedRect(x + 8 + boxW + infoGap, boxY, boxW, boxH2, 8).lineWidth(1).strokeColor("#BFD8BC").fillAndStroke(COLORS.lightGreen, "#BFD8BC");

  doc.fillColor(COLORS.text).font("Helvetica-Bold").fontSize(8).text("INSTRUCOES", x + 14, boxY + 8);
  doc.font("Helvetica").fontSize(6.6).text(INSTRUCTIONS.join("\n"), x + 14, boxY + 20, {
    width: boxW - 12,
    lineGap: 1
  });

  doc.fillColor(COLORS.text).font("Helvetica-Bold").fontSize(8).text("INFORMACOES DO EVENTO", x + 8 + boxW + infoGap + 6, boxY + 8);
  doc.font("Helvetica").fontSize(6.8).text(
    [
      `LOCAL: ${data.localEvento}`,
      `DATA: ${data.dataEvento}`,
      `HORARIO: ${data.horarioEvento}`,
      "ENTRADA: conforme configuracao da organizacao.",
      "OBS: personalize este bloco no provider de PDF."
    ].join("\n\n"),
    x + 8 + boxW + infoGap + 6,
    boxY + 20,
    { width: boxW - 12, lineGap: 1 }
  );

  cy += infoH;

  doc.rect(x, cy, w, sponsorsH).fill("#F9F9F9");
  drawSponsors(doc, x + 6, cy + 12, w - 12);
}

export async function buildCredentialPdf({ credenciado, credencial, qrPngBuffer }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 16,
      pdfVersion: "1.7"
    });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pageW = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const pageH = doc.page.height - doc.page.margins.top - doc.page.margins.bottom;

    const divider = 2;
    const halfW = (pageW - divider) / 2;
    const xLeft = doc.page.margins.left;
    const xRight = xLeft + halfW + divider;
    const y = doc.page.margins.top;

    doc.rect(xLeft + halfW, y, divider, pageH).fill("#E7E7E7");

    const data = {
      nomeUsuario: credenciado?.nomeCompleto || "PARTICIPANTE",
      cidadeUf: `${credenciado?.municipio || "CIDADE"}/${credenciado?.uf || "UF"}`,
      empresa: resolveCompany(credenciado),
      perfil: categoryToProfile(credenciado?.categoria),
      codigoUnico: credencial?.codigoUnico || "CODIGO-NAO-INFORMADO",
      localEvento: "Local configuravel pela organizacao.",
      dataEvento: "Data configuravel.",
      horarioEvento: "Horario configuravel.",
      qrPngBuffer
    };

    drawHalfCredential(doc, data, xLeft, y, halfW, pageH);
    drawHalfCredential(doc, data, xRight, y, halfW, pageH);

    doc.end();
  });
}

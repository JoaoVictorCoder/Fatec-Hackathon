import { listStandVisitorsReport } from "../repositories/accessAttemptRepository.js";

function maskEmail(email) {
  const [name, domain] = String(email || "").split("@");
  if (!name || !domain) return null;
  return `${name.slice(0, 2)}***@${domain}`;
}

function maskPhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return null;
  return `***${digits.slice(-4)}`;
}

export async function standVisitorsReportHandler(req, res) {
  const items = await listStandVisitorsReport({
    standId: typeof req.query.standId === "string" ? req.query.standId : undefined,
    operatorId: typeof req.query.operatorId === "string" ? req.query.operatorId : undefined,
    categoria: typeof req.query.categoria === "string" ? req.query.categoria : undefined,
    dateFrom: typeof req.query.dateFrom === "string" ? req.query.dateFrom : undefined,
    dateTo: typeof req.query.dateTo === "string" ? req.query.dateTo : undefined
  });

  const data = items.map((item) => {
    const credenciado = item.credencial?.credenciado;
    const consent = credenciado?.aceitouCompartilhamentoComExpositores === true;
    return {
      accessAttemptId: item.id,
      standId: item.standId,
      standName: item.standName,
      empresaNome: item.empresaNome,
      operatorId: item.operatorId,
      operatorNome: item.operatorNome,
      operatorEmail: item.operatorEmail,
      createdAt: item.createdAt,
      visitor: credenciado
        ? {
            id: consent ? credenciado.id : null,
            nomeCompleto: consent ? credenciado.nomeCompleto : "Nao autorizado (LGPD)",
            email: consent ? credenciado.email : maskEmail(credenciado.email),
            celular: consent ? credenciado.celular : maskPhone(credenciado.celular),
            categoria: credenciado.categoria,
            municipio: credenciado.municipio,
            uf: credenciado.uf,
            aceitouCompartilhamentoComExpositores: consent
          }
        : null
    };
  });

  return res.json({
    items: data,
    total: data.length
  });
}

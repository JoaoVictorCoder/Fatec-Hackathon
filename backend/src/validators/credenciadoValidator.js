import { Categoria } from "../domain/enums.js";
import {
  isObviousFakeText,
  isValidCnpj,
  isValidCpf,
  isValidEmail,
  isValidFullName,
  isValidMunicipio,
  isValidPhone,
  isValidUf,
  isValidWebsite,
  normalizeSpaces,
  normalizeWebsite,
  sanitizeCnpj,
  sanitizeCpf
} from "../utils/documentValidation.js";

const categorias = new Set(Object.values(Categoria));
const commonFields = ["nomeCompleto", "celular", "email", "municipio", "uf"];
const combustiveisValidos = new Set(["GASOLINA", "ALCOOL", "DIESEL", "ELETRICO", "NAO_INFORMADO"]);

function toCleanString(value) {
  return typeof value === "string" ? normalizeSpaces(value) : "";
}

function requiresAnyDocument(categoria) {
  return [
    Categoria.CAFEICULTOR,
    Categoria.COLABORADOR_TERCEIRIZADO,
    Categoria.COMISSAO_ORGANIZADORA
  ].includes(categoria);
}

function requiresCnpj(categoria) {
  return [Categoria.EXPOSITOR, Categoria.IMPRENSA].includes(categoria);
}

function requiresCpf(categoria) {
  return [Categoria.COMISSAO_ORGANIZADORA].includes(categoria);
}

export function validateCredenciadoPayload(payload, options = {}) {
  const allowComissaoOrganizadora = options.allowComissaoOrganizadora === true;
  const errors = [];

  const categoria = toCleanString(payload.categoria);
  const nacionalidade = toCleanString(payload.nacionalidade) || null;
  const email = toCleanString(payload.email);
  const celular = toCleanString(payload.celular);
  const municipio = toCleanString(payload.municipio);
  const nomeCompleto = toCleanString(payload.nomeCompleto);
  const cpf = sanitizeCpf(payload.cpf);
  const cnpj = sanitizeCnpj(payload.cnpj);
  const uf = toCleanString(payload.uf).toUpperCase();
  const pcd = payload.pcd === true;
  const tipoCombustivel = toCleanString(payload.tipoCombustivel).toUpperCase() || null;
  const cidadeOrigem = toCleanString(payload.cidadeOrigem) || municipio;
  const combustivel = toCleanString(payload.combustivel).toUpperCase() || tipoCombustivel || "NAO_INFORMADO";
  const distanciaKmRaw = payload.distanciaKm;
  const distanciaKm =
    distanciaKmRaw === null || distanciaKmRaw === undefined || distanciaKmRaw === ""
      ? null
      : Number(distanciaKmRaw);
  const isVisitanteInternacional =
    categoria === Categoria.VISITANTE &&
    nacionalidade &&
    nacionalidade.toLowerCase() !== "brasil";

  if (!categorias.has(categoria)) {
    errors.push("categoria invalida");
  }

  if (categoria === Categoria.COMISSAO_ORGANIZADORA && !allowComissaoOrganizadora) {
    errors.push("categoria COMISSAO_ORGANIZADORA nao permitida nesta rota");
  }

  for (const field of commonFields) {
    if (field === "uf" && isVisitanteInternacional) {
      continue;
    }
    if (!toCleanString(payload[field])) {
      errors.push(`${field} e obrigatorio`);
    }
  }

  if (!isValidFullName(nomeCompleto)) {
    errors.push("Informe nome e sobrenome");
  }

  if (!isValidEmail(email)) {
    errors.push("Informe um email valido");
  }

  if (!isValidPhone(celular)) {
    errors.push("Informe um celular valido");
  }

  if (!isValidMunicipio(municipio)) {
    errors.push("Informe a cidade");
  }

  if (payload.aceitouLgpd !== true) {
    errors.push("aceitouLgpd deve ser true");
  }

  if (cpf && !isValidCpf(cpf) && !isVisitanteInternacional) {
    errors.push("CPF invalido");
  }

  if (cnpj && !isValidCnpj(cnpj)) {
    errors.push("CNPJ invalido");
  }

  if (requiresCnpj(categoria) && !cnpj) {
    errors.push("Preencha CNPJ para esta categoria");
  }

  if (requiresCpf(categoria) && !cpf) {
    errors.push("Preencha CPF para esta categoria");
  }

  if (requiresAnyDocument(categoria) && !cpf && !cnpj) {
    errors.push("Preencha ao menos um documento valido para esta categoria");
  }

  if (
    categoria === Categoria.CAFEICULTOR &&
    !cpf &&
    !cnpj
  ) {
    errors.push("Para cafeicultor, informe CPF, CNPJ ou ambos");
  }

  if (categoria === Categoria.VISITANTE && !nacionalidade) {
    errors.push("nacionalidade e obrigatoria para visitante");
  }

  if (!isVisitanteInternacional && !isValidUf(uf)) {
    errors.push("Selecione uma UF valida");
  }

  if (toCleanString(payload.siteEmpresa) && !isValidWebsite(payload.siteEmpresa)) {
    errors.push("Informe um site valido");
  }

  if (!cidadeOrigem || isObviousFakeText(cidadeOrigem)) {
    errors.push("cidadeOrigem invalida");
  }

  if (!combustiveisValidos.has(combustivel)) {
    errors.push("combustivel invalido");
  }

  if (distanciaKm !== null && (!Number.isFinite(distanciaKm) || distanciaKm <= 0 || distanciaKm > 3000)) {
    errors.push("distanciaKm invalida");
  }

  const categoryRequiredFields = {
    [Categoria.EXPOSITOR]: ["nomeEmpresa"],
    [Categoria.CAFEICULTOR]: ["ccir", "nomePropriedade"],
    [Categoria.VISITANTE]: [],
    [Categoria.IMPRENSA]: ["nomeVeiculo"],
    [Categoria.COMISSAO_ORGANIZADORA]: ["funcaoCargo"],
    [Categoria.COLABORADOR_TERCEIRIZADO]: ["nomeEmpresa", "funcaoCargo"]
  };

  for (const field of categoryRequiredFields[categoria] || []) {
    const value = toCleanString(payload[field]);
    if (!value || isObviousFakeText(value)) {
      errors.push(`${field} e obrigatorio para categoria ${categoria}`);
    }
  }

  for (const field of ["nomeEmpresa", "nomePropriedade", "nomeVeiculo"]) {
    const value = toCleanString(payload[field]);
    if (value && isObviousFakeText(value)) {
      errors.push(`${field} invalido`);
    }
  }

  if (errors.length) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: {
      categoria,
      nomeCompleto,
      cpf: cpf || null,
      cnpj: cnpj || null,
      celular: celular.replace(/\D/g, ""),
      email: email.toLowerCase(),
      municipio,
      uf,
      nacionalidade: nacionalidade || (categoria === Categoria.VISITANTE ? "Brasil" : null),
      tipoCombustivel,
      cidadeOrigem,
      combustivel,
      distanciaKm,
      pcd,
      aceitouLgpd: true,
      siteEmpresa: normalizeWebsite(toCleanString(payload.siteEmpresa)),
      nomeEmpresa: toCleanString(payload.nomeEmpresa) || null,
      ccir: toCleanString(payload.ccir) || null,
      nomePropriedade: toCleanString(payload.nomePropriedade) || null,
      nomeVeiculo: toCleanString(payload.nomeVeiculo) || null,
      funcaoCargo: toCleanString(payload.funcaoCargo) || null
    }
  };
}

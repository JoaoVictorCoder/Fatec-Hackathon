const BRAZIL_STATE_CODES = new Set([
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT",
  "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO",
  "RR", "SC", "SP", "SE", "TO"
]);

export const REFERENCE_CITY_DISTANCES_KM = Object.freeze({
  "Sao Paulo": 15,
  "Campinas": 95,
  "Ribeirao Preto": 120,
  "Belo Horizonte": 420,
  "Curitiba": 410,
  "Porto Alegre": 820,
  "Rio de Janeiro": 430,
  "Brasilia": 860
});

const CARBON_FACTORS = Object.freeze({
  GASOLINA: 2.04,
  ALCOOL: 1.51,
  DIESEL: 2.6,
  ELETRICO: 0.0545
});
const VALID_FUEL_TYPES = new Set(Object.keys(CARBON_FACTORS));
const DEFAULT_DISTANCE_KM = 250;

const obviousFakeTokens = new Set([
  "teste",
  "aaaa",
  "asdf",
  "qwerty",
  "xxx",
  "abc",
  "123456",
  "nome sobrenome",
  "fulano de tal",
  "nao informado"
]);

function normalizeSpaces(value) {
  return (value || "").trim().replace(/\s+/g, " ");
}

export function digits(value) {
  return (value || "").replace(/\D/g, "");
}

export function formatCpf(value) {
  const raw = digits(value).slice(0, 11);
  return raw
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

export function formatCnpj(value) {
  const raw = digits(value).slice(0, 14);
  return raw
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

export function formatCellphone(value) {
  const raw = digits(value).slice(0, 13);
  if (raw.startsWith("55") && raw.length > 11) {
    const cc = raw.slice(0, 2);
    const local = raw.slice(2);
    if (local.length <= 10) {
      return `+${cc} (${local.slice(0, 2)}) ${local.slice(2)}`;
    }
    return `+${cc} (${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7, 11)}`;
  }
  if (raw.length <= 10) {
    return raw.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
  }
  return raw.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
}

export function isValidEmail(value) {
  const email = normalizeSpaces(value).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;
  const blocked = ["@teste.", "@test.", "@email.", "@example."];
  return !blocked.some((token) => email.includes(token));
}

export function isValidCpf(value) {
  const cpf = digits(value);
  if (!cpf || cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  const calc = (factor) => {
    let sum = 0;
    for (let i = 0; i < factor - 1; i += 1) sum += Number(cpf[i]) * (factor - i);
    const mod = (sum * 10) % 11;
    return mod === 10 ? 0 : mod;
  };
  return calc(10) === Number(cpf[9]) && calc(11) === Number(cpf[10]);
}

export function isValidCnpj(value) {
  const cnpj = digits(value);
  if (!cnpj || cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;
  const calc = (base, factors) => {
    let sum = 0;
    for (let i = 0; i < factors.length; i += 1) sum += Number(base[i]) * factors[i];
    const r = sum % 11;
    return r < 2 ? 0 : 11 - r;
  };
  const d1 = calc(cnpj, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const d2 = calc(cnpj, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return d1 === Number(cnpj[12]) && d2 === Number(cnpj[13]);
}

export function isValidPhone(value) {
  const raw = digits(value);
  if (/^(\d)\1+$/.test(raw)) return false;
  if (raw.startsWith("55")) {
    return raw.length === 12 || raw.length === 13;
  }
  return raw.length === 10 || raw.length === 11;
}

export function isValidFullName(value) {
  const name = normalizeSpaces(value);
  if (name.length < 7) return false;
  if (!/[A-Za-zÀ-ÖØ-öø-ÿ]/.test(name)) return false;
  const parts = name.split(" ");
  if (parts.length < 2) return false;
  if (parts.some((part) => part.length < 2)) return false;
  return !isObviousFakeText(name);
}

export function isValidMunicipio(value) {
  const city = normalizeSpaces(value);
  if (city.length < 3) return false;
  if (/^\d+$/.test(city)) return false;
  return !isObviousFakeText(city);
}

export function isValidUf(value) {
  return BR_UFS.has((value || "").trim().toUpperCase());
}

export function isValidWebsite(value) {
  const site = normalizeSpaces(value);
  if (!site) return true;
  try {
    const withProtocol = /^https?:\/\//i.test(site) ? site : `https://${site}`;
    const url = new URL(withProtocol);
    return url.hostname.includes(".") && url.hostname.length >= 4;
  } catch {
    return false;
  }
}

export function isObviousFakeText(value) {
  const v = normalizeSpaces(value).toLowerCase();
  if (!v) return true;
  if (obviousFakeTokens.has(v)) return true;
  if (/^(.)\1{3,}$/.test(v)) return true;
  return false;
}

export function normalizePublicFormPayload(form) {
  return {
    ...form,
    nomeCompleto: normalizeSpaces(form.nomeCompleto),
    email: normalizeSpaces(form.email).toLowerCase(),
    municipio: normalizeSpaces(form.municipio),
    cidadeOrigem: normalizeSpaces(form.cidadeOrigem || form.municipio),
    uf: (form.uf || "").trim().toUpperCase(),
    nacionalidade: normalizeSpaces(form.nacionalidade),
    nacionalidadeEmpresa: normalizeSpaces(form.nacionalidadeEmpresa),
    cpf: digits(form.cpf),
    cnpj: digits(form.cnpj),
    celular: digits(form.celular),
    combustivel: normalizeSpaces(form.combustivel || form.tipoCombustivel).toUpperCase(),
    distanciaKm:
      form.distanciaKm === "" || form.distanciaKm === null || form.distanciaKm === undefined
        ? null
        : Number(form.distanciaKm),
    aceitouCompartilhamentoComExpositores: form.aceitouCompartilhamentoComExpositores === true,
    siteEmpresa: normalizeSpaces(form.siteEmpresa),
    nomeEmpresa: normalizeSpaces(form.nomeEmpresa),
    ccir: normalizeSpaces(form.ccir),
    nomePropriedade: normalizeSpaces(form.nomePropriedade),
    nomeVeiculo: normalizeSpaces(form.nomeVeiculo),
    funcaoCargo: normalizeSpaces(form.funcaoCargo)
  };
}

export function resolveDistanceFromCity(originCity) {
  const city = normalizeSpaces(originCity);
  return REFERENCE_CITY_DISTANCES_KM[city] ?? DEFAULT_DISTANCE_KM;
}

export function calculateCarbonEstimate({ cidadeOrigem, combustivel, distanciaKm }) {
  const distance = Number.isFinite(Number(distanciaKm)) && Number(distanciaKm) > 0
    ? Number(distanciaKm)
    : resolveDistanceFromCity(cidadeOrigem);
  const fuel = (combustivel || "NAO_INFORMADO").toUpperCase();
  const factor = CARBON_FACTORS[fuel] ?? null;
  if (factor === null) return null;
  return Number((distance * factor).toFixed(3));
}

export function validatePublicParticipantForm(rawForm) {
  const form = normalizePublicFormPayload(rawForm);
  const errors = {};
  const isVisitanteInternacional =
    form.categoria === "VISITANTE" &&
    form.nacionalidade &&
    form.nacionalidade.toLowerCase() !== "brasil";

  if (!isValidFullName(form.nomeCompleto)) {
    errors.nomeCompleto = "validation.fullName";
  }
  if (!isValidEmail(form.email)) {
    errors.email = "validation.email";
  }
  if (!isValidPhone(form.celular)) {
    errors.celular = "validation.phone";
  }
  if (!isValidMunicipio(form.municipio)) {
    errors.municipio = "validation.city";
  }
  if (!isValidMunicipio(form.cidadeOrigem || form.municipio)) {
    errors.cidadeOrigem = "validation.originCity";
  }
  if (!isVisitanteInternacional && !isValidUf(form.uf)) {
    errors.uf = "validation.state";
  }
  if (form.categoria === "VISITANTE" && !form.nacionalidade) {
    errors.nacionalidade = "validation.nationality";
  }

  if (["EXPOSITOR", "IMPRENSA", "COLABORADOR_TERCEIRIZADO"].includes(form.categoria) && !form.nacionalidadeEmpresa) {
    errors.nacionalidadeEmpresa = "validation.companyNationality";
  }
  if (!form.aceitouLgpd) {
    errors.aceitouLgpd = "validation.privacyConsent";
  }
  if (form.combustivel && form.combustivel !== "NAO_INFORMADO" && !VALID_FUEL_TYPES.has(form.combustivel)) {
    errors.combustivel = "validation.fuel";
  }

  if (
    form.distanciaKm !== null &&
    (!Number.isFinite(form.distanciaKm) || form.distanciaKm <= 0 || form.distanciaKm > 3000)
  ) {
    errors.distanciaKm = "validation.distance";
  }

  if (form.cpf && !isValidCpf(form.cpf) && !isVisitanteInternacional) {
    errors.cpf = "validation.cpf";
  }
  if (form.cnpj && !isValidCnpj(form.cnpj)) {
    errors.cnpj = "validation.cnpj";
  }

  if (form.categoria === "EXPOSITOR" || form.categoria === "IMPRENSA") {
    if (!form.cnpj) errors.cnpj = "validation.cnpjRequiredForCategory";
  }
  if (form.categoria === "COMISSAO_ORGANIZADORA") {
    if (!form.cpf) errors.cpf = "validation.cpfRequiredForCategory";
  }
  if (
    ["CAFEICULTOR", "COLABORADOR_TERCEIRIZADO", "COMISSAO_ORGANIZADORA"].includes(form.categoria) &&
    !form.cpf &&
    !form.cnpj
  ) {
    errors.documento = "validation.documentRequired";
  }
  if (form.categoria === "CAFEICULTOR" && !form.cpf && !form.cnpj) {
    errors.documento = "validation.producerDocumentRequired";
  }

  if (form.siteEmpresa && !isValidWebsite(form.siteEmpresa)) {
    errors.siteEmpresa = "validation.website";
  }

  const requiredByCategory = {
    EXPOSITOR: ["nomeEmpresa"],
    CAFEICULTOR: ["ccir", "nomePropriedade"],
    VISITANTE: [],
    IMPRENSA: ["nomeVeiculo"],
    COMISSAO_ORGANIZADORA: ["funcaoCargo"],
    COLABORADOR_TERCEIRIZADO: ["nomeEmpresa", "funcaoCargo"]
  };

  for (const field of requiredByCategory[form.categoria] || []) {
    if (!form[field] || isObviousFakeText(form[field])) {
      errors[field] = "validation.requiredOrInvalid";
    }
  }

  for (const field of ["nomeEmpresa", "nomePropriedade", "nomeVeiculo"]) {
    if (form[field] && isObviousFakeText(form[field])) {
      errors[field] = "validation.invalidValue";
    }
  }

  const distance = resolveDistanceFromCity(form.cidadeOrigem || form.municipio);
  const estimatedCarbonFootprint = calculateCarbonEstimate({
    cidadeOrigem: form.cidadeOrigem || form.municipio,
    combustivel: form.combustivel,
    distanciaKm: distance
  });

  return {
    errors,
    normalized: {
      ...form,
      distanciaKm: distance ?? null,
      pegadaCarbonoEstimada: estimatedCarbonFootprint
    }
  };
}

export const resolveDistanceFromCidade = resolveDistanceFromCity;
export const calculateCarbonEstimateFront = calculateCarbonEstimate;
export const validatePublicCredenciadoForm = validatePublicParticipantForm;

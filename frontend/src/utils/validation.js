const BR_UFS = new Set([
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT",
  "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO",
  "RR", "SC", "SP", "SE", "TO"
]);

export const CIDADES_VIZINHAS_FRANCA = Object.freeze({
  "Restinga": 6.5,
  "Patrocinio Paulista": 32.5,
  "Cristais Paulista": 30,
  "Ribeirao Corrente": 40,
  "Batatais": 60,
  "Claraval": 37.5,
  "Ibiraci": 51.5,
  "Sao Jose da Bela Vista": 44
});

const CARBON_FACTORS = Object.freeze({
  GASOLINA: 2.04,
  ALCOOL: 1.51,
  DIESEL: 2.6,
  ELETRICO: 0.0545,
  NAO_INFORMADO: 0.18
});
const validFuel = new Set(Object.keys(CARBON_FACTORS));

const fakeTokens = new Set([
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
  if (fakeTokens.has(v)) return true;
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
    cpf: digits(form.cpf),
    cnpj: digits(form.cnpj),
    celular: digits(form.celular),
    combustivel: normalizeSpaces(form.combustivel || form.tipoCombustivel).toUpperCase(),
    distanciaKm:
      form.distanciaKm === "" || form.distanciaKm === null || form.distanciaKm === undefined
        ? null
        : Number(form.distanciaKm),
    siteEmpresa: normalizeSpaces(form.siteEmpresa),
    nomeEmpresa: normalizeSpaces(form.nomeEmpresa),
    ccir: normalizeSpaces(form.ccir),
    nomePropriedade: normalizeSpaces(form.nomePropriedade),
    nomeVeiculo: normalizeSpaces(form.nomeVeiculo),
    funcaoCargo: normalizeSpaces(form.funcaoCargo)
  };
}

export function resolveDistanceFromCidade(cidadeOrigem) {
  const city = normalizeSpaces(cidadeOrigem);
  return CIDADES_VIZINHAS_FRANCA[city] ?? null;
}

export function calculateCarbonEstimateFront({ cidadeOrigem, combustivel, distanciaKm }) {
  const distance = Number.isFinite(Number(distanciaKm)) && Number(distanciaKm) > 0
    ? Number(distanciaKm)
    : resolveDistanceFromCidade(cidadeOrigem) ?? 250;
  const fuel = (combustivel || "NAO_INFORMADO").toUpperCase();
  const factor = CARBON_FACTORS[fuel] ?? CARBON_FACTORS.NAO_INFORMADO;
  return Number((distance * factor).toFixed(3));
}

export function validatePublicCredenciadoForm(rawForm) {
  const form = normalizePublicFormPayload(rawForm);
  const errors = {};
  const isVisitanteInternacional =
    form.categoria === "VISITANTE" &&
    form.nacionalidade &&
    form.nacionalidade.toLowerCase() !== "brasil";

  if (!isValidFullName(form.nomeCompleto)) {
    errors.nomeCompleto = "Informe nome e sobrenome";
  }
  if (!isValidEmail(form.email)) {
    errors.email = "Informe um email valido";
  }
  if (!isValidPhone(form.celular)) {
    errors.celular = "Informe um celular valido";
  }
  if (!isValidMunicipio(form.municipio)) {
    errors.municipio = "Informe a cidade";
  }
  if (!isValidMunicipio(form.cidadeOrigem || form.municipio)) {
    errors.cidadeOrigem = "Informe a cidade de origem";
  }
  if (!isVisitanteInternacional && !isValidUf(form.uf)) {
    errors.uf = "Selecione uma UF valida";
  }
  if (form.categoria === "VISITANTE" && !form.nacionalidade) {
    errors.nacionalidade = "Informe a nacionalidade";
  }
  if (!form.aceitouLgpd) {
    errors.aceitouLgpd = "Voce precisa aceitar os termos da LGPD";
  }
  if (!validFuel.has(form.combustivel || "NAO_INFORMADO")) {
    errors.combustivel = "Selecione um combustivel valido";
  }

  if (
    form.distanciaKm !== null &&
    (!Number.isFinite(form.distanciaKm) || form.distanciaKm <= 0 || form.distanciaKm > 3000)
  ) {
    errors.distanciaKm = "Informe uma distancia valida";
  }

  if (form.cpf && !isValidCpf(form.cpf) && !isVisitanteInternacional) {
    errors.cpf = "CPF invalido";
  }
  if (form.cnpj && !isValidCnpj(form.cnpj)) {
    errors.cnpj = "CNPJ invalido";
  }

  if (form.categoria === "EXPOSITOR" || form.categoria === "IMPRENSA") {
    if (!form.cnpj) errors.cnpj = "Preencha CNPJ para esta categoria";
  }
  if (form.categoria === "COMISSAO_ORGANIZADORA") {
    if (!form.cpf) errors.cpf = "Preencha CPF para esta categoria";
  }
  if (
    ["CAFEICULTOR", "COLABORADOR_TERCEIRIZADO", "COMISSAO_ORGANIZADORA"].includes(form.categoria) &&
    !form.cpf &&
    !form.cnpj
  ) {
    errors.documento = "Preencha ao menos um documento valido para esta categoria";
  }
  if (form.categoria === "CAFEICULTOR" && !form.cpf && !form.cnpj) {
    errors.documento = "Para cafeicultor, informe CPF, CNPJ ou ambos";
  }

  if (form.siteEmpresa && !isValidWebsite(form.siteEmpresa)) {
    errors.siteEmpresa = "Informe um site valido";
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
      errors[field] = "Campo obrigatorio ou invalido";
    }
  }

  for (const field of ["nomeEmpresa", "nomePropriedade", "nomeVeiculo"]) {
    if (form[field] && isObviousFakeText(form[field])) {
      errors[field] = "Digite um valor valido";
    }
  }

  const distance = form.distanciaKm ?? resolveDistanceFromCidade(form.cidadeOrigem);
  const pegada = calculateCarbonEstimateFront({
    cidadeOrigem: form.cidadeOrigem,
    combustivel: form.combustivel,
    distanciaKm: distance
  });

  return {
    errors,
    normalized: {
      ...form,
      distanciaKm: distance ?? null,
      pegadaCarbonoEstimada: pegada
    }
  };
}

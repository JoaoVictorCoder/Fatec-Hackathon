function onlyDigits(value) {
  return (value || "").replace(/\D/g, "");
}

const BR_UFS = new Set([
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT",
  "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO",
  "RR", "SC", "SP", "SE", "TO"
]);

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

export function normalizeSpaces(value) {
  return (value || "").trim().replace(/\s+/g, " ");
}

export function sanitizeCpf(value) {
  return onlyDigits(value);
}

export function sanitizeCnpj(value) {
  return onlyDigits(value);
}

export function isValidEmail(value) {
  const email = normalizeSpaces(value).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;
  const blocked = ["@teste.", "@test.", "@email.", "@example."];
  return !blocked.some((token) => email.includes(token));
}

export function isValidCpf(value) {
  const cpf = sanitizeCpf(value);
  if (!cpf || cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
    return false;
  }

  const calc = (factor) => {
    let total = 0;
    for (let i = 0; i < factor - 1; i += 1) {
      total += Number(cpf[i]) * (factor - i);
    }
    const mod = (total * 10) % 11;
    return mod === 10 ? 0 : mod;
  };

  return calc(10) === Number(cpf[9]) && calc(11) === Number(cpf[10]);
}

export function isValidCnpj(value) {
  const cnpj = sanitizeCnpj(value);
  if (!cnpj || cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) {
    return false;
  }

  const calc = (base, factors) => {
    let total = 0;
    for (let i = 0; i < factors.length; i += 1) {
      total += Number(base[i]) * factors[i];
    }
    const remainder = total % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const d1 = calc(cnpj, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const d2 = calc(cnpj, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);

  return d1 === Number(cnpj[12]) && d2 === Number(cnpj[13]);
}

export function isValidPhone(value) {
  const raw = onlyDigits(value);
  if (!raw || /^(\d)\1+$/.test(raw)) return false;
  if (raw.startsWith("55")) return raw.length === 12 || raw.length === 13;
  return raw.length === 10 || raw.length === 11;
}

export function isValidUf(value) {
  return BR_UFS.has((value || "").trim().toUpperCase());
}

export function isObviousFakeText(value) {
  const v = normalizeSpaces(value).toLowerCase();
  if (!v) return true;
  if (fakeTokens.has(v)) return true;
  if (/^(.)\1{3,}$/.test(v)) return true;
  return false;
}

export function isValidFullName(value) {
  const name = normalizeSpaces(value);
  if (name.length < 7) return false;
  if (!/[A-Za-zÀ-ÖØ-öø-ÿ]/.test(name)) return false;
  if (isObviousFakeText(name)) return false;
  const parts = name.split(" ");
  if (parts.length < 2) return false;
  if (parts.some((part) => part.length < 2)) return false;
  return true;
}

export function isValidMunicipio(value) {
  const city = normalizeSpaces(value);
  if (city.length < 3) return false;
  if (/^\d+$/.test(city)) return false;
  return !isObviousFakeText(city);
}

export function normalizeWebsite(value) {
  const site = normalizeSpaces(value);
  if (!site) return null;
  return /^https?:\/\//i.test(site) ? site : `https://${site}`;
}

export function isValidWebsite(value) {
  const normalized = normalizeWebsite(value);
  if (!normalized) return true;
  try {
    const url = new URL(normalized);
    return url.hostname.includes(".") && url.hostname.length >= 4;
  } catch {
    return false;
  }
}

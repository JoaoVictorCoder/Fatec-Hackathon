import enUS from "./en-us.json";
import ptBR from "./pt-br.json";

// Change this single value to switch app language.
export const ACTIVE_LANGUAGE_CODE = "en-us";

const dictionaryByLanguage = {
  "en-us": enUS,
  "pt-br": ptBR
};

function resolveNestedKey(object, key) {
  return key.split(".").reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), object);
}

function interpolate(template, params) {
  return String(template).replace(/\{(\w+)\}/g, (_match, token) => {
    return params[token] !== undefined ? String(params[token]) : `{${token}}`;
  });
}

export function getCurrentLanguageCode() {
  return dictionaryByLanguage[ACTIVE_LANGUAGE_CODE] ? ACTIVE_LANGUAGE_CODE : "en-us";
}

export function getCurrentDictionary() {
  return dictionaryByLanguage[getCurrentLanguageCode()];
}

export function t(key, params = {}) {
  const dictionary = getCurrentDictionary();
  const raw = resolveNestedKey(dictionary, key);
  if (raw === undefined) {
    return key;
  }
  if (typeof raw === "string") {
    return interpolate(raw, params);
  }
  return raw;
}

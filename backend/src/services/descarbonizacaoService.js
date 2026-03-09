import { createDescarbonizacaoRegistro } from "../repositories/descarbonizacaoRepository.js";

const REFERENCE_CITY_DISTANCES_KM = Object.freeze({
  SAO_PAULO: 15,
  CAMPINAS: 95,
  RIBEIRAO_PRETO: 120,
  BELO_HORIZONTE: 420,
  CURITIBA: 410,
  PORTO_ALEGRE: 820,
  RIO_DE_JANEIRO: 430,
  BRASILIA: 860
});

const FATOR_CO2_POR_KM = Object.freeze({
  GASOLINA: 2.04,
  ALCOOL: 1.51,
  DIESEL: 2.6,
  ELETRICO: 0.0545,
  ETANOL: 1.51
});

const DISTANCIA_PADRAO_KM = 250;

function normalizeKey(value) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");
}

function resolveDistancia(cidadeOrigem) {
  const key = normalizeKey(cidadeOrigem);
  if (!key) {
    return DISTANCIA_PADRAO_KM;
  }
  return REFERENCE_CITY_DISTANCES_KM[key] || DISTANCIA_PADRAO_KM;
}

function resolveFator(combustivel) {
  const key = normalizeKey(combustivel);
  return FATOR_CO2_POR_KM[key] || null;
}

export function calculateCarbonEstimate({
  cidadeOrigem,
  combustivel,
  distanciaKm
}) {
  const resolvedCombustivel = normalizeKey(combustivel || "NAO_INFORMADO");
  const resolvedDistance =
    typeof distanciaKm === "number" && Number.isFinite(distanciaKm) && distanciaKm > 0
      ? distanciaKm
      : resolveDistancia(cidadeOrigem);
  const factor = resolveFator(resolvedCombustivel);
  const pegadaCarbonoEstimada =
    factor === null ? null : Number((resolvedDistance * factor).toFixed(3));

  return {
    cidadeOrigem: cidadeOrigem || "Nao informado",
    combustivel: resolvedCombustivel,
    distanciaKm: resolvedDistance,
    fatorEmissao: factor,
    pegadaCarbonoEstimada
  };
}

export function enqueueDescarbonizacaoProcess(credenciado) {
  Promise.resolve()
    .then(async () => {
      const estimate = calculateCarbonEstimate({
        cidadeOrigem: credenciado.cidadeOrigem || credenciado.municipio,
        combustivel: credenciado.combustivel || credenciado.tipoCombustivel,
        distanciaKm: credenciado.distanciaKm
      });

      if (estimate.fatorEmissao === null || estimate.pegadaCarbonoEstimada === null) {
        return;
      }

      await createDescarbonizacaoRegistro({
        credenciadoId: credenciado.id,
        cidadeOrigem: estimate.cidadeOrigem,
        cidadeDestino: "Local da Operacao",
        combustivel: estimate.combustivel,
        distanciaKm: estimate.distanciaKm,
        fatorEmissao: estimate.fatorEmissao,
        emissaoKgCo2: estimate.pegadaCarbonoEstimada,
        metadata: {
          cidadeDestino: "Local da Operacao",
          source: "reference_city_distance_table",
          noExternalMapsApi: true
        }
      });
    })
    .catch((error) => {
      console.error("falha ao processar descarbonizacao", error.message);
    });
}

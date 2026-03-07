import { createDescarbonizacaoRegistro } from "../repositories/descarbonizacaoRepository.js";

const DISTANCIAS_PARA_FRANCA_KM = Object.freeze({
  RESTINGA: 6.5,
  PATROCINIO_PAULISTA: 32.5,
  CRISTAIS_PAULISTA: 30,
  RIBEIRAO_CORRENTE: 40,
  BATATAIS: 60,
  CLARAVAL: 37.5,
  IBIRACI: 51.5,
  SAO_JOSE_DA_BELA_VISTA: 44
});

const FATOR_CO2_POR_KM = Object.freeze({
  GASOLINA: 2.04,
  ALCOOL: 1.51,
  DIESEL: 2.6,
  ELETRICO: 0.0545,
  ETANOL: 1.51,
  NAO_INFORMADO: 0.18
});

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
    return 250;
  }
  return DISTANCIAS_PARA_FRANCA_KM[key] || 250;
}

function resolveFator(combustivel) {
  const key = normalizeKey(combustivel);
  return FATOR_CO2_POR_KM[key] || FATOR_CO2_POR_KM.NAO_INFORMADO;
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
  const pegadaCarbonoEstimada = Number((resolvedDistance * factor).toFixed(3));

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

      await createDescarbonizacaoRegistro({
        credenciadoId: credenciado.id,
        cidadeOrigem: estimate.cidadeOrigem,
        combustivel: estimate.combustivel,
        distanciaKm: estimate.distanciaKm,
        fatorEmissao: estimate.fatorEmissao,
        emissaoKgCo2: estimate.pegadaCarbonoEstimada,
        metadata: {
          cidadeDestino: "Clube de Campo da Franca - Restinga/SP",
          source: "franca_neighbor_distance_table",
          noExternalMapsApi: true
        }
      });
    })
    .catch((error) => {
      console.error("falha ao processar descarbonizacao", error.message);
    });
}

import {
  getDescarbonizacaoResumo,
  listDescarbonizacaoRegistros
} from "../repositories/descarbonizacaoRepository.js";

export async function getDescarbonizacaoDashboard() {
  const [resumo, registros] = await Promise.all([
    getDescarbonizacaoResumo(),
    listDescarbonizacaoRegistros({ limit: 50 })
  ]);

  return {
    resumo,
    registros: registros.map((item) => ({
      id: item.id,
      cidadeOrigem: item.cidadeOrigem,
      cidadeDestino: item.cidadeDestino,
      combustivel: item.combustivel,
      distanciaKm: item.distanciaKm,
      emissaoKgCo2: item.emissaoKgCo2,
      createdAt: item.createdAt,
      credenciado: item.credenciado
    }))
  };
}

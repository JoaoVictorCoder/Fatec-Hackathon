import { getDescarbonizacaoDashboard } from "../services/descarbonizacaoDashboardService.js";

export async function getDescarbonizacaoAdminHandler(_req, res) {
  const data = await getDescarbonizacaoDashboard();
  return res.json(data);
}

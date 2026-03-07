import { listEventos } from "../repositories/eventoRepository.js";

export async function listEventosCadastroAdminHandler(req, res) {
  const onlyActive = req.query.ativo;
  const ativo =
    onlyActive === undefined ? undefined : String(onlyActive).toLowerCase() === "true";

  const eventos = await listEventos({ ativo });
  return res.json(
    eventos.map((item) => ({
      id: item.id,
      nomeEvento: item.nomeEvento,
      isGratuito: item.isGratuito,
      ativo: item.ativo,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }))
  );
}

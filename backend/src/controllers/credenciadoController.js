import {
  findCredenciadoById,
  listCredenciadosPaginated
} from "../repositories/credenciadoRepository.js";
import { findCredencialByCodigoUnico } from "../repositories/credencialRepository.js";
import { listEventosByCredenciadoId } from "../repositories/eventoSistemaRepository.js";
import {
  mapAdminCredenciadoListItem,
  mapCredenciadoIdentity,
  mapEventoSistema,
  mapPublicCredenciamentoResult
} from "../mappers/identityMapper.js";
import { createCredenciamento } from "../services/credenciamentoService.js";
import { enqueueDescarbonizacaoProcess } from "../services/descarbonizacaoService.js";
import {
  softDeleteCredenciadoAdmin,
  updateCredenciadoAdmin,
  updateCredenciadoStatusAdmin
} from "../services/adminManagementService.js";
import { validateCredenciadoPayload } from "../validators/credenciadoValidator.js";
import { Categoria, StatusCredenciamento } from "../domain/enums.js";
import { CreateCredenciamentoUseCase } from "../application/use-cases/createCredenciamentoUseCase.js";

const createCredenciamentoUseCase = new CreateCredenciamentoUseCase({
  createCredenciamento,
  enqueueDescarbonizacaoProcess
});

function handleCreateError(error, res) {
  if (error.code === "P2002") {
    const fields = Array.isArray(error?.meta?.target) ? error.meta.target.join(", ") : null;
    return res.status(409).json({
      error: fields
        ? `ja existe cadastro com o(s) campo(s): ${fields}`
        : "cpf ou email ja cadastrado",
      code: "UNIQUE_CONSTRAINT"
    });
  }
  return res.status(500).json({ error: "erro ao criar credenciamento" });
}

export async function createCredenciadoPublicHandler(req, res) {
  const validation = validateCredenciadoPayload(req.body || {}, {
    allowComissaoOrganizadora: false
  });

  if (!validation.valid) {
    return res.status(400).json({ errors: validation.errors });
  }

  try {
    const created = await createCredenciamentoUseCase.execute(validation.data, {
      actorType: "SYSTEM"
    });
    return res.status(201).json(mapPublicCredenciamentoResult(created));
  } catch (error) {
    return handleCreateError(error, res);
  }
}

export async function createComissaoAdminHandler(req, res) {
  const payload = {
    ...req.body,
    categoria: Categoria.COMISSAO_ORGANIZADORA
  };

  const validation = validateCredenciadoPayload(payload, {
    allowComissaoOrganizadora: true
  });

  if (!validation.valid) {
    return res.status(400).json({ errors: validation.errors });
  }

  try {
    const created = await createCredenciamentoUseCase.execute(validation.data, {
      actorType:
        req.auth?.role === "APP_GATE" ||
        req.auth?.role === "LEITOR_CATRACA" ||
        req.auth?.role === "OPERADOR_QR"
          ? "APP_GATE"
          : "ADMIN_USER",
      actorId: req.auth?.id
    });
    return res.status(201).json(mapCredenciadoIdentity(created));
  } catch (error) {
    return handleCreateError(error, res);
  }
}

export async function getCredenciadoPublicStatusHandler(req, res) {
  const lookup = req.params.id;
  let item = null;
  const uuidLike =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      lookup
    );

  // Permite consultar status por ID do credenciado (UUID) ou codigoUnico da credencial.
  if (uuidLike) {
    item = await findCredenciadoById(lookup);
  }

  if (!item) {
    const credencial = await findCredencialByCodigoUnico(lookup);
    item = credencial?.credenciado || null;
  }

  if (!item) {
    return res.status(404).json({ error: "credenciado nao encontrado" });
  }

  return res.json({
    id: item.id,
    categoria: item.categoria,
    statusCredenciamento: item.statusCredenciamento,
    credencial: item.credencial
      ? {
          id: item.credencial.id,
          codigoUnico: item.credencial.codigoUnico,
          statusCredencial: item.credencial.statusCredencial,
          emitidaEm: item.credencial.emitidaEm
        }
      : null
  });
}

export async function listCredenciadosAdminHandler(req, res) {
  const page = Math.max(Number(req.query.page || 1), 1);
  const pageSize = Math.min(Math.max(Number(req.query.pageSize || 10), 1), 100);
  const categoria =
    typeof req.query.categoria === "string" && req.query.categoria
      ? req.query.categoria
      : undefined;
  const search =
    typeof req.query.search === "string" && req.query.search.trim()
      ? req.query.search.trim()
      : undefined;

  if (categoria && !Object.values(Categoria).includes(categoria)) {
    return res.status(400).json({ error: "categoria de filtro invalida" });
  }

  const { items, total } = await listCredenciadosPaginated({
    page,
    pageSize,
    categoria,
    search
  });

  return res.json({
    items: items.map(mapAdminCredenciadoListItem),
    page,
    pageSize,
    total,
    totalPages: Math.max(Math.ceil(total / pageSize), 1)
  });
}

export async function getCredenciadoAdminByIdHandler(req, res) {
  const item = await findCredenciadoById(req.params.id);
  if (!item) {
    return res.status(404).json({ error: "credenciado nao encontrado" });
  }
  return res.json(mapCredenciadoIdentity(item));
}

export async function listCredenciadoEventosAdminHandler(req, res) {
  const credenciado = await findCredenciadoById(req.params.id);
  if (!credenciado) {
    return res.status(404).json({ error: "credenciado nao encontrado" });
  }
  const limit = Number(req.query.limit || 50);
  const boundedLimit = Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 200) : 50;
  const events = await listEventosByCredenciadoId(req.params.id, boundedLimit);
  return res.json(events.map(mapEventoSistema));
}

export async function updateCredenciadoAdminHandler(req, res) {
  const id = req.params.id;
  const current = await findCredenciadoById(id);
  if (!current) {
    return res.status(404).json({ error: "credenciado nao encontrado" });
  }

  const payload = {
    ...current,
    ...req.body,
    categoria: req.body?.categoria || current.categoria
  };

  const validation = validateCredenciadoPayload(payload, {
    allowComissaoOrganizadora: true
  });
  if (!validation.valid) {
    return res.status(400).json({ errors: validation.errors });
  }

  const updated = await updateCredenciadoAdmin(id, validation.data, req.auth);
  return res.json(mapCredenciadoIdentity(updated));
}

export async function updateCredenciadoStatusAdminHandler(req, res) {
  const id = req.params.id;
  const status = req.body?.statusCredenciamento;
  if (!status) {
    return res.status(400).json({ error: "statusCredenciamento e obrigatorio" });
  }
  if (!Object.values(StatusCredenciamento).includes(status)) {
    return res.status(400).json({ error: "statusCredenciamento invalido" });
  }
  const updated = await updateCredenciadoStatusAdmin(id, status, req.body?.motivo, req.auth);
  return res.json(mapCredenciadoIdentity(updated));
}

export async function softDeleteCredenciadoAdminHandler(req, res) {
  const id = req.params.id;
  const updated = await softDeleteCredenciadoAdmin(id, req.body?.motivo, req.auth);
  return res.json({
    ok: true,
    id: updated.id,
    statusCredenciamento: updated.statusCredenciamento
  });
}

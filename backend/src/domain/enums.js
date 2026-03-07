export const Categoria = Object.freeze({
  EXPOSITOR: "EXPOSITOR",
  CAFEICULTOR: "CAFEICULTOR",
  VISITANTE: "VISITANTE",
  IMPRENSA: "IMPRENSA",
  COMISSAO_ORGANIZADORA: "COMISSAO_ORGANIZADORA",
  COLABORADOR_TERCEIRIZADO: "COLABORADOR_TERCEIRIZADO"
});

export const StatusCredenciamento = Object.freeze({
  CADASTRADO: "CADASTRADO",
  APROVADO: "APROVADO",
  BLOQUEADO: "BLOQUEADO",
  CHECKED_IN: "CHECKED_IN",
  INATIVO: "INATIVO"
});

export const StatusCredencial = Object.freeze({
  GERADA: "GERADA",
  ATIVA: "ATIVA",
  INATIVA: "INATIVA",
  UTILIZADA: "UTILIZADA",
  CANCELADA: "CANCELADA"
});

export const TipoEventoSistema = Object.freeze({
  CREDENCIAMENTO_CRIADO: "CREDENCIAMENTO_CRIADO",
  CREDENCIAL_GERADA: "CREDENCIAL_GERADA",
  DADOS_ATUALIZADOS: "DADOS_ATUALIZADOS",
  ACESSO_VALIDADO: "ACESSO_VALIDADO",
  ACESSO_NEGADO: "ACESSO_NEGADO"
});

export const AdminRole = Object.freeze({
  MASTER_ADMIN: "MASTER_ADMIN",
  ADMIN: "ADMIN",
  OPERADOR_QR: "OPERADOR_QR",
  LEITOR_CATRACA: "LEITOR_CATRACA",
  APP_GATE: "APP_GATE",
  SYSTEM: "SYSTEM"
});

export const OrganizationProfile = Object.freeze({
  MASTER_ADMIN: "MasterAdmin",
  ADMIN: "Admin",
  OPERADOR_QR: "OperadorQr",
  SYSTEM: "System"
});

export function mapRoleToOrganizationProfile(role) {
  if (role === AdminRole.MASTER_ADMIN) {
    return OrganizationProfile.MASTER_ADMIN;
  }
  if (role === AdminRole.ADMIN) {
    return OrganizationProfile.ADMIN;
  }
  if (
    role === AdminRole.OPERADOR_QR ||
    role === AdminRole.APP_GATE ||
    role === AdminRole.LEITOR_CATRACA
  ) {
    return OrganizationProfile.OPERADOR_QR;
  }
  return OrganizationProfile.SYSTEM;
}

export const OperatorPermission = Object.freeze({
  PODE_VALIDAR_ENTRADA: "podeValidarEntrada",
  PODE_VISUALIZAR_DADOS_MINIMOS: "podeVisualizarDadosMinimosCredenciado",
  PODE_VER_HISTORICO_BASICO: "podeVerHistoricoBasicoDaCredencial",
  PODE_REGISTRAR_OBSERVACAO: "podeRegistrarObservacaoOperacional",
  PODE_CONSULTAR_ULTIMAS_ENTRADAS: "podeConsultarUltimasEntradas",
  PODE_USAR_CAMERA_QR: "podeUsarCameraParaLeituraQR"
});

export function defaultOperatorPermissions() {
  return {
    [OperatorPermission.PODE_VALIDAR_ENTRADA]: true,
    [OperatorPermission.PODE_VISUALIZAR_DADOS_MINIMOS]: true,
    [OperatorPermission.PODE_VER_HISTORICO_BASICO]: true,
    [OperatorPermission.PODE_REGISTRAR_OBSERVACAO]: true,
    [OperatorPermission.PODE_CONSULTAR_ULTIMAS_ENTRADAS]: true,
    [OperatorPermission.PODE_USAR_CAMERA_QR]: true
  };
}

export const AccessResult = Object.freeze({
  ALLOW: "ALLOW",
  DENY: "DENY"
});

export const AccessReason = Object.freeze({
  CREDENCIAL_INVALIDA: "CREDENCIAL_INVALIDA",
  CREDENCIAL_BLOQUEADA: "CREDENCIAL_BLOQUEADA",
  JA_UTILIZADA: "JA_UTILIZADA",
  FORA_DO_HORARIO: "FORA_DO_HORARIO",
  ACESSO_PERMITIDO: "ACESSO_PERMITIDO",
  CREDENCIAL_CANCELADA: "CREDENCIAL_CANCELADA",
  CREDENCIAL_INATIVA: "CREDENCIAL_INATIVA"
});

export const AuditActorType = Object.freeze({
  ADMIN_USER: "ADMIN_USER",
  APP_GATE: "APP_GATE",
  SYSTEM: "SYSTEM"
});

export const CategoriaCamposObrigatorios = Object.freeze({
  [Categoria.EXPOSITOR]: ["cnpj", "siteEmpresa", "nomeEmpresa"],
  [Categoria.CAFEICULTOR]: ["ccir", "nomePropriedade"],
  [Categoria.VISITANTE]: [],
  [Categoria.IMPRENSA]: ["cnpj", "nomeVeiculo", "siteEmpresa"],
  [Categoria.COMISSAO_ORGANIZADORA]: ["funcaoCargo"],
  [Categoria.COLABORADOR_TERCEIRIZADO]: ["cnpj", "nomeEmpresa", "funcaoCargo"]
});

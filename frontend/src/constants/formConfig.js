export const categoriaOptions = [
  { value: "EXPOSITOR", label: "Expositor" },
  { value: "CAFEICULTOR", label: "Cafeicultor" },
  { value: "VISITANTE", label: "Visitante" },
  { value: "IMPRENSA", label: "Imprensa" },
  { value: "COLABORADOR_TERCEIRIZADO", label: "Colaborador Terceirizado" }
];

export const adminComissaoCategoria = {
  value: "COMISSAO_ORGANIZADORA",
  label: "Comissao Organizadora"
};

export const categoryExtraFields = {
  EXPOSITOR: ["nomeEmpresa", "nacionalidadeEmpresa", "siteEmpresa"],
  CAFEICULTOR: ["nomePropriedade", "ccir"],
  VISITANTE: ["nacionalidade"],
  IMPRENSA: ["nomeVeiculo", "nacionalidadeEmpresa", "siteEmpresa"],
  COMISSAO_ORGANIZADORA: ["funcaoCargo"],
  COLABORADOR_TERCEIRIZADO: ["nomeEmpresa", "nacionalidadeEmpresa", "funcaoCargo"]
};

export const labels = {
  nomeCompleto: "Nome completo",
  cpf: "CPF",
  celular: "Celular",
  email: "E-mail",
  municipio: "Municipio",
  uf: "UF",
  nacionalidade: "Nacionalidade",
  nacionalidadeEmpresa: "Nacionalidade da empresa",
  tipoCombustivel: "Tipo de combustivel",
  cidadeOrigem: "Cidade de origem",
  combustivel: "Combustivel",
  distanciaKm: "Distancia ate o evento (km)",
  pegadaCarbonoEstimada: "Pegada de carbono estimada",
  pcd: "Pessoa com Deficiencia (PCD)",
  aceitouCompartilhamentoComExpositores: "Aceito compartilhar meus dados com expositores/stands visitados para contato posterior",
  cnpj: "CNPJ",
  siteEmpresa: "Site da empresa",
  nomeEmpresa: "Nome da empresa",
  ccir: "CCIR",
  nomePropriedade: "Nome da propriedade",
  nomeVeiculo: "Nome do veiculo",
  funcaoCargo: "Funcao/Cargo"
};

export const commonFields = [
  "nomeCompleto",
  "celular",
  "email",
  "municipio",
  "uf"
];

export const baseForm = {
  categoria: "EXPOSITOR",
  nomeCompleto: "",
  cpf: "",
  cnpj: "",
  celular: "",
  email: "",
  municipio: "",
  uf: "",
  cidadeOrigem: "",
  combustivel: "NAO_INFORMADO",
  distanciaKm: "",
  pegadaCarbonoEstimada: "",
  nacionalidade: "",
  nacionalidadeEmpresa: "",
  tipoCombustivel: "NAO_INFORMADO",
  pcd: false,
  aceitouLgpd: false,
  aceitouCompartilhamentoComExpositores: false,
  siteEmpresa: "",
  nomeEmpresa: "",
  ccir: "",
  nomePropriedade: "",
  nomeVeiculo: "",
  funcaoCargo: ""
};

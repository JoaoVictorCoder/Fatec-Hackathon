export const categoryOptions = [
  { value: "EXPOSITOR", labelKey: "categories.exhibitor" },
  { value: "CAFEICULTOR", labelKey: "categories.producer" },
  { value: "VISITANTE", labelKey: "categories.visitor" },
  { value: "IMPRENSA", labelKey: "categories.press" },
  { value: "COLABORADOR_TERCEIRIZADO", labelKey: "categories.thirdPartyCollaborator" }
];

export const governanceCategoryOption = {
  value: "COMISSAO_ORGANIZADORA",
  labelKey: "categories.governance"
};

export const categoryExtraFields = {
  EXPOSITOR: ["nomeEmpresa", "nacionalidadeEmpresa", "siteEmpresa"],
  CAFEICULTOR: ["nomePropriedade", "ccir"],
  VISITANTE: ["nacionalidade"],
  IMPRENSA: ["nomeVeiculo", "nacionalidadeEmpresa", "siteEmpresa"],
  COMISSAO_ORGANIZADORA: ["funcaoCargo"],
  COLABORADOR_TERCEIRIZADO: ["nomeEmpresa", "nacionalidadeEmpresa", "funcaoCargo"]
};

export const formFieldLabelKeyByField = {
  nomeCompleto: "form.fullName",
  cpf: "form.cpf",
  celular: "form.phone",
  email: "form.email",
  municipio: "form.city",
  uf: "form.state",
  nacionalidade: "form.nationality",
  nacionalidadeEmpresa: "form.companyNationality",
  tipoCombustivel: "form.fuelType",
  cidadeOrigem: "form.originCity",
  combustivel: "form.fuel",
  distanciaKm: "form.estimatedDistanceKm",
  pegadaCarbonoEstimada: "form.estimatedCarbon",
  pcd: "form.pcd",
  aceitouCompartilhamentoComExpositores: "form.dataSharing",
  cnpj: "form.cnpj",
  siteEmpresa: "form.companyWebsite",
  nomeEmpresa: "form.companyName",
  ccir: "form.ccir",
  nomePropriedade: "form.propertyName",
  nomeVeiculo: "form.vehicleName",
  funcaoCargo: "form.roleFunction"
};

export const commonFields = [
  "nomeCompleto",
  "celular",
  "email",
  "municipio",
  "uf"
];

export const publicBaseForm = {
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

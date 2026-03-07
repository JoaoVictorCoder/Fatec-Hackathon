import { useState } from "react";
import { adminComissaoCategoria, categoriaOptions } from "../constants/formConfig";

function Field({ label, value }) {
  return (
    <div className="detail-field">
      <span>{label}</span>
      <strong>{value || "-"}</strong>
    </div>
  );
}

export default function AdminCredenciadoDetails({
  credenciado,
  eventos,
  onClose,
  onSave,
  onSoftDelete,
  onCredentialStatusChange,
  onReissue
}) {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    nomeCompleto: credenciado?.nomeCompleto || "",
    categoria: credenciado?.categoria || "",
    cpf: credenciado?.cpf || "",
    cnpj: credenciado?.cnpj || "",
    celular: credenciado?.celular || "",
    email: credenciado?.email || "",
    municipio: credenciado?.municipio || "",
    uf: credenciado?.uf || "",
    nomeEmpresa: credenciado?.nomeEmpresa || "",
    siteEmpresa: credenciado?.siteEmpresa || "",
    nomeVeiculo: credenciado?.nomeVeiculo || "",
    nomePropriedade: credenciado?.nomePropriedade || "",
    ccir: credenciado?.ccir || "",
    funcaoCargo: credenciado?.funcaoCargo || "",
    nacionalidade: credenciado?.nacionalidade || "",
    nacionalidadeEmpresa: credenciado?.nacionalidadeEmpresa || "",
    tipoCombustivel: credenciado?.tipoCombustivel || "NAO_INFORMADO",
    cidadeOrigem: credenciado?.cidadeOrigem || "",
    combustivel: credenciado?.combustivel || "NAO_INFORMADO",
    distanciaKm: credenciado?.distanciaKm || "",
    pegadaCarbonoEstimada: credenciado?.pegadaCarbonoEstimada || "",
    aceitouLgpd: credenciado?.aceitouLgpd === true,
    aceitouCompartilhamentoComExpositores:
      credenciado?.aceitouCompartilhamentoComExpositores === true,
    pcd: credenciado?.pcd === true
  });

  if (!credenciado) {
    return null;
  }

  return (
    <div className="modal-backdrop">
      <section className="card modal-card">
        <div className="modal-header">
          <h3>Detalhes do Credenciado</h3>
          <button type="button" onClick={onClose}>
            Fechar
          </button>
        </div>

        <div className="toolbar">
          <button type="button" onClick={() => setEditMode((v) => !v)}>
            {editMode ? "Cancelar edicao" : "Editar cadastro"}
          </button>
          <button type="button" className="btn-danger" onClick={onSoftDelete}>
            Inativar cadastro
          </button>
          <button
            type="button"
            className="btn-danger"
            onClick={() => onCredentialStatusChange("INATIVA")}
          >
            Bloquear credencial
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => onCredentialStatusChange("ATIVA")}
          >
            Reativar credencial
          </button>
          <button type="button" className="btn-secondary" onClick={onReissue}>
            Reemitir credencial
          </button>
          {credenciado?.credencial?.id && (
            <a
              className="link-button"
              href={`${API_URL}/credenciais/${credenciado.credencial.id}/pdf`}
              target="_blank"
              rel="noreferrer"
            >
              Baixar PDF
            </a>
          )}
        </div>

        {editMode && (
          <form
            className="grid"
            onSubmit={(event) => {
              event.preventDefault();
              onSave(form);
              setEditMode(false);
            }}
          >
            <label>
              Categoria
              <select
                value={form.categoria}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, categoria: event.target.value }))
                }
              >
                {[...categoriaOptions, adminComissaoCategoria].map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            {[
              ["nomeCompleto", "Nome completo"],
              ["cpf", "CPF"],
              ["cnpj", "CNPJ"],
              ["celular", "Celular"],
              ["email", "E-mail"],
              ["municipio", "Municipio"],
              ["uf", "UF"],
              ["nacionalidade", "Nacionalidade"],
              ["nacionalidadeEmpresa", "Nacionalidade da empresa"],
              ["tipoCombustivel", "Tipo combustivel"],
              ["cidadeOrigem", "Cidade origem"],
              ["combustivel", "Combustivel"],
              ["distanciaKm", "Distancia km"],
              ["pegadaCarbonoEstimada", "Pegada CO2 estimada"],
              ["siteEmpresa", "Site da empresa"],
              ["nomeEmpresa", "Nome da empresa"],
              ["nomeVeiculo", "Nome do veiculo"],
              ["nomePropriedade", "Nome da propriedade"],
              ["ccir", "CCIR"],
              ["funcaoCargo", "Funcao/Cargo"]
            ].map(([field, label]) => (
              <label key={field}>
                {label}
                <input
                  value={form[field] || ""}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, [field]: event.target.value }))
                  }
                />
              </label>
            ))}
            <label className="checkbox">
              <input
                type="checkbox"
                checked={form.pcd}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, pcd: event.target.checked }))
                }
              />
              PCD
            </label>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={form.aceitouLgpd}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, aceitouLgpd: event.target.checked }))
                }
              />
              Aceitou LGPD
            </label>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={form.aceitouCompartilhamentoComExpositores}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    aceitouCompartilhamentoComExpositores: event.target.checked
                  }))
                }
              />
              Aceitou compartilhamento com expositores
            </label>
            <button type="submit">Salvar alteracoes</button>
          </form>
        )}

        <div className="details-grid">
          <Field label="Nome completo" value={credenciado.nomeCompleto} />
          <Field label="Categoria" value={credenciado.categoria} />
          <Field label="Status credenciamento" value={credenciado.statusCredenciamento} />
          <Field label="E-mail" value={credenciado.email} />
          <Field label="Celular" value={credenciado.celular} />
          <Field label="Municipio/UF" value={`${credenciado.municipio}/${credenciado.uf}`} />
          <Field label="CPF" value={credenciado.cpf} />
          <Field label="CNPJ" value={credenciado.cnpj} />
          <Field label="Nacionalidade" value={credenciado.nacionalidade} />
          <Field label="Nacionalidade da empresa" value={credenciado.nacionalidadeEmpresa} />
          <Field label="Tipo combustivel" value={credenciado.tipoCombustivel} />
          <Field label="Cidade origem" value={credenciado.cidadeOrigem} />
          <Field label="Combustivel" value={credenciado.combustivel} />
          <Field label="Distancia km" value={credenciado.distanciaKm} />
          <Field label="Pegada CO2" value={credenciado.pegadaCarbonoEstimada} />
          <Field label="PCD" value={credenciado.pcd ? "Sim" : "Nao"} />
          <Field label="LGPD" value={credenciado.aceitouLgpd ? "Aceito" : "Nao"} />
          <Field
            label="Compartilhamento com expositores"
            value={credenciado.aceitouCompartilhamentoComExpositores ? "Aceito" : "Nao"}
          />
          <Field label="Evento" value={credenciado.evento?.nomeEvento} />
          <Field label="Codigo da credencial" value={credenciado.credencial?.codigoUnico} />
          <Field label="Status da credencial" value={credenciado.credencial?.statusCredencial} />
          <Field label="Funcao/Cargo" value={credenciado.funcaoCargo} />
          <Field label="Nome empresa" value={credenciado.nomeEmpresa} />
          <Field label="Nome veiculo" value={credenciado.nomeVeiculo} />
          <Field label="Nome propriedade" value={credenciado.nomePropriedade} />
          <Field label="CCIR" value={credenciado.ccir} />
        </div>

        <h4>Historico basico</h4>
        <ul className="event-list compact">
          {eventos.map((evento) => (
            <li key={evento.id} className="event-item">
              <strong>{evento.tipoEvento}</strong>
              <span>{evento.descricao}</span>
              <small>{new Date(evento.createdAt).toLocaleString("pt-BR")}</small>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

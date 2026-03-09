import { useState } from "react";
import {
  categoryOptions,
  formFieldLabelKeyByField,
  governanceCategoryOption
} from "../constants/formConfig";
import { t } from "../locales";

function Field({ label, value }) {
  return (
    <div className="detail-field">
      <span>{label}</span>
      <strong>{value || "-"}</strong>
    </div>
  );
}

const editableTextFields = [
  "nomeCompleto",
  "cpf",
  "cnpj",
  "celular",
  "email",
  "municipio",
  "uf",
  "nacionalidade",
  "nacionalidadeEmpresa",
  "tipoCombustivel",
  "cidadeOrigem",
  "combustivel",
  "distanciaKm",
  "pegadaCarbonoEstimada",
  "siteEmpresa",
  "nomeEmpresa",
  "nomeVeiculo",
  "nomePropriedade",
  "ccir",
  "funcaoCargo"
];

export default function AdminCredenciadoDetails({
  credenciado,
  historyEvents,
  onClose,
  onSave,
  onSoftDelete,
  onCredentialStatusChange,
  onReissue
}) {
  const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
  const [isEditing, setIsEditing] = useState(false);
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
          <h3>{t("participantDetails.modalTitle")}</h3>
          <button type="button" onClick={onClose}>
            {t("participantDetails.close")}
          </button>
        </div>

        <div className="toolbar">
          <button type="button" onClick={() => setIsEditing((value) => !value)}>
            {isEditing ? t("participantDetails.toggleEditOn") : t("participantDetails.toggleEditOff")}
          </button>
          <button type="button" className="btn-danger" onClick={onSoftDelete}>
            {t("participantDetails.deactivateRegistration")}
          </button>
          <button
            type="button"
            className="btn-danger"
            onClick={() => onCredentialStatusChange("INATIVA")}
          >
            {t("participantDetails.blockCredential")}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => onCredentialStatusChange("ATIVA")}
          >
            {t("participantDetails.reactivateCredential")}
          </button>
          <button type="button" className="btn-secondary" onClick={onReissue}>
            {t("participantDetails.reissueCredential")}
          </button>
          {credenciado?.credencial?.id && (
            <a
              className="link-button"
              href={`${apiBaseUrl}/credenciais/${credenciado.credencial.id}/pdf`}
              target="_blank"
              rel="noreferrer"
            >
              {t("participantDetails.downloadPdf")}
            </a>
          )}
        </div>

        {isEditing && (
          <form
            className="grid"
            onSubmit={(event) => {
              event.preventDefault();
              onSave(form);
              setIsEditing(false);
            }}
          >
            <label>
              {t("form.category")}
              <select
                value={form.categoria}
                onChange={(event) =>
                  setForm((currentForm) => ({ ...currentForm, categoria: event.target.value }))
                }
              >
                {[...categoryOptions, governanceCategoryOption].map((option) => (
                  <option key={option.value} value={option.value}>
                    {t(option.labelKey)}
                  </option>
                ))}
              </select>
            </label>

            {editableTextFields.map((fieldName) => (
              <label key={fieldName}>
                {t(formFieldLabelKeyByField[fieldName] || fieldName)}
                <input
                  value={form[fieldName] || ""}
                  onChange={(event) =>
                    setForm((currentForm) => ({ ...currentForm, [fieldName]: event.target.value }))
                  }
                />
              </label>
            ))}

            <label className="checkbox">
              <input
                type="checkbox"
                checked={form.pcd}
                onChange={(event) =>
                  setForm((currentForm) => ({ ...currentForm, pcd: event.target.checked }))
                }
              />
              {t("form.pcd")}
            </label>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={form.aceitouLgpd}
                onChange={(event) =>
                  setForm((currentForm) => ({ ...currentForm, aceitouLgpd: event.target.checked }))
                }
              />
              {t("form.privacyConsentLabel")}
            </label>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={form.aceitouCompartilhamentoComExpositores}
                onChange={(event) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    aceitouCompartilhamentoComExpositores: event.target.checked
                  }))
                }
              />
              {t("participantDetails.dataSharingWithExhibitors")}
            </label>
            <button type="submit">{t("participantDetails.saveChanges")}</button>
          </form>
        )}

        <div className="details-grid">
          <Field label={t("form.fullName")} value={credenciado.nomeCompleto} />
          <Field label={t("form.category")} value={credenciado.categoria} />
          <Field label={t("participantDetails.registrationStatus")} value={credenciado.statusCredenciamento} />
          <Field label={t("table.email")} value={credenciado.email} />
          <Field label={t("table.phone")} value={credenciado.celular} />
          <Field label={t("table.cityState")} value={`${credenciado.municipio}/${credenciado.uf}`} />
          <Field label={t("form.cpf")} value={credenciado.cpf} />
          <Field label={t("form.cnpj")} value={credenciado.cnpj} />
          <Field label={t("form.nationality")} value={credenciado.nacionalidade} />
          <Field label={t("form.companyNationality")} value={credenciado.nacionalidadeEmpresa} />
          <Field label={t("form.fuelType")} value={credenciado.tipoCombustivel} />
          <Field label={t("form.originCity")} value={credenciado.cidadeOrigem} />
          <Field label={t("form.fuel")} value={credenciado.combustivel} />
          <Field label={t("form.estimatedDistanceKm")} value={credenciado.distanciaKm} />
          <Field label={t("form.estimatedCarbon")} value={credenciado.pegadaCarbonoEstimada} />
          <Field label={t("form.pcd")} value={credenciado.pcd ? t("common.yes") : t("common.no")} />
          <Field label={t("table.privacy")} value={credenciado.aceitouLgpd ? t("table.accepted") : t("table.denied")} />
          <Field
            label={t("participantDetails.dataSharingWithExhibitors")}
            value={credenciado.aceitouCompartilhamentoComExpositores ? t("table.accepted") : t("table.denied")}
          />
          <Field label={t("credentialPage.event")} value={credenciado.evento?.nomeEvento} />
          <Field label={t("participantDetails.credentialCode")} value={credenciado.credencial?.codigoUnico} />
          <Field label={t("participantDetails.credentialStatus")} value={credenciado.credencial?.statusCredencial} />
          <Field label={t("form.roleFunction")} value={credenciado.funcaoCargo} />
          <Field label={t("form.companyName")} value={credenciado.nomeEmpresa} />
          <Field label={t("form.vehicleName")} value={credenciado.nomeVeiculo} />
          <Field label={t("form.propertyName")} value={credenciado.nomePropriedade} />
          <Field label={t("form.ccir")} value={credenciado.ccir} />
        </div>

        <h4>{t("participantDetails.basicHistoryTitle")}</h4>
        <ul className="event-list compact">
          {historyEvents.map((eventItem) => (
            <li key={eventItem.id} className="event-item">
              <strong>{eventItem.tipoEvento}</strong>
              <span>{eventItem.descricao}</span>
              <small>{new Date(eventItem.createdAt).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

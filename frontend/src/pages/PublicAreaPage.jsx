import { useState } from "react";
import {
  createPublicParticipant,
  getPublicCredentialPdfUrl,
  getPublicCredentialQr
} from "../api/platformApi";
import CredenciadoForm from "../components/CredenciadoForm";
import { publicBaseForm } from "../constants/formConfig";
import { t } from "../locales";
import {
  formatCellphone,
  formatCnpj,
  formatCpf,
  resolveDistanceFromCity,
  validatePublicParticipantForm
} from "../utils/validation";

const touchedFieldsOnSubmit = {
  nomeCompleto: true,
  cpf: true,
  cnpj: true,
  celular: true,
  email: true,
  municipio: true,
  uf: true,
  cidadeOrigem: true,
  combustivel: true,
  distanciaKm: true,
  nacionalidade: true,
  nacionalidadeEmpresa: true,
  aceitouLgpd: true,
  aceitouCompartilhamentoComExpositores: true,
  nomeEmpresa: true,
  siteEmpresa: true,
  ccir: true,
  nomePropriedade: true,
  nomeVeiculo: true,
  funcaoCargo: true
};

function formatFieldValue(fieldName, value, type, checked) {
  if (type === "checkbox") return checked;
  if (fieldName === "cpf") return formatCpf(value);
  if (fieldName === "cnpj") return formatCnpj(value);
  if (fieldName === "celular") return formatCellphone(value);
  return value;
}

export default function PublicAreaPage() {
  const [form, setForm] = useState(publicBaseForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [createdParticipant, setCreatedParticipant] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    const nextValue = formatFieldValue(name, value, type, checked);

    setForm((currentForm) => {
      const nextForm = {
        ...currentForm,
        [name]: nextValue
      };

      if (name === "combustivel") {
        nextForm.tipoCombustivel = nextValue;
      }
      if (name === "cidadeOrigem") {
        nextForm.distanciaKm = String(resolveDistanceFromCity(nextValue));
      }
      if (name === "municipio" && !nextForm.cidadeOrigem) {
        nextForm.distanciaKm = String(resolveDistanceFromCity(nextValue));
      }

      const { errors } = validatePublicParticipantForm(nextForm);
      setFieldErrors((currentErrors) => ({
        ...currentErrors,
        [name]: errors[name],
        documento: errors.documento
      }));

      return nextForm;
    });
  }

  function handleBlur(event) {
    const { name } = event.target;
    setTouchedFields((currentTouched) => ({ ...currentTouched, [name]: true }));
    const { errors } = validatePublicParticipantForm(form);
    setFieldErrors(errors);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const { errors, normalized } = validatePublicParticipantForm(form);
      setFieldErrors(errors);
      setTouchedFields(touchedFieldsOnSubmit);

      if (Object.keys(errors).length > 0) {
        throw new Error(t("public.reviseFieldsError"));
      }

      const created = await createPublicParticipant(normalized);
      setCreatedParticipant(created);
      setSuccessMessage(
        t("public.successMessage", { code: created.credencial?.codigoUnico || t("common.notAvailable") })
      );

      if (created.credencial?.id) {
        const qrResponse = await getPublicCredentialQr(created.credencial.id);
        setQrDataUrl(qrResponse.qrcode || "");
      }

      setForm((currentForm) => ({ ...publicBaseForm, categoria: currentForm.categoria }));
      setFieldErrors({});
      setTouchedFields({});
    } catch (submitError) {
      setErrorMessage(submitError.message || t("public.fallbackError"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="public-layout">
      <section className="public-hero card">
        <div className="hero-top">
          <span className="hero-chip">{t("public.heroChipPrimary")}</span>
          <span className="hero-chip muted">{t("public.heroChipSecondary")}</span>
        </div>
        <h2>{t("public.heroTitle")}</h2>
        <p>{t("public.heroText")}</p>
        <div className="hero-meta">
          <strong>{t("public.heroMetaTitle")}</strong>
          <span>{t("public.heroMetaSubtitle")}</span>
        </div>
      </section>

      <section className="card card-elevated">
        <h2>{t("public.sectionTitle")}</h2>
        <p className="section-subtitle">{t("public.sectionSubtitle")}</p>
        <CredenciadoForm
          form={form}
          saving={isSubmitting}
          errors={fieldErrors}
          touched={touchedFields}
          onChange={handleChange}
          onBlur={handleBlur}
          onSubmit={handleSubmit}
        />

        {errorMessage && <p className="error">{errorMessage}</p>}
        {successMessage && <p className="success">{successMessage}</p>}
        {createdParticipant?.id && (
          <p>{t("public.registrationId", { id: createdParticipant.id })}</p>
        )}

        <section className="public-credential">
          <h3>{t("public.credentialSectionTitle")}</h3>

          {!createdParticipant?.credencial?.id && (
            <p className="hint-text">{t("public.credentialPlaceholder")}</p>
          )}

          {createdParticipant?.credencial?.id && (
            <div className="details-grid">
              <div className="detail-field">
                <span>{t("public.categoryLabel")}</span>
                <strong>{createdParticipant.categoria}</strong>
              </div>
              <div className="detail-field">
                <span>{t("public.registrationStatus")}</span>
                <strong>{createdParticipant.statusCredenciamento}</strong>
              </div>
              <div className="detail-field">
                <span>{t("public.credentialCode")}</span>
                <strong>{createdParticipant.credencial?.codigoUnico || "-"}</strong>
              </div>
              <div className="detail-field">
                <span>{t("public.credentialPdf")}</span>
                <a
                  className="link-button"
                  target="_blank"
                  rel="noreferrer"
                  href={getPublicCredentialPdfUrl(createdParticipant.credencial.id)}
                >
                  {t("common.openPdf")}
                </a>
              </div>
            </div>
          )}

          {qrDataUrl && (
            <div className="qr-section">
              <h3>{t("public.qrTitle")}</h3>
              <img src={qrDataUrl} alt={t("public.qrAlt")} className="qr-image" />
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

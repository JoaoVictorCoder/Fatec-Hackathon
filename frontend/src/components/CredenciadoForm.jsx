import {
  categoryExtraFields,
  categoryOptions,
  commonFields,
  formFieldLabelKeyByField
} from "../constants/formConfig";
import { t } from "../locales";
import {
  REFERENCE_CITY_DISTANCES_KM,
  calculateCarbonEstimate,
  resolveDistanceFromCity
} from "../utils/validation";

const stateCodeOptions = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
  "SP", "SE", "TO", "EX"
];

function getFieldLabel(fieldName) {
  return t(formFieldLabelKeyByField[fieldName] || fieldName);
}

function getDocumentHintByCategory(category) {
  if (category === "CAFEICULTOR") {
    return t("form.documentHintProducer");
  }
  if (category === "EXPOSITOR" || category === "IMPRENSA") {
    return t("form.documentHintCompany");
  }
  if (category === "COMISSAO_ORGANIZADORA") {
    return t("form.documentHintGovernance");
  }
  return t("form.documentHintDefault");
}

export default function CredenciadoForm({
  form,
  saving,
  errors = {},
  touched = {},
  onChange,
  onBlur,
  onSubmit
}) {
  const extraFields = categoryExtraFields[form.categoria] || [];
  const isInternationalVisitor =
    form.categoria === "VISITANTE" &&
    form.nacionalidade &&
    form.nacionalidade.toLowerCase() !== "brasil";
  const shouldShowError = (field) => touched[field] && errors[field];

  return (
    <form onSubmit={onSubmit} className="grid">
      <label>
        {t("form.category")} *
        <select name="categoria" value={form.categoria} onChange={onChange} required>
          {categoryOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {t(option.labelKey)}
            </option>
          ))}
        </select>
      </label>

      {commonFields.map((fieldName) => (
        <label key={fieldName}>
          {getFieldLabel(fieldName)} *
          {fieldName === "uf" ? (
            <select
              name={fieldName}
              value={form[fieldName]}
              onChange={onChange}
              onBlur={onBlur}
              className={shouldShowError(fieldName) ? "input-error" : ""}
              required={!isInternationalVisitor}
            >
              <option value="">{t("form.selectOne")}</option>
              {stateCodeOptions.map((stateCode) => (
                <option key={stateCode} value={stateCode}>
                  {stateCode}
                </option>
              ))}
            </select>
          ) : (
            <input
              name={fieldName}
              value={form[fieldName]}
              onChange={onChange}
              onBlur={onBlur}
              required
              className={shouldShowError(fieldName) ? "input-error" : ""}
            />
          )}
          {shouldShowError(fieldName) && (
            <small className="field-error">{t(errors[fieldName])}</small>
          )}
        </label>
      ))}

      <label>
        {getFieldLabel("cpf")}
        <input
          name="cpf"
          value={form.cpf}
          onChange={onChange}
          onBlur={onBlur}
          className={shouldShowError("cpf") ? "input-error" : ""}
        />
        {shouldShowError("cpf") && <small className="field-error">{t(errors.cpf)}</small>}
      </label>

      <label>
        {getFieldLabel("cnpj")}
        <input
          name="cnpj"
          value={form.cnpj}
          onChange={onChange}
          onBlur={onBlur}
          className={shouldShowError("cnpj") ? "input-error" : ""}
        />
        {shouldShowError("cnpj") && <small className="field-error">{t(errors.cnpj)}</small>}
      </label>

      <label>
        {getFieldLabel("combustivel")} *
        <select
          name="combustivel"
          value={form.combustivel}
          onChange={onChange}
          onBlur={onBlur}
          className={shouldShowError("combustivel") ? "input-error" : ""}
        >
          <option value="NAO_INFORMADO">{t("fuel.notInformed")}</option>
          <option value="GASOLINA">{t("fuel.gasoline")}</option>
          <option value="ALCOOL">{t("fuel.ethanol")}</option>
          <option value="DIESEL">{t("fuel.diesel")}</option>
          <option value="ELETRICO">{t("fuel.electric")}</option>
        </select>
        {shouldShowError("combustivel") && (
          <small className="field-error">{t(errors.combustivel)}</small>
        )}
      </label>

      <label>
        {getFieldLabel("cidadeOrigem")} *
        <input
          name="cidadeOrigem"
          value={form.cidadeOrigem}
          onChange={onChange}
          onBlur={onBlur}
          list="reference-city-list"
          className={shouldShowError("cidadeOrigem") ? "input-error" : ""}
        />
        <datalist id="reference-city-list">
          {Object.keys(REFERENCE_CITY_DISTANCES_KM).map((city) => (
            <option key={city} value={city} />
          ))}
        </datalist>
        {shouldShowError("cidadeOrigem") && (
          <small className="field-error">{t(errors.cidadeOrigem)}</small>
        )}
      </label>

      <label>
        {getFieldLabel("distanciaKm")}
        <input
          type="number"
          min="0"
          step="0.1"
          name="distanciaKm"
          value={form.distanciaKm || resolveDistanceFromCity(form.cidadeOrigem || form.municipio)}
          readOnly
          className={shouldShowError("distanciaKm") ? "input-error" : ""}
        />
        {shouldShowError("distanciaKm") && (
          <small className="field-error">{t(errors.distanciaKm)}</small>
        )}
        <small className="hint-text">{t("form.distanceHint")}</small>
      </label>

      <div className="detail-field full-span">
        <span>{getFieldLabel("pegadaCarbonoEstimada")}</span>
        <strong>
          {(() => {
            const estimate = calculateCarbonEstimate({
              cidadeOrigem: form.cidadeOrigem || form.municipio,
              combustivel: form.combustivel,
              distanciaKm: form.distanciaKm
            });
            if (estimate === null) {
              return t("form.carbonUnknown");
            }
            return `${estimate.toFixed(3)} kg CO2e`;
          })()}
        </strong>
        <small>{t("form.carbonHelper")}</small>
      </div>

      <p className="hint-text full-span">{getDocumentHintByCategory(form.categoria)}</p>
      {errors.documento && <p className="error full-span">{t(errors.documento)}</p>}

      {extraFields.map((fieldName) => (
        <label key={fieldName}>
          {getFieldLabel(fieldName)} {fieldName !== "siteEmpresa" ? "*" : `(${t("common.optional")})`}
          <input
            name={fieldName}
            value={form[fieldName]}
            onChange={onChange}
            onBlur={onBlur}
            required={
              fieldName === "nacionalidade"
                ? form.categoria === "VISITANTE"
                : fieldName !== "siteEmpresa"
            }
            placeholder={
              fieldName === "nacionalidade" || fieldName === "nacionalidadeEmpresa" ? "Brasil" : undefined
            }
            className={shouldShowError(fieldName) ? "input-error" : ""}
          />
          {shouldShowError(fieldName) && (
            <small className="field-error">{t(errors[fieldName])}</small>
          )}
        </label>
      ))}

      <label className="checkbox">
        <input type="checkbox" name="pcd" checked={form.pcd} onChange={onChange} />
        {getFieldLabel("pcd")}
      </label>

      <label className="checkbox">
        <input
          type="checkbox"
          name="aceitouLgpd"
          checked={form.aceitouLgpd}
          onChange={onChange}
          onBlur={onBlur}
          required
        />
        {t("form.privacyConsentLabel")}
      </label>

      <label className="checkbox">
        <input
          type="checkbox"
          name="aceitouCompartilhamentoComExpositores"
          checked={form.aceitouCompartilhamentoComExpositores}
          onChange={onChange}
        />
        {getFieldLabel("aceitouCompartilhamentoComExpositores")}
      </label>

      {shouldShowError("aceitouLgpd") && (
        <small className="field-error full-span">{t(errors.aceitouLgpd)}</small>
      )}

      <p className="lgpd-text">{t("form.privacyDisclaimer")}</p>

      <button type="submit" disabled={saving} className="full-span">
        {saving ? t("form.submitting") : t("form.submit")}
      </button>
    </form>
  );
}

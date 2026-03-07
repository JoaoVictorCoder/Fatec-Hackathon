import {
  categoryExtraFields,
  categoriaOptions,
  commonFields,
  labels
} from "../constants/formConfig";
import {
  CIDADES_VIZINHAS_FRANCA,
  calculateCarbonEstimateFront,
  resolveDistanceFromCidade
} from "../utils/validation";

function documentHint(categoria) {
  if (categoria === "CAFEICULTOR") {
    return "Para cafeicultor, informe CPF, CNPJ ou ambos.";
  }
  if (categoria === "EXPOSITOR" || categoria === "IMPRENSA") {
    return "Para esta categoria, informe CNPJ.";
  }
  if (categoria === "COMISSAO_ORGANIZADORA") {
    return "Para esta categoria, informe CPF.";
  }
  return "Informe CPF e/ou CNPJ conforme sua situacao.";
}

const ufOptions = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
  "SP", "SE", "TO", "EX"
];

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
  const isVisitanteInternacional =
    form.categoria === "VISITANTE" &&
    form.nacionalidade &&
    form.nacionalidade.toLowerCase() !== "brasil";
  const showError = (field) => touched[field] && errors[field];

  return (
    <form onSubmit={onSubmit} className="grid">
      <label>
        Categoria *
        <select name="categoria" value={form.categoria} onChange={onChange} required>
          {categoriaOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      {commonFields.map((field) => (
        <label key={field}>
          {labels[field]} *
          {field === "uf" ? (
            <select
              name={field}
              value={form[field]}
              onChange={onChange}
              onBlur={onBlur}
              className={showError(field) ? "input-error" : ""}
              required={!isVisitanteInternacional}
            >
              <option value="">Selecione</option>
              {ufOptions.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </select>
          ) : (
            <input
              name={field}
              value={form[field]}
              onChange={onChange}
              onBlur={onBlur}
              required
              maxLength={field === "uf" ? 2 : undefined}
              className={showError(field) ? "input-error" : ""}
            />
          )}
          {showError(field) && <small className="field-error">{errors[field]}</small>}
        </label>
      ))}

      <label>
        {labels.cpf}
        <input
          name="cpf"
          value={form.cpf}
          onChange={onChange}
          onBlur={onBlur}
          className={showError("cpf") ? "input-error" : ""}
        />
        {showError("cpf") && <small className="field-error">{errors.cpf}</small>}
      </label>

      <label>
        {labels.cnpj}
        <input
          name="cnpj"
          value={form.cnpj}
          onChange={onChange}
          onBlur={onBlur}
          className={showError("cnpj") ? "input-error" : ""}
        />
        {showError("cnpj") && <small className="field-error">{errors.cnpj}</small>}
      </label>

      <label>
        {labels.combustivel} *
        <select
          name="combustivel"
          value={form.combustivel}
          onChange={onChange}
          onBlur={onBlur}
          className={showError("combustivel") ? "input-error" : ""}
        >
          <option value="NAO_INFORMADO">Nao informado</option>
          <option value="GASOLINA">Gasolina</option>
          <option value="ALCOOL">Alcool</option>
          <option value="DIESEL">Diesel</option>
          <option value="ELETRICO">Eletrico</option>
        </select>
        {showError("combustivel") && <small className="field-error">{errors.combustivel}</small>}
      </label>

      <label>
        {labels.cidadeOrigem} *
        <input
          name="cidadeOrigem"
          value={form.cidadeOrigem}
          onChange={onChange}
          onBlur={onBlur}
          list="cidades-franca"
          className={showError("cidadeOrigem") ? "input-error" : ""}
        />
        <datalist id="cidades-franca">
          {Object.keys(CIDADES_VIZINHAS_FRANCA).map((cidade) => (
            <option key={cidade} value={cidade} />
          ))}
        </datalist>
        {showError("cidadeOrigem") && <small className="field-error">{errors.cidadeOrigem}</small>}
      </label>

      <label>
        {labels.distanciaKm}
        <input
          type="number"
          min="0"
          step="0.1"
          name="distanciaKm"
          value={form.distanciaKm || resolveDistanceFromCidade(form.cidadeOrigem || form.municipio)}
          readOnly
          className={showError("distanciaKm") ? "input-error" : ""}
        />
        {showError("distanciaKm") && <small className="field-error">{errors.distanciaKm}</small>}
        <small className="hint-text">Distancia preenchida automaticamente pela cidade de origem.</small>
      </label>

      <div className="detail-field full-span">
        <span>{labels.pegadaCarbonoEstimada}</span>
        <strong>
          {(() => {
            const estimate = calculateCarbonEstimateFront({
              cidadeOrigem: form.cidadeOrigem || form.municipio,
              combustivel: form.combustivel,
              distanciaKm: form.distanciaKm
            });
            if (estimate === null) {
              return "Nao calculada (combustivel nao informado)";
            }
            return `${estimate.toFixed(3)} kg CO2e`;
          })()}
        </strong>
        <small>Estimativa simplificada para operacao do evento.</small>
      </div>

      <p className="hint-text full-span">{documentHint(form.categoria)}</p>
      {errors.documento && <p className="error full-span">{errors.documento}</p>}

      {extraFields.map((field) => (
        <label key={field}>
          {labels[field]} {field !== "siteEmpresa" ? "*" : "(Opcional)"}
          <input
            name={field}
            value={form[field]}
            onChange={onChange}
            onBlur={onBlur}
            required={
              field === "nacionalidade"
                ? form.categoria === "VISITANTE"
                : field !== "siteEmpresa"
            }
            placeholder={
              field === "nacionalidade" || field === "nacionalidadeEmpresa" ? "Brasil" : undefined
            }
            className={showError(field) ? "input-error" : ""}
          />
          {showError(field) && <small className="field-error">{errors[field]}</small>}
        </label>
      ))}

      <label className="checkbox">
        <input type="checkbox" name="pcd" checked={form.pcd} onChange={onChange} />
        {labels.pcd}
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
        Aceito os termos da LGPD
      </label>

      <label className="checkbox">
        <input
          type="checkbox"
          name="aceitouCompartilhamentoComExpositores"
          checked={form.aceitouCompartilhamentoComExpositores}
          onChange={onChange}
        />
        Aceito compartilhar meus dados com expositores/stands visitados para contato posterior
      </label>
      {showError("aceitouLgpd") && (
        <small className="field-error full-span">{errors.aceitouLgpd}</small>
      )}
      <p className="lgpd-text">
        Ao enviar, voce autoriza o tratamento dos seus dados pessoais para fins de
        credenciamento e controle de acesso do evento.
      </p>

      <button type="submit" disabled={saving} className="full-span">
        {saving ? "Salvando..." : "Cadastrar"}
      </button>
    </form>
  );
}

import { useState } from "react";
import { formFieldLabelKeyByField } from "../constants/formConfig";
import { t } from "../locales";

const initialState = {
  nomeCompleto: "",
  cpf: "",
  cnpj: "",
  celular: "",
  email: "",
  municipio: "",
  uf: "",
  nacionalidade: "Brasil",
  pcd: false,
  funcaoCargo: "",
  aceitouLgpd: true
};

function getFieldLabel(fieldName) {
  return t(formFieldLabelKeyByField[fieldName] || fieldName);
}

export default function AdminComissaoForm({ onCreate, loading, onClose, error }) {
  const [form, setForm] = useState(initialState);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((currentForm) => ({
      ...currentForm,
      [name]: type === "checkbox" ? checked : value
    }));
  }

  return (
    <div className="modal-backdrop">
      <section className="card modal-card">
        <div className="modal-header">
          <h3>{t("adminForm.addGovernanceTitle")}</h3>
          <button type="button" onClick={onClose}>
            {t("adminForm.close")}
          </button>
        </div>

        <form
          className="grid"
          onSubmit={(event) => {
            event.preventDefault();
            onCreate(form);
          }}
        >
          {[
            "nomeCompleto",
            "cpf",
            "cnpj",
            "celular",
            "email",
            "municipio",
            "uf",
            "nacionalidade",
            "funcaoCargo"
          ].map((fieldName) => (
            <label key={fieldName}>
              {getFieldLabel(fieldName)}
              <input
                name={fieldName}
                value={form[fieldName]}
                onChange={handleChange}
                required
                maxLength={fieldName === "uf" ? 2 : undefined}
              />
            </label>
          ))}

          <label className="checkbox">
            <input
              type="checkbox"
              name="pcd"
              checked={form.pcd}
              onChange={handleChange}
            />
            {t("form.pcd")}
          </label>

          <label className="checkbox">
            <input
              type="checkbox"
              name="aceitouLgpd"
              checked={form.aceitouLgpd}
              onChange={handleChange}
              required
            />
            {t("adminForm.privacyRecord")}
          </label>

          <button type="submit" disabled={loading}>
            {loading ? t("adminForm.saving") : t("adminForm.saveMember")}
          </button>
        </form>

        {error && <p className="error">{error}</p>}
      </section>
    </div>
  );
}

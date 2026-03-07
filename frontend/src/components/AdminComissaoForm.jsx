import { useState } from "react";
import { labels } from "../constants/formConfig";

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

export default function AdminComissaoForm({ onCreate, loading, onClose, error }) {
  const [form, setForm] = useState(initialState);

  function onChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  }

  return (
    <div className="modal-backdrop">
      <section className="card modal-card">
        <div className="modal-header">
          <h3>Adicionar Comissao Organizadora</h3>
          <button type="button" onClick={onClose}>
            Fechar
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
          ].map((field) => (
            <label key={field}>
              {labels[field] || field}
              <input
                name={field}
                value={form[field]}
                onChange={onChange}
                required
                maxLength={field === "uf" ? 2 : undefined}
              />
            </label>
          ))}

          <label className="checkbox">
            <input
              type="checkbox"
              name="pcd"
              checked={form.pcd}
              onChange={onChange}
            />
            PCD
          </label>

          <label className="checkbox">
            <input
              type="checkbox"
              name="aceitouLgpd"
              checked={form.aceitouLgpd}
              onChange={onChange}
              required
            />
            Registro com aceite LGPD
          </label>

          <button type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Salvar membro"}
          </button>
        </form>

        {error && <p className="error">{error}</p>}
      </section>
    </div>
  );
}

import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

function Row({ label, value }) {
  return (
    <div className="detail-field">
      <span>{label}</span>
      <strong>{value || "-"}</strong>
    </div>
  );
}

export default function AdminCredencialView({ data, loading, saving, error, onSave }) {
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    codigoUnico: "",
    statusCredencial: "GERADA",
    qrCodePayload: "",
    emitidaEm: ""
  });

  useEffect(() => {
    if (!data) return;
    setForm({
      codigoUnico: data.codigoUnico || "",
      statusCredencial: data.statusCredencial || "GERADA",
      qrCodePayload: data.qrCodePayload || "",
      emitidaEm: data.emitidaEm ? new Date(data.emitidaEm).toISOString().slice(0, 16) : ""
    });
  }, [data?.id]);

  return (
    <main className="single-page">
      <section className="card card-elevated">
        <div className="admin-header">
          <h2>Consulta de Credencial</h2>
          <Link className="link-button" to="/admin">
            Voltar ao painel
          </Link>
        </div>

        {loading && <p>Carregando credencial...</p>}
        {error && <p className="error">{error}</p>}

        {data && (
          <>
            <div className="toolbar">
              <button type="button" onClick={() => setEditMode((v) => !v)}>
                {editMode ? "Cancelar edicao" : "Editar credencial"}
              </button>
            </div>

            {editMode && (
              <form
                className="grid"
                onSubmit={async (event) => {
                  event.preventDefault();
                  await onSave({
                    codigoUnico: form.codigoUnico,
                    statusCredencial: form.statusCredencial,
                    qrCodePayload: form.qrCodePayload,
                    emitidaEm: form.emitidaEm ? new Date(form.emitidaEm).toISOString() : null
                  });
                  setEditMode(false);
                }}
              >
                <label>
                  Codigo unico
                  <input
                    value={form.codigoUnico}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, codigoUnico: event.target.value }))
                    }
                    required
                  />
                </label>
                <label>
                  Status credencial
                  <select
                    value={form.statusCredencial}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, statusCredencial: event.target.value }))
                    }
                  >
                    <option value="GERADA">GERADA</option>
                    <option value="ATIVA">ATIVA</option>
                    <option value="INATIVA">INATIVA</option>
                    <option value="UTILIZADA">UTILIZADA</option>
                    <option value="CANCELADA">CANCELADA</option>
                  </select>
                </label>
                <label>
                  Emitida em
                  <input
                    type="datetime-local"
                    value={form.emitidaEm}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, emitidaEm: event.target.value }))
                    }
                  />
                </label>
                <label>
                  QR payload
                  <textarea
                    value={form.qrCodePayload}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, qrCodePayload: event.target.value }))
                    }
                    rows={5}
                    required
                  />
                </label>
                <button type="submit" disabled={saving}>
                  {saving ? "Salvando..." : "Salvar credencial"}
                </button>
              </form>
            )}

            <h3>Credencial</h3>
            <div className="details-grid">
              <Row label="ID credencial" value={data.id} />
              <Row label="Codigo unico" value={data.codigoUnico} />
              <Row label="Status credencial" value={data.statusCredencial} />
              <Row label="Emitida em" value={new Date(data.emitidaEm).toLocaleString("pt-BR")} />
              <Row label="QR payload" value={data.qrCodePayload} />
            </div>

            <h3>Identidade vinculada</h3>
            <div className="details-grid">
              <Row label="Nome completo" value={data.credenciado?.nomeCompleto} />
              <Row label="Categoria" value={data.credenciado?.categoria} />
              <Row label="E-mail" value={data.credenciado?.email} />
              <Row label="Celular" value={data.credenciado?.celular} />
              <Row
                label="Municipio/UF"
                value={`${data.credenciado?.municipio || ""}/${data.credenciado?.uf || ""}`}
              />
              <Row
                label="Status credenciamento"
                value={data.credenciado?.statusCredenciamento}
              />
              <Row label="CPF" value={data.credenciado?.cpf} />
              <Row label="CNPJ" value={data.credenciado?.cnpj} />
              <Row label="Nacionalidade" value={data.credenciado?.nacionalidade} />
              <Row label="Nacionalidade da empresa" value={data.credenciado?.nacionalidadeEmpresa} />
              <Row label="Tipo combustivel" value={data.credenciado?.tipoCombustivel} />
              <Row label="PCD" value={data.credenciado?.pcd ? "Sim" : "Nao"} />
              <Row label="LGPD" value={data.credenciado?.aceitouLgpd ? "Aceito" : "Nao"} />
              <Row
                label="Compartilhamento Expositores"
                value={
                  data.credenciado?.aceitouCompartilhamentoComExpositores ? "Aceito" : "Nao"
                }
              />
              <Row label="Evento" value={data.credenciado?.evento?.nomeEvento} />
              <Row label="Nome empresa" value={data.credenciado?.nomeEmpresa} />
              <Row label="Nome veiculo" value={data.credenciado?.nomeVeiculo} />
              <Row label="Funcao/Cargo" value={data.credenciado?.funcaoCargo} />
              <Row label="CCIR" value={data.credenciado?.ccir} />
              <Row label="Nome propriedade" value={data.credenciado?.nomePropriedade} />
              <Row label="Site empresa" value={data.credenciado?.siteEmpresa} />
            </div>
          </>
        )}
      </section>
    </main>
  );
}

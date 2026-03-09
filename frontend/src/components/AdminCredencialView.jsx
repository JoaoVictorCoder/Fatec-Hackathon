import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { t } from "../locales";

function DetailRow({ label, value }) {
  return (
    <div className="detail-field">
      <span>{label}</span>
      <strong>{value || "-"}</strong>
    </div>
  );
}

export default function AdminCredencialView({ data, loading, saving, error, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
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
          <h2>{t("credentialPage.title")}</h2>
          <Link className="link-button" to="/admin">
            {t("credentialPage.backToDashboard")}
          </Link>
        </div>

        {loading && <p>{t("credentialPage.loading")}</p>}
        {error && <p className="error">{error}</p>}

        {data && (
          <>
            <div className="toolbar">
              <button type="button" onClick={() => setIsEditing((value) => !value)}>
                {isEditing ? t("credentialPage.toggleEdit.on") : t("credentialPage.toggleEdit.off")}
              </button>
            </div>

            {isEditing && (
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
                  setIsEditing(false);
                }}
              >
                <label>
                  {t("credentialPage.uniqueCode")}
                  <input
                    value={form.codigoUnico}
                    onChange={(event) =>
                      setForm((currentForm) => ({ ...currentForm, codigoUnico: event.target.value }))
                    }
                    required
                  />
                </label>
                <label>
                  {t("credentialPage.credentialStatus")}
                  <select
                    value={form.statusCredencial}
                    onChange={(event) =>
                      setForm((currentForm) => ({
                        ...currentForm,
                        statusCredencial: event.target.value
                      }))
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
                  {t("credentialPage.issuedAt")}
                  <input
                    type="datetime-local"
                    value={form.emitidaEm}
                    onChange={(event) =>
                      setForm((currentForm) => ({ ...currentForm, emitidaEm: event.target.value }))
                    }
                  />
                </label>
                <label>
                  {t("credentialPage.qrPayload")}
                  <textarea
                    value={form.qrCodePayload}
                    onChange={(event) =>
                      setForm((currentForm) => ({ ...currentForm, qrCodePayload: event.target.value }))
                    }
                    rows={5}
                    required
                  />
                </label>
                <button type="submit" disabled={saving}>
                  {saving ? t("credentialPage.saving") : t("credentialPage.saveCredential")}
                </button>
              </form>
            )}

            <h3>{t("credentialPage.sectionCredential")}</h3>
            <div className="details-grid">
              <DetailRow label="ID" value={data.id} />
              <DetailRow label={t("credentialPage.uniqueCode")} value={data.codigoUnico} />
              <DetailRow label={t("credentialPage.credentialStatus")} value={data.statusCredencial} />
              <DetailRow label={t("credentialPage.issuedAt")} value={new Date(data.emitidaEm).toLocaleString()} />
              <DetailRow label={t("credentialPage.qrPayload")} value={data.qrCodePayload} />
            </div>

            <h3>{t("credentialPage.sectionIdentity")}</h3>
            <div className="details-grid">
              <DetailRow label={t("table.name")} value={data.credenciado?.nomeCompleto} />
              <DetailRow label={t("table.category")} value={data.credenciado?.categoria} />
              <DetailRow label={t("table.email")} value={data.credenciado?.email} />
              <DetailRow label={t("table.phone")} value={data.credenciado?.celular} />
              <DetailRow
                label={t("table.cityState")}
                value={`${data.credenciado?.municipio || ""}/${data.credenciado?.uf || ""}`}
              />
              <DetailRow
                label={t("credentialPage.registrationStatus")}
                value={data.credenciado?.statusCredenciamento}
              />
              <DetailRow label={t("form.cpf")} value={data.credenciado?.cpf} />
              <DetailRow label={t("form.cnpj")} value={data.credenciado?.cnpj} />
              <DetailRow label={t("form.nationality")} value={data.credenciado?.nacionalidade} />
              <DetailRow
                label={t("form.companyNationality")}
                value={data.credenciado?.nacionalidadeEmpresa}
              />
              <DetailRow label={t("form.fuelType")} value={data.credenciado?.tipoCombustivel} />
              <DetailRow label={t("form.pcd")} value={data.credenciado?.pcd ? t("common.yes") : t("common.no")} />
              <DetailRow
                label={t("credentialPage.privacyAccepted")}
                value={data.credenciado?.aceitouLgpd ? t("table.accepted") : t("table.denied")}
              />
              <DetailRow
                label={t("credentialPage.dataSharingAccepted")}
                value={
                  data.credenciado?.aceitouCompartilhamentoComExpositores
                    ? t("table.accepted")
                    : t("table.denied")
                }
              />
              <DetailRow label={t("credentialPage.event")} value={data.credenciado?.evento?.nomeEvento} />
              <DetailRow label={t("form.companyName")} value={data.credenciado?.nomeEmpresa} />
              <DetailRow label={t("form.vehicleName")} value={data.credenciado?.nomeVeiculo} />
              <DetailRow label={t("credentialPage.roleFunction")} value={data.credenciado?.funcaoCargo} />
              <DetailRow label={t("form.ccir")} value={data.credenciado?.ccir} />
              <DetailRow label={t("credentialPage.propertyName")} value={data.credenciado?.nomePropriedade} />
              <DetailRow label={t("credentialPage.companyWebsite")} value={data.credenciado?.siteEmpresa} />
            </div>
          </>
        )}
      </section>
    </main>
  );
}

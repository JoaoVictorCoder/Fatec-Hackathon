import { useState } from "react";
import { categoriaOptions, adminComissaoCategoria } from "../constants/formConfig";
import AdminComissaoForm from "./AdminComissaoForm";
import AdminCredenciadoDetails from "./AdminCredenciadoDetails";
import AdminCredenciadosTable from "./AdminCredenciadosTable";

const categoryFilterOptions = [
  { value: "", label: "Todas categorias" },
  ...categoriaOptions,
  adminComissaoCategoria
];

export default function AdminDashboard({
  admin,
  listResponse,
  eventos,
  loading,
  error,
  filters,
  onChangeFilters,
  onReload,
  onOpenDetails,
  selectedDetails,
  selectedEvents,
  onCloseDetails,
  onSaveDetails,
  onSoftDeleteDetails,
  onCredentialStatusChange,
  onReissueCredential,
  onCreateComissao,
  creatingComissao,
  createComissaoError,
  onLogout,
  auditLogs,
  onRunCheckIn,
  checkInResult,
  checkInLoading,
  analyticsOverview,
  analyticsFraud,
  analyticsDescarbonizacao
}) {
  const [showComissaoForm, setShowComissaoForm] = useState(false);
  const [activeSection, setActiveSection] = useState("credenciados");
  const [checkInForm, setCheckInForm] = useState({
    codigoUnico: "",
    gateCode: "GATE-ENTRADA-01",
    accessPoint: "Portao Principal"
  });
  const items = listResponse?.items || [];
  const page = listResponse?.page || 1;
  const totalPages = listResponse?.totalPages || 1;

  return (
    <main className="single-page">
      <section className="card">
        <div className="admin-header">
          <div>
            <h2>Painel Administrativo</h2>
            <p>Logado como {admin?.nome || admin?.email}</p>
          </div>
          <div className="toolbar">
            <button type="button" onClick={() => setShowComissaoForm(true)}>
              Adicionar Comissao Organizadora
            </button>
            <button type="button" onClick={onReload} disabled={loading}>
              {loading ? "Atualizando..." : "Atualizar"}
            </button>
            <button type="button" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>

        <div className="filters">
          <label>
            Secao
            <select
              className="section-switch"
              value={activeSection}
              onChange={(event) => setActiveSection(event.target.value)}
            >
              <option value="credenciados">Credenciados</option>
              <option value="eventos">Eventos</option>
              <option value="audit">Audit Logs</option>
              <option value="checkin">Check-in</option>
              <option value="analytics">Analytics/Fraude</option>
            </select>
          </label>
          <label>
            Busca
            <input
              value={filters.search}
              placeholder="Nome ou email"
              onChange={(event) =>
                onChangeFilters({ ...filters, search: event.target.value, page: 1 })
              }
            />
          </label>
          <label>
            Categoria
            <select
              value={filters.categoria}
              onChange={(event) =>
                onChangeFilters({ ...filters, categoria: event.target.value, page: 1 })
              }
            >
              {categoryFilterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error && <p className="error">{error}</p>}

        {activeSection === "credenciados" && (
          <>
            <AdminCredenciadosTable items={items} onOpenDetails={onOpenDetails} />

            <div className="pagination">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => onChangeFilters({ ...filters, page: page - 1 })}
              >
                Anterior
              </button>
              <span>
                Pagina {page} de {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => onChangeFilters({ ...filters, page: page + 1 })}
              >
                Proxima
              </button>
            </div>
          </>
        )}

        {activeSection === "eventos" && (
          <>
            <h3>Eventos recentes</h3>
            <ul className="event-list compact">
              {eventos.map((evento) => (
                <li key={evento.id} className="event-item">
                  <strong>{evento.tipoEvento}</strong>
                  <span>{evento.descricao}</span>
                  <small>
                    {evento.credenciado?.nomeCompleto || "Sem vinculo"} |{" "}
                    {new Date(evento.createdAt).toLocaleString("pt-BR")}
                  </small>
                </li>
              ))}
            </ul>
          </>
        )}

        {activeSection === "audit" && (
          <>
            <h3>Auditoria administrativa</h3>
            <ul className="event-list compact">
              {auditLogs.map((log) => (
                <li key={log.id} className="event-item">
                  <strong>{log.acao}</strong>
                  <span>
                    {log.actor?.nome || log.actorType} | {log.recurso}
                  </span>
                  <small>{new Date(log.createdAt).toLocaleString("pt-BR")}</small>
                </li>
              ))}
            </ul>
          </>
        )}

        {activeSection === "checkin" && (
          <>
            <h3>Controle de Entrada (QR / Check-in)</h3>
            <form
              className="grid"
              onSubmit={(event) => {
                event.preventDefault();
                onRunCheckIn(checkInForm);
              }}
            >
              <label>
                Codigo Unico
                <input
                  value={checkInForm.codigoUnico}
                  onChange={(event) =>
                    setCheckInForm((prev) => ({ ...prev, codigoUnico: event.target.value }))
                  }
                  required
                />
              </label>
              <label>
                Gate Code
                <input
                  value={checkInForm.gateCode}
                  onChange={(event) =>
                    setCheckInForm((prev) => ({ ...prev, gateCode: event.target.value }))
                  }
                  required
                />
              </label>
              <label>
                Access Point
                <input
                  value={checkInForm.accessPoint}
                  onChange={(event) =>
                    setCheckInForm((prev) => ({ ...prev, accessPoint: event.target.value }))
                  }
                />
              </label>
              <button type="submit" disabled={checkInLoading}>
                {checkInLoading ? "Validando..." : "Validar acesso"}
              </button>
            </form>

            {checkInResult && (
              <div className={checkInResult.resultado === "ALLOW" ? "success-box" : "error-box"}>
                <strong>Resultado: {checkInResult.resultado}</strong>
                <p>Motivo: {checkInResult.motivo}</p>
                <p>Credencial: {checkInResult.codigoUnico || "N/A"}</p>
              </div>
            )}
          </>
        )}

        {activeSection === "analytics" && (
          <>
            <h3>Analytics</h3>
            {analyticsOverview && (
              <div className="admin-stats">
                <article className="stat-card">
                  <strong>Total credenciados</strong>
                  <span>{analyticsOverview.totalCredenciados}</span>
                </article>
                <article className="stat-card">
                  <strong>Credenciais geradas</strong>
                  <span>{analyticsOverview.totalCredenciaisGeradas}</span>
                </article>
                <article className="stat-card">
                  <strong>Check-ins permitidos</strong>
                  <span>{analyticsOverview.totalCheckInsPermitidos}</span>
                </article>
                <article className="stat-card">
                  <strong>Check-ins negados</strong>
                  <span>{analyticsOverview.totalCheckInsNegados}</span>
                </article>
              </div>
            )}

            <h4>Fraude/Anomalias</h4>
            <ul className="event-list compact">
              {(analyticsFraud || []).map((item, idx) => (
                <li key={`${item.type}-${idx}`} className="event-item">
                  <strong>{item.type}</strong>
                  <span>{item.message}</span>
                  <small>Severidade: {item.severity} | Quantidade: {item.count}</small>
                </li>
              ))}
            </ul>

            {analyticsDescarbonizacao?.resumo && (
              <>
                <h4>Descarbonizacao (mock)</h4>
                <div className="admin-stats">
                  <article className="stat-card">
                    <strong>Registros</strong>
                    <span>{analyticsDescarbonizacao.resumo.totalRegistros}</span>
                  </article>
                  <article className="stat-card">
                    <strong>Media CO2 (kg)</strong>
                    <span>{Number(analyticsDescarbonizacao.resumo.mediaEmissaoKgCo2 || 0).toFixed(2)}</span>
                  </article>
                  <article className="stat-card">
                    <strong>Media distancia (km)</strong>
                    <span>{Number(analyticsDescarbonizacao.resumo.mediaDistanciaKm || 0).toFixed(0)}</span>
                  </article>
                </div>
              </>
            )}
          </>
        )}
      </section>

      {selectedDetails && (
        <AdminCredenciadoDetails
          credenciado={selectedDetails}
          eventos={selectedEvents}
          onClose={onCloseDetails}
          onSave={onSaveDetails}
          onSoftDelete={onSoftDeleteDetails}
          onCredentialStatusChange={onCredentialStatusChange}
          onReissue={onReissueCredential}
        />
      )}

      {showComissaoForm && (
        <AdminComissaoForm
          loading={creatingComissao}
          error={createComissaoError}
          onClose={() => setShowComissaoForm(false)}
          onCreate={async (payload) => {
            await onCreateComissao(payload);
            setShowComissaoForm(false);
          }}
        />
      )}
    </main>
  );
}

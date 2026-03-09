import { useState } from "react";
import { categoryOptions, governanceCategoryOption } from "../constants/formConfig";
import { t } from "../locales";
import AdminComissaoForm from "./AdminComissaoForm";
import AdminCredenciadoDetails from "./AdminCredenciadoDetails";
import AdminCredenciadosTable from "./AdminCredenciadosTable";

const categoryFilterOptions = [
  { value: "", labelKey: "common.unrestricted" },
  ...categoryOptions,
  governanceCategoryOption
];

function SectionSelector({ value, onChange }) {
  return (
    <label>
      {t("adminDashboard.section")}
      <select className="section-switch" value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="credenciados">{t("adminDashboard.sectionParticipants")}</option>
        <option value="eventos">{t("adminDashboard.sectionSystemEvents")}</option>
        <option value="audit">{t("adminDashboard.sectionAuditLogs")}</option>
        <option value="checkin">{t("adminDashboard.sectionCheckIn")}</option>
        <option value="analytics">{t("adminDashboard.sectionAnalytics")}</option>
      </select>
    </label>
  );
}

export default function AdminDashboard({
  admin,
  listResponse,
  systemEvents,
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
  onCreateGovernanceMember,
  creatingGovernanceMember,
  createGovernanceError,
  onLogout,
  auditLogs,
  onRunCheckIn,
  checkInResult,
  checkInLoading,
  analyticsOverview,
  analyticsFraud,
  analyticsDescarbonizacao
}) {
  const [showGovernanceForm, setShowGovernanceForm] = useState(false);
  const [activeSection, setActiveSection] = useState("credenciados");
  const [checkInForm, setCheckInForm] = useState({
    codigoUnico: "",
    gateCode: "GATE-ENTRY-01",
    accessPoint: "Main Gate"
  });

  const items = listResponse?.items || [];
  const page = listResponse?.page || 1;
  const totalPages = listResponse?.totalPages || 1;
  const isGovernanceProfile = admin?.role === "COMISSAO_ORGANIZADORA";

  return (
    <main className="single-page">
      <section className="card">
        <div className="admin-header">
          <div>
            <h2>{t("adminDashboard.title")}</h2>
            <p>{t("adminDashboard.loggedAs", { name: admin?.nome || admin?.email || "-" })}</p>
          </div>
          <div className="toolbar">
            {!isGovernanceProfile && (
              <button type="button" onClick={() => setShowGovernanceForm(true)}>
                {t("adminDashboard.addGovernanceMember")}
              </button>
            )}
            <button type="button" onClick={onReload} disabled={loading}>
              {loading ? t("common.refreshing") : t("common.refresh")}
            </button>
            <button type="button" onClick={onLogout}>
              {t("common.logout")}
            </button>
          </div>
        </div>

        {!isGovernanceProfile && (
          <div className="filters">
            <SectionSelector value={activeSection} onChange={setActiveSection} />
            <label>
              {t("adminDashboard.search")}
              <input
                value={filters.search}
                placeholder={t("adminDashboard.searchPlaceholder")}
                onChange={(event) =>
                  onChangeFilters({ ...filters, search: event.target.value, page: 1 })
                }
              />
            </label>
            <label>
              {t("adminDashboard.category")}
              <select
                value={filters.categoria}
                onChange={(event) =>
                  onChangeFilters({ ...filters, categoria: event.target.value, page: 1 })
                }
              >
                {categoryFilterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {t(option.labelKey)}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        {isGovernanceProfile && (
          <p className="section-subtitle">{t("adminDashboard.governanceScopeText")}</p>
        )}

        {error && <p className="error">{error}</p>}

        {!isGovernanceProfile && activeSection === "credenciados" && (
          <>
            <AdminCredenciadosTable items={items} onOpenDetails={onOpenDetails} />

            <div className="pagination">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => onChangeFilters({ ...filters, page: page - 1 })}
              >
                {t("common.previous")}
              </button>
              <span>{t("common.pageOf", { page, totalPages })}</span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => onChangeFilters({ ...filters, page: page + 1 })}
              >
                {t("common.next")}
              </button>
            </div>
          </>
        )}

        {!isGovernanceProfile && activeSection === "eventos" && (
          <>
            <h3>{t("adminDashboard.recentEventsTitle")}</h3>
            <ul className="event-list compact">
              {systemEvents.map((eventItem) => (
                <li key={eventItem.id} className="event-item">
                  <strong>{eventItem.tipoEvento}</strong>
                  <span>{eventItem.descricao}</span>
                  <small>
                    {eventItem.credenciado?.nomeCompleto || t("adminDashboard.noLinkedParticipant")} |{" "}
                    {new Date(eventItem.createdAt).toLocaleString()}
                  </small>
                </li>
              ))}
            </ul>
          </>
        )}

        {!isGovernanceProfile && activeSection === "audit" && (
          <>
            <h3>{t("adminDashboard.auditTrailTitle")}</h3>
            <ul className="event-list compact">
              {auditLogs.map((log) => (
                <li key={log.id} className="event-item">
                  <strong>{log.acao}</strong>
                  <span>
                    {log.actor?.nome || log.actorType} | {log.recurso}
                  </span>
                  <small>{new Date(log.createdAt).toLocaleString()}</small>
                </li>
              ))}
            </ul>
          </>
        )}

        {!isGovernanceProfile && activeSection === "checkin" && (
          <>
            <h3>{t("adminDashboard.accessControlTitle")}</h3>
            <form
              className="grid"
              onSubmit={(event) => {
                event.preventDefault();
                onRunCheckIn(checkInForm);
              }}
            >
              <label>
                {t("adminDashboard.uniqueCode")}
                <input
                  value={checkInForm.codigoUnico}
                  onChange={(event) =>
                    setCheckInForm((currentForm) => ({ ...currentForm, codigoUnico: event.target.value }))
                  }
                  required
                />
              </label>
              <label>
                {t("adminDashboard.accessPointCode")}
                <input
                  value={checkInForm.gateCode}
                  onChange={(event) =>
                    setCheckInForm((currentForm) => ({ ...currentForm, gateCode: event.target.value }))
                  }
                  required
                />
              </label>
              <label>
                {t("adminDashboard.accessPoint")}
                <input
                  value={checkInForm.accessPoint}
                  onChange={(event) =>
                    setCheckInForm((currentForm) => ({ ...currentForm, accessPoint: event.target.value }))
                  }
                />
              </label>
              <button type="submit" disabled={checkInLoading}>
                {checkInLoading ? t("adminDashboard.validating") : t("adminDashboard.validateAccess")}
              </button>
            </form>

            {checkInResult && (
              <div className={checkInResult.resultado === "ALLOW" ? "success-box" : "error-box"}>
                <strong>{t("adminDashboard.resultLabel", { result: checkInResult.resultado })}</strong>
                <p>{t("adminDashboard.reasonLabel", { reason: checkInResult.motivo })}</p>
                <p>
                  {t("adminDashboard.credentialLabel", {
                    code: checkInResult.codigoUnico || t("common.notAvailable")
                  })}
                </p>
              </div>
            )}
          </>
        )}

        {!isGovernanceProfile && activeSection === "analytics" && (
          <>
            <h3>{t("adminDashboard.sectionAnalytics")}</h3>
            {analyticsOverview && (
              <div className="admin-stats">
                <article className="stat-card">
                  <strong>{t("adminDashboard.totalParticipants")}</strong>
                  <span>{analyticsOverview.totalCredenciados}</span>
                </article>
                <article className="stat-card">
                  <strong>{t("adminDashboard.totalCredentials")}</strong>
                  <span>{analyticsOverview.totalCredenciaisGeradas}</span>
                </article>
                <article className="stat-card">
                  <strong>{t("adminDashboard.allowedCheckIns")}</strong>
                  <span>{analyticsOverview.totalCheckInsPermitidos}</span>
                </article>
                <article className="stat-card">
                  <strong>{t("adminDashboard.deniedCheckIns")}</strong>
                  <span>{analyticsOverview.totalCheckInsNegados}</span>
                </article>
              </div>
            )}

            <h4>{t("adminDashboard.fraudSignalsTitle")}</h4>
            <ul className="event-list compact">
              {(analyticsFraud || []).map((item, index) => (
                <li key={`${item.type}-${index}`} className="event-item">
                  <strong>{item.type}</strong>
                  <span>{item.message}</span>
                  <small>
                    {t("adminDashboard.severityCount", {
                      severity: item.severity,
                      count: item.count
                    })}
                  </small>
                </li>
              ))}
            </ul>

            {analyticsDescarbonizacao?.resumo && (
              <>
                <h4>{t("adminDashboard.carbonPanelTitle")}</h4>
                <div className="admin-stats">
                  <article className="stat-card">
                    <strong>{t("adminDashboard.records")}</strong>
                    <span>{analyticsDescarbonizacao.resumo.totalRegistros}</span>
                  </article>
                  <article className="stat-card">
                    <strong>{t("adminDashboard.averageCo2")}</strong>
                    <span>{Number(analyticsDescarbonizacao.resumo.mediaEmissaoKgCo2 || 0).toFixed(2)}</span>
                  </article>
                  <article className="stat-card">
                    <strong>{t("adminDashboard.averageDistance")}</strong>
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
          historyEvents={selectedEvents}
          onClose={onCloseDetails}
          onSave={onSaveDetails}
          onSoftDelete={onSoftDeleteDetails}
          onCredentialStatusChange={onCredentialStatusChange}
          onReissue={onReissueCredential}
        />
      )}

      {!isGovernanceProfile && showGovernanceForm && (
        <AdminComissaoForm
          loading={creatingGovernanceMember}
          error={createGovernanceError}
          onClose={() => setShowGovernanceForm(false)}
          onCreate={async (payload) => {
            await onCreateGovernanceMember(payload);
            setShowGovernanceForm(false);
          }}
        />
      )}
    </main>
  );
}

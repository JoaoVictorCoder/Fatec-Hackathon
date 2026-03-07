import { useEffect, useState } from "react";
import { Navigate, NavLink, Route, Routes, useNavigate, useParams } from "react-router-dom";
import {
  createAdminComissao,
  createAdminUser,
  createCredenciadoPublic,
  exportAdminBackup,
  getAdminAccessLogs,
  getAdminAnalyticsDescarbonizacao,
  getAdminAnalyticsFraud,
  getAdminAnalyticsOverview,
  getAdminAuditLogs,
  getAdminBackupStatus,
  getAdminCredenciadoById,
  getAdminCredenciadoEventos,
  getAdminCredenciados,
  getAdminCredencialById,
  getAdminEventos,
  getAdminUsers,
  getPublicCredencialPdfUrl,
  getPublicCredencialQr,
  login,
  operatorHistoryBasic,
  operatorLogin,
  operatorValidateCheckIn,
  logout,
  me,
  patchAdminCredencialStatus,
  patchAdminUserActive,
  patchAdminUserPermissions,
  reissueAdminCredencial,
  softDeleteAdminCredenciado,
  updateAdminCredencial,
  updateAdminCredenciado,
  validateAdminCheckIn
} from "./api/credenciamentoApi";
import AdminCredencialView from "./components/AdminCredencialView";
import AdminDashboard from "./components/AdminDashboard";
import AdminLoginForm from "./components/AdminLoginForm";
import CredenciadoForm from "./components/CredenciadoForm";
import InternalUsersPanel from "./components/InternalUsersPanel";
import OperatorConsole from "./components/OperatorConsole";
import { baseForm } from "./constants/formConfig";
import {
  formatCellphone,
  formatCnpj,
  formatCpf,
  resolveDistanceFromCidade,
  validatePublicCredenciadoForm
} from "./utils/validation";

function PublicAreaPage() {
  const [form, setForm] = useState(baseForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [lastCreated, setLastCreated] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

  function onChange(event) {
    const { name, value, type, checked } = event.target;
    const nextValue = (() => {
      if (type === "checkbox") return checked;
      if (name === "cpf") return formatCpf(value);
      if (name === "cnpj") return formatCnpj(value);
      if (name === "celular") return formatCellphone(value);
      return value;
    })();

    setForm((prev) => {
      const nextForm = {
        ...prev,
        [name]: nextValue
      };
      if (name === "combustivel") {
        nextForm.tipoCombustivel = nextValue;
      }
      if (name === "cidadeOrigem") {
        const estimatedDistance = resolveDistanceFromCidade(nextValue);
        if (estimatedDistance != null) {
          nextForm.distanciaKm = String(estimatedDistance);
        }
      }
      const { errors } = validatePublicCredenciadoForm(nextForm);
      setFieldErrors((old) => ({ ...old, [name]: errors[name], documento: errors.documento }));
      return nextForm;
    });
  }

  function onBlur(event) {
    const { name } = event.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const { errors } = validatePublicCredenciadoForm(form);
    setFieldErrors(errors);
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const { errors, normalized } = validatePublicCredenciadoForm(form);
      setFieldErrors(errors);
      setTouched({
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
        aceitouLgpd: true,
        nomeEmpresa: true,
        siteEmpresa: true,
        ccir: true,
        nomePropriedade: true,
        nomeVeiculo: true,
        funcaoCargo: true
      });
      if (Object.keys(errors).length > 0) {
        throw new Error("Revise os campos destacados antes de enviar");
      }

      const created = await createCredenciadoPublic(normalized);
      setLastCreated(created);
      setSuccess(
        `Cadastro realizado com sucesso. Credencial ${created.credencial?.codigoUnico || "N/A"} gerada.`
      );
      if (created.credencial?.id) {
        const qr = await getPublicCredencialQr(created.credencial.id);
        setQrDataUrl(qr.qrcode || "");
      }
      setForm((prev) => ({ ...baseForm, categoria: prev.categoria }));
      setFieldErrors({});
      setTouched({});
    } catch (submitError) {
      setError(submitError.message || "Erro ao cadastrar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="single-page">
      <section className="card">
        <h2>Cadastro Publico</h2>
        <p>Preencha seus dados para credenciamento no evento.</p>
        <CredenciadoForm
          form={form}
          saving={saving}
          errors={fieldErrors}
          touched={touched}
          onChange={onChange}
          onBlur={onBlur}
          onSubmit={onSubmit}
        />
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
        {lastCreated?.id && <p>ID do cadastro: {lastCreated.id}</p>}
      </section>

      <section className="card">
        <h2>Sua credencial</h2>
        {!lastCreated?.credencial?.id && (
          <p>A credencial e exibida aqui apos um cadastro concluido.</p>
        )}
        {lastCreated?.credencial?.id && (
          <div className="details-grid">
            <div className="detail-field">
              <span>Categoria</span>
              <strong>{lastCreated.categoria}</strong>
            </div>
            <div className="detail-field">
              <span>Status credenciamento</span>
              <strong>{lastCreated.statusCredenciamento}</strong>
            </div>
            <div className="detail-field">
              <span>Codigo da credencial</span>
              <strong>{lastCreated.credencial?.codigoUnico || "-"}</strong>
            </div>
            <div className="detail-field">
              <span>PDF da credencial</span>
              <a
                className="link-button"
                target="_blank"
                rel="noreferrer"
                href={getPublicCredencialPdfUrl(lastCreated.credencial.id)}
              >
                Abrir PDF
              </a>
            </div>
          </div>
        )}

        {qrDataUrl && (
          <div className="qr-section">
            <h3>QR Code</h3>
            <img src={qrDataUrl} alt="QR da credencial" className="qr-image" />
          </div>
        )}
      </section>
    </main>
  );
}

function AdminLoginPage({ onLoggedIn }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  return (
    <main className="single-page">
      <AdminLoginForm
        loading={loading}
        error={error}
        title="Login Operador QR"
        subtitle="Acesso operacional para validacao de entrada."
        onSubmit={async (payload) => {
          setLoading(true);
          setError("");
          try {
            const data = await login(payload);
            if (data.admin?.role === "OPERADOR_QR") {
              throw new Error("Use a aba Operador QR para este perfil");
            }
            onLoggedIn(data.admin);
            navigate("/admin");
          } catch (loginError) {
            setError(loginError.message || "Falha no login.");
          } finally {
            setLoading(false);
          }
        }}
      />
    </main>
  );
}

function AdminDashboardPage({ admin, onLogout }) {
  const [listResponse, setListResponse] = useState({ items: [], page: 1, totalPages: 1 });
  const [eventos, setEventos] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [analyticsOverview, setAnalyticsOverview] = useState(null);
  const [analyticsFraud, setAnalyticsFraud] = useState([]);
  const [analyticsDescarbonizacao, setAnalyticsDescarbonizacao] = useState(null);
  const [checkInResult, setCheckInResult] = useState(null);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    categoria: "",
    page: 1,
    pageSize: 10
  });
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [creatingComissao, setCreatingComissao] = useState(false);
  const [createComissaoError, setCreateComissaoError] = useState("");
  const [internalUsers, setInternalUsers] = useState([]);
  const [accessLogs, setAccessLogs] = useState([]);
  const [backupStatus, setBackupStatus] = useState(null);

  async function loadData(activeFilters = filters) {
    setLoading(true);
    setError("");
    try {
      const [listData, eventData, logData, overview, fraud, descarbonizacao] = await Promise.all([
        getAdminCredenciados(activeFilters),
        getAdminEventos({ limit: 60 }),
        getAdminAuditLogs({ page: 1, pageSize: 40 }),
        getAdminAnalyticsOverview(),
        getAdminAnalyticsFraud(),
        getAdminAnalyticsDescarbonizacao()
      ]);
      setListResponse(listData);
      setEventos(eventData);
      setAuditLogs(logData.items || []);
      setAnalyticsOverview(overview);
      setAnalyticsFraud(fraud);
      setAnalyticsDescarbonizacao(descarbonizacao);

      if (admin?.role === "MASTER_ADMIN") {
        const [usersData, accessLogsData, backupData] = await Promise.all([
          getAdminUsers(),
          getAdminAccessLogs({ page: 1, pageSize: 30 }),
          getAdminBackupStatus()
        ]);
        setInternalUsers(usersData.items || []);
        setAccessLogs(accessLogsData.items || []);
        setBackupStatus(backupData);
      }
    } catch (loadError) {
      setError(loadError.message || "Falha ao carregar dados administrativos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData(filters);
  }, [filters.page, filters.pageSize, filters.categoria]);

  return (
    <main className="single-page">
      <AdminDashboard
        admin={admin}
        listResponse={listResponse}
        eventos={eventos}
        loading={loading}
        error={error}
        filters={filters}
        onChangeFilters={(next) => {
          setFilters(next);
          if (next.search !== filters.search) {
            loadData(next);
          }
        }}
        onReload={() => loadData(filters)}
        onOpenDetails={async (id) => {
          try {
            const [identity, eventsData] = await Promise.all([
              getAdminCredenciadoById(id),
              getAdminCredenciadoEventos(id)
            ]);
            setSelectedDetails(identity);
            setSelectedEvents(eventsData);
          } catch (detailError) {
            setError(detailError.message || "Falha ao carregar detalhes.");
          }
        }}
        selectedDetails={selectedDetails}
        selectedEvents={selectedEvents}
        onCloseDetails={() => {
          setSelectedDetails(null);
          setSelectedEvents([]);
        }}
        onSaveDetails={async (payload) => {
          if (!selectedDetails?.id) return;
          await updateAdminCredenciado(selectedDetails.id, payload);
          const refreshed = await getAdminCredenciadoById(selectedDetails.id);
          setSelectedDetails(refreshed);
          await loadData(filters);
        }}
        onSoftDeleteDetails={async () => {
          if (!selectedDetails?.id) return;
          await softDeleteAdminCredenciado(selectedDetails.id, "inativacao manual");
          const refreshed = await getAdminCredenciadoById(selectedDetails.id);
          setSelectedDetails(refreshed);
          await loadData(filters);
        }}
        onCredentialStatusChange={async (statusCredencial) => {
          if (!selectedDetails?.credencial?.id) return;
          await patchAdminCredencialStatus(selectedDetails.credencial.id, {
            statusCredencial,
            motivo: "acao manual no painel admin"
          });
          const refreshed = await getAdminCredenciadoById(selectedDetails.id);
          setSelectedDetails(refreshed);
          await loadData(filters);
        }}
        onReissueCredential={async () => {
          if (!selectedDetails?.credencial?.id) return;
          await reissueAdminCredencial(selectedDetails.credencial.id, {
            motivo: "reemissao manual no painel admin"
          });
          const refreshed = await getAdminCredenciadoById(selectedDetails.id);
          setSelectedDetails(refreshed);
          await loadData(filters);
        }}
        onCreateComissao={async (payload) => {
          setCreatingComissao(true);
          setCreateComissaoError("");
          try {
            await createAdminComissao(payload);
            await loadData(filters);
          } catch (createError) {
            setCreateComissaoError(createError.message || "Erro ao criar membro.");
            throw createError;
          } finally {
            setCreatingComissao(false);
          }
        }}
        creatingComissao={creatingComissao}
        createComissaoError={createComissaoError}
        onLogout={onLogout}
        auditLogs={auditLogs}
        onRunCheckIn={async (payload) => {
          setCheckInLoading(true);
          setError("");
          try {
            const result = await validateAdminCheckIn(payload);
            setCheckInResult(result);
            await loadData(filters);
          } catch (checkError) {
            setError(checkError.message || "Falha no check-in.");
          } finally {
            setCheckInLoading(false);
          }
        }}
        checkInResult={checkInResult}
        checkInLoading={checkInLoading}
        analyticsOverview={analyticsOverview}
        analyticsFraud={analyticsFraud}
        analyticsDescarbonizacao={analyticsDescarbonizacao}
      />

      {admin?.role === "MASTER_ADMIN" && (
        <>
          <InternalUsersPanel
            users={internalUsers}
            onCreate={async (payload) => {
              await createAdminUser(payload);
              await loadData(filters);
            }}
            onToggleActive={async (id, ativo) => {
              await patchAdminUserActive(id, ativo);
              await loadData(filters);
            }}
            onUpdatePermissions={async (id, permissions) => {
              await patchAdminUserPermissions(id, permissions);
              await loadData(filters);
            }}
          />

          <section className="card">
            <h3>Logs de Entrada</h3>
            <ul className="event-list compact">
              {accessLogs.map((item) => (
                <li key={item.id} className="event-item">
                  <strong>{item.resultado} - {item.motivo}</strong>
                  <span>{item.nomeCredenciado || "Sem vinculo"} | Operador: {item.operatorNome || "-"}</span>
                  <small>{new Date(item.createdAt).toLocaleString("pt-BR")}</small>
                </li>
              ))}
            </ul>
          </section>

          <section className="card">
            <h3>Backup / Continuidade</h3>
            <p>Diretorio: {backupStatus?.backupDir || "-"}</p>
            <p>Total de arquivos: {backupStatus?.totalFiles ?? 0}</p>
            <p>Ultimo backup: {backupStatus?.latestFile || "nenhum"}</p>
            <button
              type="button"
              onClick={async () => {
                await exportAdminBackup();
                await loadData(filters);
              }}
            >
              Gerar backup agora
            </button>
          </section>
        </>
      )}
    </main>
  );
}

function AdminCredencialPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);

  async function reload() {
    setLoading(true);
    setError("");
    try {
      const response = await getAdminCredencialById(id);
      setData(response);
    } catch (loadError) {
      setError(loadError.message || "Credencial nao encontrada.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, [id]);

  return (
    <AdminCredencialView
      data={data}
      loading={loading}
      saving={saving}
      error={error}
      onSave={async (payload) => {
        setSaving(true);
        setError("");
        try {
          const updated = await updateAdminCredencial(id, payload);
          setData(updated);
        } catch (saveError) {
          setError(saveError.message || "Falha ao salvar credencial.");
        } finally {
          setSaving(false);
        }
      }}
    />
  );
}

function OperatorLoginPage({ onLoggedIn }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  return (
    <main className="single-page">
      <AdminLoginForm
        loading={loading}
        error={error}
        onSubmit={async (payload) => {
          setLoading(true);
          setError("");
          try {
            const data = await operatorLogin(payload);
            onLoggedIn(data.admin);
            navigate("/operator");
          } catch (loginError) {
            setError(loginError.message || "Falha no login do operador.");
          } finally {
            setLoading(false);
          }
        }}
      />
    </main>
  );
}

function OperatorAreaPage({ operator }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    operatorHistoryBasic()
      .then((data) => setHistory(data.items || []))
      .catch(() => setHistory([]));
  }, []);

  return (
    <OperatorConsole
      operator={operator}
      history={history}
      loading={loading}
      onValidate={async (payload) => {
        setLoading(true);
        try {
          const result = await operatorValidateCheckIn(payload);
          const hist = await operatorHistoryBasic();
          setHistory(hist.items || []);
          return result;
        } finally {
          setLoading(false);
        }
      }}
    />
  );
}

function ProtectedAdminRoute({ admin, children }) {
  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

function App() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [operator, setOperator] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    me()
      .then((response) => {
        const role = response.admin?.role;
        if (role === "OPERADOR_QR") {
          setOperator(response.admin);
          setAdmin(null);
        } else {
          setAdmin(response.admin);
          setOperator(null);
        }
      })
      .catch(() => {
        setAdmin(null);
        setOperator(null);
      })
      .finally(() => setCheckingAuth(false));
  }, []);

  if (checkingAuth) {
    return <p className="loading-screen">Carregando...</p>;
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <h1>Credenciamento - Setor Cafeeiro</h1>
          <p>Checkpoint 2 - Publico + Admin + Check-in + QR/PDF + Analytics</p>
        </div>
        <nav className="tabs">
          <NavLink to="/" end className={({ isActive }) => (isActive ? "tab active" : "tab")}>
            Publico
          </NavLink>
          <NavLink
            to={admin ? "/admin" : "/admin/login"}
            className={({ isActive }) => (isActive ? "tab active" : "tab")}
          >
            Admin
          </NavLink>
          <NavLink
            to={operator ? "/operator" : "/operator/login"}
            className={({ isActive }) => (isActive ? "tab active" : "tab")}
          >
            Operador QR
          </NavLink>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<PublicAreaPage />} />
        <Route path="/admin/login" element={<AdminLoginPage onLoggedIn={setAdmin} />} />
        <Route path="/operator/login" element={<OperatorLoginPage onLoggedIn={setOperator} />} />
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute admin={admin}>
              <AdminDashboardPage
                admin={admin}
                onLogout={async () => {
                  await logout();
                  setAdmin(null);
                  setOperator(null);
                  navigate("/admin/login");
                }}
              />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/operator"
          element={
            <ProtectedAdminRoute admin={operator}>
              <OperatorAreaPage operator={operator} />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/credenciais/:id"
          element={
            <ProtectedAdminRoute admin={admin}>
              <AdminCredencialPage />
            </ProtectedAdminRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;

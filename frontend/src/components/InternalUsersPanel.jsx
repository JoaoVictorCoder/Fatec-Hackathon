import { useMemo, useState } from "react";
import { t } from "../locales";

function createDefaultOperatorPermissions() {
  return {
    podeValidarEntrada: true,
    podeVisualizarDadosMinimosCredenciado: true,
    podeVerHistoricoBasicoDaCredencial: true,
    podeRegistrarObservacaoOperacional: true,
    podeConsultarUltimasEntradas: true,
    podeUsarCameraParaLeituraQR: true
  };
}

function createEmptyForm() {
  return {
    nome: "",
    email: "",
    senha: "",
    role: "OPERADOR_QR",
    standId: "",
    standName: "",
    empresaNome: "",
    empresaVinculadaId: "",
    empresaVinculadaNome: "",
    comissaoResponsavelId: ""
  };
}

export default function InternalUsersPanel({
  managerRole,
  users,
  currentUserId,
  onCreate,
  onToggleActive,
  onUpdatePermissions,
  onUpdateUser
}) {
  const [form, setForm] = useState(createEmptyForm);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [loadingRowId, setLoadingRowId] = useState("");
  const [editingUserId, setEditingUserId] = useState("");
  const [draftPermissions, setDraftPermissions] = useState(createDefaultOperatorPermissions());
  const [draftUser, setDraftUser] = useState({
    standId: "",
    standName: "",
    empresaNome: "",
    empresaVinculadaId: "",
    empresaVinculadaNome: "",
    comissaoResponsavelId: ""
  });

  const usersById = useMemo(
    () => Object.fromEntries((users || []).map((user) => [user.id, user])),
    [users]
  );
  const visibleUsers = useMemo(
    () => (users || []).filter((user) => user.id !== currentUserId),
    [users, currentUserId]
  );

  async function handleCreate(event) {
    event.preventDefault();
    setIsCreating(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      await onCreate({
        ...form,
        permissoesCustomizadas: form.role === "OPERADOR_QR" ? createDefaultOperatorPermissions() : null
      });
      setForm(createEmptyForm());
      setSuccessMessage(t("usersPanel.createSuccess"));
    } catch (createError) {
      setErrorMessage(createError.message || t("usersPanel.createError"));
    } finally {
      setIsCreating(false);
    }
  }

  function beginEdit(user) {
    setEditingUserId(user.id);
    setDraftPermissions({ ...createDefaultOperatorPermissions(), ...(user.permissoesCustomizadas || {}) });
    setDraftUser({
      standId: user.standId || "",
      standName: user.standName || "",
      empresaNome: user.empresaNome || "",
      empresaVinculadaId: user.empresaVinculadaId || "",
      empresaVinculadaNome: user.empresaVinculadaNome || "",
      comissaoResponsavelId: user.comissaoResponsavelId || ""
    });
    setErrorMessage("");
    setSuccessMessage("");
  }

  async function saveEdit(user) {
    setLoadingRowId(user.id);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      if (user.role === "OPERADOR_QR") {
        await onUpdatePermissions(user.id, draftPermissions);
      }

      await onUpdateUser(user.id, {
        standId: draftUser.standId,
        standName: draftUser.standName,
        empresaNome: draftUser.empresaNome,
        empresaVinculadaId: draftUser.empresaVinculadaId,
        empresaVinculadaNome: draftUser.empresaVinculadaNome,
        comissaoResponsavelId: draftUser.comissaoResponsavelId
      });

      setEditingUserId("");
      setSuccessMessage(t("usersPanel.saveSuccess"));
    } catch (saveError) {
      setErrorMessage(saveError.message || t("usersPanel.saveError"));
    } finally {
      setLoadingRowId("");
    }
  }

  return (
    <section className="card">
      <h3>{t("usersPanel.title")}</h3>

      <form className="grid" onSubmit={handleCreate}>
        <label>
          {t("usersPanel.name")}
          <input
            value={form.nome}
            onChange={(event) => setForm((currentForm) => ({ ...currentForm, nome: event.target.value }))}
            required
          />
        </label>
        <label>
          {t("table.email")}
          <input
            value={form.email}
            onChange={(event) => setForm((currentForm) => ({ ...currentForm, email: event.target.value }))}
            required
          />
        </label>
        <label>
          {t("auth.password")}
          <input
            type="password"
            value={form.senha}
            onChange={(event) => setForm((currentForm) => ({ ...currentForm, senha: event.target.value }))}
            required
          />
        </label>
        <label>
          {t("usersPanel.role")}
          {managerRole === "COMISSAO_ORGANIZADORA" ? (
            <input value="OPERADOR_QR" disabled />
          ) : (
            <select
              value={form.role}
              onChange={(event) => setForm((currentForm) => ({ ...currentForm, role: event.target.value }))}
            >
              <option value="ADMIN">ADMIN</option>
              <option value="COMISSAO_ORGANIZADORA">COMISSAO_ORGANIZADORA</option>
              <option value="OPERADOR_QR">OPERADOR_QR</option>
            </select>
          )}
        </label>
        <label>
          {t("usersPanel.standId")}
          <input
            value={form.standId}
            onChange={(event) => setForm((currentForm) => ({ ...currentForm, standId: event.target.value }))}
          />
        </label>
        <label>
          {t("usersPanel.standName")}
          <input
            value={form.standName}
            onChange={(event) => setForm((currentForm) => ({ ...currentForm, standName: event.target.value }))}
          />
        </label>
        <label>
          {t("usersPanel.company")}
          <input
            value={form.empresaVinculadaNome || form.empresaNome}
            onChange={(event) =>
              setForm((currentForm) => ({
                ...currentForm,
                empresaNome: event.target.value,
                empresaVinculadaNome: event.target.value
              }))
            }
          />
        </label>
        <label>
          {t("usersPanel.companyId")}
          <input
            value={form.empresaVinculadaId}
            onChange={(event) =>
              setForm((currentForm) => ({ ...currentForm, empresaVinculadaId: event.target.value }))
            }
          />
        </label>
        {managerRole !== "COMISSAO_ORGANIZADORA" && (
          <label>
            {t("usersPanel.governanceResponsibleId")}
            <input
              value={form.comissaoResponsavelId}
              onChange={(event) =>
                setForm((currentForm) => ({ ...currentForm, comissaoResponsavelId: event.target.value }))
              }
            />
          </label>
        )}
        <button type="submit" disabled={isCreating}>
          {isCreating ? t("usersPanel.creating") : t("usersPanel.createUser")}
        </button>
      </form>

      {successMessage && <p className="success">{successMessage}</p>}
      {errorMessage && <p className="error">{errorMessage}</p>}

      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t("usersPanel.name")}</th>
              <th>{t("table.email")}</th>
              <th>{t("usersPanel.role")}</th>
              <th>{t("usersPanel.standName")}</th>
              <th>{t("usersPanel.company")}</th>
              <th>{t("usersPanel.active")}</th>
              <th>{t("usersPanel.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {visibleUsers.map((user) => {
              const isEditing = editingUserId === user.id;
              const isRowLoading = loadingRowId === user.id;

              return (
                <tr key={user.id}>
                  <td>{user.nome}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    {isEditing ? (
                      <input
                        value={draftUser.standName}
                        onChange={(event) =>
                          setDraftUser((currentDraft) => ({ ...currentDraft, standName: event.target.value }))
                        }
                      />
                    ) : (
                      user.standName || "-"
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        value={draftUser.empresaVinculadaNome || draftUser.empresaNome}
                        onChange={(event) =>
                          setDraftUser((currentDraft) => ({
                            ...currentDraft,
                            empresaNome: event.target.value,
                            empresaVinculadaNome: event.target.value
                          }))
                        }
                      />
                    ) : (
                      user.empresaVinculadaNome || user.empresaNome || "-"
                    )}
                  </td>
                  <td>{user.ativo ? t("common.yes") : t("common.no")}</td>
                  <td className="table-actions">
                    <button
                      type="button"
                      disabled={isRowLoading}
                      onClick={async () => {
                        setLoadingRowId(user.id);
                        setErrorMessage("");
                        setSuccessMessage("");
                        try {
                          await onToggleActive(user.id, !user.ativo);
                          setSuccessMessage(t("usersPanel.statusSuccess"));
                        } catch (toggleError) {
                          setErrorMessage(toggleError.message || t("usersPanel.statusError"));
                        } finally {
                          setLoadingRowId("");
                        }
                      }}
                    >
                      {isRowLoading
                        ? t("usersPanel.editing")
                        : user.ativo
                          ? t("usersPanel.deactivate")
                          : t("usersPanel.activate")}
                    </button>

                    {!isEditing && (
                      <button type="button" onClick={() => beginEdit(user)}>
                        {t("usersPanel.editUser")}
                      </button>
                    )}

                    {isEditing && (
                      <>
                        {user.role === "OPERADOR_QR" && (
                          <button
                            type="button"
                            onClick={() =>
                              setDraftPermissions((currentPermissions) => ({
                                ...currentPermissions,
                                podeUsarCameraParaLeituraQR: !currentPermissions.podeUsarCameraParaLeituraQR
                              }))
                            }
                          >
                            {t("usersPanel.cameraPermission", {
                              value: draftPermissions.podeUsarCameraParaLeituraQR ? "ON" : "OFF"
                            })}
                          </button>
                        )}
                        <button type="button" disabled={isRowLoading} onClick={() => saveEdit(user)}>
                          {isRowLoading ? t("credentialPage.saving") : t("usersPanel.saveChanges")}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingUserId("");
                            setDraftPermissions(createDefaultOperatorPermissions());
                          }}
                        >
                          {t("common.cancel")}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editingUserId && usersById[editingUserId]?.role === "OPERADOR_QR" && (
        <section className="card">
          <h4>{t("usersPanel.operatorPermissions")}</h4>
          <div className="grid">
            {Object.entries(draftPermissions).map(([permissionKey, value]) => (
              <label key={permissionKey} className="checkbox">
                <input
                  type="checkbox"
                  checked={value === true}
                  onChange={(event) =>
                    setDraftPermissions((currentPermissions) => ({
                      ...currentPermissions,
                      [permissionKey]: event.target.checked
                    }))
                  }
                />
                {permissionKey}
              </label>
            ))}
          </div>
          <label>
            {t("usersPanel.standId")}
            <input
              value={draftUser.standId}
              onChange={(event) =>
                setDraftUser((currentDraft) => ({ ...currentDraft, standId: event.target.value }))
              }
            />
          </label>
          <label>
            {t("usersPanel.companyId")}
            <input
              value={draftUser.empresaVinculadaId}
              onChange={(event) =>
                setDraftUser((currentDraft) => ({
                  ...currentDraft,
                  empresaVinculadaId: event.target.value
                }))
              }
            />
          </label>
          {managerRole !== "COMISSAO_ORGANIZADORA" && (
            <label>
              {t("usersPanel.governanceResponsibleId")}
              <input
                value={draftUser.comissaoResponsavelId}
                onChange={(event) =>
                  setDraftUser((currentDraft) => ({
                    ...currentDraft,
                    comissaoResponsavelId: event.target.value
                  }))
                }
              />
            </label>
          )}
        </section>
      )}
    </section>
  );
}

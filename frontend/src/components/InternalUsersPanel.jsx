import { useMemo, useState } from "react";

function initialPermissions() {
  return {
    podeValidarEntrada: true,
    podeVisualizarDadosMinimosCredenciado: true,
    podeVerHistoricoBasicoDaCredencial: true,
    podeRegistrarObservacaoOperacional: true,
    podeConsultarUltimasEntradas: true,
    podeUsarCameraParaLeituraQR: true
  };
}

function emptyForm() {
  return {
    nome: "",
    email: "",
    senha: "",
    role: "OPERADOR_QR",
    standId: "",
    standName: "",
    empresaNome: ""
  };
}

export default function InternalUsersPanel({
  users,
  currentUserId,
  onCreate,
  onToggleActive,
  onUpdatePermissions,
  onUpdateUser
}) {
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [savingCreate, setSavingCreate] = useState(false);
  const [rowLoadingId, setRowLoadingId] = useState("");
  const [editingUserId, setEditingUserId] = useState("");
  const [draftPermissions, setDraftPermissions] = useState(initialPermissions());
  const [draftUser, setDraftUser] = useState({
    standId: "",
    standName: "",
    empresaNome: ""
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
    setSavingCreate(true);
    setError("");
    setMessage("");
    try {
      await onCreate({
        ...form,
        permissoesCustomizadas: form.role === "OPERADOR_QR" ? initialPermissions() : null
      });
      setForm(emptyForm());
      setMessage("Usuario criado com sucesso.");
    } catch (createError) {
      setError(createError.message || "Erro ao criar usuario.");
    } finally {
      setSavingCreate(false);
    }
  }

  function beginEdit(user) {
    setEditingUserId(user.id);
    setDraftPermissions({ ...initialPermissions(), ...(user.permissoesCustomizadas || {}) });
    setDraftUser({
      standId: user.standId || "",
      standName: user.standName || "",
      empresaNome: user.empresaNome || ""
    });
    setError("");
    setMessage("");
  }

  async function saveEdit(user) {
    setRowLoadingId(user.id);
    setError("");
    setMessage("");
    try {
      if (user.role === "OPERADOR_QR") {
        await onUpdatePermissions(user.id, draftPermissions);
      }
      await onUpdateUser(user.id, {
        standId: draftUser.standId,
        standName: draftUser.standName,
        empresaNome: draftUser.empresaNome
      });
      setEditingUserId("");
      setMessage("Alteracoes salvas com sucesso.");
    } catch (saveError) {
      setError(saveError.message || "Falha ao salvar alteracoes.");
    } finally {
      setRowLoadingId("");
    }
  }

  return (
    <section className="card">
      <h3>Usuarios Internos</h3>
      <form className="grid" onSubmit={handleCreate}>
        <label>
          Nome
          <input
            value={form.nome}
            onChange={(e) => setForm((prev) => ({ ...prev, nome: e.target.value }))}
            required
          />
        </label>
        <label>
          Email
          <input
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            required
          />
        </label>
        <label>
          Senha
          <input
            type="password"
            value={form.senha}
            onChange={(e) => setForm((prev) => ({ ...prev, senha: e.target.value }))}
            required
          />
        </label>
        <label>
          Perfil
          <select
            value={form.role}
            onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
          >
            <option value="ADMIN">ADMIN</option>
            <option value="OPERADOR_QR">OPERADOR_QR</option>
          </select>
        </label>
        <label>
          Stand ID
          <input
            value={form.standId}
            onChange={(e) => setForm((prev) => ({ ...prev, standId: e.target.value }))}
          />
        </label>
        <label>
          Nome do Stand
          <input
            value={form.standName}
            onChange={(e) => setForm((prev) => ({ ...prev, standName: e.target.value }))}
          />
        </label>
        <label>
          Empresa
          <input
            value={form.empresaNome}
            onChange={(e) => setForm((prev) => ({ ...prev, empresaNome: e.target.value }))}
          />
        </label>
        <button type="submit" disabled={savingCreate}>
          {savingCreate ? "Criando..." : "Criar usuario"}
        </button>
      </form>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Role</th>
              <th>Stand</th>
              <th>Empresa</th>
              <th>Ativo</th>
              <th>Acoes</th>
            </tr>
          </thead>
          <tbody>
            {visibleUsers.map((user) => {
              const isEditing = editingUserId === user.id;
              const savingRow = rowLoadingId === user.id;
              return (
                <tr key={user.id}>
                  <td>{user.nome}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{isEditing ? <input value={draftUser.standName} onChange={(e) => setDraftUser((prev) => ({ ...prev, standName: e.target.value }))} /> : user.standName || "-"}</td>
                  <td>{isEditing ? <input value={draftUser.empresaNome} onChange={(e) => setDraftUser((prev) => ({ ...prev, empresaNome: e.target.value }))} /> : user.empresaNome || "-"}</td>
                  <td>{user.ativo ? "Sim" : "Nao"}</td>
                  <td className="table-actions">
                    <button
                      type="button"
                      disabled={savingRow}
                      onClick={async () => {
                        setRowLoadingId(user.id);
                        setError("");
                        setMessage("");
                        try {
                          await onToggleActive(user.id, !user.ativo);
                          setMessage("Status atualizado com sucesso.");
                        } catch (toggleError) {
                          setError(toggleError.message || "Falha ao atualizar status.");
                        } finally {
                          setRowLoadingId("");
                        }
                      }}
                    >
                      {savingRow ? "Salvando..." : user.ativo ? "Desativar" : "Ativar"}
                    </button>
                    {!isEditing && (
                      <button type="button" onClick={() => beginEdit(user)}>
                        Editar
                      </button>
                    )}
                    {isEditing && (
                      <>
                        {user.role === "OPERADOR_QR" && (
                          <button
                            type="button"
                            onClick={() =>
                              setDraftPermissions((prev) => ({
                                ...prev,
                                podeUsarCameraParaLeituraQR: !prev.podeUsarCameraParaLeituraQR
                              }))
                            }
                          >
                            Camera: {draftPermissions.podeUsarCameraParaLeituraQR ? "ON" : "OFF"}
                          </button>
                        )}
                        <button type="button" disabled={savingRow} onClick={() => saveEdit(user)}>
                          {savingRow ? "Salvando..." : "Salvar"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingUserId("");
                            setDraftPermissions(initialPermissions());
                          }}
                        >
                          Cancelar
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
          <h4>Permissoes do Operador</h4>
          <div className="grid">
            {Object.entries(draftPermissions).map(([key, value]) => (
              <label key={key} className="checkbox">
                <input
                  type="checkbox"
                  checked={value === true}
                  onChange={(event) =>
                    setDraftPermissions((prev) => ({ ...prev, [key]: event.target.checked }))
                  }
                />
                {key}
              </label>
            ))}
          </div>
          <label>
            Stand ID
            <input
              value={draftUser.standId}
              onChange={(e) => setDraftUser((prev) => ({ ...prev, standId: e.target.value }))}
            />
          </label>
        </section>
      )}
    </section>
  );
}

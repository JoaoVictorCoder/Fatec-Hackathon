import { useState } from "react";

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

export default function InternalUsersPanel({
  users,
  onCreate,
  onToggleActive,
  onUpdatePermissions
}) {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    role: "OPERADOR_QR"
  });

  return (
    <section className="card">
      <h3>Usuarios Internos</h3>
      <form
        className="grid"
        onSubmit={(event) => {
          event.preventDefault();
          onCreate({
            ...form,
            permissoesCustomizadas:
              form.role === "OPERADOR_QR" ? initialPermissions() : null
          });
          setForm({ nome: "", email: "", senha: "", role: "OPERADOR_QR" });
        }}
      >
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
        <button type="submit">Criar usuario</button>
      </form>

      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Role</th>
              <th>Ativo</th>
              <th>Acoes</th>
            </tr>
          </thead>
          <tbody>
            {(users || []).map((user) => (
              <tr key={user.id}>
                <td>{user.nome}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.ativo ? "Sim" : "Nao"}</td>
                <td className="table-actions">
                  <button type="button" onClick={() => onToggleActive(user.id, !user.ativo)}>
                    {user.ativo ? "Desativar" : "Ativar"}
                  </button>
                  {user.role === "OPERADOR_QR" && (
                    <button
                      type="button"
                      onClick={() =>
                        onUpdatePermissions(user.id, {
                          ...initialPermissions(),
                          ...(user.permissoesCustomizadas || {}),
                          podeRegistrarObservacaoOperacional:
                            !(user.permissoesCustomizadas?.podeRegistrarObservacaoOperacional === true)
                        })
                      }
                    >
                      Alternar obs.
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

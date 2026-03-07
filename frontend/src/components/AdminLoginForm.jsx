import { useState } from "react";

export default function AdminLoginForm({
  onSubmit,
  loading,
  error,
  title = "Login Administrativo",
  subtitle = "Area restrita para equipe organizadora."
}) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  return (
    <section className="card auth-card">
      <h2>{title}</h2>
      <p>{subtitle}</p>

      <form
        className="grid single-column"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit({ email, senha });
        }}
      >
        <label>
          E-mail
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label>
          Senha
          <input
            type="password"
            value={senha}
            onChange={(event) => setSenha(event.target.value)}
            required
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      {error && <p className="error">{error}</p>}
    </section>
  );
}

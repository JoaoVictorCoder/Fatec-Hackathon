import { useState } from "react";
import { t } from "../locales";

export default function AdminLoginForm({
  onSubmit,
  loading,
  error,
  title = t("auth.admin.title"),
  subtitle = t("auth.admin.subtitle")
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <section className="card auth-card">
      <h2>{title}</h2>
      <p className="section-subtitle">{subtitle}</p>

      <form
        className="grid single-column"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit({ email, senha: password });
        }}
      >
        <label>
          {t("auth.email")}
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label>
          {t("auth.password")}
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? t("auth.signingIn") : t("auth.signIn")}
        </button>
      </form>

      {error && <p className="error">{error}</p>}
    </section>
  );
}

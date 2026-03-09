import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInOperator } from "../api/platformApi";
import AdminLoginForm from "../components/AdminLoginForm";
import { t } from "../locales";

export default function OperatorLoginPage({ onLoggedIn }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  return (
    <main className="auth-layout">
      <section className="auth-hero card">
        <h2>{t("auth.operator.heroTitle")}</h2>
        <p>{t("auth.operator.heroSubtitle")}</p>
      </section>
      <AdminLoginForm
        loading={loading}
        error={error}
        title={t("auth.operator.title")}
        subtitle={t("auth.operator.subtitle")}
        onSubmit={async (payload) => {
          setLoading(true);
          setError("");
          try {
            const data = await signInOperator(payload);
            onLoggedIn(data.admin);
            navigate("/operator");
          } catch (loginError) {
            setError(loginError.message || t("auth.operator.fallbackError"));
          } finally {
            setLoading(false);
          }
        }}
      />
    </main>
  );
}

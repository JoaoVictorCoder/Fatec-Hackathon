import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInAdmin } from "../api/platformApi";
import AdminLoginForm from "../components/AdminLoginForm";
import { t } from "../locales";

export default function AdminLoginPage({ onLoggedIn }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  return (
    <main className="auth-layout">
      <section className="auth-hero card">
        <h2>{t("auth.admin.heroTitle")}</h2>
        <p>{t("auth.admin.heroSubtitle")}</p>
      </section>
      <AdminLoginForm
        loading={loading}
        error={error}
        title={t("auth.admin.title")}
        subtitle={t("auth.admin.subtitle")}
        onSubmit={async (payload) => {
          setLoading(true);
          setError("");
          try {
            const data = await signInAdmin(payload);
            if (data.admin?.role === "OPERADOR_QR") {
              throw new Error(t("auth.admin.operatorProfileError"));
            }
            onLoggedIn(data.admin);
            navigate("/admin");
          } catch (loginError) {
            setError(loginError.message || t("auth.admin.fallbackError"));
          } finally {
            setLoading(false);
          }
        }}
      />
    </main>
  );
}

import { useMemo, useState } from "react";

function getDeviceId() {
  const key = "operator_device_id";
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const created = `dev-${crypto.randomUUID()}`;
  localStorage.setItem(key, created);
  return created;
}

function deviceInfo() {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screen: `${window.screen.width}x${window.screen.height}`
  };
}

export default function OperatorConsole({ operator, onValidate, history, loading }) {
  const [codigoUnico, setCodigoUnico] = useState("");
  const [observacaoOperacional, setObservacaoOperacional] = useState("");
  const [result, setResult] = useState(null);
  const localDeviceId = useMemo(() => getDeviceId(), []);

  return (
    <main className="single-page operator-page">
      <section className="card">
        <h2>Operador QR</h2>
        <p>{operator?.nome} - {operator?.role}</p>
        <p>Device ID: {localDeviceId}</p>

        <form
          className="grid single-column"
          onSubmit={async (event) => {
            event.preventDefault();
            const response = await onValidate({
              codigoUnico,
              gateCode: "MOBILE-OPERATOR",
              accessPoint: "Entrada Principal",
              deviceId: localDeviceId,
              deviceInfo: deviceInfo(),
              observacaoOperacional
            });
            setResult(response);
          }}
        >
          <label>
            Codigo/QR da credencial
            <input value={codigoUnico} onChange={(e) => setCodigoUnico(e.target.value)} required />
          </label>
          <label>
            Observacao operacional
            <input
              value={observacaoOperacional}
              onChange={(e) => setObservacaoOperacional(e.target.value)}
            />
          </label>
          <button type="submit" disabled={loading}>{loading ? "Validando..." : "Validar entrada"}</button>
        </form>

        {result && (
          <div className={result.resultado === "ALLOW" ? "success-box" : "error-box"}>
            <strong>{result.resultado === "ALLOW" ? "Acesso Liberado" : "Acesso Negado"}</strong>
            <p>Motivo: {result.motivo}</p>
            <p>Credenciado: {result.credenciado?.nomeCompleto || "-"}</p>
            <p>Categoria: {result.credenciado?.categoria || "-"}</p>
          </div>
        )}
      </section>

      <section className="card">
        <h3>Historico basico</h3>
        <ul className="event-list compact">
          {(history || []).map((item) => (
            <li key={item.id} className="event-item">
              <strong>{item.resultado}</strong>
              <span>{item.nomeCredenciado || "Sem vinculo"}</span>
              <small>{new Date(item.createdAt).toLocaleString("pt-BR")}</small>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";

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

function decodeCodigoFromQrText(text) {
  if (!text) return "";
  const trimmed = String(text).trim();
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed?.credentialCode) return String(parsed.credentialCode).trim();
  } catch {
    // no-op
  }
  return trimmed;
}

export default function OperatorConsole({ operator, onValidate, history, loading }) {
  const [codigoUnico, setCodigoUnico] = useState("");
  const [observacaoOperacional, setObservacaoOperacional] = useState("");
  const [result, setResult] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [scanStatus, setScanStatus] = useState("idle");
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanTimerRef = useRef(null);
  const lastReadRef = useRef({ text: "", at: 0 });
  const validatingRef = useRef(false);
  const localDeviceId = useMemo(() => getDeviceId(), []);

  const canUseCamera = operator?.permissoesCustomizadas?.podeUsarCameraParaLeituraQR !== false;

  function stopCamera() {
    if (scanTimerRef.current) {
      window.clearInterval(scanTimerRef.current);
      scanTimerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setScanStatus("idle");
  }

  async function validateByCode(rawText) {
    const decodedCode = decodeCodigoFromQrText(rawText);
    if (!decodedCode) return;
    const now = Date.now();
    if (lastReadRef.current.text === decodedCode && now - lastReadRef.current.at < 3000) {
      return;
    }
    lastReadRef.current = { text: decodedCode, at: now };
    setScanStatus("validating");
    validatingRef.current = true;
    try {
      const response = await onValidate({
        codigoUnico: decodedCode,
        gateCode: "MOBILE-OPERATOR",
        accessPoint: operator?.standName || "Entrada Principal",
        deviceId: localDeviceId,
        deviceInfo: deviceInfo(),
        observacaoOperacional
      });
      setCodigoUnico(decodedCode);
      setResult(response);
      setScanStatus("idle");
    } finally {
      validatingRef.current = false;
    }
  }

  async function startCamera() {
    setCameraError("");
    if (!canUseCamera) {
      setCameraError("Seu perfil nao possui permissao para usar camera.");
      return;
    }
    if (!("BarcodeDetector" in window)) {
      setCameraError("Leitura por camera nao suportada neste navegador.");
      return;
    }

    try {
      const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
      setScanStatus("scanning");

      scanTimerRef.current = window.setInterval(async () => {
        if (!videoRef.current || validatingRef.current) return;
        try {
          const results = await detector.detect(videoRef.current);
          if (results?.length) {
            await validateByCode(results[0].rawValue || "");
          }
        } catch {
          // leitura continua
        }
      }, 450);
    } catch (error) {
      setCameraError("Nao foi possivel acessar a camera. Verifique permissoes.");
      stopCamera();
      console.error(error);
    }
  }

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <main className="single-page operator-page">
      <section className="card card-elevated">
        <h2>Operador QR</h2>
        <p className="section-subtitle">
          {operator?.nome} - {operator?.role} | Stand: {operator?.standName || "-"}
        </p>
        <p className="hint-text">Device ID: {localDeviceId}</p>

        <div className="toolbar">
          {!cameraActive ? (
            <button type="button" onClick={startCamera} disabled={loading}>
              Ler QR Code
            </button>
          ) : (
            <button type="button" className="btn-danger" onClick={stopCamera}>
              Parar camera
            </button>
          )}
          <span className="hint-text">
            {scanStatus === "scanning" && "Camera ativa: aponte para o QR"}
            {scanStatus === "validating" && "Validando leitura..."}
          </span>
        </div>

        {cameraActive && (
          <div className="operator-camera-wrap">
            <video ref={videoRef} className="operator-camera" muted playsInline />
          </div>
        )}
        {cameraError && <p className="error">{cameraError}</p>}

        <form
          className="grid single-column"
          onSubmit={async (event) => {
            event.preventDefault();
            await validateByCode(codigoUnico);
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
          <button type="submit" disabled={loading}>
            {loading ? "Validando..." : "Validar entrada"}
          </button>
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

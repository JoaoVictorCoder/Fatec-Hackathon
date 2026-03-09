import { useEffect, useMemo, useRef, useState } from "react";
import jsQR from "jsqr";
import { t } from "../locales";

function getPersistentDeviceId() {
  const key = "operator_device_id";
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const created = `dev-${crypto.randomUUID()}`;
  localStorage.setItem(key, created);
  return created;
}

function collectDeviceInfo() {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screen: `${window.screen.width}x${window.screen.height}`
  };
}

function parseCredentialCodeFromQrText(text) {
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

function buildVideoCandidates(videoDevices = []) {
  const rearDevices = videoDevices.filter((device) =>
    /back|rear|environment|traseira|tras|externa/i.test(device.label || "")
  );
  const frontDevices = videoDevices.filter((device) =>
    /front|user|frontal|selfie/i.test(device.label || "")
  );
  const remainingDevices = videoDevices.filter(
    (device) => !rearDevices.includes(device) && !frontDevices.includes(device)
  );

  const orderedDevices = [...rearDevices, ...remainingDevices, ...frontDevices];

  return [
    ...orderedDevices.map((device) => ({
      video: {
        deviceId: { exact: device.deviceId },
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    })),
    {
      video: {
        facingMode: { ideal: "environment" },
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    },
    {
      video: {
        facingMode: { ideal: "user" },
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    },
    { video: true, audio: false }
  ];
}

export default function OperatorConsole({ operator, onValidate, history, loading }) {
  const [credentialCode, setCredentialCode] = useState("");
  const [operationalNote, setOperationalNote] = useState("");
  const [result, setResult] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [scanStatus, setScanStatus] = useState("idle");

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);
  const detectorRef = useRef(null);
  const canvasRef = useRef(null);
  const lastReadRef = useRef({ text: "", at: 0 });
  const isValidatingRef = useRef(false);
  const localDeviceId = useMemo(() => getPersistentDeviceId(), []);

  const canUseCamera = operator?.permissoesCustomizadas?.podeUsarCameraParaLeituraQR !== false;

  function stopCamera() {
    if (animationFrameRef.current) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setScanStatus("idle");
  }

  async function waitForVideoReady(videoElement) {
    if ((videoElement.videoWidth || 0) > 0 && (videoElement.videoHeight || 0) > 0) {
      return;
    }

    await new Promise((resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        cleanup();
        reject(new Error("video_not_ready"));
      }, 2500);

      function cleanup() {
        window.clearTimeout(timeoutId);
        videoElement.removeEventListener("loadedmetadata", handleReady);
        videoElement.removeEventListener("canplay", handleReady);
        videoElement.removeEventListener("playing", handleReady);
      }

      function handleReady() {
        if ((videoElement.videoWidth || 0) > 0 && (videoElement.videoHeight || 0) > 0) {
          cleanup();
          resolve();
        }
      }

      videoElement.addEventListener("loadedmetadata", handleReady);
      videoElement.addEventListener("canplay", handleReady);
      videoElement.addEventListener("playing", handleReady);
    });
  }

  async function openVideoWithFallback() {
    const videoDevices = navigator.mediaDevices?.enumerateDevices
      ? (await navigator.mediaDevices.enumerateDevices()).filter(
          (device) => device.kind === "videoinput"
        )
      : [];
    const candidates = buildVideoCandidates(videoDevices);

    let lastError = null;
    for (const constraints of candidates) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (!videoRef.current) return stream;
        const videoElement = videoRef.current;
        videoElement.setAttribute("autoplay", "true");
        videoElement.setAttribute("muted", "true");
        videoElement.setAttribute("playsinline", "true");
        videoElement.muted = true;
        videoElement.defaultMuted = true;
        videoElement.playsInline = true;
        videoElement.autoplay = true;
        videoElement.srcObject = stream;
        await videoElement.play();
        await waitForVideoReady(videoElement);

        if ((videoElement.videoWidth || 0) > 0 && (videoElement.videoHeight || 0) > 0) {
          return stream;
        }
        stream.getTracks().forEach((track) => track.stop());
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError || new Error("camera_unavailable");
  }

  async function validateByCode(rawText) {
    const decodedCode = parseCredentialCodeFromQrText(rawText);
    if (!decodedCode) return;

    const now = Date.now();
    if (lastReadRef.current.text === decodedCode && now - lastReadRef.current.at < 3000) {
      return;
    }

    lastReadRef.current = { text: decodedCode, at: now };
    setScanStatus("validating");
    isValidatingRef.current = true;

    try {
      const response = await onValidate({
        codigoUnico: decodedCode,
        gateCode: "MOBILE-OPERATOR",
        accessPoint: operator?.standName || t("operatorConsole.defaultAccessPoint"),
        deviceId: localDeviceId,
        deviceInfo: collectDeviceInfo(),
        observacaoOperacional: operationalNote
      });
      setCredentialCode(decodedCode);
      setResult(response);
      setScanStatus("idle");
    } finally {
      isValidatingRef.current = false;
    }
  }

  async function startCamera() {
    setCameraError("");

    if (!canUseCamera) {
      setCameraError(t("operatorConsole.permissionError"));
      return;
    }

    if (!navigator?.mediaDevices?.getUserMedia) {
      setCameraError(t("operatorConsole.unsupportedCamera"));
      return;
    }

    try {
      if ("BarcodeDetector" in window) {
        detectorRef.current = new window.BarcodeDetector({ formats: ["qr_code"] });
      } else {
        detectorRef.current = null;
      }

      const stream = await openVideoWithFallback();
      streamRef.current = stream;
      setIsCameraActive(true);
      setScanStatus("scanning");

      const detectOnce = async () => {
        if (!videoRef.current || isValidatingRef.current || videoRef.current.readyState < 2) {
          animationFrameRef.current = window.requestAnimationFrame(detectOnce);
          return;
        }

        if (!videoRef.current || isValidatingRef.current) return;

        try {
          if (detectorRef.current) {
            const results = await detectorRef.current.detect(videoRef.current);
            if (results?.length) {
              await validateByCode(results[0].rawValue || "");
            }
          } else {
            const videoElement = videoRef.current;
            if (!canvasRef.current) {
              canvasRef.current = document.createElement("canvas");
            }
            const canvas = canvasRef.current;
            canvas.width = videoElement.videoWidth || 640;
            canvas.height = videoElement.videoHeight || 480;
            const context = canvas.getContext("2d", { willReadFrequently: true });
            if (context) {
              context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
              const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
              const qr = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: "attemptBoth"
              });
              if (qr?.data) {
                await validateByCode(qr.data);
              }
            }
          }
        } catch {
          // keep scanning
        } finally {
          animationFrameRef.current = window.requestAnimationFrame(detectOnce);
        }
      };

      animationFrameRef.current = window.requestAnimationFrame(detectOnce);
    } catch (error) {
      if (error?.name === "NotAllowedError" || error?.name === "PermissionDeniedError") {
        setCameraError(t("operatorConsole.deniedCamera"));
      } else if (error?.name === "NotFoundError" || error?.name === "DevicesNotFoundError") {
        setCameraError(t("operatorConsole.noCamera"));
      } else {
        setCameraError(t("operatorConsole.genericCameraError"));
      }
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
        <h2>{t("operatorConsole.title")}</h2>
        <p className="section-subtitle">
          {t("operatorConsole.subtitle", {
            name: operator?.nome || "-",
            role: operator?.role || "-",
            unit: operator?.standName || "-"
          })}
        </p>
        <p className="hint-text">{t("operatorConsole.deviceId", { id: localDeviceId })}</p>

        <div className="toolbar">
          {!isCameraActive ? (
            <button type="button" onClick={startCamera} disabled={loading}>
              {t("operatorConsole.startQrScan")}
            </button>
          ) : (
            <button type="button" className="btn-danger" onClick={stopCamera}>
              {t("operatorConsole.stopCamera")}
            </button>
          )}
          <span className="hint-text">
            {scanStatus === "scanning" && t("operatorConsole.scanningHint")}
            {scanStatus === "validating" && t("operatorConsole.validatingHint")}
          </span>
        </div>

        {isCameraActive && (
          <div className="operator-camera-wrap">
            <video ref={videoRef} className="operator-camera" muted playsInline autoPlay />
          </div>
        )}
        {cameraError && <p className="error">{cameraError}</p>}

        <form
          className="grid single-column"
          onSubmit={async (event) => {
            event.preventDefault();
            await validateByCode(credentialCode);
          }}
        >
          <label>
            {t("operatorConsole.credentialInput")}
            <input
              value={credentialCode}
              onChange={(event) => setCredentialCode(event.target.value)}
              required
            />
          </label>
          <label>
            {t("operatorConsole.operationalNote")}
            <input
              value={operationalNote}
              onChange={(event) => setOperationalNote(event.target.value)}
            />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? t("operatorConsole.validatingHint") : t("operatorConsole.validateAccess")}
          </button>
        </form>

        {result && (
          <div className={result.resultado === "ALLOW" ? "success-box" : "error-box"}>
            <strong>
              {result.resultado === "ALLOW" ? t("operatorConsole.allowed") : t("operatorConsole.denied")}
            </strong>
            <p>{t("operatorConsole.reason", { reason: result.motivo || "-" })}</p>
            <p>{t("operatorConsole.participant", { name: result.credenciado?.nomeCompleto || "-" })}</p>
            <p>{t("operatorConsole.category", { category: result.credenciado?.categoria || "-" })}</p>
          </div>
        )}
      </section>

      <section className="card">
        <h3>{t("operatorConsole.historyTitle")}</h3>
        <ul className="event-list compact">
          {(history || []).map((item) => (
            <li key={item.id} className="event-item">
              <strong>{item.resultado}</strong>
              <span>{item.nomeCredenciado || t("operatorConsole.historyNoParticipant")}</span>
              <small>{new Date(item.createdAt).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

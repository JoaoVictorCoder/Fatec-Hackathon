const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    if (typeof data === "object" && data !== null) {
      throw new Error(data.error || (data.errors || []).join(", ") || "Erro na API");
    }
    throw new Error("Erro na API");
  }
  return data;
}

function adminFetch(path, options = {}) {
  return fetch(`${API_URL}${path}`, {
    credentials: "include",
    ...options
  });
}

export async function createCredenciadoPublic(payload) {
  const response = await fetch(`${API_URL}/credenciados`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return parseResponse(response);
}

export async function getPublicCredencialQr(id) {
  const response = await fetch(`${API_URL}/credenciais/${id}/qrcode`);
  return parseResponse(response);
}

export function getPublicCredencialPdfUrl(id) {
  return `${API_URL}/credenciais/${id}/pdf`;
}

export async function login(payload) {
  const response = await adminFetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return parseResponse(response);
}

export async function me() {
  const response = await adminFetch("/auth/me");
  return parseResponse(response);
}

export async function logout() {
  const response = await adminFetch("/auth/logout", {
    method: "POST"
  });
  return parseResponse(response);
}

export async function getAdminCredenciados({ page = 1, pageSize = 10, search = "", categoria = "" }) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));
  if (search) {
    params.set("search", search);
  }
  if (categoria) {
    params.set("categoria", categoria);
  }
  const response = await adminFetch(`/admin/credenciados?${params.toString()}`);
  return parseResponse(response);
}

export async function getAdminCredenciadoById(id) {
  const response = await adminFetch(`/admin/credenciados/${id}`);
  return parseResponse(response);
}

export async function getAdminCredenciadoEventos(id) {
  const response = await adminFetch(`/admin/credenciados/${id}/eventos?limit=100`);
  return parseResponse(response);
}

export async function updateAdminCredenciado(id, payload) {
  const response = await adminFetch(`/admin/credenciados/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return parseResponse(response);
}

export async function patchAdminCredenciadoStatus(id, payload) {
  const response = await adminFetch(`/admin/credenciados/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return parseResponse(response);
}

export async function softDeleteAdminCredenciado(id, motivo = "") {
  const response = await adminFetch(`/admin/credenciados/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ motivo })
  });
  return parseResponse(response);
}

export async function createAdminComissao(payload) {
  const response = await adminFetch("/admin/credenciados/comissao-organizadora", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return parseResponse(response);
}

export async function getAdminEventos({ limit = 100, tipoEvento = "" } = {}) {
  const params = new URLSearchParams();
  params.set("limit", String(limit));
  if (tipoEvento) {
    params.set("tipoEvento", tipoEvento);
  }
  const response = await adminFetch(`/admin/eventos?${params.toString()}`);
  return parseResponse(response);
}

export async function getAdminCredencialById(id) {
  const response = await adminFetch(`/admin/credenciais/${id}`);
  return parseResponse(response);
}

export async function updateAdminCredencial(id, payload) {
  const response = await adminFetch(`/admin/credenciais/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return parseResponse(response);
}

export async function patchAdminCredencialStatus(id, payload) {
  const response = await adminFetch(`/admin/credenciais/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return parseResponse(response);
}

export async function reissueAdminCredencial(id, payload = {}) {
  const response = await adminFetch(`/admin/credenciais/${id}/reemitir`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return parseResponse(response);
}

export async function getAdminAuditLogs({ page = 1, pageSize = 20 } = {}) {
  const response = await adminFetch(`/admin/audit-logs?page=${page}&pageSize=${pageSize}`);
  return parseResponse(response);
}

export async function validateAdminCheckIn(payload) {
  const response = await adminFetch("/admin/check-in/validate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return parseResponse(response);
}

export async function getAdminAnalyticsOverview() {
  const response = await adminFetch("/admin/analytics/overview");
  return parseResponse(response);
}

export async function getAdminAnalyticsFraud() {
  const response = await adminFetch("/admin/analytics/fraud");
  return parseResponse(response);
}

export async function getAdminAnalyticsDescarbonizacao() {
  const response = await adminFetch("/admin/analytics/descarbonizacao");
  return parseResponse(response);
}

export async function getAdminUsers() {
  const response = await adminFetch("/admin/users");
  return parseResponse(response);
}

export async function createAdminUser(payload) {
  const response = await adminFetch("/admin/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return parseResponse(response);
}

export async function updateAdminUser(id, payload) {
  const response = await adminFetch(`/admin/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return parseResponse(response);
}

export async function patchAdminUserActive(id, ativo) {
  const response = await adminFetch(`/admin/users/${id}/active`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ativo })
  });
  return parseResponse(response);
}

export async function patchAdminUserPermissions(id, permissoesCustomizadas) {
  const response = await adminFetch(`/admin/users/${id}/permissions`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ permissoesCustomizadas })
  });
  return parseResponse(response);
}

export async function getAdminAccessLogs(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });
  const response = await adminFetch(`/admin/access-logs?${query.toString()}`);
  return parseResponse(response);
}

export async function getAdminBackupStatus() {
  const response = await adminFetch("/admin/backup/status");
  return parseResponse(response);
}

export async function exportAdminBackup() {
  const response = await adminFetch("/admin/backup/export", {
    method: "POST"
  });
  return parseResponse(response);
}

export async function operatorLogin(payload) {
  const response = await adminFetch("/auth/operator/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return parseResponse(response);
}

export async function operatorMe() {
  const response = await adminFetch("/operator/me");
  return parseResponse(response);
}

export async function operatorValidateCheckIn(payload) {
  const response = await adminFetch("/operator/check-in/validate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return parseResponse(response);
}

export async function operatorHistoryBasic() {
  const response = await adminFetch("/operator/history-basic");
  return parseResponse(response);
}

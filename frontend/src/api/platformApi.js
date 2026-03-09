const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

async function parseApiResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  const parsedBody = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    if (typeof parsedBody === "object" && parsedBody !== null) {
      throw new Error(parsedBody.error || (parsedBody.errors || []).join(", ") || "API error");
    }
    throw new Error("API error");
  }

  return parsedBody;
}

function authenticatedFetch(path, options = {}) {
  return fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...options
  });
}

function buildQueryString(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });
  return query.toString();
}

export async function createPublicParticipant(payload) {
  const response = await fetch(`${API_BASE_URL}/credenciados`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return parseApiResponse(response);
}

export async function getPublicCredentialQr(credentialId) {
  const response = await fetch(`${API_BASE_URL}/credenciais/${credentialId}/qrcode`);
  return parseApiResponse(response);
}

export function getPublicCredentialPdfUrl(credentialId) {
  return `${API_BASE_URL}/credenciais/${credentialId}/pdf`;
}

export async function signInAdmin(payload) {
  const response = await authenticatedFetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return parseApiResponse(response);
}

export async function signInOperator(payload) {
  const response = await authenticatedFetch("/auth/operator/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return parseApiResponse(response);
}

export async function getCurrentSession() {
  const response = await authenticatedFetch("/auth/me");
  return parseApiResponse(response);
}

export async function signOutSession() {
  const response = await authenticatedFetch("/auth/logout", { method: "POST" });
  return parseApiResponse(response);
}

export async function listAdminParticipants({
  page = 1,
  pageSize = 10,
  search = "",
  category = ""
}) {
  const query = buildQueryString({ page, pageSize, search, categoria: category });
  const response = await authenticatedFetch(`/admin/credenciados?${query}`);
  return parseApiResponse(response);
}

export async function getAdminParticipantById(participantId) {
  const response = await authenticatedFetch(`/admin/credenciados/${participantId}`);
  return parseApiResponse(response);
}

export async function listAdminParticipantEvents(participantId) {
  const response = await authenticatedFetch(`/admin/credenciados/${participantId}/eventos?limit=100`);
  return parseApiResponse(response);
}

export async function updateAdminParticipant(participantId, payload) {
  const response = await authenticatedFetch(`/admin/credenciados/${participantId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return parseApiResponse(response);
}

export async function updateAdminParticipantStatus(participantId, payload) {
  const response = await authenticatedFetch(`/admin/credenciados/${participantId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return parseApiResponse(response);
}

export async function deactivateAdminParticipant(participantId, reason = "") {
  const response = await authenticatedFetch(`/admin/credenciados/${participantId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ motivo: reason })
  });
  return parseApiResponse(response);
}

export async function createAdminGovernanceParticipant(payload) {
  const response = await authenticatedFetch("/admin/credenciados/comissao-organizadora", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return parseApiResponse(response);
}

export async function listAdminSystemEvents({ limit = 100, eventType = "" } = {}) {
  const query = buildQueryString({ limit, tipoEvento: eventType });
  const response = await authenticatedFetch(`/admin/eventos?${query}`);
  return parseApiResponse(response);
}

export async function getAdminCredentialById(credentialId) {
  const response = await authenticatedFetch(`/admin/credenciais/${credentialId}`);
  return parseApiResponse(response);
}

export async function updateAdminCredential(credentialId, payload) {
  const response = await authenticatedFetch(`/admin/credenciais/${credentialId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return parseApiResponse(response);
}

export async function updateAdminCredentialStatus(credentialId, payload) {
  const response = await authenticatedFetch(`/admin/credenciais/${credentialId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return parseApiResponse(response);
}

export async function reissueAdminCredential(credentialId, payload = {}) {
  const response = await authenticatedFetch(`/admin/credenciais/${credentialId}/reemitir`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return parseApiResponse(response);
}

export async function listAdminAuditLogs({ page = 1, pageSize = 20 } = {}) {
  const response = await authenticatedFetch(`/admin/audit-logs?page=${page}&pageSize=${pageSize}`);
  return parseApiResponse(response);
}

export async function runAdminCheckInValidation(payload) {
  const response = await authenticatedFetch("/admin/check-in/validate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return parseApiResponse(response);
}

export async function getAdminAnalyticsOverview() {
  const response = await authenticatedFetch("/admin/analytics/overview");
  return parseApiResponse(response);
}

export async function getAdminAnalyticsFraud() {
  const response = await authenticatedFetch("/admin/analytics/fraud");
  return parseApiResponse(response);
}

export async function getAdminAnalyticsCarbon() {
  const response = await authenticatedFetch("/admin/analytics/descarbonizacao");
  return parseApiResponse(response);
}

export async function listAdminUsers() {
  const response = await authenticatedFetch("/admin/users");
  return parseApiResponse(response);
}

export async function createAdminUser(payload) {
  const response = await authenticatedFetch("/admin/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return parseApiResponse(response);
}

export async function updateAdminUser(userId, payload) {
  const response = await authenticatedFetch(`/admin/users/${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return parseApiResponse(response);
}

export async function updateAdminUserActive(userId, isActive) {
  const response = await authenticatedFetch(`/admin/users/${userId}/active`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ativo: isActive })
  });
  return parseApiResponse(response);
}

export async function updateAdminUserPermissions(userId, customPermissions) {
  const response = await authenticatedFetch(`/admin/users/${userId}/permissions`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ permissoesCustomizadas: customPermissions })
  });
  return parseApiResponse(response);
}

export async function listAdminAccessLogs(params = {}) {
  const query = buildQueryString(params);
  const response = await authenticatedFetch(`/admin/access-logs?${query}`);
  return parseApiResponse(response);
}

export async function listAdminUnitVisitorsReport(params = {}) {
  const query = buildQueryString(params);
  const response = await authenticatedFetch(`/admin/reports/stand-visitors?${query}`);
  return parseApiResponse(response);
}

export async function getAdminBackupStatus() {
  const response = await authenticatedFetch("/admin/backup/status");
  return parseApiResponse(response);
}

export async function runAdminBackupExport() {
  const response = await authenticatedFetch("/admin/backup/export", { method: "POST" });
  return parseApiResponse(response);
}

export async function getOperatorSession() {
  const response = await authenticatedFetch("/operator/me");
  return parseApiResponse(response);
}

export async function runOperatorCheckInValidation(payload) {
  const response = await authenticatedFetch("/operator/check-in/validate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return parseApiResponse(response);
}

export async function listOperatorHistory() {
  const response = await authenticatedFetch("/operator/history-basic");
  return parseApiResponse(response);
}

export async function listGovernanceOperators() {
  const response = await authenticatedFetch("/commission/operators");
  return parseApiResponse(response);
}

export async function createGovernanceOperator(payload) {
  const response = await authenticatedFetch("/commission/operators", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return parseApiResponse(response);
}

export async function updateGovernanceOperator(operatorId, payload) {
  const response = await authenticatedFetch(`/commission/operators/${operatorId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return parseApiResponse(response);
}

export async function updateGovernanceOperatorActive(operatorId, isActive) {
  const response = await authenticatedFetch(`/commission/operators/${operatorId}/active`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ativo: isActive })
  });
  return parseApiResponse(response);
}

export async function listGovernanceAccessLogs(params = {}) {
  const query = buildQueryString(params);
  const response = await authenticatedFetch(`/commission/access-logs?${query}`);
  return parseApiResponse(response);
}

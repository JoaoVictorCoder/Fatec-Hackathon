import { useEffect, useState } from "react";
import {
	Navigate,
	NavLink,
	Route,
	Routes,
	useNavigate,
} from "react-router-dom";
import { getCurrentSession, signOutSession } from "./api/platformApi";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import AdminCredencialPage from "./pages/AdminCredencialPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import OperatorAreaPage from "./pages/OperatorAreaPage";
import OperatorLoginPage from "./pages/OperatorLoginPage";
import PublicAreaPage from "./pages/PublicAreaPage";
import { t } from "./locales";

function getTabClassName({ isActive }) {
	return isActive ? "tab active" : "tab";
}

function TabLink({ to, children, end = false }) {
	return (
		<NavLink to={to} end={end} className={getTabClassName}>
			{children}
		</NavLink>
	);
}

function AppHeader({ admin, operator, isOperatorSession }) {
	return (
		<header className="topbar">
			<div className="brand-block">
				<h1>{t("app.brandTitle")}</h1>
				<p>{t("app.brandSubtitle")}</p>
			</div>
			<nav className="tabs">
				<TabLink to="/" end>
					{t("app.tabs.public")}
				</TabLink>
				{!isOperatorSession && (
					<TabLink to={admin ? "/admin" : "/admin/login"}>{t("app.tabs.admin")}</TabLink>
				)}
				<TabLink to={operator ? "/operator" : "/operator/login"}>
					{t("app.tabs.operator")}
				</TabLink>
			</nav>
		</header>
	);
}

function normalizeSession(response) {
	const role = response.admin?.role;

	if (role === "OPERADOR_QR") {
		return { admin: null, operator: response.admin };
	}

	return { admin: response.admin, operator: null };
}

export default function App() {
	const navigate = useNavigate();
	const [adminUser, setAdminUser] = useState(null);
	const [operatorUser, setOperatorUser] = useState(null);
	const [isCheckingSession, setIsCheckingSession] = useState(true);
	const isOperatorSession = Boolean(operatorUser) && !adminUser;

	useEffect(() => {
		getCurrentSession()
			.then((response) => {
				const session = normalizeSession(response);
				setAdminUser(session.admin);
				setOperatorUser(session.operator);
			})
			.catch(() => {
				setAdminUser(null);
				setOperatorUser(null);
			})
			.finally(() => setIsCheckingSession(false));
	}, []);

	async function handleLogout() {
		await signOutSession();
		setAdminUser(null);
		setOperatorUser(null);
		navigate("/admin/login");
	}

	if (isCheckingSession) {
		return <p className="loading-screen">{t("app.loading")}</p>;
	}

	return (
		<div className="app-shell">
			<AppHeader
				admin={adminUser}
				operator={operatorUser}
				isOperatorSession={isOperatorSession}
			/>

			<Routes>
				<Route path="/" element={<PublicAreaPage />} />
				<Route
					path="/admin/login"
					element={<AdminLoginPage onLoggedIn={setAdminUser} />}
				/>
				<Route
					path="/operator/login"
					element={<OperatorLoginPage onLoggedIn={setOperatorUser} />}
				/>
				<Route
					path="/admin"
					element={
						<ProtectedAdminRoute admin={adminUser}>
							<AdminDashboardPage admin={adminUser} onLogout={handleLogout} />
						</ProtectedAdminRoute>
					}
				/>
				<Route
					path="/operator"
					element={
						<ProtectedAdminRoute admin={operatorUser}>
							<OperatorAreaPage operator={operatorUser} />
						</ProtectedAdminRoute>
					}
				/>
				<Route
					path="/admin/credenciais/:id"
					element={
						<ProtectedAdminRoute admin={adminUser}>
							<AdminCredencialPage />
						</ProtectedAdminRoute>
					}
				/>
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</div>
	);
}

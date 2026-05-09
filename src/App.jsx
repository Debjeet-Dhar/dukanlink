import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useNavigate,
  useLocation,
  Link,
} from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AppProvider, useApp } from "./context/AppContext";
import { Sidebar, BottomNav } from "./components/Navigation";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Settings from "./pages/Settings";
import DemoShop from "./pages/DemoShop";
import Admin from "./pages/Admin";
import AdminAccess from "./pages/AdminAccess";
import PublicShop from "./pages/PublicShop";
import { Loader2 } from "./components/Icons";

function AuthLayout() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const { shop, shopLoading } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  if (authLoading || (user && shopLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!user) {
    const redirectTo = `/login?next=${encodeURIComponent(location.pathname)}`;
    return <Navigate to={redirectTo} replace />;
  }

  // If user is not admin and has no shop, redirect to onboarding
  if (!shop && !isAdmin && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  // If user has a shop (or is admin) and tries to access onboarding, redirect to dashboard
  if ((shop || isAdmin) && location.pathname === "/onboarding") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

function AppShell() {
  const { user, isAdmin, signOut } = useAuth();
  const { shop } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const pathToPage = (path) => {
    if (path === "/" || path === "/dashboard") return "home";
    if (path === "/products") return "products";
    if (path === "/settings") return "settings";
    if (path === "/admin") return "admin";
    return "home";
  };

  const activePage = pathToPage(location.pathname);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Landing
            onGetStarted={() => navigate("/login")}
            onDemo={() => navigate("/demo")}
          />
        }
      />
      <Route path="/login" element={<Login onBack={() => navigate("/")} />} />
      <Route path="/demo" element={<DemoShop onBack={() => navigate("/")} />} />
      <Route path="/shop/:slug" element={<PublicShop />} />
      <Route
        path="/admin"
        element={
          isAdmin ? (
            <AppLayout
              page="admin"
              onLogout={handleLogout}
              shop={shop}
              isAdmin={isAdmin}
            />
          ) : (
            <AdminAccess />
          )
        }
      />

      <Route element={<AuthLayout />}>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route
          path="/dashboard"
          element={
            <AppLayout
              page={activePage}
              onLogout={handleLogout}
              shop={shop}
              isAdmin={isAdmin}
            />
          }
        />
        <Route
          path="/products"
          element={
            <AppLayout
              page={activePage}
              onLogout={handleLogout}
              shop={shop}
              isAdmin={isAdmin}
            />
          }
        />
        <Route
          path="/settings"
          element={
            <AppLayout
              page={activePage}
              onLogout={handleLogout}
              shop={shop}
              isAdmin={isAdmin}
            />
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function AppLayout({ page, onLogout, shop, isAdmin }) {
  const navigate = useNavigate();
  const location = useLocation();

  const renderPage = () => {
    switch (location.pathname) {
      case "/products":
        return <Products />;
      case "/settings":
        return <Settings onLogout={onLogout} />;
      case "/admin":
        return <Admin />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-surface-100 flex">
      <Sidebar
        active={page}
        onNavigate={(p) => {
          if (p === "home") navigate("/dashboard");
          else navigate(`/${p}`);
        }}
        onLogout={onLogout}
        shopName={shop?.name || ""}
        plan={shop?.plan || "free"}
        isAdmin={isAdmin}
      />

      <main className="flex-1 min-h-screen pb-24 md:pb-8">
        <div className="max-w-3xl lg:max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-8">
          {page !== "admin" && shop && (
            <div className="mb-5 flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow-soft border border-surface-200">
              <div className="flex items-center gap-2 text-sm text-surface-600">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M8 1.333a6.667 6.667 0 100 13.334A6.667 6.667 0 008 1.333zM8 6v2.667M8 10.667h.007"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="font-medium">
                  Preview your shop as customers see it
                </span>
              </div>
              <Link
                to={`/shop/${shop.slug}`}
                target="_blank"
                className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
              >
                Preview
              </Link>
            </div>
          )}
          {renderPage()}
        </div>
      </main>

      <BottomNav
        active={page}
        onNavigate={(p) => {
          if (p === "home") navigate("/dashboard");
          else navigate(`/${p}`);
        }}
        onLogout={onLogout}
        isAdmin={isAdmin}
      />
    </div>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppProvider>
            <AppShell />
          </AppProvider>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}

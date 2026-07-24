import { useLocation } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import PWAModal from "./components/PWAModal";
import Footer from "./components/Footer";
import NavBar from "./components/NavBar";
import useAuthCheck from "./hooks/useAuthCheck";
import { NavBarProvider } from "./components/NavBarContext";
import { RBACProvider } from "./context/RBACContext";
import { PermissionDebugProvider } from "./context/PermissionDebugContext";

export default function App() {
  const { token, isLoading } = useAuthCheck();
  const location = useLocation();
  const hideChrome = location.pathname.startsWith("/tasks/");

  if (isLoading || !token) {
    return <div className="loader">SSO-ya yönləndirilir...</div>;
  }

  return (
    <PermissionDebugProvider>
      <RBACProvider>
        <NavBarProvider>
          <PWAModal />
          {!hideChrome && <NavBar />}
          <AppRoutes />
          {!hideChrome && <Footer />}
        </NavBarProvider>
      </RBACProvider>
    </PermissionDebugProvider>
  );
}

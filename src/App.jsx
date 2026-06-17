import AppRoutes from "./routes/AppRoutes";
import PWAModal from "./components/PWAModal";
import Footer from "./components/Footer";
import NavBar from "./components/NavBar";
import useAuthCheck from "./hooks/useAuthCheck";

import { NavBarProvider } from "./components/NavBarContext";
import api from "./api";
import { use, useEffect } from "react";

export default function App() {
  const { token, isLoading } = useAuthCheck();
  if (isLoading || !token) {
    return <div className="loader">SSO-ya yönləndirilir...</div>;
  }
  
  return (
    <NavBarProvider>
      <PWAModal />
      <NavBar />
      <AppRoutes />
      <Footer />
    </NavBarProvider>
  );
}

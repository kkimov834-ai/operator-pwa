import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "antd-mobile/es/global";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { PWAProvider } from "./context/PWAContext.jsx";
import { PermissionDebugProvider } from "./context/PermissionDebugContext.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <PermissionDebugProvider>
      <PWAProvider>
        <App />
      </PWAProvider>
    </PermissionDebugProvider>
  </BrowserRouter>,
);

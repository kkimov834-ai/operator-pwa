import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "antd-mobile/es/global";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { PWAProvider } from "./context/PWAContext.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
   
    <PWAProvider>
      <App />
    </PWAProvider>
  </BrowserRouter>,
);

import { useContext } from "react";
import { PWAContext } from "./PWAContextValue";

export const usePWA = () => {
  const context = useContext(PWAContext);

  if (!context) {
    throw new Error("usePWA must be used inside PWAProvider");
  }

  return context;
};

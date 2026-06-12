import { useEffect, useState } from "react";
import { PWAContext } from "./PWAContextValue";

const getIsStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;

const getIsIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

export const PWAProvider = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS] = useState(getIsIOS);
  const [isStandalone] = useState(getIsStandalone);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const wasInstalled = localStorage.getItem("pwa_installed") === "true";
    const wasDismissed = localStorage.getItem("pwa_dismissed") === "true";

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };

    const handleAppInstalled = () => {
      localStorage.setItem("pwa_installed", "true");
      setShowModal(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    const timer = setTimeout(() => {
      if (!isStandalone && !wasInstalled && !wasDismissed) {
        setShowModal(true);
      }
    }, 2000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      clearTimeout(timer);
    };
  }, [isStandalone]);

  const installPWA = async () => {
    if (!deferredPrompt) {
      setShowModal(true);
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      localStorage.setItem("pwa_installed", "true");
      setShowModal(false);
    }

    setDeferredPrompt(null);
  };

  const closePrompt = () => setShowModal(false);

  const dismissPermanently = () => {
    localStorage.setItem("pwa_dismissed", "true");
    setShowModal(false);
  };

  return (
    <PWAContext.Provider
      value={{
        isStandalone,
        isIOS,
        deferredPrompt,
        showModal,
        setShowModal,
        installPWA,
        closePrompt,
        dismissPermanently,
      }}
    >
      {children}
    </PWAContext.Provider>
  );
};

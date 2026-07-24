import { usePWA } from "../context/usePWA";

const PWAModal = () => {
  const {
    deferredPrompt,
    installPWA,
    showModal,
    closePrompt,
    dismissPermanently,
  } = usePWA();

  if (!showModal) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>Tətbiqimizi Yükləyin!</h2>
        <p>
          Daha sürətli giriş və oflayn rejim üçün tətbiqi ana ekranınıza əlavə
          edin.
        </p>

        <div style={styles.actions}>
          {deferredPrompt ? (
            <button onClick={installPWA} style={styles.installBtn}>
              İndi Quraşdır
            </button>
          ) : (
            <div style={styles.iosInstruction}>
              <p>iOS-da quraşdırmaq üçün:</p>
              <ol>
                <li>
                  Aşağıdakı <b>"Paylaş"</b> (Share) ikonuna toxunun.
                </li>
                <li>
                  <b>"Ana Ekrana Əlavə Et"</b> (Add to Home Screen) seçin.
                </li>
              </ol>
            </div>
          )}
          <button onClick={closePrompt} style={styles.laterBtn}>
            Daha sonra
          </button>
          <button onClick={dismissPermanently} style={styles.dismissBtn}>
            Bir daha göstərmə
          </button>
        </div>
      </div>
    </div>
  );
};

// Mövzuya uyğunlaşdırılmış stillər
const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    padding: "20px",
  },
  modal: {
    backgroundColor: "var(--card-bg, #ffffff)",
    color: "var(--card-text, #000000)",
    padding: "24px 20px",
    borderRadius: "16px",
    textAlign: "center",
    maxWidth: "350px",
    width: "100%",
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
    border: "1px solid var(--border, #e5e7eb)",
  },
  actions: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "20px",
  },
  installBtn: {
    padding: "12px",
    backgroundColor: "var(--tab-active-bg, #7C3AED)",
    color: "var(--tab-active-text, #ffffff)",
    border: "none",
    borderRadius: "10px",
    fontWeight: "600",
    fontSize: "15px",
    cursor: "pointer",
  },
  laterBtn: {
    padding: "12px",
    backgroundColor: "var(--surface-bg, rgba(0,0,0,0.04))",
    color: "var(--card-text, #000000)",
    border: "1px solid var(--border, #e5e7eb)",
    borderRadius: "10px",
    fontWeight: "600",
    fontSize: "15px",
    cursor: "pointer",
  },
  dismissBtn: {
    padding: "10px",
    backgroundColor: "transparent",
    border: "none",
    color: "var(--muted-text, #9CA3AF)",
    fontWeight: "500",
    fontSize: "13px",
    cursor: "pointer",
  },
  iosInstruction: {
    backgroundColor: "var(--surface-bg, rgba(0,0,0,0.04))",
    border: "1px solid var(--border, #e5e7eb)",
    color: "var(--card-text, #000000)",
    padding: "12px",
    borderRadius: "10px",
    textAlign: "left",
    fontSize: "14px",
    lineHeight: "1.5",
  },
};

export default PWAModal;

/**
 * Simple imperative toast that works with React 19.
 * antd-mobile v5 Toast uses ReactDOM.unmountComponentAtNode which was removed in React 19.
 */

const TOAST_DURATION = 2500;

function createToast(icon, content) {
  // Remove any existing toast
  const existing = document.getElementById("__custom_toast__");
  if (existing) existing.remove();

  const container = document.createElement("div");
  container.id = "__custom_toast__";
  Object.assign(container.style, {
    position: "fixed",
    top: "0",
    left: "0",
    right: "0",
    bottom: "0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: "99999",
    pointerEvents: "none",
  });

  const box = document.createElement("div");
  Object.assign(box.style, {
    background: "rgba(0,0,0,0.78)",
    color: "#fff",
    borderRadius: "12px",
    padding: "16px 24px",
    fontSize: "14px",
    fontWeight: "500",
    textAlign: "center",
    maxWidth: "70vw",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
    animation: "toastFadeIn 0.2s ease",
    pointerEvents: "auto",
  });

  // Icon
  const iconEl = document.createElement("div");
  iconEl.style.fontSize = "28px";
  if (icon === "success") {
    iconEl.textContent = "✓";
    iconEl.style.color = "#52c41a";
  } else if (icon === "fail") {
    iconEl.textContent = "✕";
    iconEl.style.color = "#ff4d4f";
  }

  // Text
  const textEl = document.createElement("div");
  textEl.textContent = content;

  if (icon) box.appendChild(iconEl);
  box.appendChild(textEl);
  container.appendChild(box);

  // Add animation keyframes if not already present
  if (!document.getElementById("__toast_style__")) {
    const style = document.createElement("style");
    style.id = "__toast_style__";
    style.textContent = `
      @keyframes toastFadeIn {
        from { opacity: 0; transform: scale(0.85); }
        to   { opacity: 1; transform: scale(1); }
      }
      @keyframes toastFadeOut {
        from { opacity: 1; transform: scale(1); }
        to   { opacity: 0; transform: scale(0.85); }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(container);

  setTimeout(() => {
    box.style.animation = "toastFadeOut 0.2s ease forwards";
    setTimeout(() => container.remove(), 220);
  }, TOAST_DURATION);
}

const toast = {
  show({ icon, content }) {
    createToast(icon, content);
  },
  success(content) {
    createToast("success", content);
  },
  fail(content) {
    createToast("fail", content);
  },
};

export default toast;

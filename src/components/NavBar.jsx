import { useNavigate } from "react-router-dom";
import { useNavBarContext } from "./NavBarContext";
import { AiOutlineLogout } from "react-icons/ai";
import { FiSearch } from "react-icons/fi";
import { Moon, Sun } from "lucide-react";

export default function NavBar({ placeholder = "Axtar" }) {
  const {
    title, showBack, query, setQuery, showSearch, toggleTheme,
    isDark, themeStyles, toggleSearch, extraNavNode,
  } = useNavBarContext();
  const navigate = useNavigate();

  const iconButtonStyle = {
    width: 34, height: 34, borderRadius: 8,
    border: "1px solid var(--border)", background: "var(--tab-passive-bg)",
    color: themeStyles?.navText || "inherit", display: "inline-flex",
    alignItems: "center", justifyContent: "center", padding: 0, cursor: "pointer",
  };

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "12px", paddingTop: "max(12px, env(safe-area-inset-top))",
      paddingLeft: "max(12px, env(safe-area-inset-left))",
      paddingRight: "max(12px, env(safe-area-inset-right))",
      background: themeStyles?.navBg || "transparent",
      color: themeStyles?.navText || "inherit", position: "sticky", top: 0, zIndex: 50,
    }}>
      <div style={{ display: "flex", alignItems: "center", minWidth: 44 }}>
        {showBack ? <button onClick={() => navigate(-1)} aria-label="Geri" style={{ ...iconButtonStyle, marginRight: 6 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button> : null}
      </div>

      <div style={{ flex: 1, textAlign: "center" }}>
        {!showSearch ? <div style={{ fontSize: 18, fontWeight: 600, color: themeStyles?.navText || "inherit" }}>{title || "App"}</div> :
          <input autoFocus value={query || ""} onChange={(e) => setQuery?.(e.target.value)} placeholder={placeholder} style={{
            width: "90%", padding: 8, borderRadius: 8,
            border: `1px solid ${themeStyles?.border || "rgba(0,0,0,0.08)"}`,
            background: themeStyles?.inputBg || "#fff", color: themeStyles?.inputText || "#000", outline: "none",
          }} />}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 44, justifyContent: "flex-end" }}>
        <button onClick={toggleSearch} aria-label="Axtarış" title="Axtarış" style={iconButtonStyle}><FiSearch size={18} /></button>
        {extraNavNode && <div style={{ display: "flex", alignItems: "center" }}>{extraNavNode}</div>}
        <button onClick={toggleTheme} aria-label={isDark ? "Light mode" : "Dark mode"} title={isDark ? "Light mode" : "Dark mode"} style={iconButtonStyle}>{isDark ? <Moon size={18} /> : <Sun size={18} />}</button>
        <button onClick={() => { localStorage.removeItem("token"); window.location.href = "/"; }} aria-label="Çıxış" title="Çıxış" style={iconButtonStyle}><AiOutlineLogout /></button>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNavBarContext } from "./NavBarContext";
import { AiFillSetting, AiOutlineLogout } from "react-icons/ai";
import { Button } from "antd-mobile";
import { Moon, Sun } from "lucide-react";
export default function NavBar({ placeholder = "Axtar" }) {
  const {
    title,
    setTitle,
    showBack,
    setShowBack,
    query,
    setQuery,
    toggleTheme,
    isDark,
    themeStyles,
  } = useNavBarContext();
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);

  const onSearchIcon = () => {
    setShowSearch((s) => !s);
    if (!showSearch && setQuery) setQuery("");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const iconButtonStyle = {
    width: 34,
    height: 34,
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.08)",
    color: themeStyles?.navText || "inherit",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 12,
        background: themeStyles?.navBg || "transparent",
        color: themeStyles?.navText || "inherit",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", minWidth: 44 }}>
        {showBack ? (
          <button
            onClick={() => {
              // navigate back to accounts list
              try {
                navigate("/");
              } catch (e) {
                // no-op
              }
              setShowBack(false);
              setTitle("");
            }}
            aria-label="Geri"
            style={{
              ...iconButtonStyle,
              marginRight: 6,
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        ) : null}
      </div>

      <div style={{ flex: 1, textAlign: "center" }}>
        {!showSearch ? (
          <div
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: themeStyles?.navText || "inherit",
            }}
          >
            {title || "App"}
          </div>
        ) : (
          <input
            autoFocus
            value={query || ""}
            onChange={(e) => setQuery && setQuery(e.target.value)}
            placeholder={placeholder}
            style={{
              width: "90%",
              padding: 8,
              borderRadius: 8,
              border: `1px solid ${themeStyles?.border || "rgba(0,0,0,0.08)"}`,
              background: themeStyles?.inputBg || "#fff",
              color: themeStyles?.inputText || "#000",
              outline: "none",
            }}
          />
        )}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          minWidth: 44,
          justifyContent: "flex-end",
        }}
      >
        <button
          onClick={toggleTheme}
          aria-label={isDark ? "Light mode" : "Dark mode"}
          title={isDark ? "Light mode" : "Dark mode"}
          style={iconButtonStyle}
        >
          {/* İkonlar artıq çox təmiz şəkildə çağırılır */}
          {isDark ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <div style={{ position: "relative" }}>
          <button
            onClick={handleLogout}
            aria-label="Çıxış"
            title="Çıxış"
            style={iconButtonStyle}
          >
            <AiOutlineLogout />
          </button>
        </div>
      </div>
    </div>
  );
}

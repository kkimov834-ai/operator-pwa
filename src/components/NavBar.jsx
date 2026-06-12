import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNavBarContext } from "./NavBarContext";
import { AiFillSetting } from "react-icons/ai";

export default function NavBar({ placeholder = "Axtar" }) {
  const {
    title,
    setTitle,
    showBack,
    setShowBack,
    query,
    setQuery,
    toggleTheme,
    colorTheme,
    setColorTheme,
    themeStyles,
  } = useNavBarContext();
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);

  const onSearchIcon = () => {
    setShowSearch((s) => !s);
    if (!showSearch && setQuery) setQuery("");
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 12,
        background: themeStyles?.pageBg || "transparent",
        color: themeStyles?.cardText || "inherit",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", minWidth: 44 }}>
        {showBack ? (
          <button
            onClick={() => {
              // navigate back to accounts list
              try {
                navigate("/accounts");
              } catch (e) {
                // no-op
              }
              setShowBack(false);
              setTitle("");
            }}
            aria-label="Geri"
            style={{
              background: "transparent",
              border: "none",
              padding: 6,
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
              color: themeStyles?.cardText || "inherit",
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
              border: "1px solid rgba(0,0,0,0.08)",
              background: themeStyles?.inputBg || "#fff",
              color: themeStyles?.inputText || "#000",
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
          aria-label="Toggle theme"
          style={{
            background: "transparent",
            border: "none",
            padding: 6,
            color: themeStyles?.cardText || "inherit",
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="4" />
          </svg>
        </button>

        <button
          onClick={onSearchIcon}
          aria-label="Search"
          style={{
            background: "transparent",
            border: "none",
            padding: 6,
            color: themeStyles?.cardText || "inherit",
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>

        <div style={{ position: "relative" }}>
          {showSettings && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 36,
                padding: 8,
                borderRadius: 8,
                boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                zIndex: 200,
              }}
            ></div>
          )}
        </div>
      </div>
    </div>
  );
}

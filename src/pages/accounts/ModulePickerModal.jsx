import React from "react";
import { Button, Selector } from "antd-mobile";

export default function ModulePickerModal({
  open,
  options,
  value,
  onChange,
  onClose,
  onConfirm,
  title,
  emptyText,
}) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 100,
      }}
    >
      <div
        style={{
          padding: 20,
          borderRadius: 16,
          background: "var(--card-bg)",
          border: "1px solid var(--border)",
          width: "100%",
          maxWidth: 520,
        }}
      >
        <h4 style={{ margin: "0 0 16px", color: "var(--card-text)", fontSize: 16, fontWeight: 600 }}>
          {title}
        </h4>
        <div style={{ marginBottom: 20 }}>
          {options.length === 0 ? (
            <div style={{ padding: "12px 0", color: "var(--muted-text)" }}>
              {emptyText}
            </div>
          ) : (
            <Selector options={options} value={value ? [value] : []} onChange={(next) => onChange(next[0] || null)} />
          )}
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Button
            block
            onClick={onClose}
            style={{
              background: "transparent",
              color: "var(--muted-text)",
              border: "1px solid var(--border)",
              borderRadius: 8,
            }}
          >
            İmtina
          </Button>
          <Button
            block
            onClick={onConfirm}
            disabled={!value || options.length === 0}
            style={{
              background: !value || options.length === 0 ? "var(--border)" : "var(--tab-active-bg)",
              color: !value || options.length === 0 ? "var(--muted-text)" : "var(--tab-active-text)",
              border: "none",
              borderRadius: 8,
              fontWeight: 500,
            }}
          >
            Əlavə et
          </Button>
        </div>
      </div>
    </div>
  );
}

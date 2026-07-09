import { Card, Space, Tag } from "antd-mobile";
import {
  ClockCircleOutline,
  PhonebookOutline,
  UserOutline,
} from "antd-mobile-icons";

const rowStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  alignItems: "center",
  paddingBottom: "10px",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
};

const valueStyle = (themeStyles) => ({
  fontWeight: 600,
  color: themeStyles?.cardText || "#fff",
  textAlign: "right",
  wordBreak: "break-word",
});

export default function AccountUserInfoCard({ account, themeStyles }) {
  return (
    <Space direction="vertical" block style={{ "--gap": "16px" }}>
      {/* Top Card: Balance and Primary Info */}
      <Card
        style={{
          borderRadius: "16px",
          boxShadow: themeStyles?.isDark ? "none" : "0 8px 24px rgba(24, 144, 255, 0.15)",
          background: "linear-gradient(135deg, #2f54eb, #1890ff)",
          color: "#ffffff",
          padding: "8px",
          border: "none",
        }}
        bodyStyle={{ padding: 0 }}
      >
        <div style={{ padding: "12px 16px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "12px",
            }}
          >
            <div>
              <div
                style={{
                  opacity: 0.8,
                  fontSize: "13px",
                  marginBottom: "6px",
                  color: "rgba(255, 255, 255, 0.85)",
                  fontWeight: 500,
                }}
              >
                Cari balans
              </div>
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: 700,
                  letterSpacing: "-0.5px",
                  color: "#ffffff",
                  lineHeight: 1,
                  display: "flex",
                  alignItems: "baseline",
                  gap: "4px",
                }}
              >
                {account?.balance ? Number(account.balance).toFixed(2) : "0.00"}
                <span style={{ fontSize: "16px", fontWeight: 600, opacity: 0.9 }}>
                  AZN
                </span>
              </div>
            </div>
            <div
              style={{
                borderRadius: "8px",
                padding: "4px 10px",
                fontSize: "12px",
                fontWeight: 700,
                color: account?.status === 1 ? "#15803d" : "#b91c1c",
                background: account?.status === 1 ? "#dcfce7" : "#fee2e2",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              {account?.status === 1 ? "AKTİV" : "DEAKTİV"}
            </div>
          </div>

          <div
            style={{
              marginTop: "20px",
              paddingTop: "16px",
              borderTop: "1px solid rgba(255, 255, 255, 0.2)",
              display: "flex",
              justifyContent: "space-between",
              gap: "12px",
              fontSize: "14px",
            }}
          >
            <div>
              <div style={{ fontSize: "11px", opacity: 0.7, marginBottom: "4px" }}>Hesab</div>
              <div style={{ fontWeight: 600, letterSpacing: "0.5px" }}>{account?.account}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "11px", opacity: 0.7, marginBottom: "4px" }}>Rol</div>
              <div style={{ fontWeight: 600, textTransform: "uppercase" }}>{account?.role || "-"}</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Info Card: Details */}
      <Card
        style={{
          borderRadius: "16px",
          background: themeStyles?.cardBg || "#fff",
          border: `1px solid ${themeStyles?.border || "transparent"}`,
          boxShadow: themeStyles?.isDark ? "none" : "0 4px 16px rgba(0,0,0,0.04)",
        }}
        bodyStyle={{ padding: "16px" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "16px", fontWeight: "700", marginBottom: "16px", color: themeStyles?.cardText }}>
          <UserOutline color="#1890ff" /> Şəxsi və Tərəfdaş məlumatları
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={rowStyle}>
            <span style={{ color: themeStyles?.cardTextSecondary, fontSize: "14px" }}>Ad / Soyad</span>
            <span style={valueStyle(themeStyles)}>
              {account?.name} {account?.lastname}
            </span>
          </div>
          <div style={rowStyle}>
            <span style={{ color: themeStyles?.cardTextSecondary, fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
              <PhonebookOutline /> Telefon
            </span>
            <span style={valueStyle(themeStyles)}>+{account?.phone}</span>
          </div>
          <div style={rowStyle}>
            <span style={{ color: themeStyles?.cardTextSecondary, fontSize: "14px" }}>Partnyor</span>
            <span style={{ ...valueStyle(themeStyles), color: "var(--tab-active-bg)" }}>
              {account?.partner_name || "-"}
            </span>
          </div>
          <div style={{ ...rowStyle, borderBottom: "none", paddingBottom: 0 }}>
            <span style={{ color: themeStyles?.cardTextSecondary, fontSize: "14px" }}>
              Partnyor PIN
            </span>
            <span style={{ ...valueStyle(themeStyles), fontFamily: "monospace", letterSpacing: "1px" }}>
              {account?.partnerpin || "-"}
            </span>
          </div>
        </div>
      </Card>

      {/* Info Card: Dates */}
      <Card
        style={{
          borderRadius: "16px",
          background: themeStyles?.cardBg || "#fff",
          border: `1px solid ${themeStyles?.border || "transparent"}`,
          boxShadow: themeStyles?.isDark ? "none" : "0 4px 16px rgba(0,0,0,0.04)",
        }}
        bodyStyle={{ padding: "16px" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "16px", fontWeight: "700", marginBottom: "16px", color: themeStyles?.cardText }}>
          <ClockCircleOutline color="#1890ff" /> Sistem tarixləri
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            fontSize: "14px",
            color: themeStyles?.cardText,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>
            <span style={{ color: themeStyles?.cardTextSecondary }}>Son Giriş</span>
            <span style={{ fontWeight: 600, textAlign: "right" }}>{account?.last_login || "-"}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>
            <span style={{ color: themeStyles?.cardTextSecondary }}>Son Əlaqə</span>
            <span style={{ fontWeight: 600, textAlign: "right" }}>{account?.last_contact || "-"}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <span style={{ color: themeStyles?.cardTextSecondary }}>Qeydiyyat Tarixi</span>
            <span style={{ fontWeight: 600, textAlign: "right" }}>{account?.registermoment || "-"}</span>
          </div>
        </div>
      </Card>
    </Space>
  );
}

import { useEffect, useState } from "react";
import { Badge, Card, Space } from "antd-mobile";
import { ClockCircleOutline } from "antd-mobile-icons";
import { userHistory } from "../../services/userHistory.service";

const normalizeList = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.data?.data)) return value.data.data;
  return [];
};

const fieldValue = (value) => {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
};

const getAmountColor = (paymentSource, themeStyles) => {
  const source = String(paymentSource || "").toLowerCase();

  if (source === "bonus" || source === "credit") return "#16a34a";
  if (source === "daily_charge") return "#dc2626";
  return themeStyles?.cardText || "#111827";
};

export default function AccountHistoryCard({ accountId, themeStyles }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accountId) return undefined;

    let mounted = true;

    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await userHistory(accountId);
        if (mounted) {
          setHistory(normalizeList(res));
        }
      } catch (error) {
        console.error("History melumatlari yuklenirken xeta", error);
        if (mounted) {
          setHistory([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchHistory();

    return () => {
      mounted = false;
    };
  }, [accountId]);

  return (
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
        <ClockCircleOutline color="#1890ff" /> Hesab tarixi
      </div>
      {loading ? (
        <div
          style={{
            padding: "16px",
            textAlign: "center",
            color: themeStyles?.mutedText,
            fontSize: "14px",
          }}
        >
          Tarix yüklənir...
        </div>
      ) : history.length === 0 ? (
        <div
          style={{
            padding: "16px",
            textAlign: "center",
            color: themeStyles?.mutedText,
            fontSize: "14px",
          }}
        >
          Bu hesaba aid tarixçə tapılmadı.
        </div>
      ) : (
        <Space direction="vertical" block style={{ "--gap": "12px" }}>
          {history.map((item, index) => (
            <div
              key={item.transaction_id || item.id || index}
              style={{
                borderRadius: "12px",
                border: `1px solid ${themeStyles?.border || "#e5e7eb"}`,
                background: themeStyles?.surfaceBg || "#f8fafc",
                padding: "14px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  fontSize: "13px",
                  color: themeStyles?.cardTextSecondary,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Məbləğ</span>
                  <span
                    style={{
                      color: getAmountColor(item.payment_source, themeStyles),
                      fontWeight: 700,
                      fontSize: "15px",
                    }}
                  >
                    {fieldValue(item.amount)} AZN
                  </span>
                </div>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Vaxt</span>
                  <span style={{ color: themeStyles?.cardText, fontWeight: 500 }}>
                    {fieldValue(item.moment)}
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Köçürmə Üsulu</span>
                  <Badge content={fieldValue(item.payment_source)} style={{ '--color': 'var(--tab-active-bg)' }} />
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>İD</span>
                  <span
                    style={{
                      color: themeStyles?.cardText,
                      fontWeight: 500,
                      fontFamily: "monospace",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {fieldValue(item.transaction_id)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </Space>
      )}
    </Card>
  );
}

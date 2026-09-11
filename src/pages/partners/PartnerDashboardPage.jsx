import { useState, useEffect } from "react";
import { SpinLoading } from "antd-mobile";
import {
  Wallet,
  Users,
  Percent,
  Award,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { useNavBarContext } from "../../components/NavBarContext";
import { PartnerService } from "../../services/partner.service";
import toast from "../../helpers/toast";

export default function PartnerDashboardPage() {
  const { setTitle, setShowBack, themeStyles } = useNavBarContext();

  const [dashboardData, setDashboardData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(true);

  useEffect(() => {
    setTitle("Partnyor Kabineti");
    setShowBack(false);
    return () => setTitle("");
  }, [setTitle, setShowBack]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const res = await PartnerService.getPartnerDashboard();
      if (res.status === "success") {
        setDashboardData(res.data);
      }
    } catch {
      toast.fail("Məlumatların yüklənməsində xəta");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTransactions = async () => {
    setTxLoading(true);
    try {
      const res = await PartnerService.getMyTransactions();
      if (res.status === "success") {
        setTransactions(res.data || []);
      }
    } catch {
      toast.fail("Tranzaksiyaların yüklənməsində xəta");
    } finally {
      setTxLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchTransactions();
  }, []);

  const s = themeStyles || {};

  /* ──── shared styles ──── */

  const cardStyle = {
    background: s.cardBg || "#fff",
    color: s.cardText || "#111",
    border: `1px solid ${s.border || "rgba(0,0,0,0.08)"}`,
    borderRadius: 14,
    padding: 16,
  };

  const metricIconBox = {
    width: 44,
    height: 44,
    borderRadius: 12,
    background: "rgba(37,99,235,0.08)",
    border: "1px solid rgba(37,99,235,0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#2563eb",
    flexShrink: 0,
  };

  const badgeBase = {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: 8,
    fontSize: 11,
    fontWeight: 600,
    whiteSpace: "nowrap",
  };

  const txBadge = (type) => {
    if (type === "commission")
      return {
        ...badgeBase,
        background: "rgba(16,185,129,0.08)",
        color: "#059669",
      };
    if (type === "payout")
      return {
        ...badgeBase,
        background: "rgba(244,63,94,0.08)",
        color: "#e11d48",
      };
    if (type === "reward")
      return {
        ...badgeBase,
        background: "rgba(99,102,241,0.08)",
        color: "#6366f1",
      };
    return {
      ...badgeBase,
      background: "rgba(245,158,11,0.08)",
      color: "#d97706",
    };
  };

  const txLabel = (type) => {
    if (type === "commission") return "Komissiya";
    if (type === "payout") return "Ödəniş (Çıxış)";
    if (type === "reward") return "Mükafat";
    return "Bonus çıxışı";
  };

  /* ──── loading state ──── */

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
          background: s.pageBg,
        }}
      >
        <SpinLoading />
      </div>
    );
  }

  /* ──── error / no data state ──── */

  if (!dashboardData) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          padding: 24,
          background: s.pageBg,
          color: s.mutedText || "#6b7280",
          textAlign: "center",
        }}
      >
        <AlertCircle size={44} style={{ color: "#e11d48", marginBottom: 8 }} />
        <div style={{ fontSize: 16, fontWeight: 700, color: s.text }}>
          Giriş qadağandır və ya partnyor məlumatı tapılmadı
        </div>
        <div style={{ fontSize: 13, marginTop: 4 }}>
          Zəhmət olmasa superadminlə əlaqə saxlayın.
        </div>
      </div>
    );
  }

  /* ──── level progress calculations ──── */

  const currentPayments = dashboardData.monthly_payments;
  const level1Limit = dashboardData.level1_limit;
  const level2Limit = dashboardData.level2_limit;

  let nextLevelLimit = level1Limit;
  let progressPercent = 0;
  let currentLevelName = "1-ci Səviyyə";
  let nextLevelName = "2-ci Səviyyə";

  if (dashboardData.current_level === 1) {
    nextLevelLimit = level1Limit;
    progressPercent = Math.min((currentPayments / level1Limit) * 100, 100);
    currentLevelName = "1-ci Səviyyə";
    nextLevelName = "2-ci Səviyyə";
  } else if (dashboardData.current_level === 2) {
    nextLevelLimit = level2Limit;
    progressPercent = Math.min(
      ((currentPayments - level1Limit) / (level2Limit - level1Limit)) * 100,
      100
    );
    currentLevelName = "2-ci Səviyyə";
    nextLevelName = "3-cü Səviyyə (Maksimum)";
  } else {
    progressPercent = 100;
    currentLevelName = "3-cü Səviyyə (Maksimum)";
    nextLevelName = "";
  }

  /* ═══════════════════════════════ RENDER ═══════════════════════════════ */

  return (
    <div
      style={{
        padding: 12,
        paddingBottom: "calc(84px + env(safe-area-inset-bottom))",
        minHeight: "100vh",
        background: s.pageBg || "#f6f7fb",
        color: s.text || "#111",
      }}
    >
      {/* ─── Welcome Header ─── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 10,
          marginBottom: 16,
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <h2
            style={{
              margin: 0,
              fontSize: 19,
              fontWeight: 700,
              color: s.text,
              lineHeight: 1.3,
            }}
          >
            Xoş gəlmisiniz, {dashboardData.name}!
          </h2>
          <p
            style={{
              margin: "3px 0 0",
              fontSize: 12,
              color: s.mutedText || "#6b7280",
              lineHeight: 1.4,
            }}
          >
            Balansınızı və müştəri statistikalarını izləyin
          </p>
        </div>
        <span
          style={{
            display: "inline-block",
            padding: "5px 10px",
            borderRadius: 8,
            background: "#2563eb",
            color: "#fff",
            fontSize: 11,
            fontWeight: 700,
            fontFamily: "monospace",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          KOD: {dashboardData.partnerPin}
        </span>
      </div>

      {/* ─── Metric Cards (2 × 2 grid on mobile) ─── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          marginBottom: 14,
        }}
      >
        {/* Card 1: Balance */}
        <div style={cardStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: s.mutedText || "#6b7280",
                }}
              >
                Yığılmış Komissiya
              </div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 900,
                  fontFamily: "monospace",
                  marginTop: 6,
                  color:
                    dashboardData.balance < 0 ? "#e11d48" : "#059669",
                  lineHeight: 1.1,
                }}
              >
                {dashboardData.balance.toFixed(2)}
                <span style={{ fontSize: 12, fontWeight: 600 }}> AZN</span>
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: s.mutedText || "#9ca3af",
                  marginTop: 4,
                  opacity: 0.8,
                }}
              >
                Mənfi balans ola bilər
              </div>
            </div>
            <div style={metricIconBox}>
              <Wallet size={20} />
            </div>
          </div>
        </div>

        {/* Card 2: Current Level & Rate */}
        <div style={cardStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: s.mutedText || "#6b7280",
                }}
              >
                Səviyyə / Faiz
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 900,
                  marginTop: 6,
                  color: "#2563eb",
                  lineHeight: 1.2,
                }}
              >
                {currentLevelName}
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#2563eb",
                  marginTop: 2,
                }}
              >
                {dashboardData.current_rate}%
              </div>
            </div>
            <div style={metricIconBox}>
              <Percent size={20} />
            </div>
          </div>
        </div>

        {/* Card 3: Active Clients */}
        <div style={cardStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: s.mutedText || "#6b7280",
                }}
              >
                Aktiv Müştərilər
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 900,
                  fontFamily: "monospace",
                  marginTop: 6,
                  color: s.cardText,
                  lineHeight: 1.1,
                }}
              >
                {dashboardData.active_clients_count}
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: s.mutedText || "#6b7280",
                  }}
                >
                  {" "}
                  / {dashboardData.clients_count}
                </span>
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: s.mutedText || "#9ca3af",
                  marginTop: 4,
                  opacity: 0.8,
                }}
              >
                Aktiv / Ümumi
              </div>
            </div>
            <div style={metricIconBox}>
              <Users size={20} />
            </div>
          </div>
        </div>

        {/* Card 4: Contract */}
        <div style={cardStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: s.mutedText || "#6b7280",
                }}
              >
                Müqavilə Müddəti
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  marginTop: 6,
                  color: s.cardText,
                  lineHeight: 1.3,
                }}
              >
                {dashboardData.partner_type === "annual"
                  ? new Date(
                      dashboardData.contract_end_date
                    ).toLocaleDateString()
                  : "Daimi (Lifetime)"}
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: s.mutedText || "#9ca3af",
                  marginTop: 4,
                  opacity: 0.8,
                }}
              >
                {dashboardData.partner_type === "annual"
                  ? "Годовой"
                  : "Бессрочный"}
              </div>
            </div>
            <div style={metricIconBox}>
              <Calendar size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Monthly Progress Bar ─── */}
      <div style={{ ...cardStyle, marginBottom: 14 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
            flexWrap: "wrap",
            gap: 4,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              fontWeight: 600,
              color: s.text,
            }}
          >
            <Award size={16} style={{ color: "#2563eb" }} />
            <span>Aylıq ödənişlər:</span>
            <span
              style={{
                fontFamily: "monospace",
                fontWeight: 700,
              }}
            >
              {currentPayments.toFixed(2)} AZN
            </span>
          </div>
          {dashboardData.current_level < 3 && nextLevelName && (
            <div
              style={{
                fontSize: 10,
                color: s.mutedText || "#6b7280",
              }}
            >
              Növbəti:{" "}
              <span
                style={{
                  fontFamily: "monospace",
                  color: "#2563eb",
                  fontWeight: 700,
                }}
              >
                {nextLevelLimit} AZN
              </span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div
          style={{
            width: "100%",
            height: 10,
            borderRadius: 6,
            background: s.surfaceBg || "#e5e7eb",
            border: `1px solid ${s.border || "rgba(0,0,0,0.06)"}`,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progressPercent}%`,
              height: "100%",
              borderRadius: 6,
              background: "linear-gradient(90deg, #2563eb, #6366f1)",
              transition: "width 0.5s ease",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 6,
            fontSize: 9,
            fontFamily: "monospace",
            color: s.mutedText || "#9ca3af",
          }}
        >
          <span>Səviyyə 1: {level1Limit} AZN</span>
          <span>Səviyyə 2: {level2Limit} AZN</span>
        </div>
      </div>

      {/* ─── Transactions ─── */}
      <h3
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: s.text,
          marginBottom: 10,
        }}
      >
        Hesablaşma tranzaksiyaları
      </h3>

      <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
        {txLoading ? (
          <div style={{ textAlign: "center", padding: 32 }}>
            <SpinLoading />
          </div>
        ) : transactions.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: 32,
              color: s.mutedText || "#9ca3af",
            }}
          >
            <AlertCircle
              size={28}
              style={{
                margin: "0 auto 6px",
                display: "block",
                opacity: 0.5,
              }}
            />
            <div style={{ fontSize: 12 }}>Heç bir tranzaksiya yoxdur</div>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            {transactions.map((tx, idx) => {
              const amt = parseFloat(tx.amount);
              return (
                <div
                  key={tx.id}
                  style={{
                    padding: "12px 14px",
                    borderBottom:
                      idx < transactions.length - 1
                        ? `1px solid ${s.border || "rgba(0,0,0,0.06)"}`
                        : "none",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  {/* Row 1: badge + amount */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={txBadge(tx.type)}>{txLabel(tx.type)}</span>
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontWeight: 700,
                        fontSize: 14,
                        color: amt < 0 ? "#e11d48" : "#059669",
                      }}
                    >
                      {amt > 0 ? "+" : ""}
                      {amt.toFixed(2)} AZN
                    </span>
                  </div>

                  {/* Row 2: client + payment */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: 11,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "monospace",
                        color: s.mutedText || "#6b7280",
                      }}
                    >
                      {tx.client_account || "—"}
                    </span>
                    {tx.payment_amount && (
                      <span
                        style={{
                          fontFamily: "monospace",
                          color: s.mutedText || "#6b7280",
                        }}
                      >
                        Ödəniş: {parseFloat(tx.payment_amount).toFixed(2)} AZN
                      </span>
                    )}
                  </div>

                  {/* Row 3: info + date */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: 10,
                      color: s.mutedText || "#9ca3af",
                    }}
                  >
                    <span
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: "55%",
                      }}
                    >
                      {tx.info || ""}
                    </span>
                    <span style={{ fontFamily: "monospace", flexShrink: 0 }}>
                      {new Date(tx.moment).toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

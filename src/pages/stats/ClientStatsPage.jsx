import { useState, useEffect } from "react";
import { SpinLoading } from "antd-mobile";
import {
  Users,
  UserCheck,
  CreditCard,
  RefreshCw,
  BarChart3,
  TrendingUp,
  Clock,
  UserMinus,
  ShieldAlert,
  Phone,
  X,
} from "lucide-react";
import { useNavBarContext } from "../../components/NavBarContext";
import api from "../../api";
import toast from "../../helpers/toast";

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "—";
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}/${mm}/${dd}`;
};

export default function ClientStatsPage() {
  const { setTitle, setShowBack, themeStyles } = useNavBarContext();

  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("g30_plus");
  const [selectedChartData, setSelectedChartData] = useState(null);

  useEffect(() => {
    setTitle("Müştəri Statistikası");
    setShowBack(false);
    return () => setTitle("");
  }, [setTitle, setShowBack]);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const res = await api.post("/user/stats");
      if (res.status === "success" || res.data) {
        const responseData = res.data || res;
        setStats(responseData.data || responseData);
      }
    } catch {
      toast.fail("Statistika yüklənərkən xəta baş verdi");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const s = themeStyles || {};

  /* ── shared styles ── */
  const card = {
    background: s.cardBg || "#fff",
    border: `1px solid ${s.border || "rgba(0,0,0,0.08)"}`,
    borderRadius: 14,
    padding: 14,
  };

  const iconBox = (color) => ({
    width: 36,
    height: 36,
    borderRadius: 10,
    background: color + "18",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color,
    flexShrink: 0,
  });

  const overlayStyle = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    backdropFilter: "blur(4px)",
    WebkitBackdropFilter: "blur(4px)",
    zIndex: 200,
    display: "flex",
    alignItems: "flex-end",
  };

  const sheetStyle = {
    background: s.cardBg || "#fff",
    color: s.cardText || "#111",
    borderRadius: "20px 20px 0 0",
    width: "100%",
    maxHeight: "88vh",
    overflowY: "auto",
    padding: "20px 16px calc(20px + env(safe-area-inset-bottom))",
    boxShadow: "0 -8px 40px rgba(0,0,0,0.18)",
    animation: "slideUp 0.28s ease",
  };

  /* ── loading ── */
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

  /* ── data prep ── */
  const kpi = stats?.kpi || {
    total_accounts: 0,
    active_accounts: 0,
    total_payments: 0,
    avg_lifetime_months: 0,
    arpu: 0,
    churn_rate: 0,
    deactivated_accounts: 0,
  };

  const regData = (stats?.registrations || []).map((item) => ({
    ...item,
    label: item.date ? formatDate(item.date).substring(0, 7) : "—",
  }));

  const paymentData = (stats?.payments || []).map((item) => ({
    ...item,
    label: item.date ? formatDate(item.date).substring(0, 7) : "—",
  }));

  const activePercentage =
    kpi.total_accounts > 0
      ? ((kpi.active_accounts / kpi.total_accounts) * 100).toFixed(1)
      : 0;

  const inactiveLists = stats?.inactive_lists || {};
  const currentList = Array.isArray(inactiveLists[activeTab])
    ? inactiveLists[activeTab]
    : [];

  const tabLabels = {
    g30_plus: `Deaktiv (30+ gün) · ${(inactiveLists.g30_plus || []).length}`,
    g7_14: `7–14 gün · ${(inactiveLists.g7_14 || []).length}`,
    g14_30: `14–30 gün · ${(inactiveLists.g14_30 || []).length}`,
    no_payments: `Ödəniş yoxdur · ${(inactiveLists.no_payments || []).length}`,
  };

  const isNeverPaidTab = activeTab === "no_payments";

  /* ── chart scaling ── */
  const maxPayment = Math.max(...paymentData.map((d) => d.amount || 0), 1);
  const maxReg = Math.max(...regData.map((d) => Math.max(d.count || 0, d.deact_count || 0, d.first_pay_count || 0)), 1);

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
      <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>

      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 14,
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: s.text, display: "flex", alignItems: "center", gap: 6 }}>
            <BarChart3 size={20} style={{ color: "#2563eb" }} />
            Müştəri Statistikası
          </h2>
          <p style={{ margin: "3px 0 0", fontSize: 12, color: s.mutedText || "#6b7280" }}>
            Dinamika, LTV və fəaliyyətsizlik hesabatı
          </p>
        </div>
        <button
          onClick={fetchStats}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "7px 12px",
            borderRadius: 9,
            border: `1px solid ${s.border || "rgba(0,0,0,0.08)"}`,
            background: s.cardBg || "#fff",
            color: s.text,
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <RefreshCw size={13} /> Yenilə
        </button>
      </div>

      {/* ── KPI Row 1 (2×2) ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
        {/* Total */}
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 600, color: s.mutedText, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Toplam Müştərilər
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, fontFamily: "monospace", color: s.cardText, marginTop: 6 }}>
                {kpi.total_accounts}
              </div>
              <div style={{ fontSize: 9, color: s.mutedText, marginTop: 3, opacity: 0.8 }}>
                dine_ / bein_ bazaları
              </div>
            </div>
            <div style={iconBox("#2563eb")}><Users size={18} /></div>
          </div>
        </div>

        {/* Active */}
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 9, fontWeight: 600, color: s.mutedText, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Aktiv Müştərilər
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, fontFamily: "monospace", color: "#059669", marginTop: 6 }}>
                {kpi.active_accounts}
                <span style={{ fontSize: 11, fontWeight: 500, color: s.mutedText }}> ({activePercentage}%)</span>
              </div>
              <div style={{ width: "100%", height: 6, borderRadius: 3, background: s.surfaceBg || "#e5e7eb", marginTop: 6, overflow: "hidden" }}>
                <div style={{ width: `${activePercentage}%`, height: "100%", borderRadius: 3, background: "#10b981", transition: "width 0.5s ease" }} />
              </div>
            </div>
            <div style={iconBox("#10b981")}><UserCheck size={18} /></div>
          </div>
        </div>

        {/* Avg Lifetime */}
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 600, color: s.mutedText, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Orta Müştəri Ömrü
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, fontFamily: "monospace", color: "#d97706", marginTop: 6 }}>
                {kpi.avg_lifetime_months}
                <span style={{ fontSize: 12, fontWeight: 500, color: s.mutedText }}> ay</span>
              </div>
              <div style={{ fontSize: 9, color: s.mutedText, marginTop: 3, opacity: 0.8 }}>
                İlk ödənişdən son fəaliyyətə
              </div>
            </div>
            <div style={iconBox("#d97706")}><Clock size={18} /></div>
          </div>
        </div>

        {/* ARPU */}
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 600, color: s.mutedText, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Orta Gəlir (ARPU)
              </div>
              <div style={{ fontSize: 18, fontWeight: 900, fontFamily: "monospace", color: "#6366f1", marginTop: 6 }}>
                {(kpi.arpu || 0).toFixed(2)}
                <span style={{ fontSize: 11, fontWeight: 500, color: s.mutedText }}> AZN</span>
              </div>
              <div style={{ fontSize: 9, color: s.mutedText, marginTop: 3, opacity: 0.8 }}>
                Gəlir / baza sayı
              </div>
            </div>
            <div style={iconBox("#6366f1")}><CreditCard size={18} /></div>
          </div>
        </div>
      </div>

      {/* ── KPI Row 2 (3 cols) ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
        {/* Total payments */}
        <div style={{ ...card, padding: "12px 10px" }}>
          <div style={{ fontSize: 8, fontWeight: 600, color: s.mutedText, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>
            Toplam Ödənişlər
          </div>
          <div style={{ fontSize: 14, fontWeight: 900, fontFamily: "monospace", color: "#6366f1" }}>
            {(kpi.total_payments || 0).toFixed(0)}
            <span style={{ fontSize: 9, fontWeight: 500, color: s.mutedText }}> AZN</span>
          </div>
        </div>

        {/* Churn */}
        <div style={{ ...card, padding: "12px 10px" }}>
          <div style={{ fontSize: 8, fontWeight: 600, color: s.mutedText, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>
            Churn Rate
          </div>
          <div style={{ fontSize: 14, fontWeight: 900, fontFamily: "monospace", color: "#e11d48" }}>
            {kpi.churn_rate}%
          </div>
        </div>

        {/* Deactivated */}
        <div style={{ ...card, padding: "12px 10px" }}>
          <div style={{ fontSize: 8, fontWeight: 600, color: s.mutedText, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>
            Deaktiv olunmuş
          </div>
          <div style={{ fontSize: 14, fontWeight: 900, fontFamily: "monospace", color: "#e11d48" }}>
            {kpi.deactivated_accounts}
          </div>
        </div>
      </div>

      {/* ── Payment trend chart ── */}
      {paymentData.length > 0 && (
        <div style={{ ...card, marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
            <TrendingUp size={15} style={{ color: "#2563eb" }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: s.text }}>Ödəniş Dinamikası (AZN)</div>
              <div style={{ fontSize: 10, color: s.mutedText }}>Son 12 ayın ödəniş həcmi</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {paymentData.map((d) => {
              const pct = ((d.amount || 0) / maxPayment) * 100;
              return (
                <div key={d.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 2 }}>
                    <span style={{ color: s.mutedText, fontFamily: "monospace" }}>{d.label}</span>
                    <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#2563eb" }}>
                      {(d.amount || 0).toFixed(0)} AZN
                    </span>
                  </div>
                  <div style={{ width: "100%", height: 8, borderRadius: 4, background: s.surfaceBg || "#e5e7eb", overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: "100%",
                        borderRadius: 4,
                        background: "linear-gradient(90deg, #2563eb, #6366f1)",
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Registration trend chart ── */}
      {regData.length > 0 && (
        <div style={{ ...card, marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
            <Users size={15} style={{ color: "#2563eb" }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: s.text }}>Yeni Müştəri Artımı</div>
              <div style={{ fontSize: 10, color: s.mutedText }}>Son 12 ay · Tapın görüntüləmək üçün</div>
            </div>
          </div>

          {/* Legend */}
          <div style={{ display: "flex", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
            {[
              { color: "#2563eb", label: "Qeydiyyat" },
              { color: "#10b981", label: "İlk ödəniş" },
              { color: "#e11d48", label: "Deaktivasiya" },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: s.mutedText }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: color }} />
                {label}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {regData.map((d) => {
              const regPct = ((d.count || 0) / maxReg) * 100;
              const fpPct = ((d.first_pay_count || 0) / maxReg) * 100;
              const deactPct = ((d.deact_count || 0) / maxReg) * 100;
              return (
                <div
                  key={d.label}
                  onClick={() => setSelectedChartData(d)}
                  style={{ cursor: "pointer" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 3 }}>
                    <span style={{ color: s.mutedText, fontFamily: "monospace" }}>{d.label}</span>
                    <div style={{ display: "flex", gap: 8 }}>
                      <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#2563eb" }}>{d.count || 0}</span>
                      <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#10b981" }}>{d.first_pay_count || 0}</span>
                      <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#e11d48" }}>{d.deact_count || 0}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    {[
                      { pct: regPct, color: "#2563eb" },
                      { pct: fpPct, color: "#10b981" },
                      { pct: deactPct, color: "#e11d48" },
                    ].map(({ pct, color }, i) => (
                      <div key={i} style={{ width: "100%", height: 6, borderRadius: 3, background: s.surfaceBg || "#e5e7eb", overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", borderRadius: 3, background: color, transition: "width 0.4s ease" }} />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 8, fontSize: 9, color: s.mutedText, textAlign: "center" }}>
            Ay sətrinə toxunaraq ətraflı siyahıya baxa bilərsiniz
          </div>
        </div>
      )}

      {/* ── Inactive lists ── */}
      <div style={{ ...card, padding: 0, overflow: "hidden" }}>
        {/* Section header */}
        <div style={{ padding: "14px 14px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <ShieldAlert size={16} style={{ color: "#e11d48" }} />
            <div style={{ fontSize: 14, fontWeight: 700, color: s.text }}>Fəaliyyətsiz Müştərilər</div>
          </div>
          <div style={{ fontSize: 11, color: s.mutedText, marginBottom: 10 }}>
            Fəaliyyətsizlik müddətinə görə qruplaşdırılmış siyahı
          </div>

          {/* Tab pills — horizontally scrollable */}
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 12 }}>
            {Object.keys(tabLabels).map((key) => {
              const active = activeTab === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  style={{
                    padding: "6px 11px",
                    borderRadius: 8,
                    border: `1px solid ${active ? "#e11d48" : "transparent"}`,
                    background: active ? "rgba(225,29,72,0.08)" : s.surfaceBg || "#e5e7eb",
                    color: active ? "#e11d48" : s.mutedText || "#6b7280",
                    fontSize: 11,
                    fontWeight: active ? 700 : 500,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  {tabLabels[key]}
                </button>
              );
            })}
          </div>
        </div>

        {/* List */}
        {currentList.length === 0 ? (
          <div style={{ textAlign: "center", padding: 32, color: s.mutedText }}>
            <UserCheck size={28} style={{ margin: "0 auto 8px", display: "block", opacity: 0.4 }} />
            <div style={{ fontSize: 12 }}>Bu qrupda fəaliyyətsiz müştəri tapılmadı</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {currentList.map((client, idx) => (
              <div
                key={client.account}
                style={{
                  padding: "12px 14px",
                  borderTop: `1px solid ${s.border || "rgba(0,0,0,0.06)"}`,
                  display: "flex",
                  flexDirection: "column",
                  gap: 5,
                }}
              >
                {/* Row 1: name + days */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: s.cardText, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "65%" }}>
                    {client.name || "Ad qeyd olunmayıb"}
                  </span>
                  <span style={{ fontSize: 12, fontFamily: "monospace", fontWeight: 800, color: "#e11d48" }}>
                    {client.days_inactive} gün
                  </span>
                </div>
                {/* Row 2: account + phone + date */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 10, color: s.mutedText, flexWrap: "wrap", gap: 4 }}>
                  <span style={{ fontFamily: "monospace", color: "#2563eb", fontWeight: 600 }}>
                    {client.account}
                  </span>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    {client.phone && (
                      <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                        <Phone size={10} /> {client.phone}
                      </span>
                    )}
                    <span style={{ fontFamily: "monospace" }}>
                      {formatDate(client.last_activity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ═══════════ Chart detail bottom sheet ═══════════ */}
      {selectedChartData && (
        <div style={overlayStyle} onClick={() => setSelectedChartData(null)}>
          <div style={sheetStyle} onClick={(e) => e.stopPropagation()}>
            {/* Sheet header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
                paddingBottom: 12,
                borderBottom: `1px solid ${s.border || "rgba(0,0,0,0.08)"}`,
              }}
            >
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: s.cardText }}>
                  {selectedChartData.label} — Tarixçə
                </div>
                <div style={{ fontSize: 11, color: s.mutedText, marginTop: 2 }}>
                  Qeydiyyat, ilk ödəniş və deaktivasiya hesabları
                </div>
              </div>
              <button
                onClick={() => setSelectedChartData(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: s.mutedText, display: "flex" }}
              >
                <X size={22} />
              </button>
            </div>

            {/* 3 sections */}
            {[
              {
                label: "Yeni Qeydiyyatlar",
                count: selectedChartData.count,
                accounts: selectedChartData.reg_accounts,
                color: "#2563eb",
              },
              {
                label: "İlk Ödənişlər",
                count: selectedChartData.first_pay_count,
                accounts: selectedChartData.first_pay_accounts,
                color: "#10b981",
              },
              {
                label: "Deaktiv Olunanlar",
                count: selectedChartData.deact_count,
                accounts: selectedChartData.deact_accounts,
                color: "#e11d48",
              },
            ].map(({ label, count, accounts, color }) => (
              <div key={label} style={{ marginBottom: 18 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 700, color }}>{label}</span>
                  <span
                    style={{
                      padding: "3px 9px",
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 700,
                      fontFamily: "monospace",
                      background: color + "14",
                      color,
                    }}
                  >
                    {count || 0}
                  </span>
                </div>
                <div
                  style={{
                    padding: 10,
                    borderRadius: 10,
                    background: s.surfaceBg || "#eef2f7",
                    border: `1px solid ${s.border || "rgba(0,0,0,0.06)"}`,
                    minHeight: 40,
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                  }}
                >
                  {accounts ? (
                    accounts.split(",").map((acc, i) => (
                      <span
                        key={i}
                        style={{
                          padding: "3px 8px",
                          borderRadius: 6,
                          background: s.cardBg || "#fff",
                          border: `1px solid ${s.border || "rgba(0,0,0,0.06)"}`,
                          fontSize: 10,
                          fontFamily: "monospace",
                          color: s.cardText,
                        }}
                      >
                        {acc.trim()}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: 11, color: s.mutedText }}>Məlumat yoxdur</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { SpinLoading } from "antd-mobile";
import {
  Clock,
  Star,
  Percent,
  Layers,
  RefreshCw,
  Calendar,
  Edit3,
  X,
  AlertCircle,
} from "lucide-react";
import { useNavBarContext } from "../../components/NavBarContext";
import { useRole } from "../../hooks/useRole";
import api from "../../api";
import toast from "../../helpers/toast";

const formatDuration = (seconds) => {
  if (seconds === null || seconds === undefined || isNaN(seconds)) return "—";
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
};

export default function OperatorStatsPage() {
  const { setTitle, setShowBack, themeStyles } = useNavBarContext();
  const { isSu, isSuperAdmin } = useRole();

  const [stats, setStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // QA modal
  const [showQaModal, setShowQaModal] = useState(false);
  const [qaOpName, setQaOpName] = useState("");
  const [qaChatId, setQaChatId] = useState("");
  const [scoreGrammar, setScoreGrammar] = useState(5);
  const [scorePoliteness, setScorePoliteness] = useState(5);
  const [scoreCompleteness, setScoreCompleteness] = useState(5);
  const [isSubmittingQa, setIsSubmittingQa] = useState(false);

  useEffect(() => {
    setTitle("Operator Statistikası");
    setShowBack(false);
    return () => setTitle("");
  }, [setTitle, setShowBack]);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const res = await api.post("/operator_stats/get", {
        start_date: startDate + " 00:00:00",
        end_date: endDate + " 23:59:59",
      });
      if (res.status === "success" || res.data) {
        const responseData = res.data || res;
        setStats(responseData.data || responseData || []);
      }
    } catch {
      toast.fail("Statistika yüklənərkən xəta baş verdi");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  const handleOpenQaModal = (opName) => {
    setQaOpName(opName);
    setQaChatId("");
    setScoreGrammar(5);
    setScorePoliteness(5);
    setScoreCompleteness(5);
    setShowQaModal(true);
  };

  const handleSubmitQa = async (e) => {
    e.preventDefault();
    if (!qaChatId.trim()) {
      toast.fail("Chat ID daxil edin");
      return;
    }
    setIsSubmittingQa(true);
    try {
      const res = await api.post("/operator_stats/addQaEvaluation", {
        operator_name: qaOpName,
        chat_id: parseInt(qaChatId),
        score_grammar: parseInt(scoreGrammar),
        score_politeness: parseInt(scorePoliteness),
        score_completeness: parseInt(scoreCompleteness),
      });
      if (res.status === "success") {
        toast.success("Keyfiyyət qiymətləndirilməsi qeyd olundu");
        setShowQaModal(false);
        fetchStats();
      }
    } catch {
      toast.fail("Qiymətləndirmə zamanı xəta");
    } finally {
      setIsSubmittingQa(false);
    }
  };

  /* ── aggregate KPIs ── */
  const totalVolume = stats.reduce((s, i) => s + (i.chat_volume || 0), 0);
  const n = stats.length || 1;
  const avgFrtAll = Math.round(stats.reduce((s, i) => s + (i.avg_frt || 0), 0) / n);
  const avgArtAll = Math.round(stats.reduce((s, i) => s + (i.avg_art || 0), 0) / n);
  const avgCsatAll = (stats.reduce((s, i) => s + (i.csat || 0), 0) / n).toFixed(2);
  const avgFcrAll = (stats.reduce((s, i) => s + (i.fcr_rate || 0), 0) / n).toFixed(1);
  const avgQaAll = (stats.reduce((s, i) => s + (i.qa_score || 0), 0) / n).toFixed(1);
  const avgUtilAll = (stats.reduce((s, i) => s + (i.utilization_rate || 0), 0) / n).toFixed(1);
  const avgWrapAll = Math.round(stats.reduce((s, i) => s + (i.avg_wrap_up || 0), 0) / n);

  /* ── chart max for scaling ── */
  const maxVolume = Math.max(...stats.map((r) => r.chat_volume || 0), 1);

  const s = themeStyles || {};

  const cardStyle = {
    background: s.cardBg || "#fff",
    border: `1px solid ${s.border || "rgba(0,0,0,0.08)"}`,
    borderRadius: 14,
    padding: 14,
  };

  const metricBox = (color) => ({
    width: 40,
    height: 40,
    borderRadius: 10,
    background: color + "18",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color,
    flexShrink: 0,
  });

  const inputStyle = {
    height: 36,
    padding: "0 10px",
    borderRadius: 8,
    border: `1px solid ${s.border || "rgba(0,0,0,0.08)"}`,
    background: s.inputBg || "#fff",
    color: s.inputText || "#111",
    fontSize: 12,
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  };

  const overlayStyle = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    backdropFilter: "blur(4px)",
    WebkitBackdropFilter: "blur(4px)",
    zIndex: 100,
    display: "flex",
    alignItems: "flex-end",
  };

  const sheetStyle = {
    background: s.cardBg || "#fff",
    color: s.cardText || "#111",
    borderRadius: "20px 20px 0 0",
    width: "100%",
    maxHeight: "90vh",
    overflowY: "auto",
    padding: "20px 16px calc(20px + env(safe-area-inset-bottom))",
    boxShadow: "0 -8px 40px rgba(0,0,0,0.15)",
    animation: "slideUp 0.28s ease",
  };

  const scoreBtn = (current, val, setter) => ({
    width: 34,
    height: 34,
    borderRadius: 8,
    border: "none",
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
    background: current === val ? "#2563eb" : s.surfaceBg || "#e5e7eb",
    color: current === val ? "#fff" : s.mutedText || "#6b7280",
    transition: "all 0.15s",
  });

  const qaColorFor = (score) => {
    if (score >= 85) return "#059669";
    if (score >= 70) return "#d97706";
    return "#e11d48";
  };

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
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: s.text }}>
          Operator Statistikası
        </h2>
        <p style={{ margin: "3px 0 0", fontSize: 12, color: s.mutedText || "#6b7280" }}>
          Sürət, keyfiyyət və məhsuldarlıq göstəriciləri
        </p>
      </div>

      {/* ── Date filter ── */}
      <div
        style={{
          ...cardStyle,
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 14,
          padding: "10px 12px",
        }}
      >
        <Calendar size={15} style={{ color: s.mutedText, flexShrink: 0 }} />
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={{ ...inputStyle, flex: 1 }}
        />
        <span style={{ color: s.mutedText, fontSize: 12 }}>—</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          style={{ ...inputStyle, flex: 1 }}
        />
        <button
          onClick={fetchStats}
          style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            border: `1px solid ${s.border || "rgba(0,0,0,0.08)"}`,
            background: s.surfaceBg || "#e5e7eb",
            color: s.text,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <RefreshCw size={15} style={{ animation: isLoading ? "spin 1s linear infinite" : "none" }} />
        </button>
      </div>

      {isLoading ? (
        <div style={{ textAlign: "center", paddingTop: 60 }}>
          <SpinLoading />
        </div>
      ) : (
        <>
          {/* ── KPI Cards (2×2) ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              marginBottom: 14,
            }}
          >
            {[
              {
                label: "FRT (İlk cavab)",
                value: formatDuration(avgFrtAll),
                sub: "İlk qəbul sürəti",
                color: "#3b82f6",
                icon: <Clock size={18} />,
              },
              {
                label: "Müştəri qiymətləndirməsi",
                value: `${avgCsatAll} ★`,
                sub: "Orta CSAT balı",
                color: "#f59e0b",
                icon: <Star size={18} />,
              },
              {
                label: "FCR (İlk həll)",
                value: `${avgFcrAll}%`,
                sub: "İlk təmasda həll",
                color: "#10b981",
                icon: <Percent size={18} />,
              },
              {
                label: "Utilizasiya",
                value: `${avgUtilAll}%`,
                sub: "Faydalı iş vaxtı",
                color: "#8b5cf6",
                icon: <Layers size={18} />,
              },
            ].map(({ label, value, sub, color, icon }) => (
              <div key={label} style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: s.mutedText, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      {label}
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: s.cardText, marginTop: 5, lineHeight: 1.1 }}>
                      {value}
                    </div>
                    <div style={{ fontSize: 9, color: s.mutedText, marginTop: 4, opacity: 0.8 }}>
                      {sub}
                    </div>
                  </div>
                  <div style={metricBox(color)}>{icon}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Department summary ── */}
          <div style={{ ...cardStyle, marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: s.mutedText, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
              Şöbə üzrə orta icmal
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Cəmi işlənmiş çatlar:", val: totalVolume, mono: true },
                { label: "Cavab sürəti (ART):", val: formatDuration(avgArtAll), mono: true },
                { label: "Keyfiyyət (QA Score):", val: `${avgQaAll}%`, mono: true },
                { label: "Post-işləmə (Wrap-up):", val: formatDuration(avgWrapAll), mono: true },
              ].map(({ label, val }) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingBottom: 8,
                    borderBottom: `1px solid ${s.border || "rgba(0,0,0,0.06)"}`,
                    fontSize: 13,
                  }}
                >
                  <span style={{ color: s.mutedText || "#6b7280", fontSize: 12 }}>{label}</span>
                  <span style={{ fontFamily: "monospace", fontWeight: 700, color: s.cardText }}>{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Native bar chart: chat volume per operator ── */}
          {stats.length > 0 && (
            <div style={{ ...cardStyle, marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: s.mutedText, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
                Operator yükü (Bağlanmış çatlar)
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {stats.map((row) => {
                  const pct = ((row.chat_volume || 0) / maxVolume) * 100;
                  return (
                    <div key={row.operator_name}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}>
                        <span style={{ color: s.cardText, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "70%" }}>
                          {row.operator_name}
                        </span>
                        <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#2563eb", flexShrink: 0 }}>
                          {row.chat_volume}
                        </span>
                      </div>
                      <div
                        style={{
                          width: "100%",
                          height: 8,
                          borderRadius: 4,
                          background: s.surfaceBg || "#e5e7eb",
                          overflow: "hidden",
                        }}
                      >
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

          {/* ── Operator cards ── */}
          <div style={{ fontSize: 11, fontWeight: 700, color: s.mutedText, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
            Fərdi Göstəricilər
          </div>

          {stats.length === 0 ? (
            <div style={{ textAlign: "center", paddingTop: 40, color: s.mutedText }}>
              <AlertCircle size={32} style={{ margin: "0 auto 8px", display: "block", opacity: 0.4 }} />
              <p style={{ fontSize: 13 }}>Seçilmiş tarix aralığında heç bir operator tapılmadı</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {stats.map((row, idx) => (
                <div key={idx} style={cardStyle}>
                  {/* Name row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#2563eb" }}>
                      {row.operator_name}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {row.qa_score > 0 && (
                        <span
                          style={{
                            padding: "3px 9px",
                            borderRadius: 8,
                            fontSize: 11,
                            fontWeight: 700,
                            background: qaColorFor(row.qa_score) + "18",
                            color: qaColorFor(row.qa_score),
                          }}
                        >
                          QA {row.qa_score}%
                        </span>
                      )}
                      {(isSu || isSuperAdmin) && (
                        <button
                          onClick={() => handleOpenQaModal(row.operator_name)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "5px 10px",
                            borderRadius: 8,
                            border: `1px solid ${s.border || "rgba(0,0,0,0.08)"}`,
                            background: s.surfaceBg || "#e5e7eb",
                            color: s.text || "#111",
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          <Edit3 size={11} /> QA
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Stats grid — all 8 indicators, 4 columns × 2 rows */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr 1fr",
                      gap: 7,
                    }}
                  >
                    {[
                      { label: "Çatlar", val: row.chat_volume, color: "#2563eb" },
                      { label: "FRT", val: formatDuration(row.avg_frt), color: s.cardText },
                      { label: "ART", val: formatDuration(row.avg_art), color: s.cardText },
                      {
                        label: "CSAT",
                        val: row.csat > 0 ? `${row.csat}★` : "—",
                        color: row.csat > 0 ? "#d97706" : s.mutedText,
                      },
                      {
                        label: "FCR",
                        val: row.fcr_rate > 0 ? `${row.fcr_rate}%` : "—",
                        color: s.cardText,
                      },
                      {
                        label: "QA Score",
                        val: row.qa_score > 0 ? `${row.qa_score}%` : "—",
                        color: row.qa_score > 0 ? qaColorFor(row.qa_score) : s.mutedText,
                      },
                      {
                        label: "Məşğulluq",
                        val: `${row.concurrency_rate}x`,
                        color: s.cardText,
                      },
                      { label: "Util.", val: `${row.utilization_rate}%`, color: "#8b5cf6" },
                    ].map(({ label, val, color }) => (
                      <div
                        key={label}
                        style={{
                          padding: "7px 8px",
                          borderRadius: 10,
                          background: s.surfaceBg || "#eef2f7",
                          border: `1px solid ${s.border || "rgba(0,0,0,0.05)"}`,
                        }}
                      >
                        <div style={{ fontSize: 8, color: s.mutedText, fontWeight: 600, textTransform: "uppercase", marginBottom: 3, letterSpacing: "0.02em" }}>
                          {label}
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 800, fontFamily: "monospace", color }}>
                          {val}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ═════════════ QA Modal (bottom sheet) ═════════════ */}
      {showQaModal && (
        <div style={overlayStyle} onClick={() => setShowQaModal(false)}>
          <div style={sheetStyle} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
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
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 17, fontWeight: 700, color: s.cardText }}>
                <Edit3 size={18} style={{ color: "#2563eb" }} />
                QA Qiymətləndirilməsi
              </div>
              <button
                onClick={() => setShowQaModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: s.mutedText, display: "flex" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitQa} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Operator (disabled) */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: s.mutedText, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                  Operator
                </label>
                <input
                  value={qaOpName}
                  disabled
                  style={{
                    ...inputStyle,
                    background: s.surfaceBg || "#e5e7eb",
                    color: s.mutedText,
                    fontWeight: 700,
                  }}
                />
              </div>

              {/* Chat ID */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: s.mutedText, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                  Chat ID
                </label>
                <input
                  type="number"
                  value={qaChatId}
                  onChange={(e) => setQaChatId(e.target.value)}
                  placeholder="Məsələn: 123"
                  style={{ ...inputStyle, fontFamily: "monospace", fontWeight: 700 }}
                  required
                />
              </div>

              {/* Score buttons */}
              {[
                { label: "Qrammatika və Yazı qaydaları (0–5)", val: scoreGrammar, set: setScoreGrammar },
                { label: "Nəzakət və Etika (0–5)", val: scorePoliteness, set: setScorePoliteness },
                { label: "Cavabın Tamlığı və Həlli (0–5)", val: scoreCompleteness, set: setScoreCompleteness },
              ].map(({ label, val, set }) => (
                <div key={label}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: s.mutedText, display: "block", marginBottom: 8 }}>
                    {label}
                  </label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[1, 2, 3, 4, 5].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => set(v)}
                        style={scoreBtn(val, v)}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Actions */}
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  paddingTop: 12,
                  borderTop: `1px solid ${s.border || "rgba(0,0,0,0.08)"}`,
                  marginTop: 4,
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowQaModal(false)}
                  style={{
                    flex: 1,
                    height: 44,
                    borderRadius: 10,
                    border: `1px solid ${s.border || "rgba(0,0,0,0.08)"}`,
                    background: s.surfaceBg || "#e5e7eb",
                    color: s.text,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Ləğv et
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingQa}
                  style={{
                    flex: 1,
                    height: 44,
                    borderRadius: 10,
                    border: "none",
                    background: isSubmittingQa ? "#9ca3af" : "#2563eb",
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: isSubmittingQa ? "not-allowed" : "pointer",
                  }}
                >
                  {isSubmittingQa ? "Saxlanılır..." : "Yadda saxla"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

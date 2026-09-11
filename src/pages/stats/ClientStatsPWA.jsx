import { useState, useEffect } from "react";
import { SpinLoading } from "antd-mobile";
import { BarChart3, RefreshCw } from "lucide-react";
import { useNavBarContext } from "../../components/NavBarContext";
import { StatsService } from "../../services/stats.service";
import toast from "../../helpers/toast";

const STORAGE_KEY = "clientStatsPWA_cache";

export default function ClientStatsPWA() {
  const { setTitle, setShowBack, themeStyles } = useNavBarContext();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    setTitle("Müştəri Statistikası (PWA)");
    setShowBack(false);
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setStats(parsed.data);
        setLastUpdated(parsed.ts);
      } catch {}
    }
    fetchStats();
    return () => setTitle("");
  }, [setTitle, setShowBack]);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const res = await StatsService.getClientStats({});
      const payload = res?.data || res;
      setStats(payload);
      const ts = new Date().toISOString();
      setLastUpdated(ts);
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ data: payload, ts }),
        );
      } catch {}
    } catch (err) {
      toast.fail("Statistika yüklənərkən xəta oldu");
    } finally {
      setIsLoading(false);
    }
  };

  const updateStats = async () => {
    setIsLoading(true);
    try {
      await StatsService.updateClientStats({});
      toast.success("Statistika yeniləndi");
      await fetchStats();
    } catch {
      toast.fail("Yeniləmə zamanı xəta baş verdi");
      setIsLoading(false);
    }
  };

  const s = themeStyles || {};

  if (isLoading && !stats) {
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

  return (
    <div
      style={{
        padding: 12,
        minHeight: "100vh",
        background: s.pageBg || "#f6f7fb",
        color: s.text || "#111",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <BarChart3 size={18} style={{ color: "#2563eb" }} />
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>
              Müştəri Statistikası (PWA)
            </div>
            <div style={{ fontSize: 12, color: s.mutedText || "#6b7280" }}>
              Offline cache istifadə edir · Son yenilənmə:{" "}
              {lastUpdated ? new Date(lastUpdated).toLocaleString() : "—"}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={fetchStats}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: `1px solid ${s.border || "rgba(0,0,0,0.08)"}`,
              background: s.cardBg || "#fff",
              cursor: "pointer",
            }}
          >
            <RefreshCw size={14} /> Yenilə
          </button>
          <button
            onClick={updateStats}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: `1px solid ${s.border || "rgba(0,0,0,0.08)"}`,
              background: "#10b981",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Serverə Yenilə
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
        <div
          style={{
            padding: 14,
            borderRadius: 12,
            background: s.cardBg || "#fff",
            border: `1px solid ${s.border || "rgba(0,0,0,0.06)"}`,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
            Qısa Xülasə
          </div>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              fontFamily: "inherit",
              fontSize: 13,
              color: s.cardText || "#111",
            }}
          >
            {JSON.stringify(stats?.kpi || stats || {}, null, 2)}
          </pre>
        </div>

        <div
          style={{
            padding: 14,
            borderRadius: 12,
            background: s.cardBg || "#fff",
            border: `1px solid ${s.border || "rgba(0,0,0,0.06)"}`,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
            Əlavə Məlumat
          </div>
          <div style={{ fontSize: 13, color: s.mutedText || "#6b7280" }}>
            {stats?.details || "Ətraflı məlumat yoxdur"}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Button, Card, Input, SpinLoading, TextArea, Tag } from "antd-mobile";
import {
  BadgeInfo,
  RefreshCw,
  Save,
  Search,
  ShieldAlert,
  UserCog,
  FileText,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useNavBarContext } from "../../components/NavBarContext";
import PermissionGuard from "../../components/auth/PermissionGuard";
import { StatsService } from "../../services/stats.service";
import toast from "../../helpers/toast";

const emptyForm = {
  total_support_tickets: "",
  client_priority: "medium",
  internal_notes: "",
};

const PRIORITY_META = {
  low: { label: "Aşağı", color: "#16a34a" },
  medium: { label: "Orta", color: "#d97706" },
  high: { label: "Yüksək", color: "#dc2626" },
};

const normalizeStats = (response) => {
  const payload = response?.data ?? response;
  return payload?.data ?? payload ?? null;
};

const formatValue = (value) => {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
};

export default function ClientStatsEditorPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setTitle, setShowBack, themeStyles } = useNavBarContext();

  const initialAccount = searchParams.get("account") || "";

  const [accountId, setAccountId] = useState(initialAccount);
  const [loadedAccountId, setLoadedAccountId] = useState(initialAccount);
  const [stats, setStats] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [isLoading, setIsLoading] = useState(Boolean(initialAccount));
  const [isSaving, setIsSaving] = useState(false);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    setTitle("Müştəri Redaktoru");
    setShowBack(false);
    return () => setTitle("");
  }, [setTitle, setShowBack]);

  useEffect(() => {
    if (initialAccount) {
      loadClientStats(initialAccount);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAccount]);

  const loadClientStats = async (targetAccount = accountId) => {
    const account = String(targetAccount || "").trim();
    if (!account) {
      toast.fail("Hesab ID daxil edin");
      return;
    }

    setIsLoading(true);
    setForbidden(false);

    try {
      const response = await StatsService.getClientStats({ account });
      const payload = normalizeStats(response);

      if (!payload) {
        setStats(null);
        setLoadedAccountId(account);
        setFormData(emptyForm);
        toast.fail("Bu hesab üçün məlumat tapılmadı");
        return;
      }

      setStats(payload);
      setLoadedAccountId(account);
      setFormData({
        total_support_tickets: payload.total_support_tickets ?? "",
        client_priority: payload.client_priority ?? "medium",
        internal_notes: payload.internal_notes ?? "",
      });
    } catch (error) {
      if (error?.response?.status === 403) {
        setForbidden(true);
      } else {
        toast.fail("Məlumat yüklənərkən xəta baş verdi");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    const account = String(accountId || loadedAccountId || "").trim();
    if (!account) {
      toast.fail("Hesab ID daxil edin");
      return;
    }

    setIsSaving(true);
    try {
      const response = await StatsService.updateClientStats({
        account,
        total_support_tickets: Number(formData.total_support_tickets) || 0,
        client_priority: formData.client_priority,
        internal_notes: formData.internal_notes,
      });

      const payload = normalizeStats(response);
      if (payload) {
        setStats(payload);
      }

      toast.success("Müştəri statistikası yeniləndi");
    } catch (error) {
      toast.fail("Yadda saxlanarkən xəta baş verdi");
    } finally {
      setIsSaving(false);
    }
  };

  const s = themeStyles || {};
  const cardStyle = {
    background: s.cardBg || "#fff",
    border: `1px solid ${s.border || "rgba(0,0,0,0.08)"}`,
    borderRadius: 18,
    boxShadow: s.isDark ? "none" : "0 10px 28px rgba(15, 23, 42, 0.04)",
  };

  const labelStyle = {
    fontSize: 12,
    fontWeight: 600,
    color: s.cardTextSecondary || s.mutedText || "#6b7280",
    marginBottom: 6,
  };

  const inputStyle = {
    width: "100%",
    borderRadius: 12,
    border: `1px solid ${s.border || "rgba(0,0,0,0.08)"}`,
    background: s.inputBg || s.surfaceBg || "#fff",
    color: s.inputText || s.cardText || "#111",
    padding: "10px 12px",
    boxSizing: "border-box",
  };

  const priority = PRIORITY_META[formData.client_priority] || PRIORITY_META.medium;

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 12,
        paddingBottom: "calc(96px + env(safe-area-inset-bottom))",
        background:
          s.pageBg ||
          "linear-gradient(180deg, rgba(244,247,255,1) 0%, rgba(246,247,251,1) 38%, rgba(246,247,251,1) 100%)",
        color: s.text || "#111",
      }}
    >
      <div
        style={{
          ...cardStyle,
          marginBottom: 12,
          padding: 16,
          background:
            s.cardBg ||
            "linear-gradient(135deg, rgba(37,99,235,0.14), rgba(99,102,241,0.08))",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: "rgba(37,99,235,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#2563eb",
              flexShrink: 0,
            }}
          >
            <UserCog size={22} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                lineHeight: 1.15,
                color: s.cardText || s.text || "#111",
              }}
            >
              Müştəri statistika redaktoru
            </div>
            <div
              style={{
                marginTop: 5,
                fontSize: 12,
                color: s.cardTextSecondary || s.mutedText || "#6b7280",
              }}
            >
              Hesab ID ilə statistik kartı yüklə, PWA üçün mobil formda yenilə.
            </div>
          </div>
        </div>
      </div>

      <Card style={{ ...cardStyle, marginBottom: 12 }} bodyStyle={{ padding: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <Search size={16} style={{ color: "#2563eb" }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: s.cardText || s.text || "#111" }}>
              Hesabı yüklə
            </div>
            <div style={{ fontSize: 11, color: s.mutedText || "#6b7280" }}>
              account dəyərini yazın və məlumatı gətirin
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <div style={labelStyle}>Hesab ID</div>
            <Input
              value={accountId}
              onChange={setAccountId}
              placeholder="Məs: 12345"
              style={inputStyle}
            />
          </div>
          <Button
            color="primary"
            loading={isLoading}
            onClick={() => loadClientStats()}
            style={{ borderRadius: 12, alignSelf: "flex-end", minWidth: 92 }}
          >
            Yüklə
          </Button>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <Button
            fill="outline"
            onClick={() => {
              setAccountId("");
              setLoadedAccountId("");
              setStats(null);
              setFormData(emptyForm);
              setForbidden(false);
            }}
            style={{ borderRadius: 12, flex: 1 }}
          >
            Təmizlə
          </Button>
          <Button
            fill="outline"
            onClick={() => loadClientStats(accountId)}
            style={{ borderRadius: 12, flex: 1 }}
          >
            <RefreshCw size={14} style={{ marginRight: 6 }} />
            Yenilə
          </Button>
        </div>
      </Card>

      {isLoading && !stats && !forbidden ? (
        <div
          style={{
            ...cardStyle,
            padding: 24,
            minHeight: 180,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <SpinLoading />
        </div>
      ) : forbidden ? (
        <Card style={{ ...cardStyle, marginBottom: 12 }} bodyStyle={{ padding: 16 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                background: "rgba(220,38,38,0.12)",
                color: "#dc2626",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <ShieldAlert size={18} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: s.cardText || s.text || "#111" }}>
                Məlumatlara giriş icazəsi yoxdur
              </div>
              <div style={{ marginTop: 4, fontSize: 12, color: s.mutedText || "#6b7280" }}>
                Bu hesab üçün 403 cavabı alındı.
              </div>
            </div>
          </div>
        </Card>
      ) : stats ? (
        <>
          <Card style={{ ...cardStyle, marginBottom: 12 }} bodyStyle={{ padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: s.mutedText || "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Cari profil
                </div>
                <div style={{ marginTop: 6, fontSize: 16, fontWeight: 800, color: s.cardText || s.text || "#111" }}>
                  {formatValue(stats.account_name || stats.client_name || loadedAccountId || accountId)}
                </div>
                <div style={{ marginTop: 4, fontSize: 12, color: s.mutedText || "#6b7280" }}>
                  Hesab: {formatValue(loadedAccountId || accountId)}
                </div>
              </div>
              <Tag color="primary" fill="outline" style={{ borderRadius: 999 }}>
                <BadgeInfo size={12} style={{ marginRight: 4 }} />
                Aktiv
              </Tag>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                marginTop: 14,
              }}
            >
              <div
                style={{
                  borderRadius: 14,
                  background: s.surfaceBg || "#eef2f7",
                  padding: 12,
                }}
              >
                <div style={{ fontSize: 11, color: s.mutedText || "#6b7280" }}>
                  Bilet sayı
                </div>
                <div style={{ marginTop: 4, fontSize: 20, fontWeight: 900, color: s.cardText || s.text || "#111" }}>
                  {formatValue(stats.total_support_tickets)}
                </div>
              </div>

              <div
                style={{
                  borderRadius: 14,
                  background: `${priority.color}14`,
                  padding: 12,
                }}
              >
                <div style={{ fontSize: 11, color: s.mutedText || "#6b7280" }}>
                  Prioritet
                </div>
                <div
                  style={{
                    marginTop: 4,
                    fontSize: 18,
                    fontWeight: 900,
                    color: priority.color,
                  }}
                >
                  {priority.label}
                </div>
              </div>
            </div>
          </Card>

          <Card style={{ ...cardStyle, marginBottom: 12 }} bodyStyle={{ padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <FileText size={16} style={{ color: "#2563eb" }} />
              <div style={{ fontSize: 14, fontWeight: 700, color: s.cardText || s.text || "#111" }}>
                Redaktə forması
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <div style={labelStyle}>Dəstək biletləri</div>
                <Input
                  type="number"
                  value={formData.total_support_tickets}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      total_support_tickets: value,
                    }))
                  }
                  placeholder="0"
                  style={inputStyle}
                />
              </div>

              <div>
                <div style={labelStyle}>Müştəri prioriteti</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                  {Object.entries(PRIORITY_META).map(([key, meta]) => {
                    const active = formData.client_priority === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            client_priority: key,
                          }))
                        }
                        style={{
                          border: `1px solid ${active ? meta.color : s.border || "rgba(0,0,0,0.08)"}`,
                          background: active ? `${meta.color}16` : s.surfaceBg || "#eef2f7",
                          color: active ? meta.color : s.cardText || s.text || "#111",
                          borderRadius: 12,
                          padding: "10px 8px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        {meta.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div style={labelStyle}>Daxili qeydlər</div>
                <TextArea
                  value={formData.internal_notes}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      internal_notes: value,
                    }))
                  }
                  placeholder="Müştəri ilə bağlı daxili qeydlər..."
                  rows={5}
                  style={{
                    ...inputStyle,
                    minHeight: 120,
                    resize: "vertical",
                  }}
                />
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <PermissionGuard id="update-info">
                <Button
                  block
                  color="primary"
                  loading={isSaving}
                  onClick={handleSave}
                  style={{ borderRadius: 12, fontWeight: 700 }}
                >
                  <Save size={14} style={{ marginRight: 6 }} />
                  Yadda saxla
                </Button>
              </PermissionGuard>
            </div>
          </Card>

          <Card style={cardStyle} bodyStyle={{ padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: s.mutedText || "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
              Son yüklənən məlumat
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <span style={{ color: s.mutedText || "#6b7280" }}>Account</span>
                <span style={{ fontFamily: "monospace", fontWeight: 700, color: s.cardText || s.text || "#111" }}>
                  {formatValue(loadedAccountId || accountId)}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <span style={{ color: s.mutedText || "#6b7280" }}>Bilet sayı</span>
                <span style={{ fontFamily: "monospace", fontWeight: 700, color: s.cardText || s.text || "#111" }}>
                  {formatValue(stats.total_support_tickets)}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <span style={{ color: s.mutedText || "#6b7280" }}>Prioritet</span>
                <span style={{ fontFamily: "monospace", fontWeight: 700, color: priority.color }}>
                  {priority.label}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <span style={{ color: s.mutedText || "#6b7280" }}>Qeydlər</span>
                <span style={{ fontFamily: "monospace", fontWeight: 700, color: s.cardText || s.text || "#111" }}>
                  {String(formData.internal_notes || "").length} simvol
                </span>
              </div>
            </div>
          </Card>
        </>
      ) : (
        <Card style={{ ...cardStyle, marginBottom: 12 }} bodyStyle={{ padding: 16, textAlign: "center" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: s.cardText || s.text || "#111" }}>
            Hələ məlumat yüklənməyib
          </div>
          <div style={{ marginTop: 6, fontSize: 12, color: s.mutedText || "#6b7280" }}>
            Hesab ID yazıb "Yüklə" düyməsinə basın.
          </div>
        </Card>
      )}
    </div>
  );
}

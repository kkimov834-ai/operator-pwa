import { useState, useEffect } from "react";
import { SpinLoading } from "antd-mobile";
import {
  User,
  Search,
  AlertCircle,
  Wallet,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  X,
} from "lucide-react";
import { useNavBarContext } from "../../components/NavBarContext";
import { PartnerService } from "../../services/partner.service";
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

export default function PartnerClientsPage() {
  const { setTitle, setShowBack, themeStyles } = useNavBarContext();

  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState("active");
  const [sortKey, setSortKey] = useState("partner_attached_at");
  const [sortDirection, setSortDirection] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  // Detail bottom-sheet
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientDetails, setClientDetails] = useState(null);
  const [clientModules, setClientModules] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    setTitle("Müştərilərim");
    setShowBack(false);
    return () => setTitle("");
  }, [setTitle, setShowBack]);

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const res = await PartnerService.getMyClients();
      if (res.status === "success") {
        setClients(res.data || []);
      }
    } catch {
      toast.fail("Müştəri siyahısının yüklənməsində xəta");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleViewClient = async (client) => {
    setSelectedClient(client);
    setClientDetails(null);
    setClientModules([]);
    setDetailsLoading(true);
    try {
      const [infoRes, modRes] = await Promise.allSettled([
        api.get(`/user/info?account=${client.account}`),
        api.post("/user/modules", { account: client.account }),
      ]);
      if (infoRes.status === "fulfilled" && infoRes.value?.status === "success") {
        setClientDetails(infoRes.value.data);
      }
      if (modRes.status === "fulfilled") {
        const raw = modRes.value;
        setClientModules(raw?.data || []);
      }
    } catch {
      toast.fail("Müştəri detalları yüklənərkən xəta");
    } finally {
      setDetailsLoading(false);
    }
  };

  /* ──────── sort ──────── */
  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("desc");
    }
    setCurrentPage(1);
  };

  /* ──────── filter + sort + paginate ──────── */
  const filtered = clients.filter((c) => {
    const fullName = `${c.name} ${c.lastname}`.toLowerCase();
    const q = search.toLowerCase();
    const matchSearch =
      fullName.includes(q) ||
      c.account.toLowerCase().includes(q) ||
      (c.phone && c.phone.includes(q));
    const isActive = parseInt(c.status) === 1;
    const matchStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
        ? isActive
        : !isActive;
    return matchSearch && matchStatus;
  });

  const sorted = [...filtered].sort((a, b) => {
    let av = a[sortKey];
    let bv = b[sortKey];
    if (sortKey === "name") {
      av = `${a.name} ${a.lastname}`.toLowerCase();
      bv = `${b.name} ${b.lastname}`.toLowerCase();
    } else if (
      sortKey === "partner_attached_at" ||
      sortKey === "registermoment"
    ) {
      av = av ? new Date(av).getTime() : 0;
      bv = bv ? new Date(bv).getTime() : 0;
    } else if (
      sortKey === "total_paid" ||
      sortKey === "commission" ||
      sortKey === "status"
    ) {
      av = parseFloat(av || 0);
      bv = parseFloat(bv || 0);
    } else {
      av = String(av || "").toLowerCase();
      bv = String(bv || "").toLowerCase();
    }
    if (av === bv) return 0;
    return (av > bv ? 1 : -1) * (sortDirection === "asc" ? 1 : -1);
  });

  const totalItems = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const paginated = sorted.slice(startIndex, startIndex + pageSize);

  /* ──────── style helpers ──────── */
  const s = themeStyles || {};

  const cardStyle = {
    background: s.cardBg || "#fff",
    color: s.cardText || "#111",
    border: `1px solid ${s.border || "rgba(0,0,0,0.08)"}`,
    borderRadius: 14,
  };

  const statusBadge = (status) =>
    parseInt(status) === 1
      ? {
          display: "inline-block",
          padding: "3px 9px",
          borderRadius: 8,
          fontSize: 10,
          fontWeight: 600,
          background: "#dcfce7",
          color: "#15803d",
          whiteSpace: "nowrap",
        }
      : {
          display: "inline-block",
          padding: "3px 9px",
          borderRadius: 8,
          fontSize: 10,
          fontWeight: 600,
          background: "#fee2e2",
          color: "#b91c1c",
          whiteSpace: "nowrap",
        };

  const filterTabStyle = (active) => ({
    flex: 1,
    padding: "6px 0",
    fontSize: 12,
    fontWeight: active ? 700 : 500,
    color: active ? s.text || "#111" : s.mutedText || "#6b7280",
    background: active ? s.cardBg || "#fff" : "transparent",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    boxShadow: active ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
    transition: "all 0.15s",
  });

  const sortIconFor = (key) => {
    if (sortKey !== key)
      return <ArrowUpDown size={12} style={{ color: s.mutedText, opacity: 0.4 }} />;
    return sortDirection === "asc" ? (
      <ArrowUp size={12} style={{ color: "#2563eb" }} />
    ) : (
      <ArrowDown size={12} style={{ color: "#2563eb" }} />
    );
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
    maxHeight: "88vh",
    overflowY: "auto",
    padding: "20px 16px calc(20px + env(safe-area-inset-bottom))",
    boxShadow: "0 -8px 40px rgba(0,0,0,0.15)",
    animation: "slideUp 0.28s ease",
  };

  /* ═══════════════════════ RENDER ═══════════════════════ */
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
          Müştərilərim
        </h2>
        <p style={{ margin: "3px 0 0", fontSize: 12, color: s.mutedText || "#6b7280" }}>
          Partnyor kodunuzla bağlı müştərilər
        </p>
      </div>

      {/* ── Search ── */}
      <div style={{ position: "relative", marginBottom: 10 }}>
        <Search
          size={15}
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            color: s.mutedText || "#9ca3af",
          }}
        />
        <input
          type="text"
          placeholder="Ad, hesab kodu və ya telefon..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          style={{
            width: "100%",
            height: 40,
            paddingLeft: 36,
            paddingRight: 12,
            borderRadius: 10,
            border: `1px solid ${s.border || "rgba(0,0,0,0.08)"}`,
            background: s.inputBg || "#fff",
            color: s.inputText || "#111",
            fontSize: 13,
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* ── Status Filter Tabs ── */}
      <div
        style={{
          display: "flex",
          gap: 4,
          padding: 4,
          borderRadius: 12,
          background: s.surfaceBg || "#e5e7eb",
          border: `1px solid ${s.border || "rgba(0,0,0,0.06)"}`,
          marginBottom: 12,
        }}
      >
        {["active", "inactive", "all"].map((f) => (
          <button
            key={f}
            style={filterTabStyle(statusFilter === f)}
            onClick={() => {
              setStatusFilter(f);
              setCurrentPage(1);
            }}
          >
            {f === "active" ? "Aktiv" : f === "inactive" ? "Deaktiv" : "Hamısı"}
          </button>
        ))}
      </div>

      {/* ── Sort bar ── */}
      <div
        style={{
          display: "flex",
          gap: 6,
          overflowX: "auto",
          marginBottom: 10,
          paddingBottom: 2,
        }}
      >
        {[
          { key: "name", label: "Ad" },
          { key: "partner_attached_at", label: "Qoşulma" },
          { key: "total_paid", label: "Ödənilib" },
          { key: "commission", label: "Komissiya" },
          { key: "status", label: "Status" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handleSort(key)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: "5px 10px",
              borderRadius: 8,
              border: `1px solid ${
                sortKey === key ? "#2563eb" : s.border || "rgba(0,0,0,0.08)"
              }`,
              background:
                sortKey === key
                  ? "rgba(37,99,235,0.07)"
                  : s.cardBg || "#fff",
              color: sortKey === key ? "#2563eb" : s.mutedText || "#6b7280",
              fontSize: 11,
              fontWeight: sortKey === key ? 700 : 500,
              cursor: "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {label} {sortIconFor(key)}
          </button>
        ))}
      </div>

      {/* ── List ── */}
      {isLoading ? (
        <div style={{ textAlign: "center", paddingTop: 60 }}>
          <SpinLoading />
        </div>
      ) : paginated.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            paddingTop: 60,
            color: s.mutedText || "#9ca3af",
          }}
        >
          <AlertCircle
            size={36}
            style={{ margin: "0 auto 8px", display: "block", opacity: 0.5 }}
          />
          Müştəri tapılmadı
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {paginated.map((client) => {
            const isSelected = selectedClient?.account === client.account;
            const attached = client.partner_attached_at;

            return (
              <div
                key={client.account}
                onClick={() => handleViewClient(client)}
                style={{
                  ...cardStyle,
                  padding: "13px 14px",
                  cursor: "pointer",
                  borderLeft: isSelected
                    ? "3px solid #2563eb"
                    : `1px solid ${s.border || "rgba(0,0,0,0.08)"}`,
                }}
              >
                {/* Row 1: name + status */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 6,
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: s.cardText,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {client.name} {client.lastname}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        fontFamily: "monospace",
                        color: "#2563eb",
                        marginTop: 1,
                      }}
                    >
                      {client.account}
                    </div>
                  </div>
                  <span style={statusBadge(client.status)}>
                    {parseInt(client.status) === 1 ? "Aktiv" : "Deaktiv"}
                  </span>
                </div>

                {/* Row 2: phone + attach date + commission */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: 11,
                    color: s.mutedText || "#6b7280",
                    flexWrap: "wrap",
                    gap: 4,
                  }}
                >
                  <span>{client.phone || "—"}</span>
                  <div style={{ display: "flex", gap: 10 }}>
                    <span>
                      {attached ? (
                        <span
                          style={{
                            fontFamily: "monospace",
                            background: "rgba(37,99,235,0.07)",
                            color: "#2563eb",
                            padding: "2px 7px",
                            borderRadius: 6,
                            fontSize: 10,
                            fontWeight: 600,
                          }}
                        >
                          {formatDate(attached)}
                        </span>
                      ) : (
                        <span
                          style={{
                            background: "rgba(245,158,11,0.08)",
                            color: "#d97706",
                            padding: "2px 7px",
                            borderRadius: 6,
                            fontSize: 10,
                            fontWeight: 600,
                          }}
                        >
                          İlk ödəniş gözlənilir
                        </span>
                      )}
                    </span>
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontWeight: 700,
                        color: "#059669",
                        fontSize: 11,
                      }}
                    >
                      +{(client.commission || 0).toFixed(2)} AZN
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Pagination ── */}
      {!isLoading && totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 14,
            padding: "10px 14px",
            borderRadius: 12,
            background: s.cardBg || "#fff",
            border: `1px solid ${s.border || "rgba(0,0,0,0.08)"}`,
          }}
        >
          <span style={{ fontSize: 11, color: s.mutedText || "#6b7280" }}>
            {startIndex + 1}–{Math.min(startIndex + pageSize, totalItems)} /{" "}
            {totalItems} müştəri
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={safeCurrentPage === 1}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: `1px solid ${s.border || "rgba(0,0,0,0.08)"}`,
                background: s.surfaceBg || "#e5e7eb",
                color: safeCurrentPage === 1 ? s.mutedText : s.text,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: safeCurrentPage === 1 ? "not-allowed" : "pointer",
                opacity: safeCurrentPage === 1 ? 0.4 : 1,
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: s.text,
                minWidth: 40,
                textAlign: "center",
              }}
            >
              {safeCurrentPage} / {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(p + 1, totalPages))
              }
              disabled={safeCurrentPage === totalPages}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: `1px solid ${s.border || "rgba(0,0,0,0.08)"}`,
                background: s.surfaceBg || "#e5e7eb",
                color:
                  safeCurrentPage === totalPages ? s.mutedText : s.text,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor:
                  safeCurrentPage === totalPages ? "not-allowed" : "pointer",
                opacity: safeCurrentPage === totalPages ? 0.4 : 1,
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ═══════════ Detail Bottom Sheet ═══════════ */}
      {selectedClient && (
        <div style={overlayStyle} onClick={() => setSelectedClient(null)}>
          <div style={sheetStyle} onClick={(e) => e.stopPropagation()}>
            {/* Sheet header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 14,
              }}
            >
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    color: s.cardText,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {selectedClient.name} {selectedClient.lastname}
                </div>
                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: 10,
                    color: "#2563eb",
                    marginTop: 2,
                  }}
                >
                  {selectedClient.account}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={statusBadge(selectedClient.status)}>
                  {parseInt(selectedClient.status) === 1 ? "Aktiv" : "Deaktiv"}
                </span>
                <button
                  onClick={() => setSelectedClient(null)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: s.mutedText,
                    padding: 4,
                    display: "flex",
                  }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Quick stats */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  padding: 12,
                  borderRadius: 12,
                  background: s.surfaceBg || "#eef2f7",
                  border: `1px solid ${s.border || "rgba(0,0,0,0.06)"}`,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    color: s.mutedText,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Wallet size={11} /> Balans
                </div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    fontFamily: "monospace",
                    marginTop: 5,
                    color: s.cardText,
                  }}
                >
                  {detailsLoading
                    ? "..."
                    : clientDetails
                    ? `${parseFloat(clientDetails.balance || 0).toFixed(2)} AZN`
                    : "—"}
                </div>
              </div>
              <div
                style={{
                  padding: 12,
                  borderRadius: 12,
                  background: s.surfaceBg || "#eef2f7",
                  border: `1px solid ${s.border || "rgba(0,0,0,0.06)"}`,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    color: s.mutedText,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Calendar size={11} /> Qoşulma tarixi
                </div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    fontFamily: "monospace",
                    marginTop: 5,
                    color: s.cardText,
                  }}
                >
                  {selectedClient.partner_attached_at
                    ? formatDate(selectedClient.partner_attached_at)
                    : "İlk ödəniş gözlənilir"}
                </div>
              </div>
            </div>

            {detailsLoading ? (
              <div style={{ textAlign: "center", padding: 24 }}>
                <SpinLoading />
              </div>
            ) : (
              <>
                {/* Financial stats */}
                <div style={{ marginBottom: 16 }}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#2563eb",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      marginBottom: 8,
                    }}
                  >
                    Maliyyə göstəriciləri
                  </div>
                  <div
                    style={{
                      padding: 12,
                      borderRadius: 12,
                      background: s.surfaceBg || "#eef2f7",
                      border: `1px solid ${s.border || "rgba(0,0,0,0.06)"}`,
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    {[
                      {
                        label: "Ümumi ödəniş:",
                        val: `${(selectedClient.total_paid || 0).toFixed(2)} AZN`,
                        color: s.cardText,
                      },
                      {
                        label: "Qazanılan komissiya:",
                        val: `${(selectedClient.commission || 0).toFixed(2)} AZN`,
                        color: "#059669",
                      },
                    ].map(({ label, val, color }) => (
                      <div
                        key={label}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 12,
                        }}
                      >
                        <span style={{ color: s.mutedText }}>{label}</span>
                        <span
                          style={{
                            fontFamily: "monospace",
                            fontWeight: 700,
                            color,
                          }}
                        >
                          {val}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact info */}
                <div style={{ marginBottom: 16 }}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#2563eb",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      marginBottom: 8,
                    }}
                  >
                    Əlaqə məlumatları
                  </div>
                  <div
                    style={{
                      padding: 12,
                      borderRadius: 12,
                      background: s.surfaceBg || "#eef2f7",
                      border: `1px solid ${s.border || "rgba(0,0,0,0.06)"}`,
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                      fontSize: 12,
                    }}
                  >
                    {[
                      { label: "Telefon:", val: selectedClient.phone || "—" },
                      {
                        label: "E-poçt:",
                        val: selectedClient.email || "—",
                      },
                      {
                        label: "Qeydiyyat:",
                        val: formatDate(selectedClient.registermoment),
                        mono: true,
                      },
                    ].map(({ label, val, mono }) => (
                      <div
                        key={label}
                        style={{ display: "flex", justifyContent: "space-between", gap: 8 }}
                      >
                        <span style={{ color: s.mutedText }}>{label}</span>
                        <span
                          style={{
                            color: s.cardText,
                            fontFamily: mono ? "monospace" : undefined,
                            fontWeight: 600,
                            textAlign: "right",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: "60%",
                          }}
                        >
                          {val}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Modules */}
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#2563eb",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      marginBottom: 8,
                    }}
                  >
                    Aktiv modullar ({clientModules.length})
                  </div>
                  {clientModules.length === 0 ? (
                    <p
                      style={{
                        fontSize: 12,
                        color: s.mutedText,
                        textAlign: "center",
                        padding: 16,
                      }}
                    >
                      Heç bir modul tapılmadı
                    </p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {clientModules.map((mod) => (
                        <div
                          key={mod.module_id}
                          style={{
                            padding: "10px 12px",
                            borderRadius: 10,
                            background: s.surfaceBg || "#eef2f7",
                            border: `1px solid ${s.border || "rgba(0,0,0,0.06)"}`,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            fontSize: 12,
                          }}
                        >
                          <span
                            style={{
                              fontWeight: 700,
                              color: s.cardText,
                              textTransform: "capitalize",
                            }}
                          >
                            {mod.module_id}
                          </span>
                          <span
                            style={{
                              background: "#dcfce7",
                              color: "#15803d",
                              padding: "2px 8px",
                              borderRadius: 6,
                              fontSize: 10,
                              fontWeight: 600,
                            }}
                          >
                            Aktiv
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

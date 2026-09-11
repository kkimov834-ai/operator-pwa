import { useState, useEffect } from "react";
import { SpinLoading } from "antd-mobile";
import {
  Plus,
  Wallet,
  Calendar,
  AlertCircle,
  Send,
  ChevronRight,
  User,
  Edit,
  X,
} from "lucide-react";
import { useNavBarContext } from "../../components/NavBarContext";
import { PartnerService } from "../../services/partner.service";
import toast from "../../helpers/toast";

export default function PartnersPage() {
  const { setTitle, setShowBack, themeStyles } = useNavBarContext();

  const [partners, setPartners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState(null);

  // Detail panel tabs
  const [activeTab, setActiveTab] = useState("clients");
  const [partnerClients, setPartnerClients] = useState([]);
  const [partnerTransactions, setPartnerTransactions] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [txLoading, setTxLoading] = useState(false);

  // Add modal
  const [showAddModal, setShowAddModal] = useState(false);
  const emptyPartner = {
    partnerPin: "",
    name: "",
    partner_type: "lifetime",
    status: "1",
    contract_start_date: "",
    contract_end_date: "",
    level1_limit: 5000,
    level2_limit: 15000,
    level1_rate: 5,
    level2_rate: 10,
    level3_rate: 15,
    fixed_amount: 0,
  };
  const [newPartnerData, setNewPartnerData] = useState({ ...emptyPartner });

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editPartnerData, setEditPartnerData] = useState({ ...emptyPartner });

  // Payout
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutInfo, setPayoutInfo] = useState("");
  const [payoutSubmitting, setPayoutSubmitting] = useState(false);

  // Reward
  const [rewardAmount, setRewardAmount] = useState("");
  const [rewardInfo, setRewardInfo] = useState("");
  const [rewardSubmitting, setRewardSubmitting] = useState(false);

  useEffect(() => {
    setTitle("Partnyorlar");
    setShowBack(false);
    return () => setTitle("");
  }, [setTitle, setShowBack]);

  /* ──────────────────── fetchers ──────────────────── */

  const fetchPartners = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const res = await PartnerService.getPartnersList();
      if (res.status === "success") {
        const list = res.data || [];
        setPartners(list);
        if (selectedPartner) {
          const updated = list.find(
            (p) => p.partnerPin === selectedPartner.partnerPin
          );
          if (updated) setSelectedPartner(updated);
        }
      }
    } catch {
      toast.fail("Partnyorların siyahısı yüklənərkən xəta baş verdi");
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPartnerDetails = async (partner) => {
    setSelectedPartner(partner);
    setActiveTab("clients");
    setPartnerClients([]);
    setPartnerTransactions([]);
    setPayoutAmount("");
    setPayoutInfo("");
    setRewardAmount("");
    setRewardInfo("");

    setClientsLoading(true);
    try {
      const r = await PartnerService.getPartnerClients(partner.partnerPin);
      if (r.status === "success") setPartnerClients(r.data || []);
    } catch {
      toast.fail("Müştərilərin yüklənməsində xəta");
    } finally {
      setClientsLoading(false);
    }

    setTxLoading(true);
    try {
      const r = await PartnerService.getPartnerTransactions(partner.partnerPin);
      if (r.status === "success") setPartnerTransactions(r.data || []);
    } catch {
      toast.fail("Tranzaksiyaların yüklənməsində xəta");
    } finally {
      setTxLoading(false);
    }
  };

  /* ──────────────── create / edit / payout / reward ──────────────── */

  const handleCreatePartner = async (e) => {
    e.preventDefault();
    if (!newPartnerData.partnerPin || !newPartnerData.name) {
      toast.fail("PIN və Ad daxil edilməlidir");
      return;
    }
    try {
      const res = await PartnerService.createPartner(newPartnerData);
      if (res.status === "success") {
        toast.success("Partnyor uğurla yaradıldı");
        setShowAddModal(false);
        fetchPartners();
        setNewPartnerData({ ...emptyPartner });
      }
    } catch (err) {
      toast.fail(err.response?.data?.message || "Yaradılma zamanı xəta");
    }
  };

  const openEditModal = (partner) => {
    const startFmt = partner.contract_start_date
      ? partner.contract_start_date.split(" ")[0]
      : "";
    const endFmt = partner.contract_end_date
      ? partner.contract_end_date.split(" ")[0]
      : "";
    setEditPartnerData({
      partnerPin: partner.partnerPin,
      name: partner.name,
      partner_type: partner.partner_type,
      status: String(partner.status),
      contract_start_date: startFmt,
      contract_end_date: endFmt,
      level1_limit: parseFloat(partner.level1_limit || 5000),
      level2_limit: parseFloat(partner.level2_limit || 15000),
      level1_rate: parseFloat(partner.level1_rate || 5),
      level2_rate: parseFloat(partner.level2_rate || 10),
      level3_rate: parseFloat(partner.level3_rate || 15),
      fixed_amount: parseFloat(partner.fixed_amount || 0),
    });
    setShowEditModal(true);
  };

  const handleEditPartner = async (e) => {
    e.preventDefault();
    try {
      const res = await PartnerService.updatePartner(
        editPartnerData.partnerPin,
        editPartnerData
      );
      if (res.status === "success") {
        toast.success("Partnyor məlumatları uğurla yeniləndi");
        setShowEditModal(false);
        await fetchPartners(true);
        if (selectedPartner?.partnerPin === editPartnerData.partnerPin) {
          setSelectedPartner({
            ...selectedPartner,
            ...editPartnerData,
            status: parseInt(editPartnerData.status),
            contract_start_date: editPartnerData.contract_start_date
              ? editPartnerData.contract_start_date + " 00:00:00"
              : selectedPartner.contract_start_date,
            contract_end_date: editPartnerData.contract_end_date
              ? editPartnerData.contract_end_date + " 00:00:00"
              : selectedPartner.contract_end_date,
          });
        }
      }
    } catch (err) {
      toast.fail(err.response?.data?.message || "Yenilənmə zamanı xəta");
    }
  };

  const handlePayoutSubmit = async (e) => {
    e.preventDefault();
    if (!payoutAmount || parseFloat(payoutAmount) <= 0) {
      toast.fail("Düzgün məbləğ daxil edin");
      return;
    }
    setPayoutSubmitting(true);
    try {
      const res = await PartnerService.makePayout(
        selectedPartner.partnerPin,
        payoutAmount,
        payoutInfo
      );
      if (res.status === "success") {
        toast.success("Ödəniş uğurla qeydə alındı");
        setPayoutAmount("");
        setPayoutInfo("");
        await fetchPartners(true);
        setTxLoading(true);
        try {
          const txRes = await PartnerService.getPartnerTransactions(
            selectedPartner.partnerPin
          );
          if (txRes.status === "success")
            setPartnerTransactions(txRes.data || []);
        } catch {}
        setTxLoading(false);
      }
    } catch (err) {
      toast.fail(err.response?.data?.message || "Ödəniş zamanı xəta");
    } finally {
      setPayoutSubmitting(false);
    }
  };

  const handleRewardSubmit = async (e) => {
    e.preventDefault();
    if (!rewardAmount || parseFloat(rewardAmount) <= 0) {
      toast.fail("Düzgün məbləğ daxil edin");
      return;
    }
    setRewardSubmitting(true);
    try {
      const res = await PartnerService.makeReward(
        selectedPartner.partnerPin,
        rewardAmount,
        rewardInfo
      );
      if (res.status === "success") {
        toast.success("Mükafat uğurla qeydə alındı");
        setRewardAmount("");
        setRewardInfo("");
        await fetchPartners(true);
        setTxLoading(true);
        try {
          const txRes = await PartnerService.getPartnerTransactions(
            selectedPartner.partnerPin
          );
          if (txRes.status === "success")
            setPartnerTransactions(txRes.data || []);
        } catch {}
        setTxLoading(false);
      }
    } catch (err) {
      toast.fail(
        err.response?.data?.message || "Mükafatlandırma zamanı xəta"
      );
    } finally {
      setRewardSubmitting(false);
    }
  };

  /* ──────────────────── shared style helpers ──────────────────── */

  const s = themeStyles || {};

  const cardStyle = {
    background: s.cardBg || "#fff",
    color: s.cardText || "#111",
    border: `1px solid ${s.border || "rgba(0,0,0,0.08)"}`,
    borderRadius: 14,
    overflow: "hidden",
  };

  const inputStyle = {
    width: "100%",
    height: 42,
    padding: "0 12px",
    borderRadius: 10,
    border: `1px solid ${s.border || "rgba(0,0,0,0.08)"}`,
    background: s.inputBg || "#fff",
    color: s.inputText || "#111",
    fontSize: 13,
    outline: "none",
    boxSizing: "border-box",
  };

  const selectStyle = {
    ...inputStyle,
    WebkitAppearance: "none",
    MozAppearance: "none",
    appearance: "none",
  };

  const labelStyle = {
    fontSize: 12,
    fontWeight: 600,
    color: s.text || "#111",
    marginBottom: 4,
    display: "block",
  };

  const smallLabelStyle = {
    ...labelStyle,
    fontSize: 11,
    fontWeight: 500,
  };

  const badgeBase = {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: 8,
    fontSize: 11,
    fontWeight: 600,
    whiteSpace: "nowrap",
  };

  const statusBadge = (status) =>
    parseInt(status) === 1
      ? { ...badgeBase, background: "#dcfce7", color: "#15803d" }
      : { ...badgeBase, background: "#fee2e2", color: "#b91c1c" };

  const typeBadge = (type, fixedAmount) => {
    if (type === "annual")
      return {
        ...badgeBase,
        background: "rgba(245,158,11,0.08)",
        color: "#d97706",
      };
    if (type === "fixed")
      return {
        ...badgeBase,
        background: "rgba(139,92,246,0.08)",
        color: "#7c3aed",
      };
    return {
      ...badgeBase,
      background: "rgba(99,102,241,0.08)",
      color: "#6366f1",
    };
  };

  const typeLabel = (type, fixedAmount) => {
    if (type === "annual") return "Годовой";
    if (type === "fixed")
      return `Разовый (${parseFloat(fixedAmount || 0).toFixed(2)} AZN)`;
    return "Бессрочный";
  };

  const txBadge = (type) => {
    if (type === "commission")
      return {
        ...badgeBase,
        background: "rgba(16,185,129,0.08)",
        color: "#059669",
        fontSize: 10,
        padding: "2px 8px",
      };
    if (type === "payout")
      return {
        ...badgeBase,
        background: "rgba(244,63,94,0.08)",
        color: "#e11d48",
        fontSize: 10,
        padding: "2px 8px",
      };
    if (type === "reward")
      return {
        ...badgeBase,
        background: "rgba(99,102,241,0.08)",
        color: "#6366f1",
        fontSize: 10,
        padding: "2px 8px",
      };
    return {
      ...badgeBase,
      background: "rgba(245,158,11,0.08)",
      color: "#d97706",
      fontSize: 10,
      padding: "2px 8px",
    };
  };

  const txLabel = (type) => {
    if (type === "commission") return "Komissiya";
    if (type === "payout") return "Ödəniş";
    if (type === "reward") return "Mükafat";
    return "Bonus çıxışı";
  };

  const btnPrimary = {
    width: "100%",
    height: 44,
    borderRadius: 10,
    border: "none",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  };

  /* ──────────────────── modal overlay helper ──────────────────── */

  const overlayStyle = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    backdropFilter: "blur(4px)",
    WebkitBackdropFilter: "blur(4px)",
    zIndex: 100,
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    padding: 0,
  };

  const modalStyle = {
    background: s.cardBg || "#fff",
    color: s.cardText || "#111",
    borderRadius: "20px 20px 0 0",
    width: "100%",
    maxHeight: "92vh",
    overflowY: "auto",
    padding: "20px 16px calc(16px + env(safe-area-inset-bottom))",
    boxShadow: "0 -8px 40px rgba(0,0,0,0.15)",
    animation: "slideUp 0.28s ease",
  };

  /* ──────────────────── form fields helper (used in both modals) ──────────────────── */

  const renderPartnerFormFields = (data, setData, isEdit = false) => (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={labelStyle}>
            Partnyor PIN-kodu {isEdit ? "(dəyişdirilməz)" : "*"}
          </label>
          <input
            type="text"
            placeholder="Məs. 1001"
            value={data.partnerPin}
            onChange={(e) =>
              !isEdit && setData({ ...data, partnerPin: e.target.value })
            }
            style={{
              ...inputStyle,
              ...(isEdit
                ? {
                    background: s.surfaceBg || "#eee",
                    color: s.mutedText || "#999",
                    fontFamily: "monospace",
                  }
                : {}),
            }}
            disabled={isEdit}
            required={!isEdit}
          />
        </div>
        <div>
          <label style={labelStyle}>Partnyor adı *</label>
          <input
            type="text"
            placeholder="Məs. MilliÖN"
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            style={inputStyle}
            required
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={labelStyle}>Müqavilə növü</label>
          <select
            value={data.partner_type}
            onChange={(e) =>
              setData({ ...data, partner_type: e.target.value })
            }
            style={selectStyle}
          >
            <option value="lifetime">Все время (Lifetime)</option>
            <option value="annual">Годовой (Annual)</option>
            <option value="fixed">Разовый с клиента (Fixed)</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Status</label>
          <select
            value={data.status}
            onChange={(e) => setData({ ...data, status: e.target.value })}
            style={selectStyle}
          >
            <option value="1">Aktiv</option>
            <option value="0">Deaktiv</option>
          </select>
        </div>
      </div>

      {data.partner_type === "fixed" && (
        <div>
          <label style={labelStyle}>
            Hər müştəridən sabit limit məbləğ (AZN)
          </label>
          <input
            type="number"
            step="0.01"
            placeholder="Məs. 100.00"
            value={data.fixed_amount}
            onChange={(e) =>
              setData({ ...data, fixed_amount: parseFloat(e.target.value) || 0 })
            }
            style={inputStyle}
            required
          />
        </div>
      )}

      {data.partner_type === "annual" && (
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          <div>
            <label style={labelStyle}>Başlama tarixi</label>
            <input
              type="date"
              value={data.contract_start_date}
              onChange={(e) =>
                setData({ ...data, contract_start_date: e.target.value })
              }
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Bitmə tarixi</label>
            <input
              type="date"
              value={data.contract_end_date}
              onChange={(e) =>
                setData({ ...data, contract_end_date: e.target.value })
              }
              style={inputStyle}
            />
          </div>
        </div>
      )}

      {/* Commission & limits */}
      <div
        style={{
          borderTop: `1px solid ${s.border || "rgba(0,0,0,0.08)"}`,
          paddingTop: 12,
          marginTop: 4,
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#2563eb",
            marginBottom: 10,
          }}
        >
          Komissiya və Dinamik Limitlər (AZN)
        </div>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          <div>
            <label style={smallLabelStyle}>Level 1 Limiti</label>
            <input
              type="number"
              value={data.level1_limit}
              onChange={(e) =>
                setData({ ...data, level1_limit: parseFloat(e.target.value) })
              }
              style={inputStyle}
            />
          </div>
          <div>
            <label style={smallLabelStyle}>Level 2 Limiti</label>
            <input
              type="number"
              value={data.level2_limit}
              onChange={(e) =>
                setData({ ...data, level2_limit: parseFloat(e.target.value) })
              }
              style={inputStyle}
            />
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 10,
            marginTop: 10,
          }}
        >
          <div>
            <label style={smallLabelStyle}>L1 Rate (%)</label>
            <input
              type="number"
              step="0.1"
              value={data.level1_rate}
              onChange={(e) =>
                setData({ ...data, level1_rate: parseFloat(e.target.value) })
              }
              style={inputStyle}
            />
          </div>
          <div>
            <label style={smallLabelStyle}>L2 Rate (%)</label>
            <input
              type="number"
              step="0.1"
              value={data.level2_rate}
              onChange={(e) =>
                setData({ ...data, level2_rate: parseFloat(e.target.value) })
              }
              style={inputStyle}
            />
          </div>
          <div>
            <label style={smallLabelStyle}>L3 Rate (%)</label>
            <input
              type="number"
              step="0.1"
              value={data.level3_rate}
              onChange={(e) =>
                setData({ ...data, level3_rate: parseFloat(e.target.value) })
              }
              style={inputStyle}
            />
          </div>
        </div>
      </div>
    </>
  );

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
      {/* Animation keyframes */}
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
      `}</style>

      {/* ─── Header ─── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 700,
              color: s.text,
            }}
          >
            Partnyorlar
          </h2>
          <p
            style={{
              margin: "2px 0 0",
              fontSize: 12,
              color: s.mutedText || "#6b7280",
            }}
          >
            Kodlar, balanslar və müqavilələr
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "8px 14px",
            borderRadius: 10,
            border: "none",
            background: "#2563eb",
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <Plus size={15} /> Əlavə et
        </button>
      </div>

      {/* ─── Partners list ─── */}
      {isLoading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            paddingTop: 60,
          }}
        >
          <SpinLoading />
        </div>
      ) : partners.length === 0 ? (
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
          Heç bir partnyor tapılmadı
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {partners.map((partner) => {
            const isSelected =
              selectedPartner?.partnerPin === partner.partnerPin;
            const bal = parseFloat(partner.balance);

            return (
              <div
                key={partner.partnerPin}
                onClick={() => loadPartnerDetails(partner)}
                style={{
                  ...cardStyle,
                  padding: "14px 14px",
                  cursor: "pointer",
                  borderLeft: isSelected
                    ? "3px solid #2563eb"
                    : `1px solid ${s.border || "rgba(0,0,0,0.08)"}`,
                  transition: "border 0.15s",
                }}
              >
                {/* Row 1: name + status */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: s.cardText,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {partner.name}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        fontFamily: "monospace",
                        color: s.mutedText || "#6b7280",
                        marginTop: 1,
                      }}
                    >
                      PIN: {partner.partnerPin}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={statusBadge(partner.status)}>
                      {parseInt(partner.status) === 1 ? "Aktiv" : "Deaktiv"}
                    </span>
                    <ChevronRight
                      size={16}
                      style={{ color: s.mutedText || "#9ca3af", flexShrink: 0 }}
                    />
                  </div>
                </div>

                {/* Row 2: balance + type */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontWeight: 700,
                      fontSize: 14,
                      color: bal < 0 ? "#e11d48" : "#059669",
                    }}
                  >
                    {bal.toFixed(2)} AZN
                  </span>
                  <span
                    style={typeBadge(
                      partner.partner_type,
                      partner.fixed_amount
                    )}
                  >
                    {typeLabel(partner.partner_type, partner.fixed_amount)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══════════ Detail bottom-sheet ═══════════ */}
      {selectedPartner && (
        <div style={overlayStyle} onClick={() => setSelectedPartner(null)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 12,
              }}
            >
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      fontSize: 17,
                      fontWeight: 700,
                      color: s.cardText,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {selectedPartner.name}
                  </span>
                  <button
                    onClick={() => openEditModal(selectedPartner)}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 4,
                      cursor: "pointer",
                      color: s.mutedText || "#6b7280",
                      display: "flex",
                    }}
                  >
                    <Edit size={14} />
                  </button>
                </div>
                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: 11,
                    color: "#2563eb",
                    marginTop: 2,
                  }}
                >
                  PIN: {selectedPartner.partnerPin}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={statusBadge(selectedPartner.status)}>
                  {parseInt(selectedPartner.status) === 1
                    ? "Aktiv"
                    : "Deaktiv"}
                </span>
                <button
                  onClick={() => setSelectedPartner(null)}
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
                marginBottom: 14,
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
                    fontSize: 11,
                    color: s.mutedText || "#6b7280",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Wallet size={12} /> Balans
                </div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    fontFamily: "monospace",
                    marginTop: 4,
                    color:
                      parseFloat(selectedPartner.balance) < 0
                        ? "#e11d48"
                        : "#059669",
                  }}
                >
                  {parseFloat(selectedPartner.balance).toFixed(2)} AZN
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
                    fontSize: 11,
                    color: s.mutedText || "#6b7280",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Calendar size={12} /> Limit / Bitmə
                </div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    marginTop: 6,
                    color: s.cardText,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {selectedPartner.partner_type === "annual"
                    ? new Date(
                        selectedPartner.contract_end_date
                      ).toLocaleDateString()
                    : selectedPartner.partner_type === "fixed"
                    ? `Hər client: ${parseFloat(
                        selectedPartner.fixed_amount || 0
                      ).toFixed(2)} AZN`
                    : "Lifetime"}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div
              style={{
                display: "flex",
                borderBottom: `1px solid ${s.border || "rgba(0,0,0,0.08)"}`,
                marginBottom: 14,
                overflowX: "auto",
              }}
            >
              {["clients", "transactions", "payout", "reward"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    flex: 1,
                    paddingBottom: 10,
                    fontSize: 12,
                    fontWeight: activeTab === tab ? 700 : 500,
                    color:
                      activeTab === tab
                        ? "#2563eb"
                        : s.mutedText || "#6b7280",
                    background: "none",
                    border: "none",
                    borderBottom:
                      activeTab === tab
                        ? "2px solid #2563eb"
                        : "2px solid transparent",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "color 0.15s, border-color 0.15s",
                  }}
                >
                  {tab === "clients"
                    ? "Müştərilər"
                    : tab === "transactions"
                    ? "Tranzaksiyalar"
                    : tab === "payout"
                    ? "Ödəniş"
                    : "Mükafat"}
                </button>
              ))}
            </div>

            {/* ── Tab content ── */}

            {/* Clients */}
            {activeTab === "clients" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {clientsLoading ? (
                  <div style={{ textAlign: "center", padding: 24 }}>
                    <SpinLoading />
                  </div>
                ) : partnerClients.length === 0 ? (
                  <p
                    style={{
                      textAlign: "center",
                      padding: 24,
                      fontSize: 12,
                      color: s.mutedText,
                    }}
                  >
                    Bu partnyora bağlı müştəri yoxdur
                  </p>
                ) : (
                  partnerClients.map((client) => (
                    <div
                      key={client.account}
                      style={{
                        padding: 12,
                        borderRadius: 12,
                        background: s.surfaceBg || "rgba(0,0,0,0.02)",
                        border: `1px solid ${s.border || "rgba(0,0,0,0.06)"}`,
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: "rgba(37,99,235,0.08)",
                          border: "1px solid rgba(37,99,235,0.15)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#2563eb",
                          flexShrink: 0,
                        }}
                      >
                        <User size={15} />
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            fontSize: 13,
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
                            fontSize: 10,
                            fontFamily: "monospace",
                            color: s.mutedText,
                            marginTop: 2,
                          }}
                        >
                          Acc: {client.account}
                        </div>
                        <div
                          style={{
                            fontSize: 10,
                            color: s.mutedText,
                            marginTop: 3,
                          }}
                        >
                          Qoşulma:{" "}
                          {client.partner_attached_at
                            ? new Date(
                                client.partner_attached_at
                              ).toLocaleDateString()
                            : "Birinci ödəniş gözlənilir"}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Transactions */}
            {activeTab === "transactions" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {txLoading ? (
                  <div style={{ textAlign: "center", padding: 24 }}>
                    <SpinLoading />
                  </div>
                ) : partnerTransactions.length === 0 ? (
                  <p
                    style={{
                      textAlign: "center",
                      padding: 24,
                      fontSize: 12,
                      color: s.mutedText,
                    }}
                  >
                    Heç bir tranzaksiya tapılmadı
                  </p>
                ) : (
                  partnerTransactions.map((tx) => {
                    const amt = parseFloat(tx.amount);
                    return (
                      <div
                        key={tx.id}
                        style={{
                          padding: 12,
                          borderRadius: 12,
                          background: s.surfaceBg || "rgba(0,0,0,0.02)",
                          border: `1px solid ${
                            s.border || "rgba(0,0,0,0.06)"
                          }`,
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span style={txBadge(tx.type)}>
                            {txLabel(tx.type)}
                          </span>
                          <span
                            style={{
                              fontFamily: "monospace",
                              fontWeight: 700,
                              fontSize: 13,
                              color: amt < 0 ? "#e11d48" : "#059669",
                            }}
                          >
                            {amt > 0 ? "+" : ""}
                            {amt.toFixed(2)} AZN
                          </span>
                        </div>
                        {tx.info && (
                          <div
                            style={{
                              fontSize: 11,
                              color: s.mutedText,
                              marginTop: 2,
                            }}
                          >
                            {tx.info}
                          </div>
                        )}
                        {tx.client_account && (
                          <div
                            style={{
                              fontSize: 10,
                              fontFamily: "monospace",
                              color: s.mutedText,
                            }}
                          >
                            Müştəri: {tx.client_account}
                          </div>
                        )}
                        <div
                          style={{
                            fontSize: 10,
                            color: s.mutedText,
                            textAlign: "right",
                            marginTop: 2,
                          }}
                        >
                          {new Date(tx.moment).toLocaleString()}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Payout form */}
            {activeTab === "payout" && (
              <form
                onSubmit={handlePayoutSubmit}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}
              >
                <div>
                  <label style={labelStyle}>Ödəniləcək məbləğ (AZN)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Məbləğ daxil edin"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    style={inputStyle}
                    required
                  />
                </div>
                <div>
                  <label style={labelStyle}>Qeyd (İnfo)</label>
                  <input
                    type="text"
                    placeholder="Məs. Nağd ödəniş, Bank transferi"
                    value={payoutInfo}
                    onChange={(e) => setPayoutInfo(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <button
                  type="submit"
                  disabled={payoutSubmitting}
                  style={{
                    ...btnPrimary,
                    background: payoutSubmitting ? "#9ca3af" : "#059669",
                    color: "#fff",
                    marginTop: 4,
                  }}
                >
                  <Send size={14} /> Ödənişi Tamamla
                </button>
              </form>
            )}

            {/* Reward form */}
            {activeTab === "reward" && (
              <form
                onSubmit={handleRewardSubmit}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}
              >
                <div>
                  <label style={labelStyle}>Mükafat məbləği (AZN)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Məbləğ daxil edin"
                    value={rewardAmount}
                    onChange={(e) => setRewardAmount(e.target.value)}
                    style={inputStyle}
                    required
                  />
                </div>
                <div>
                  <label style={labelStyle}>Qeyd (İnfo)</label>
                  <input
                    type="text"
                    placeholder="Məs. Fəal işə görə bonus"
                    value={rewardInfo}
                    onChange={(e) => setRewardInfo(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <button
                  type="submit"
                  disabled={rewardSubmitting}
                  style={{
                    ...btnPrimary,
                    background: rewardSubmitting ? "#9ca3af" : "#6366f1",
                    color: "#fff",
                    marginTop: 4,
                  }}
                >
                  <Send size={14} /> Mükafatlandır
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ═══════════ Add Partner Modal ═══════════ */}
      {showAddModal && (
        <div style={overlayStyle} onClick={() => setShowAddModal(false)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 14,
              }}
            >
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, color: s.cardText }}>
                  Yeni Partnyor Yarat
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: s.mutedText,
                    marginTop: 2,
                  }}
                >
                  Tərəfdaşın parametrləri
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
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

            <form
              onSubmit={handleCreatePartner}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              {renderPartnerFormFields(
                newPartnerData,
                setNewPartnerData,
                false
              )}
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  marginTop: 8,
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    ...btnPrimary,
                    flex: 1,
                    background: s.surfaceBg || "#e5e7eb",
                    color: s.text || "#111",
                  }}
                >
                  Ləğv et
                </button>
                <button
                  type="submit"
                  style={{
                    ...btnPrimary,
                    flex: 1,
                    background: "#2563eb",
                    color: "#fff",
                  }}
                >
                  Partnyor Yarat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════ Edit Partner Modal ═══════════ */}
      {showEditModal && (
        <div style={overlayStyle} onClick={() => setShowEditModal(false)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 14,
              }}
            >
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, color: s.cardText }}>
                  Partnyor Redaktə Et
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: s.mutedText,
                    marginTop: 2,
                  }}
                >
                  Parametr və faiz dərəcələrinin tənzimlənməsi
                </div>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
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

            <form
              onSubmit={handleEditPartner}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              {renderPartnerFormFields(
                editPartnerData,
                setEditPartnerData,
                true
              )}
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  marginTop: 8,
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  style={{
                    ...btnPrimary,
                    flex: 1,
                    background: s.surfaceBg || "#e5e7eb",
                    color: s.text || "#111",
                  }}
                >
                  Ləğv et
                </button>
                <button
                  type="submit"
                  style={{
                    ...btnPrimary,
                    flex: 1,
                    background: "#2563eb",
                    color: "#fff",
                  }}
                >
                  Dəyişiklikləri Saxla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

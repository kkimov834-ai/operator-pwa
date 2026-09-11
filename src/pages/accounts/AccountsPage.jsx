import { useState, useMemo, useEffect } from "react";
import { Card, Popup, Button, Selector } from "antd-mobile";
import { AlertCircle, LoaderCircle } from "lucide-react";
import { MODULE_OPTIONS, TARIFF_OPTIONS } from "./accountsData";
import AccountList from "./AccountList";
import { getUserAccounts } from "../../services/user.service";
import { useNavBarContext } from "../../components/NavBarContext";
import { useNavigate } from "react-router-dom";

const normalizeAccounts = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.accounts)) return response.accounts;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.accounts)) return response.data.accounts;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  return [];
};

const formatInfoValue = (value) => {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "Bəli" : "Xeyr";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const getFirstValue = (source, keys, fallback = "-") => {
  for (const key of keys) {
    const value = source?.[key];
    if (value !== null && value !== undefined && value !== "") return value;
  }
  return fallback;
};

const getAccountInfoFields = (info, fallback) => [
  { label: "Hesab", value: getFirstValue(info, ["account", "account_name"], fallback.account) },
  { label: "Ödənilib", value: getFirstValue(info, ["total_paid", "totalPaid"], fallback.total_paid) },
  {
    label: "Ad Soyad",
    value: getFirstValue(info, ["full_name", "fullname"], `${fallback.name || ""} ${fallback.lastname || ""}`.trim() || "-"),
  },
  { label: "Ad", value: getFirstValue(info, ["name", "first_name"], fallback.name) },
  { label: "Soyad", value: getFirstValue(info, ["lastname", "last_name", "surname"], fallback.lastname) },
  { label: "Partnyor", value: getFirstValue(info, ["partner_name", "partner"], fallback.partner_name) },
  { label: "E-poçt", value: getFirstValue(info, ["email", "mail"], fallback.email) },
  { label: "Telefon", value: getFirstValue(info, ["phone", "phone_number"], fallback.phone) },
  {
    label: "Tərəfdaş PIN",
    value: getFirstValue(info, ["partnerpin", "partner_pin", "partnerPin"], fallback.partnerpin ?? fallback.partner_pin ?? fallback.partnerPin),
  },
  {
    label: "Status",
    value: Number(getFirstValue(info, ["status"], fallback.status)) === 1 ? "Aktiv" : "Deaktiv",
    status: Number(getFirstValue(info, ["status"], fallback.status)) === 1 ? "active" : "inactive",
  },
  { label: "Qeydiyyat", value: getFirstValue(info, ["registermoment", "registremoment", "registered_at"], fallback.registermoment) },
  { label: "Son Giriş", value: getFirstValue(info, ["last_login", "lastLogin"], fallback.last_login) },
  { label: "Son Əlaqə", value: getFirstValue(info, ["last_contact", "lastContact"], fallback.last_contact) },
];

export default function AccountsPage() {
  const [open, setOpen] = useState(false);
  const [selected] = useState(null);
  const [selectedInfo, setSelectedInfo] = useState(null);
  const [infoLoading, setInfoLoading] = useState(false);
  const [infoError, setInfoError] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [accountModules, setAccountModules] = useState({
    acc_1: [],
    acc_2: [],
  });

  const [addingModuleFor, setAddingModuleFor] = useState(null);
  const [moduleValue, setModuleValue] = useState(undefined);
  const [addingServiceFor, setAddingServiceFor] = useState(null);
  const [serviceValue, setServiceValue] = useState(undefined);

  const {
    themeStyles,
    query,
    setTitle,
    setShowBack,
  } = useNavBarContext();
  const navigate = useNavigate();
  const visibleAccounts = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    if (!q) return accounts;
    return accounts.filter(
      (a) =>
        [a.name, a.lastname, a.phone, a.email, a.partner_name, a.account]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(q)),
    );
  }, [accounts, query]);

  useEffect(() => {
    let mounted = true;

    const loadAccounts = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getUserAccounts();
        if (mounted) setAccounts(normalizeAccounts(response));
      } catch (requestError) {
        console.error("Hesablar yüklənərkən xəta baş verdi", requestError);
        if (mounted) setError("Hesabları yükləmək mümkün olmadı. Yenidən cəhd edin.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadAccounts();
    return () => {
      mounted = false;
    };
  }, []);

  const availableModules = addingModuleFor
    ? MODULE_OPTIONS.filter(
        (o) =>
          !(accountModules[addingModuleFor] || []).some(
            (m) => m.name === o.value,
          ),
      )
    : MODULE_OPTIONS;

  const availableTariffs = addingServiceFor
    ? (() => {
        const accId = addingServiceFor.accId;
        const modId = addingServiceFor.modId;
        const mod = (accountModules[accId] || []).find((m) => m.id === modId);
        const existing = (mod && mod.services.map((s) => s.name)) || [];
        return TARIFF_OPTIONS.filter((o) => !existing.includes(o.value));
      })()
    : TARIFF_OPTIONS;

  const modulesFor = (selected && accountModules[selected.id]) || [];

  const openAccount = (acc) => {
    if (acc.account) navigate(`/${encodeURIComponent(acc.account)}`);
  };

  useEffect(() => {
    if (!open || !selected?.account) return undefined;

    let mounted = true;
    const loadAccountInfo = async () => {
      try {
        setInfoLoading(true);
        setInfoError("");
        if (mounted) setSelectedInfo(selected);
      } catch (requestError) {
        console.error("Hesab məlumatları yüklənərkən xəta baş verdi", requestError);
        if (mounted) setInfoError("Hesab məlumatlarını yükləmək mümkün olmadı.");
      } finally {
        if (mounted) setInfoLoading(false);
      }
    };

    loadAccountInfo();
    return () => {
      mounted = false;
    };
  }, [open, selected]);
  // ensure NavBar resets when popup closes
  const handleClose = () => {
    setOpen(false);
    setSelectedInfo(null);
    setInfoError("");
    setShowBack(false);
    setTitle("");
  };

  const startAddModule = (accId) => {
    setModuleValue(undefined);
    setAddingModuleFor(accId);
  };
  const confirmAddModule = () => {
    if (!addingModuleFor || !moduleValue) return setAddingModuleFor(null);
    const mod = {
      id: `m_${Date.now()}`,
      name: moduleValue,
      price: "0 AZN",
      services: [],
    };
    setAccountModules((prev) => ({
      ...prev,
      [addingModuleFor]: [mod, ...(prev[addingModuleFor] || [])],
    }));
    setAddingModuleFor(null);
  };

  const startAddService = (accId, modId) => {
    setServiceValue(undefined);
    setAddingServiceFor({ accId, modId });
  };
  const confirmAddService = () => {
    if (!addingServiceFor || !serviceValue) return setAddingServiceFor(null);
    const { accId, modId } = addingServiceFor;
    const svc = { id: `s_${Date.now()}`, name: serviceValue, price: "0 AZN" };
    setAccountModules((prev) => ({
      ...prev,
      [accId]: prev[accId].map((m) =>
        m.id === modId ? { ...m, services: [...m.services, svc] } : m,
      ),
    }));
    setAddingServiceFor(null);
  };

  const removeService = (accId, modId, serviceId) => {
    setAccountModules((prev) => ({
      ...prev,
      [accId]: prev[accId].map((m) =>
        m.id === modId
          ? { ...m, services: m.services.filter((s) => s.id !== serviceId) }
          : m,
      ),
    }));
  };

  const removeModule = (accId, modId) =>
    setAccountModules((prev) => ({
      ...prev,
      [accId]: prev[accId].filter((m) => m.id !== modId),
    }));

  useEffect(() => {
    setTitle("Hesablar");
    setShowBack(false);
    return () => setTitle("");
  }, [setShowBack, setTitle]);

  return (
    <div
      className="accounts-page"
      style={{
        padding: 12,
        paddingBottom: "calc(88px + env(safe-area-inset-bottom, 0px))",
        background: themeStyles.pageBg,
        color: themeStyles.text,
        minHeight: "100dvh",
        boxSizing: "border-box",
      }}
    >
      {/* Global NavBar is provided in App.jsx via NavBarProvider; title set with NavBarContext */}

      <div
        className="accounts-list-shell"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          marginTop: 12,
        }}
      >
        {loading ? (
          <div style={{ padding: 32, textAlign: "center", color: themeStyles.mutedText }}>
            Hesablar yüklənir...
          </div>
        ) : error ? (
          <div style={{ padding: 24, textAlign: "center", color: "#dc2626" }}>
            {error}
          </div>
        ) : visibleAccounts.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", color: themeStyles.mutedText }}>
            {query ? "Axtarışa uyğun hesab tapılmadı." : "Hesab tapılmadı."}
          </div>
        ) : (
          <AccountList accounts={visibleAccounts} onOpen={openAccount} />
        )}
      </div>

      <Popup
        visible={open}
        onMaskClick={handleClose}
        position="bottom"
        bodyStyle={{
          paddingTop: "calc(12px + env(safe-area-inset-top,12px))",
          paddingLeft: "env(safe-area-inset-left,12px)",
          paddingRight: "env(safe-area-inset-right,12px)",
          height: "100dvh",
          maxHeight: "100dvh",
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          overflow: "hidden",
          background: themeStyles.popupBg,
        }}
      >
        {selected && (
          <div
            style={{ display: "flex", flexDirection: "column", height: "100%" }}
          >
            <div className="account-popup-header" style={{ padding: "10px 12px 6px 12px" }}>
              <div className="account-detail-eyebrow">Hesab məlumatları</div>
              <h3 style={{ margin: "4px 0 0", fontSize: 20 }}>
                {selected.account || selected.id || "-"}
              </h3>
              <div className="account-detail-subtitle">
                {selected.name || selected.partner_name || "Ətraflı hesab görünüşü"}
              </div>
            </div>

            <div className="account-detail-scroll">
              {infoLoading ? (
                <div className="account-detail-state">
                  <LoaderCircle className="account-detail-spinner" size={22} />
                  Məlumatlar yüklənir...
                </div>
              ) : infoError ? (
                <div className="account-detail-state account-detail-error">
                  <AlertCircle size={22} />
                  {infoError}
                </div>
              ) : selectedInfo ? (
                <div className="account-info-grid">
                  {getAccountInfoFields(selectedInfo, selected).map((field) => (
                    <div className="account-info-item" key={field.label}>
                      <div className="account-info-label">{field.label}</div>
                      <div className={`account-info-value ${field.status ? `is-${field.status}` : ""}`}>
                        {formatInfoValue(field.value)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div
              className="account-modules-toolbar"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 8,
                padding: "0 12px",
              }}
            >
              <div style={{ fontWeight: 600 }}>Aktiv Modullar və Xidmətlər</div>
              <Button
                size="mini"
                onClick={() => startAddModule(selected.id)}
                style={{ padding: "6px 10px" }}
              >
                + Modul
              </Button>
            </div>

            <div
              style={{
                marginTop: 8,
                flex: 1,
                overflowY: "auto",
                padding: "8px 12px",
                paddingBottom: "calc(88px + env(safe-area-inset-bottom,12px))",
              }}
            >
              {modulesFor.length === 0 ? (
                <div
                  style={{ padding: 20, textAlign: "center", color: "#6b7280" }}
                >
                  Hələ modul əlavə edilməyib
                </div>
              ) : (
                modulesFor.map((mod) => (
                  <Card
                    key={mod.id}
                    title={mod.name}
                    style={{
                      marginBottom: 12,
                      background: themeStyles.cardBg,
                      color: themeStyles.cardText,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            background: "#10b981",
                            color: "white",
                            padding: "4px 8px",
                            borderRadius: 12,
                            fontSize: 12,
                          }}
                        >
                          Modul Aktivdir
                        </div>
                        <div
                          style={{
                            background: "#0ea5a9",
                            color: "white",
                            padding: "4px 8px",
                            borderRadius: 12,
                            fontSize: 12,
                          }}
                        >
                          {mod.price}
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                        }}
                      >
                        {mod.services.map((s) => (
                          <div
                            key={s.id}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: 8,
                              borderRadius: 8,
                              background: themeStyles.serviceBg,
                              color: themeStyles.serviceText,
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 600 }}>{s.name}</div>
                              <div style={{ fontSize: 13, opacity: 0.8 }}>
                                {s.price}
                              </div>
                            </div>
                            <div style={{ display: "flex", gap: 8 }}>
                              <Button
                                size="mini"
                                color="danger"
                                onClick={() =>
                                  removeService(selected.id, mod.id, s.id)
                                }
                              >
                                Sil
                              </Button>
                            </div>
                          </div>
                        ))}

                        <div style={{ display: "flex", gap: 8 }}>
                          <Button
                            size="mini"
                            onClick={() => startAddService(selected.id, mod.id)}
                          >
                            + Tarif
                          </Button>
                          <Button
                            size="mini"
                            color="danger"
                            onClick={() => removeModule(selected.id, mod.id)}
                          >
                            Sil
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>

            <div style={{ height: 12 }} />
            <div
              style={{
                position: "fixed",
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1200,
                background: themeStyles.pageBg,
                padding:
                  "12px 12px calc(12px + env(safe-area-inset-bottom,12px))",
                boxShadow: "0 -6px 12px rgba(0,0,0,0.06)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "center" }}>
                <Button
                  color="primary"
                  onClick={handleClose}
                  style={{
                    width: "92%",
                    maxWidth: 420,
                    borderRadius: 8,
                    padding: "12px 0",
                  }}
                >
                  Bağla
                </Button>
              </div>
            </div>
          </div>
        )}
      </Popup>

      <Popup
        visible={!!addingModuleFor}
        bodyStyle={{ padding: 12 }}
        onMaskClick={() => setAddingModuleFor(null)}
      >
        <div>
          <h4 style={{ marginTop: 0 }}>Modul seçin</h4>
          <Selector
            options={availableModules}
            value={moduleValue ? [moduleValue] : []}
            onChange={(v) => setModuleValue((v && v[0]) || undefined)}
            defaultValue={[]}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <Button block onClick={() => setAddingModuleFor(null)}>
              İmtina
            </Button>
            <Button
              block
              color="primary"
              onClick={confirmAddModule}
              disabled={availableModules.length === 0}
            >
              Əlavə et
            </Button>
          </div>
        </div>
      </Popup>

      <Popup
        visible={!!addingServiceFor}
        bodyStyle={{ padding: 12 }}
        onMaskClick={() => setAddingServiceFor(null)}
      >
        <div>
          <h4 style={{ marginTop: 0 }}>Tarif seçin</h4>
          <Selector
            options={availableTariffs}
            value={serviceValue ? [serviceValue] : []}
            onChange={(v) => setServiceValue((v && v[0]) || undefined)}
            defaultValue={[]}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <Button block onClick={() => setAddingServiceFor(null)}>
              İmtina
            </Button>
            <Button
              block
              color="primary"
              onClick={confirmAddService}
              disabled={availableTariffs.length === 0}
            >
              Əlavə et
            </Button>
          </div>
        </div>
      </Popup>
    </div>
  );
}

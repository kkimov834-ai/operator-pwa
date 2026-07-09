import { useEffect, useState, useRef } from "react";
import { Card, SpinLoading } from "antd-mobile";
import { getUserAccounts } from "../../services/user.service";
import { useNavBarContext } from "../../components/NavBarContext";
import { useNavigate } from "react-router-dom";

const isMissingEmail = (email) => {
  const normalized = String(email ?? "")
    .trim()
    .toLowerCase();
  return normalized === "0" || normalized === "null" || normalized === "";
};

export default function AccountsPage() {
  const navigate = useNavigate();
  const { query, setQuery, setTitle, setShowBack, themeStyles } =
    useNavBarContext();

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    setTitle("Hesablar");
    setShowBack(false);
    setQuery("");
    return () => setTitle("");
  }, [setTitle, setShowBack, setQuery]);

  useEffect(() => {
    const fetchAccounts = async (searchQuery) => {
      setLoading(true);
      try {
        const res = await getUserAccounts(searchQuery);

        let accountsList = [];
        if (Array.isArray(res)) {
          accountsList = res;
        } else if (res && Array.isArray(res.data)) {
          accountsList = res.data;
        } else if (res && Array.isArray(res.data?.data)) {
          accountsList = res.data.data;
        } else {
          console.warn("Expected accounts array not found:", res);
        }

        setAccounts(accountsList);
      } catch (e) {
        console.error("Failed to load accounts", e);
        setAccounts([]);
      } finally {
        setLoading(false);
      }
    };

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      const trimmedQuery = (query || "").trim();
      if (trimmedQuery === "" || trimmedQuery.length >= 4) {
        fetchAccounts(trimmedQuery);
      } else {
        setAccounts([]);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]);

  const visibleAccounts = accounts;

  const openAccount = (account) => {
    const accId = account.id || account.account || account;
    navigate(`/${accId}`);
  };

  if (loading) {
    return <div><SpinLoading text="Yüklənir..." /></div>;
  }

  return (
    <div
      style={{
        padding: 12,
        paddingBottom: "calc(84px + env(safe-area-inset-bottom))",
        minHeight: "100vh",
        background: themeStyles?.pageBg,
        color: themeStyles?.text,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          marginTop: 12,
        }}
      >
        {visibleAccounts.length === 0 ? (
          <div
            style={{
              color: themeStyles?.mutedText || "#9CA3AF",
              textAlign: "center",
              marginTop: 24,
            }}
          >
            Heç Bir Hesab tapılmadı.
          </div>
        ) : (
          visibleAccounts.map((account) => {
            const isActive = Number(account.status) === 1;
            const emailText = isMissingEmail(account.email)
              ? "Yazılmayıb"
              : account.email;
            const registerMoment =
              account.registremoment || account.registermoment || "-";
            const details = [
              { label: "Email", value: emailText },
              { label: "Son Əlaqə", value: account.last_contact || "-" },
              { label: "Partner", value: account.partner_name || "-" },
              { label: "Partner PIN", value: account.partnerpin || "-" },
              { label: "Telefon", value: account.phone || "-" },
              { label: "Qeydiyyat", value: registerMoment },
            ];

            return (
              <div
                key={account.id || account.account}
                style={{ width: "100%" }}
              >
                <div
                  onClick={() => openAccount(account)}
                  style={{ cursor: "pointer" }}
                >
                  <Card
                    style={{
                      background: themeStyles?.cardBg,
                      color: themeStyles?.cardText,
                      border: `1px solid ${themeStyles?.border || "transparent"}`,
                      borderRadius: 12,
                      padding: "16px 16px",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
                    }}
                    bodyStyle={{ padding: 0 }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 16,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 18,
                            fontWeight: 700,
                            color: themeStyles?.cardText,
                            lineHeight: 1.3,
                            wordBreak: "break-word",
                            paddingRight: 12,
                          }}
                        >
                          {account.name || "-"} {account.lastname || account.lastName || account.surname || ""}
                        </div>
                        <div
                          style={{
                            padding: "4px 10px",
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 600,
                            color: isActive ? "#15803d" : "#b91c1c",
                            background: isActive ? "#dcfce7" : "#fee2e2",
                            whiteSpace: "nowrap",
                            flexShrink: 0,
                          }}
                        >
                          {isActive ? "Aktif" : "Deaktif"}
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 10,
                          background: themeStyles?.surfaceBg || "rgba(0,0,0,0.02)",
                          padding: 12,
                          borderRadius: 10,
                        }}
                      >
                        {details.map((item) => {
                          if (item.value === "-" || !item.value) return null;
                          return (
                            <div
                              key={item.label}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: 16,
                                fontSize: 13,
                              }}
                            >
                              <span
                                style={{
                                  color: themeStyles?.mutedText || "#6b7280",
                                  flexShrink: 0,
                                }}
                              >
                                {item.label}:
                              </span>
                              <span
                                style={{
                                  fontWeight: 600,
                                  textAlign: "right",
                                  wordBreak: "break-word",
                                  color: themeStyles?.cardText,
                                }}
                              >
                                {item.value}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

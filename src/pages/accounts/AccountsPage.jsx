import React, { useMemo, useEffect, useState } from "react";
import { Card } from "antd-mobile";
import { getUserAccounts } from "../../services/user.service";
import { useNavBarContext } from "../../components/NavBarContext";
import { useNavigate } from "react-router-dom";

export default function AccountsPage() {
  const navigate = useNavigate();
  const { query, setQuery, setTitle, setShowBack, themeStyles } =
    useNavBarContext();

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTitle("Hesablar");
    setShowBack(false);
    setQuery("");
    return () => setTitle("");
  }, [setTitle, setShowBack, setQuery]);

  useEffect(() => {
    const fetchAccounts = async () => {
      setLoading(true);
      try {
        const res = await getUserAccounts();

        // Normalize possible response shapes from the service
        let accountsList = [];
        if (Array.isArray(res)) {
          accountsList = res;
        } else if (res && Array.isArray(res.data)) {
          accountsList = res.data;
        } else if (res && Array.isArray(res.data?.data)) {
          accountsList = res.data.data;
        } else if (res && res.status === "success" && Array.isArray(res.data)) {
          accountsList = res.data;
        } else {
          console.warn("Expected accounts array not found:", res);
        }

        setAccounts(accountsList);
      } catch (e) {
        console.error("Failed to load accounts", e);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  const visibleAccounts = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    if (!q) return accounts;

    return accounts.filter((account) => {
      const firstName = account.name || "";
      const lastName =
        account.lastname || account.lastName || account.surname || "";
      return `${firstName} ${lastName}`.toLowerCase().includes(q);
    });
  }, [query, accounts]);

  const openAccount = (account) => {
    const accId = account.id || account.account || account;
    navigate(`/${accId}`);
  };

  if (loading) {
    return (
      <div
        style={{
          padding: 12,
          color: themeStyles?.mutedText || "#9CA3AF",
          textAlign: "center",
          background: themeStyles?.pageBg,
          minHeight: "100vh",
        }}
      >
        Yuklenir...
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 12,
        minHeight: "100vh",
        background: themeStyles?.pageBg,
        color: themeStyles?.text,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
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
            Hesab tapilmadi.
          </div>
        ) : (
          visibleAccounts.map((account) => {
            const lastName =
              account.lastname || account.lastName || account.surname || "";
            const isActive = Number(account.status) === 1;
            const accId = account.id || account.account || account;

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
                      borderRadius: 8,
                      padding: 12,
                      boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 12,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: 16,
                            fontWeight: 600,
                            color: themeStyles?.cardText,
                          }}
                        >
                          {account.name}
                        </div>
                        <div
                          style={{
                            marginTop: 4,
                            fontSize: 14,
                            color: themeStyles?.cardText,
                            opacity: 0.75,
                          }}
                        >
                          {lastName}
                        </div>
                      </div>
                      <span
                        style={{
                          flexShrink: 0,
                          borderRadius: 999,
                          padding: "4px 10px",
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#ffffff",
                          background: isActive ? "#16a34a" : "#dc2626",
                        }}
                      >
                        {isActive ? "Aktif" : "Deaktif"}
                      </span>
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

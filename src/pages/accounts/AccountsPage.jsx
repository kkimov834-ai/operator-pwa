import React, { useMemo, useEffect } from "react";
import { Card } from "antd-mobile";
import { useNavigate } from "react-router-dom";
import { ACCOUNTS } from "./accountsData";
import { useNavBarContext } from "../../components/NavBarContext";

export default function AccountsPage() {
  const navigate = useNavigate();
  const { query, setQuery, setTitle, setShowBack } =
    useNavBarContext();

    
  useEffect(() => {
    setTitle("Hesablar");
    setShowBack(false);
    return () => setTitle("");
  }, []);


  const visibleAccounts = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    if (!q) return ACCOUNTS;
    return ACCOUNTS.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.phone.includes(q) ||
        a.email.toLowerCase().includes(q),
    );
  }, [query]);

  const openAccount = (acc) => {
    navigate(`/accounts/${acc.id}`);
  };

  return (
    <div
      style={{
        padding: 12,
        minHeight: "100vh",
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
        {visibleAccounts.map((acc) => (
          <div key={acc.id} style={{ width: "100%" }}>
            <div onClick={() => openAccount(acc)} style={{ cursor: "pointer" }}>
              <Card
                title={acc.name}
                style={{
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                  }}
                >
                  Balans: {acc.balance}
                </div>
              </Card>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

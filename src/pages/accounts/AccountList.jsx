import React from "react";
import { Card } from "antd-mobile";
import { useNavBarContext } from "../../components/NavBarContext";

export default function AccountList({ accounts = [], onOpen }) {
  const { themeStyles } = useNavBarContext();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        marginTop: 12,
      }}
    >
      {accounts.map((account) => {
        const lastName =
          account.lastname || account.lastName || account.surname || "";
        const isActive = Number(account.status) === 1;

        return (
          <div key={account.id || account.account} style={{ width: "100%" }}>
            <div
              onClick={() => onOpen?.(account)}
              style={{ cursor: "pointer" }}
            >
              <Card
                style={{
                  background: themeStyles?.cardBg,
                  color: themeStyles?.cardText,
                  border: `1px solid ${themeStyles?.border || "transparent"}`,
                  borderRadius: 8,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{account.name}</div>
                    <div
                      style={{
                        marginTop: 4,
                        color: themeStyles?.cardTextSecondary,
                      }}
                    >
                      {lastName}
                    </div>
                  </div>
                  <span
                    style={{
                      alignSelf: "flex-start",
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
      })}
    </div>
  );
}

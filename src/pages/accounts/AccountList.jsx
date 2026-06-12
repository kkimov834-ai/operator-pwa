import React from "react";
import { Card, Button } from "antd-mobile";

export default function AccountList({ accounts, onOpen }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        marginTop: 12,
      }}
    >
      {accounts.map((acc) => (
        <div key={acc.id} style={{ width: "100%" }}>
          <div onClick={() => onOpen(acc)} style={{ cursor: "pointer" }}>
            <Card title={acc.name}>
              <div style={{ fontSize: 14 }}>Balans: {acc.balance}</div>
            </Card>
          </div>
        </div>
      ))}
    </div>
  );
}

import React, { useState } from 'react';
import { Card, Space, Button, Input, Toast } from "antd-mobile";
import { BankcardOutline } from "antd-mobile-icons";
import { addCredit, addBonus } from "../../services/finance.service";

export default function AccountFinanceCard({ accountId, themeStyles }) {
  const [amount, setAmount] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAction = async (type) => {
    setLoading(true);
    try {
      if (type === 'credit') {
        await addCredit({ account: accountId, amount: Number(amount), info });
        Toast.show({ icon: 'success', content: 'Kredit verildi' });
      } else {
        await addBonus({ account: accountId, amount: Number(amount), info });
        Toast.show({ icon: 'success', content: 'Bonus verildi' });
      }
      setAmount("");
      setInfo("");
    } catch (e) {
      Toast.show({ icon: 'fail', content: 'Xəta baş verdi' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      style={{
        borderRadius: "16px",
        background: themeStyles?.cardBg || "#fff",
        border: `1px solid ${themeStyles?.border || "transparent"}`,
        boxShadow: themeStyles?.isDark ? "none" : "0 4px 16px rgba(0,0,0,0.04)",
      }}
      bodyStyle={{ padding: "16px" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "16px", fontWeight: "700", marginBottom: "16px", color: themeStyles?.cardText }}>
        <BankcardOutline color="#1890ff" /> Maliyyə Əməliyyatları
      </div>
      
      <Space direction="vertical" block style={{ "--gap": "16px" }}>
        <div style={{
          background: themeStyles?.isDark ? 'rgba(255,255,255,0.05)' : '#f5f5f5',
          borderRadius: '12px',
          padding: '8px 16px',
        }}>
          <Input
            placeholder="Məbləğ daxil edin"
            type="number"
            value={amount}
            onChange={(val) => setAmount(val)}
            style={{ 
              '--font-size': '18px', 
              '--text-align': 'center',
              '--color': themeStyles?.cardText || '#000',
              '--placeholder-color': themeStyles?.isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'
            }}
            clearable
          />
        </div>
        <div style={{
          background: themeStyles?.isDark ? 'rgba(255,255,255,0.05)' : '#f5f5f5',
          borderRadius: '12px',
          padding: '8px 16px',
        }}>
          <Input
            placeholder="Səbəb daxil edin"
            value={info}
            onChange={(val) => setInfo(val)}
            style={{ 
              '--font-size': '16px', 
              '--text-align': 'center',
              '--color': themeStyles?.cardText || '#000',
              '--placeholder-color': themeStyles?.isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'
            }}
            clearable
          />
        </div>
        <div style={{ display: "flex", gap: "12px", marginTop: "4px" }}>
          <Button
            block
            color="primary"
            shape="rounded"
            disabled={!amount || loading}
            loading={loading}
            onClick={() => handleAction('credit')}
            style={{ flex: 1 }}
          >
            Kredit ver
          </Button>
          <Button
            block
            color="success"
            shape="rounded"
            disabled={!amount || loading}
            loading={loading}
            onClick={() => handleAction('bonus')}
            style={{ flex: 1 }}
          >
            Bonus ver
          </Button>
        </div>
      </Space>
    </Card>
  );
}

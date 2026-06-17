import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, Space, Tag, Grid } from "antd-mobile";
import {
  UserOutline,
  BillOutline,
  ClockCircleOutline,
  PhonebookOutline,
} from "antd-mobile-icons"; // Əgər ikonlar yoxdursa, standart mətn də qoya bilərsən
import ModulesManager from "./ModulesManager";
import { useNavBarContext } from "../../components/NavBarContext";
import { getUserInfo } from "../../services/userİnfo.service";
import { getUserAccounts } from "../../services/user.service";

export default function AccountDetail() {
  const { id } = useParams();
  const { setTitle, setShowBack, themeStyles } = useNavBarContext();

  const [acc, setAcc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let mounted = true;

    const fetchInfo = async () => {
      try {
        setLoading(true);
        let data = null;

        try {
          const res = await getUserInfo(id);

          if (res) {
            // Əgər res birbaşa obyekt olaraq gəlirsə (məs. res.balance varsa)
            if (res.balance !== undefined) {
              data = res;
            }
            // Əgər res.data-nın daxilindədirsə
            else if (res.data && res.data.balance !== undefined) {
              data = res.data;
            }
            // Alternativ struktur
            else if (res.data) {
              data = res.data;
            }
          }
        } catch (err) {
          console.warn("getUserInfo xəta verdi, fallback yoxlanılır...");
        }

        if (!data) {
          const listRes = await getUserAccounts(acc);
          let accounts = [];
          if (Array.isArray(listRes)) accounts = listRes;
          else if (Array.isArray(listRes.data)) accounts = listRes.data;
          else if (Array.isArray(listRes.data?.data))
            accounts = listRes.data.data;

          const found = accounts.find(
            (a) =>
              String(a?.id) === String(id) || String(a?.account) === String(id),
          );
          if (found) data = found;
        }

        if (mounted && data) {
          setAcc(data);
          setTitle("Hesab Təfərrüatı");
        }
      } catch (e) {
        console.error("Məlumat yüklənərkən xəta", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchInfo();
    setShowBack(true);

    return () => {
      mounted = false;
      setTitle("");
      setShowBack(false);
    };
  }, [id, setTitle, setShowBack]);

  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: "center", color: "#999" }}>
        Məlumatlar yüklənir...
      </div>
    );
  }

  if (!acc) {
    return (
      <div style={{ padding: 20, textAlign: "center", color: "#ff4d4f" }}>
        İstifadəçi tapılmadı.
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "12px 14px",
        background: themeStyles?.popupBg || "#f5f7fa",
        minHeight: "100vh",
        paddingBottom: "calc(30px + env(safe-area-inset-bottom, 24px))",
      }}
    >
      <Space direction="vertical" block style={{ "--gap": "12px" }}>
        {/* 1. ƏSAS BALANS VƏ STATUS KARTI */}
        <Card
          style={{
            borderRadius: "16px",
            boxShadow: "0 6px 16px rgba(0,0,0,0.04)",
            background: "linear-gradient(135deg, #2f54eb, #1890ff)",
            color: "#ffffff",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <div
                style={{ opacity: 0.8, fontSize: "13px", marginBottom: "4px" }}
              >
                Cari Balans
              </div>
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  letterSpacing: "-0.5px",
                }}
              >
                {acc.balance ? Number(acc.balance).toFixed(2) : "0.00"}{" "}
                <span style={{ fontSize: "18px" }}>AZN</span>
              </div>
            </div>
            <Tag
              color={acc.status === 1 ? "success" : "default"}
              style={{
                borderRadius: "6px",
                padding: "4px 8px",
                fontSize: "11px",
                fontWeight: "600",
              }}
            >
              {acc.status === 1 ? "AKTİV" : "DEAKTİV"}
            </Tag>
          </div>

          <div
            style={{
              marginTop: "16px",
              paddingTop: "12px",
              borderTop: "1px solid rgba(255,255,255,0.15)",
              display: "flex",
              justifyContent: "space-between",
              fontSize: "13px",
              opacity: 0.9,
            }}
          >
            <div>
              <strong>Hesab:</strong> {acc.account}
            </div>
            <div>
              <strong>Rol:</strong>{" "}
              <span style={{ textTransform: "uppercase" }}>{acc.role}</span>
            </div>
          </div>
        </Card>

        {/* 2. PROFİL VƏ PARTNYOR MƏLUMATLARI KARTI */}
        <Card
          title={
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "15px",
                fontWeight: "600",
              }}
            >
              <UserOutline color="#1890ff" /> Şəxsi və Tərəfdaş Məlumatları
            </div>
          }
          style={{
            borderRadius: "12px",
            background: themeStyles?.cardBg || "#fff",
          }}
        >
          <Grid columns={1} gap={10} style={{ fontSize: "14px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                paddingBottom: "8px",
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              <span style={{ color: "#8c8c8c" }}>Ad / Soyad:</span>
              <span style={{ fontWeight: "500" }}>
                {acc.name} {acc.lastname}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                paddingBottom: "8px",
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              <span style={{ color: "#8c8c8c" }}>
                <PhonebookOutline /> Telefon:
              </span>
              <span style={{ fontWeight: "500" }}>+{acc.phone}</span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                paddingBottom: "8px",
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              <span style={{ color: "#8c8c8c" }}>Partnyor:</span>
              <span style={{ fontWeight: "500", color: "#1890ff" }}>
                {acc.partner_name}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#8c8c8c" }}>Partnyor PIN:</span>
              <span style={{ fontWeight: "500", fontFamily: "monospace" }}>
                {acc.partnerpin}
              </span>
            </div>
          </Grid>
        </Card>

        {/* 3. SİSTEMƏ GİRİŞ TARİXÇƏSİ KARTI */}
        <Card
          title={
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "14px",
                color: "#666",
              }}
            >
              <ClockCircleOutline /> Sistem Tarixləri
            </div>
          }
          style={{
            borderRadius: "12px",
            background: themeStyles?.cardBg || "#fff",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              fontSize: "12px",
              color: "#555",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Son Giriş:</span>
              <span>{acc.last_login}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Qeydiyyat Tarixi:</span>
              <span>{acc.registermoment}</span>
            </div>
          </div>
        </Card>

        {/* 4. MODULLARIN İDARƏ EDİLMƏSİ (MÖVCUD KOMPONENTİN) */}
        <ModulesManager accountId={acc.account} />
      </Space>
    </div>
  );
}

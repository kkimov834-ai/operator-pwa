import React, { useEffect, useState } from 'react';
import { Card, Button, Input, TextArea } from 'antd-mobile';
import { StatsService } from '../../services/stats.service';
import toast from '../../helpers/toast';
import PermissionGuard from '../../components/auth/PermissionGuard';

const PRIORITY_LABELS = { low: 'Aşağı', medium: 'Orta', high: 'Yüksək' };

export default function AccountInfoCard({ accountId, themeStyles }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [forbidden, setForbidden] = useState(false);
  const [formData, setFormData] = useState({
    total_support_tickets: '',
    client_priority: 'medium',
    internal_notes: '',
  });

  useEffect(() => {
    let mounted = true;
    const getClientStat = async () => {
      console.log("AccountInfoCard useEffect: accountId is", accountId);
      if (!accountId) {
        console.log("AccountInfoCard useEffect: accountId is empty, skipping fetch");
        return;
      }
      setLoading(true);
      try {
        console.log("AccountInfoCard: calling StatsService.getClientStats for", accountId);
        const res = await StatsService.getClientStats({ account: accountId });
        console.log("AccountInfoCard: StatsService.getClientStats response:", res);
        const d = res?.data || res;
        if (mounted && d) {
          setData(d);
          setFormData({
            total_support_tickets: d.total_support_tickets ?? '',
            client_priority: d.client_priority ?? 'medium',
            internal_notes: d.internal_notes ?? '',
          });
        }
      } catch (error) {
        console.error("AccountInfoCard: getClientStat error:", error);
        if (error?.response?.status === 403) {
          setForbidden(true);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    getClientStat();
    return () => { mounted = false; };
  }, [accountId]);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e?.preventDefault();
    setSaving(true);
    try {
      const res = await StatsService.updateClientStats({
        account: accountId,
        ...formData,
        total_support_tickets: Number(formData.total_support_tickets) || 0,
      });
      if (res) toast.show({ icon: 'success', content: 'Məlumat uğurla yeniləndi.' });
    } catch (error) {
      toast.show({ icon: 'fail', content: 'Məlumat yenilənərkən xəta baş verdi.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading && !data && !forbidden) {
    return (
      <Card
        style={{
          borderRadius: "16px",
          background: themeStyles?.cardBg || "#fff",
          border: `1px solid ${themeStyles?.border || "transparent"}`,
        }}
      >
        <div style={{ padding: "16px", textAlign: "center", color: themeStyles?.mutedText }}>
          Məlumatlar yüklənir...
        </div>
      </Card>
    );
  }

  if (forbidden) {
    return (
      <Card
        style={{
          borderRadius: "16px",
          background: themeStyles?.cardBg || "#fff",
          border: `1px solid ${themeStyles?.border || "transparent"}`,
        }}
      >
        <div style={{ padding: "16px", textAlign: "center", color: themeStyles?.mutedText }}>
          Məlumatlara baxmaq icazəniz yoxdur (403 Forbidden)
        </div>
      </Card>
    );
  }

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
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--tab-active-bg)" }}>
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
        Ümumi Məlumatlar
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <div style={{ fontSize: 13, marginBottom: 6, color: themeStyles?.cardTextSecondary }}>Dəstək Biletləri</div>
          <Input
            type="number"
            value={formData.total_support_tickets}
            onChange={(val) => handleChange('total_support_tickets', val)}
            placeholder="0"
            min={0}
            style={{
              padding: "8px 12px",
              background: themeStyles?.surfaceBg,
              border: `1px solid ${themeStyles?.border}`,
              borderRadius: "8px",
              color: themeStyles?.cardText,
            }}
          />
        </div>

        <div>
          <div style={{ fontSize: 13, marginBottom: 6, color: themeStyles?.cardTextSecondary }}>Müştəri Prioriteti</div>
          <select
            value={formData.client_priority}
            onChange={(e) => handleChange('client_priority', e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              background: themeStyles?.surfaceBg,
              border: `1px solid ${themeStyles?.border}`,
              borderRadius: "8px",
              color: themeStyles?.cardText,
              outline: "none",
              fontSize: 14,
              WebkitAppearance: "none",
            }}
          >
            {Object.keys(PRIORITY_LABELS).map((key) => (
              <option key={key} value={key}>
                {PRIORITY_LABELS[key]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div style={{ fontSize: 13, marginBottom: 6, color: themeStyles?.cardTextSecondary }}>Daxili Qeydlər</div>
          <TextArea
            value={formData.internal_notes}
            onChange={(val) => handleChange('internal_notes', val)}
            placeholder="Müştəri haqqında qeydlər..."
            rows={4}
            style={{
              padding: "8px 12px",
              background: themeStyles?.surfaceBg,
              border: `1px solid ${themeStyles?.border}`,
              borderRadius: "8px",
              color: themeStyles?.cardText,
              width: "100%"
            }}
          />
        </div>

        <PermissionGuard id="update-info">
          <Button
            block
            color="primary"
            loading={saving}
            onClick={handleUpdate}
            style={{ borderRadius: "8px", fontWeight: 600 }}
          >
            {saving ? 'Yadda saxlanılır...' : 'Yadda Saxla'}
          </Button>
        </PermissionGuard>
      </div>
    </Card>
  );
}

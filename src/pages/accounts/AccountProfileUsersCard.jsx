import { useEffect, useState } from "react";
import { Card, Modal, Button } from "antd-mobile";
import { UserOutline } from "antd-mobile-icons";
import toast from "../../helpers/toast";
import { userProfileUsers, updateProfileUser } from "../../services/userProfileUsers.service";
import { killSession } from "../../services/session.service";

const PUBLIC_MODE_OPTIONS = ["online", "dev", "beta"];

const normalizeList = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.data?.data)) return value.data.data;
  return [];
};

export default function AccountProfileUsersCard({ accountId, themeStyles }) {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    if (!accountId) return undefined;

    let mounted = true;

    const fetchProfiles = async () => {
      try {
        setLoading(true);
        const profilesRes = await userProfileUsers(accountId);
        if (mounted) {
          setProfiles(normalizeList(profilesRes));
        }
      } catch (error) {
        console.error("Profil melumatlari yuklenirken xeta", error);
        if (mounted) {
          setProfiles([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchProfiles();

    return () => {
      mounted = false;
    };
  }, [accountId]);

  const handlePublicModeChange = async (profile, newMode) => {
    const previousMode = profile.publicMode;
    if (newMode === previousMode) return;

    setUpdatingId(profile.id);
    try {
      const res = await updateProfileUser({
        account: accountId,
        login: profile.login,
        publicMode: newMode,
      });

      setProfiles((prev) =>
        prev.map((p) =>
          p.id === profile.id ? { ...p, publicMode: newMode } : p
        )
      );
      toast.show({ icon: "success", content: res?.message || "Public mode dəyişdirildi" });
    } catch (error) {
      const errMsg = error?.response?.data?.message || error?.message || "Dəyişiklik uğursuz oldu";
      toast.show({ icon: "fail", content: errMsg });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleKillSession = async (profile) => {
    const confirmed = await Modal.confirm({
      content: `"${profile.login || profile.name}" istifadəçisinin sessiyasını sonlandırmaq istəyirsiniz?`,
      confirmText: "Bəli, Sonlandır",
      cancelText: "Xeyr",
    });

    if (confirmed) {
      setUpdatingId(profile.id);
      try {
        await killSession(accountId, profile.login);
        toast.show({ icon: "success", content: "Sessiya sonlandırıldı" });
      } catch (error) {
        toast.show({ icon: "fail", content: "Xəta baş verdi" });
      } finally {
        setUpdatingId(null);
      }
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
        <UserOutline color="#1890ff" /> Profil istifadəçiləri
      </div>
      {loading ? (
        <div
          style={{
            padding: "16px",
            textAlign: "center",
            color: themeStyles?.mutedText,
            fontSize: "14px",
          }}
        >
          Profillər yüklənir...
        </div>
      ) : profiles.length === 0 ? (
        <div
          style={{
            padding: "16px",
            textAlign: "center",
            color: themeStyles?.mutedText,
            fontSize: "14px",
          }}
        >
          Bu hesaba aid profil istifadəçisi tapılmadı.
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {profiles.map((profile, idx) => (
            <div
              key={profile.id || profile.login || idx}
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "14px",
                background: themeStyles?.surfaceBg,
                borderRadius: "12px",
                border: `1px solid ${themeStyles?.border}`,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div
                  style={{
                    fontWeight: 600,
                    color: themeStyles?.cardText,
                    fontSize: 15,
                  }}
                >
                  {profile.name}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {profile.role && (
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "var(--tab-active-bg)",
                        background: "rgba(124, 58, 237, 0.08)",
                        padding: "4px 8px",
                        borderRadius: 6,
                        textTransform: "uppercase",
                      }}
                    >
                      {profile.role}
                    </div>
                  )}
                  <select
                    value={profile.publicMode || "online"}
                    disabled={updatingId === profile.id}
                    onChange={(e) => handlePublicModeChange(profile, e.target.value)}
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      padding: "4px 8px",
                      borderRadius: 8,
                      border: `1px solid ${themeStyles?.border || "#d9d9d9"}`,
                      background: themeStyles?.surfaceBg || "#fff",
                      color: themeStyles?.cardText || "#333",
                      cursor: updatingId === profile.id ? "not-allowed" : "pointer",
                      opacity: updatingId === profile.id ? 0.5 : 1,
                      outline: "none",
                      minWidth: 70,
                    }}
                  >
                    {PUBLIC_MODE_OPTIONS.map((mode) => (
                      <option key={mode} value={mode}>
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {profile.login && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: themeStyles?.cardTextSecondary }}>Login:</span>
                    <span style={{ color: themeStyles?.cardText, fontWeight: 500 }}>{profile.login}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: themeStyles?.cardTextSecondary }}>Telefon:</span>
                  <span style={{ color: themeStyles?.cardText, fontWeight: 500 }}>+{profile.phone}</span>
                </div>
                {profile.email && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: themeStyles?.cardTextSecondary }}>Email:</span>
                    <span style={{ color: themeStyles?.cardText, fontWeight: 500 }}>{profile.email}</span>
                  </div>
                )}
                <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button 
                    size="mini" 
                    color="danger" 
                    fill="outline" 
                    disabled={updatingId === profile.id || !profile.login}
                    onClick={() => handleKillSession(profile)}
                  >
                    Sessiyanı sonlandır
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

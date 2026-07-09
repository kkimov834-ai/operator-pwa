import { useEffect, useState } from "react";
import { Card } from "antd-mobile";
import { UserOutline } from "antd-mobile-icons";
import { userProfileUsers } from "../../services/userProfileUsers.service";

const normalizeList = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.data?.data)) return value.data.data;
  return [];
};

export default function AccountProfileUsersCard({ accountId, themeStyles }) {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

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
          {profiles.map((profile) => (
            <div
              key={profile.id}
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
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

import React, { useState, useEffect } from "react";
import { getCurrentUser } from "../../services/auth.services";
import { List, Avatar, DotLoading } from "antd-mobile";
import { UserOutline, CheckShieldOutline  } from "antd-mobile-icons";
import { useNavBarContext } from "../../components/NavBarContext";

const ProfilePage = () => {
  const [authUser, setAuthUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { setTitle, setShowBack, themeStyles, isDark } = useNavBarContext();

  useEffect(() => {
    setTitle("Hesabım");
    setShowBack(false);
    return () => setTitle("");
  }, [setTitle, setShowBack]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const user = await getCurrentUser();
        setAuthUser(user || {});
        setError(null);
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("Istifadeci melumatlari yuklenerken xeta bash verdi");
        setAuthUser({});
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 12,
        paddingBottom: 84,
        background: themeStyles?.pageBg,
        color: themeStyles?.text,
      }}
    >
      {error && (
        <div
          style={{
            padding: 12,
            borderRadius: 8,
            background: isDark ? "rgba(127, 29, 29, 0.28)" : "#fef2f2",
            border: "1px solid rgba(220, 38, 38, 0.35)",
            color: isDark ? "#fecaca" : "#b91c1c",
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40, color: themeStyles?.mutedText }}>
          <DotLoading color="primary" />
          <span style={{ marginLeft: 8 }}>Məlumatlar yüklənir...</span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
          
          {/* Avatar Section */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            padding: '24px 0',
            background: themeStyles?.cardBg,
            borderRadius: '16px',
            border: `1px solid ${themeStyles?.border || 'transparent'}`,
            boxShadow: isDark ? 'none' : '0 4px 16px rgba(0,0,0,0.04)'
          }}>
            <Avatar 
              src="" 
              style={{ '--size': '80px', marginBottom: '12px' }} 
              fallback={<UserOutline style={{ fontSize: 40, color: 'var(--tab-active-bg)' }} />}
            />
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
              {authUser?.identifier || "Naməlum İstifadəçi"}
            </h2>
            <div style={{ 
              marginTop: '6px', 
              padding: '4px 12px', 
              background: 'rgba(124, 58, 237, 0.1)', 
              color: 'var(--tab-active-bg)',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: 600
            }}>
              {authUser?.role || "Rol təyin edilməyib"}
            </div>
          </div>

          {/* Details List */}
          <List 
            style={{ 
              '--border-inner': `1px solid ${themeStyles?.border || '#eee'}`,
              '--border-top': 'none',
              '--border-bottom': 'none',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: isDark ? 'none' : '0 4px 16px rgba(0,0,0,0.04)'
            }}
          >
            <List.Item
              prefix={<UserOutline style={{ fontSize: 20, color: themeStyles?.mutedText }} />}
              description="Sistemə daxil olduğunuz hesab adı"
              style={{ background: themeStyles?.cardBg, color: themeStyles?.cardText }}
            >
              <div style={{ color: themeStyles?.cardText }}>{authUser?.identifier || "N/A"}</div>
            </List.Item>
            
            <List.Item
              prefix={<CheckShieldOutline style={{ fontSize: 20, color: themeStyles?.mutedText }} />}
              description="Sistemdəki mövcud rolunuz"
              style={{ background: themeStyles?.cardBg, color: themeStyles?.cardText }}
            >
              <div style={{ color: themeStyles?.cardText, textTransform: 'capitalize' }}>
                {authUser?.role || "N/A"}
              </div>
            </List.Item>
          </List>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;

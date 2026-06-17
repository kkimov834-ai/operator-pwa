import React, { useState, useEffect } from "react";
import { getCurrentUser } from "../../services/auth.services";
import { Card } from "antd-mobile";
import { useNavBarContext } from "../../components/NavBarContext";

const ProfilePage = () => {
  const [authUser, setAuthUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { setTitle, setShowBack, themeStyles, isDark } = useNavBarContext();

  useEffect(() => {
    setTitle("Hesabim");
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
        <div style={{ color: themeStyles?.mutedText || "#9CA3AF" }}>
          SSO gozlenilir...
        </div>
      ) : (
        <Card
          style={{
            background: themeStyles?.cardBg,
            border: `1px solid ${themeStyles?.border || "transparent"}`,
            borderRadius: 8,
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            marginTop: "20px",
          }}
        >
          <div style={{ color: themeStyles?.cardText }}>
            <strong
              style={{
                color: themeStyles?.cardTextSecondary || "#9CA3AF",
                fontWeight: 500,
              }}
            >
              Istifadeci:
            </strong>{" "}
            {authUser?.identifier || "N/A"}
          </div>
          <div style={{ color: themeStyles?.cardText }}>
            <strong
              style={{
                color: themeStyles?.cardTextSecondary || "#9CA3AF",
                fontWeight: 500,
              }}
            >
              Rol:
            </strong>{" "}
            {authUser?.role || "N/A"}
          </div>
        </Card>
      )}
    </div>
  );
};

export default ProfilePage;

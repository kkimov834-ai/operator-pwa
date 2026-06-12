import React, { useState, useEffect } from "react";
import { getCurrentUser } from "../../services/auth.services";
import { Card } from "antd-mobile";

const ProfilePage = () => {
  const [authUser, setAuthUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const user = await getCurrentUser();
        setAuthUser(user || {});
        setError(null);
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("İstifadəçi məlumatları yüklənərkən xəta baş verdi");
        setAuthUser({});
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="p-6 mx-auto space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div>salam</div>
      ) : (
        <Card background="white" className="p-4">
          <strong>İstifadəçi:</strong> {authUser?.identifier || "N/A"}
          <strong>Rol:</strong> {authUser?.role || "N/A"}
        </Card>
      )}
    </div>
  );
};

export default ProfilePage;

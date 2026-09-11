import React, { useEffect } from "react";
import { useNavBarContext } from "../../components/NavBarContext";

export default function SettingsPage() {
  const { setTitle, setShowBack } = useNavBarContext();

  useEffect(() => {
    setTitle("Ayarlar");
    setShowBack(true);
    return () => setTitle("");
  }, []);

  return (
    <div style={{ padding: 16, minHeight: "100vh" }}>
      <h3 style={{ color: "#948683" }}>Ayarlar</h3>
      <div style={{ color: "#948683" }}>Burada tətbiq ayarlarını göstərin.</div>
    </div>
  );
}

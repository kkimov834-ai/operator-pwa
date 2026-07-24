import React from "react";
import { CapsuleTabs, TabBar } from "antd-mobile";
import { useNavigate, useLocation } from "react-router-dom";
import { useNavBarContext } from "./NavBarContext";
import { FaTasks, FaUser } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { MdOutlineDashboard, MdOutlineTerminal } from "react-icons/md";
import { ShieldCheck } from "lucide-react";
import { useRole } from "../hooks/useRole";

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setTitle, setShowBack, setQuery, themeStyles } = useNavBarContext();
  const { isSuperAdmin } = useRole();

  const items = [
    { key: "/", title: "Hesablar", icon: <FaUser /> },
    { key: "/tasks", title: "Tapşırıqlar", icon: <FaTasks /> },
    { key: "/task-environments", title: "Mühitlər", icon: <MdOutlineDashboard /> },
    { key: "/profile", title: "Hesabım", icon: <CgProfile /> },
  ];

  if (isSuperAdmin) {
    items.push({ key: "/terminal", title: "Terminal", icon: <MdOutlineTerminal /> });
    items.push({ key: "/permissions", title: "İcazələr", icon: <ShieldCheck size={18} /> });
  }

  const currentPath = location.pathname;
  const activeItem = items.find((it) => {
    if (it.key === "/") return currentPath === "/";
    return currentPath.startsWith(it.key);
  });

  const activeKey = activeItem ? activeItem.key : items[0].key;

  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        minHeight: 64,
        paddingBottom: "env(safe-area-inset-bottom)",
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
        borderRadius: 0,
        background: themeStyles?.navBg || "#161424",
        zIndex: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderTop: "1px solid rgba(0,0,0,0.12)",
      }}
    >
      {/* Məcburi CSS Əzmə (Override):
        antd-mobile-ın daxili klasslarını birbaşa hədəf alırıq ki, 
        göy və ağ düymə rəngləri tamamilə silinsin.
      */}
      <style>{`
        .adm-capsule-tabs-tab {
          background-color: ${themeStyles?.tabPassiveBg || "#2A2740"} !important;
          color: ${themeStyles?.tabPassiveText || "#9CA3AF"} !important;
        }
        .adm-capsule-tabs-tab-active {
          background-color: ${themeStyles?.tabActiveBg || "#7C3AED"} !important;
          color: ${themeStyles?.tabActiveText || "#FFFFFF"} !important;
        }
        .adm-capsule-tabs-tab-list {
          background-color: transparent !important;
        }
      `}</style>

      <div style={{ width: "100%", padding: "0 10px" }}>
        <TabBar
          activeKey={activeKey}
          onChange={(key) => {
            navigate(key);
            if (key === "/") {
              try {
                setTitle("Hesablar");
                setShowBack(false);
                setQuery && setQuery("");
              } catch (e) {
                // ignore
              }
            }
          }}
          style={{
            "--cap-space": "12px",
          }}
        >
          {items.map((it) => (
            <TabBar.Item title={it.title} icon={it.icon} key={it.key} />
          ))}
        </TabBar>
      </div>
    </div>
  );
};

export default Footer;

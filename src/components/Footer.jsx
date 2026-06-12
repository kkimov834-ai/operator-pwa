import React from "react";
import { CapsuleTabs, TabBar } from "antd-mobile";
import { useNavigate, useLocation } from "react-router-dom";
import { AiOutlineCheckSquare, AiOutlineUser } from "react-icons/ai";
import { useNavBarContext } from "./NavBarContext";

const items = [
  {
    key: "/accounts",
    title: "Hesablar",
    icon: <AiOutlineUser />,
  },
  {
    key: "/tasks",
    title: "Tapşırıqlar",
    icon: <AiOutlineCheckSquare />,
  },
  {
    key: "/profile",
    title: "Hesabım",
    icon: <AiOutlineUser />,
  },
];

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { themeStyles } = useNavBarContext();

  const activeKey =
    items.find((it) => location.pathname.startsWith(it.key))?.key ||
    items[0].key;
  const inactiveColor = "#9ca3af";
  const activeColor = "#60a5fa";

  return (
    <div
      style={{
        position: "fixed",
        left: 12,
        right: 12,
        bottom: 12,
        borderRadius: 14,
        background:
          themeStyles?.buttonBg ||
          "linear-gradient(180deg,#052b4e 0%,#04263f 100%)",
        boxShadow: "0 8px 20px rgba(2,8,23,0.6)",
        padding: "6px",
        zIndex: 40,
      }}
    >
      <TabBar
        activeKey={activeKey}
        onChange={(key) => navigate(key)}
        style={{ background: "transparent" }}
      >
        {items.map((it) => {
          const isActive = activeKey === it.key;
          const icon = React.cloneElement(it.icon, {
            style: { color: isActive ? activeColor : inactiveColor },
          });
          return (
            <TabBar.Item
              key={it.key}
              icon={icon}
              title={
                <CapsuleTabs
                  activeKey={activeKey}
                  onChange={(key) => navigate(key)}
                >
                  <CapsuleTabs.Tab title={it.title} key={it.key} />
                </CapsuleTabs>
              }
            />
          );
        })}
      </TabBar>
    </div>
  );
};

export default Footer;

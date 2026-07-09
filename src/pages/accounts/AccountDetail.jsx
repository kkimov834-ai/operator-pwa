import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Space } from "antd-mobile";
import ModulesManager from "./ModulesManager";
import AccountHistoryCard from "./AccountHistoryCard";
import AccountUserInfoCard from "./AccountUserInfoCard";
import AccountProfileUsersCard from "./AccountProfileUsersCard";
import { useNavBarContext } from "../../components/NavBarContext";
import { getUserInfo } from "../../services/userInfo.service";
import { getUserAccounts } from "../../services/user.service";

const normalizeList = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.data?.data)) return value.data.data;
  return [];
};

export default function AccountDetail() {
  const { id } = useParams();
  const { setTitle, setShowBack, themeStyles } = useNavBarContext();

  const [acc, setAcc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return undefined;

    let mounted = true;

    const fetchInfo = async () => {
      try {
        setLoading(true);

        let data = null;

        try {
          const res = await getUserInfo(id);

          if (res?.balance !== undefined) {
            data = res;
          } else if (res?.data?.balance !== undefined) {
            data = res.data;
          } else if (res?.data) {
            data = res.data;
          }
        } catch {
          console.warn("getUserInfo failed, trying account list fallback...");
        }

        if (!data) {
          const accounts = normalizeList(await getUserAccounts());
          const found = accounts.find(
            (item) =>
              String(item?.id) === String(id) ||
              String(item?.account) === String(id),
          );

          if (found) {
            data = found;
          }
        }

        if (!mounted) return;

        if (!data) return;

        setAcc(data);
        setTitle("Hesab ");
      } catch (error) {
        console.error("Melumat yuklenirken xeta", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchInfo();
    setShowBack(true);

    return () => {
      mounted = false;
      setTitle("");
      setShowBack(false);
    };
  }, [id, setShowBack, setTitle]);

  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: "center", color: "#999" }}>
        Melumatlar yuklenir...
      </div>
    );
  }

  if (!acc) {
    return (
      <div style={{ padding: 20, textAlign: "center", color: "#ff4d4f" }}>
        Istifadeci tapilmadi.
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "16px",
        background: themeStyles?.pageBg,
        minHeight: "100vh",
        paddingBottom: "calc(30px + env(safe-area-inset-bottom, 24px))",
      }}
    >
      <Space direction="vertical" block style={{ "--gap": "12px" }}>
        <AccountUserInfoCard account={acc} themeStyles={themeStyles} />
        <AccountProfileUsersCard
          accountId={acc.account}
          themeStyles={themeStyles}
        />

        <AccountHistoryCard accountId={acc.account} themeStyles={themeStyles} />

        <ModulesManager accountId={acc.account} />
      </Space>
    </div>
  );
}

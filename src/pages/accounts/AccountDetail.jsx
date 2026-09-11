import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { UserRound, Wallet } from "lucide-react";
import AccountFinanceCard from "./AccountFinanceCard";
import ModulesManager from "./ModulesManager";
import AccountHistoryCard from "./AccountHistoryCard";
import AccountProfileUsersCard from "./AccountProfileUsersCard";
import UpdateAccountCard from "./UpdateAccountCard";
import AccountInfoCard from "./AccountInfoCard";
import AccountTasksCard from "./AccountTasksCard";
import { useNavBarContext } from "../../components/NavBarContext";
import { getUserInfo } from "../../services/userInfo.service";
import { getUserAccounts } from "../../services/user.service";

const normalizeList = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.data?.data)) return value.data.data;
  return [];
};

const valueOrDash = (value) =>
  value === null || value === undefined || value === "" ? "-" : value;

const formatBalance = (value) => {
  const balance = valueOrDash(value);
  return String(balance).toUpperCase().includes("AZN")
    ? balance
    : `${balance} AZN`;
};

const firstValue = (account, keys, fallback = "-") => {
  for (const key of keys) {
    if (account?.[key] !== null && account?.[key] !== undefined && account?.[key] !== "") {
      return account[key];
    }
  }
  return fallback;
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
        setTitle(data.account || "Hesab");
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

  const isActive = Number(acc.status) === 1;
  const fullName = firstValue(
    acc,
    ["full_name", "fullname"],
    `${acc.name || ""} ${acc.lastname || ""}`.trim() || "-",
  );
  const infoFields = [
    { label: "Account name", value: firstValue(acc, ["account", "account_name"]) },
    { label: "Cari balans", value: formatBalance(firstValue(acc, ["balance", "current_balance"])) },
    { label: "Ad Soyad", value: fullName },
    { label: "E-poçt", value: firstValue(acc, ["email", "mail"]) },
    { label: "Telefon", value: firstValue(acc, ["phone", "phone_number"]) },
    { label: "Tərəfdaş PIN", value: firstValue(acc, ["partnerpin", "partner_pin"]) },
    {
      label: "Status",
      value: isActive ? "Aktiv" : "Deaktiv",
      status: isActive ? "active" : "inactive",
    },
    { label: "Qeydiyyat", value: firstValue(acc, ["registermoment", "registremoment", "registered_at", "register_date"]) },
    { label: "Son Giriş", value: firstValue(acc, ["last_login", "lastLogin", "last_login_at"]) },
    { label: "Son Əlaqə", value: firstValue(acc, ["last_contact", "lastContact", "last_contact_at"]) },
  ];

  return (
    <main className="account-detail-page" style={{ background: themeStyles?.pageBg, color: themeStyles?.text }}>
      <div className="account-detail-container">
        <header className="account-detail-topbar">
          <div className="account-detail-heading">
            <div className="account-detail-kicker">Hesab profili</div>
            <h1>{acc.account || "-"}</h1>
          </div>
          <span className={`account-detail-status ${isActive ? "is-active" : "is-inactive"}`}>
            <span className="account-status-dot" /> {isActive ? "Aktiv" : "Deaktiv"}
          </span>
        </header>

        <section className="account-detail-summary">
          <div className="account-detail-summary-main">
            <div className="account-detail-avatar"><UserRound size={22} /></div>
            <div>
              <div className="account-detail-name">{fullName}</div>
              <div className="account-detail-muted">{valueOrDash(acc.partner_name)}</div>
            </div>
          </div>
          <div className="account-detail-balance">
            <span>Cari balans</span>
            <strong>{formatBalance(acc.balance)}</strong>
          </div>
        </section>

        <section className="account-detail-info-panel">
          <div className="account-detail-info-title">Hesab məlumatları</div>
          <div className="account-detail-info-grid">
            {infoFields.map((field) => (
              <div className="account-detail-info-item" key={field.label}>
                <div className="account-detail-info-label">{field.label}</div>
                <div className={`account-detail-info-value ${field.status ? `is-${field.status}` : ""}`}>
                  {field.value}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="account-detail-section">
          <div className="account-detail-section-heading"><Wallet size={18} /> Maliyyə və hesab əməliyyatları</div>
          <AccountFinanceCard accountId={acc.account} themeStyles={themeStyles} />
          <UpdateAccountCard account={acc} themeStyles={themeStyles} />
        </section>

        <section className="account-detail-section">
          <div className="account-detail-section-heading"><UserRound size={18} /> İstifadəçi və modullar</div>
          <AccountProfileUsersCard accountId={acc.account} themeStyles={themeStyles} />
          <ModulesManager accountId={acc.account} />
        </section>

        <section className="account-detail-section">
          <AccountHistoryCard accountId={acc.account} themeStyles={themeStyles} />
          <AccountInfoCard accountId={acc.account} themeStyles={themeStyles} />
          <AccountTasksCard accountId={acc.account} themeStyles={themeStyles} />
        </section>
      </div>
    </main>
  );
}

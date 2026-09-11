import { Card } from "antd-mobile";
import {
  ChevronRight,
  CircleDollarSign,
  Mail,
  Phone,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNavBarContext } from "../../components/NavBarContext";

const isMissingEmail = (email) => {
  const normalized = String(email ?? "").trim().toLowerCase();
  return normalized === "0" || normalized === "null" || normalized === "";
};

const valueOrDash = (value) =>
  value === null || value === undefined || value === "" ? "-" : value;

const getPartnerPin = (account) =>
  valueOrDash(account?.partnerpin ?? account?.partner_pin ?? account?.partnerPin);

const formatPaid = (paid) => {
  if (paid === null || paid === undefined || paid === "") return "0.00 AZN";
  const numeric = Number(paid);
  if (!Number.isNaN(numeric)) return `${numeric.toFixed(2)} AZN`;
  const text = String(paid).trim().toUpperCase();
  return text.includes("AZN") ? paid : `${paid} AZN`;
};

const fullName = (account) => {
  const name = valueOrDash(account?.name);
  const lastname = valueOrDash(account?.lastname);
  return name === "-" && lastname === "-"
    ? "-"
    : [name, lastname].filter((v) => v !== "-").join(" ") || "-";
};

export default function AccountList({ accounts = [], onOpen }) {
  const { themeStyles } = useNavBarContext();
  const navigate = useNavigate();

  return (
    <div
      className="account-list"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        marginTop: 12,
      }}
    >
      {accounts.map((account) => {
        const isActive = Number(account.status) === 1;
        const emailText = isMissingEmail(account.email)
          ? "Email Yazılmamıştır"
          : account.email;
        return (
          <div key={account.id || account.account} style={{ width: "100%" }}>
            <div
              onClick={() => {
                if (onOpen) onOpen(account);
                else if (account.account) navigate(`/${encodeURIComponent(account.account)}`);
              }}
              style={{ cursor: "pointer" }}
            >
              <Card
                className="account-card"
                style={{
                  background: themeStyles?.cardBg,
                  color: themeStyles?.cardText,
                  border: `1px solid ${themeStyles?.border || "transparent"}`,
                  borderRadius: 16,
                }}
              >
                <div className="account-card-content">
                  <div className="account-card-heading">
                    <div className="account-card-title">
                      <span className="account-card-avatar">
                        {(account.account || "?").slice(0, 1).toUpperCase()}
                      </span>
                      <div>
                        <div className="account-card-id">
                          {account.account || account.id || "-"}
                        </div>
                        <div className="account-card-name">
                          {fullName(account) !== "-" ? fullName(account) : account.partner_name || "Hesab məlumatı"}
                        </div>
                      </div>
                    </div>
                    <span className={`account-status ${isActive ? "is-active" : "is-inactive"}`}>
                      <span className="account-status-dot" />
                      {isActive ? "Aktiv" : "Deaktiv"}
                    </span>
                  </div>

                  <div className="account-card-metrics">
                    <div className="account-metric">
                      <CircleDollarSign size={15} strokeWidth={2.2} />
                      <span>Ödənilib</span>
                      <strong>{formatPaid(account.total_paid)}</strong>
                    </div>
                    <div className="account-metric">
                      <Phone size={15} strokeWidth={2.2} />
                      <span>Telefon</span>
                      <strong>{valueOrDash(account.phone)}</strong>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 8,
                    }}
                  >
                    <div className="account-metric" style={{ gridTemplateColumns: "18px 1fr" }}>
                      <UserRound size={15} strokeWidth={2.2} />
                      <span>Partnyor</span>
                      <strong>{valueOrDash(account.partner_name)}</strong>
                    </div>
                    <div className="account-metric" style={{ gridTemplateColumns: "18px 1fr" }}>
                      <span />
                      <span>Tərəfdaş PIN</span>
                      <strong className="account-partner-pin">{getPartnerPin(account)}</strong>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                      gap: 8,
                    }}
                  >
                    <div className="account-metric" style={{ gridTemplateColumns: "1fr" }}>
                      <span>Qeydiyyat</span>
                      <strong>{valueOrDash(account.registermoment ?? account.registremoment ?? account.registered_at)}</strong>
                    </div>
                    <div className="account-metric" style={{ gridTemplateColumns: "1fr" }}>
                      <span>Son giriş</span>
                      <strong>{valueOrDash(account.last_login ?? account.lastLogin)}</strong>
                    </div>
                    <div className="account-metric" style={{ gridTemplateColumns: "1fr" }}>
                      <span>Son əlaqə</span>
                      <strong>{valueOrDash(account.last_contact ?? account.lastContact)}</strong>
                    </div>
                  </div>

                  <div className="account-card-footer">
                    <div className="account-card-contact">
                      <Mail size={14} strokeWidth={2} />
                      <span>{emailText}</span>
                    </div>
                    <div className="account-card-open">
                      Ətraflı <ChevronRight size={16} strokeWidth={2.2} />
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        );
      })}
    </div>
  );
}

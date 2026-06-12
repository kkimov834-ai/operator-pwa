import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { ACCOUNTS } from "./accountsData";
import ModulesManager from "./ModulesManager";
import { useNavBarContext } from "../../components/NavBarContext";

export default function AccountDetail() {
  const { id } = useParams();
  const acc = ACCOUNTS.find((a) => a.id === id) || {
    id,
    name: "Hesab",
    balance: "0 AZN",
  };
  const { setTitle, setShowBack } = useNavBarContext();

  useEffect(() => {
    setTitle(acc.name);
    setShowBack(true);
    return () => {
      setTitle("");
      setShowBack(false);
    };
  }, [acc.id]);

  return (
    <div
      style={{
        padding: 12,
        background: "#f3f4f6",
        minHeight: "100vh",
      }}
    >
      <h2>{acc.name}</h2>
      <p>Balans: {acc.balance}</p>
      <ModulesManager accountId={acc.id} />
    </div>
  );
}

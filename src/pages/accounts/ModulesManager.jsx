import React, { useState, useEffect } from "react";
import { Button, Selector, Card } from "antd-mobile";
import { MODULE_OPTIONS, TARIFF_OPTIONS } from "./accountsData";
import {
  getModules,
  addModules,
  removeModule,
  addTariffs,
  removeService,
} from "./accountsStore";
import { useNavBarContext } from "../../components/NavBarContext";

export default function ModulesManager({ accountId }) {
  const { themeStyles } = useNavBarContext();
  const [modules, setModules] = useState([]);
  const [addingModules, setAddingModules] = useState(false);
  const [selectedModules, setSelectedModules] = useState([]);
  const [addingTariffsFor, setAddingTariffsFor] = useState(null);
  const [selectedTariffs, setSelectedTariffs] = useState([]);

  useEffect(() => {
    setModules(getModules(accountId));
  }, [accountId]);

  const openAddModules = () => {
    setSelectedModules([]);
    setAddingModules(true);
  };

  const confirmAddModules = () => {
    if (selectedModules.length === 0) return setAddingModules(false);
    const names = selectedModules;
    const updated = addModules(accountId, names);
    setModules(updated);
    setAddingModules(false);
  };

  const handleRemoveModule = (modId) => {
    const updated = removeModule(accountId, modId);
    setModules(updated);
  };

  const openAddTariffs = (modId) => {
    setAddingTariffsFor(modId);
    setSelectedTariffs([]);
  };

  const confirmAddTariffs = () => {
    if (!addingTariffsFor || selectedTariffs.length === 0)
      return setAddingTariffsFor(null);
    const updated = addTariffs(accountId, addingTariffsFor, selectedTariffs);
    setModules(updated);
    setAddingTariffsFor(null);
  };

  const handleRemoveService = (modId, serviceId) => {
    const updated = removeService(accountId, modId, serviceId);
    setModules(updated);
  };

  const availableModuleOptions = MODULE_OPTIONS.filter(
    (o) => !modules.some((m) => m.name === o.value),
  );

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <h3 style={{ margin: 0, color: themeStyles.cardText }}>Modullar</h3>
        <Button
          size="small"
          onClick={openAddModules}
          style={{
            background: themeStyles.buttonBg,
            color: themeStyles.buttonText,
          }}
        >
          + Modul əlavə et
        </Button>
      </div>

      {modules.length === 0 ? (
        <div style={{ padding: 12, color: themeStyles.cardText || "#6b7280" }}>
          Hələ modul əlavə edilməyib
        </div>
      ) : (
        modules.map((mod) => (
          <Card
            key={mod.id}
            title={mod.name}
            style={{
              marginBottom: 12,
              background: themeStyles.cardBg,
              color: themeStyles.cardText,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: themeStyles.cardText }}>
                  {mod.name}
                </div>
                <div style={{ fontSize: 13, color: themeStyles.cardText }}>
                  {mod.price}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Button
                  size="small"
                  onClick={() => openAddTariffs(mod.id)}
                  style={{
                    background: themeStyles.buttonBg,
                    color: themeStyles.buttonText,
                  }}
                >
                  + Tarif əlavə et
                </Button>
                <Button
                  size="small"
                  color="danger"
                  onClick={() => handleRemoveModule(mod.id)}
                >
                  Sil
                </Button>
              </div>
            </div>

            {mod.services && mod.services.length > 0 && (
              <div
                style={{
                  marginTop: 12,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {mod.services.map((s) => (
                  <div
                    key={s.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: 8,
                      borderRadius: 8,
                      background: themeStyles.serviceBg,
                      color: themeStyles.serviceText || themeStyles.cardText,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>{s.name}</div>
                      <div
                        style={{
                          fontSize: 13,
                          color:
                            themeStyles.serviceText || themeStyles.cardText,
                        }}
                      >
                        {s.price}
                      </div>
                    </div>
                    <div>
                      <Button
                        size="small"
                        color="danger"
                        onClick={() => handleRemoveService(mod.id, s.id)}
                      >
                        Sil
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))
      )}

      {/* Add modules selector popup */}
      {addingModules && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            style={{
              padding: 16,
              borderRadius: 8,
              background: "white",
              width: "100%",
              maxWidth: 520,
            }}
          >
            <h4>Modulları seçin</h4>
            <Selector
              options={availableModuleOptions}
              value={selectedModules}
              onChange={(v) => setSelectedModules(v || [])}
              multiple
            />
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <Button block onClick={() => setAddingModules(false)}>
                Imtina
              </Button>
              <Button
                block
                color="primary"
                onClick={confirmAddModules}
                disabled={selectedModules.length === 0}
                style={{}}
              >
                Əlavə et
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add tariffs selector popup */}
      {addingTariffsFor && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            style={{
              padding: 16,
              borderRadius: 8,
              background: "white",
              width: "100%",
              maxWidth: 520,
            }}
          >
            <h4>Tarifləri seçin</h4>
            <Selector
              options={TARIFF_OPTIONS}
              value={selectedTariffs}
              onChange={(v) => setSelectedTariffs(v || [])}
              multiple
            />
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <Button block onClick={() => setAddingTariffsFor(null)}>
                Imtina
              </Button>
              <Button
                block
                color="primary"
                onClick={confirmAddTariffs}
                disabled={selectedTariffs.length === 0}
              >
                Əlavə et
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Button, Selector, Card, Toast } from "antd-mobile";
import { MODULE_OPTIONS, TARIFF_OPTIONS } from "./accountsData";
import {
  addModules,
  removeModule,
  addTariffs,
  removeService,
} from "./accountsStore";
import { userModules } from "../../services/userModules.secvice";

export default function ModulesManager({ accountId }) {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);

  const [addingModules, setAddingModules] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null); // Massiv yox, tək dəyər
  const [addingTariffsFor, setAddingTariffsFor] = useState(null);
  const [selectedTariff, setSelectedTariff] = useState(null); // Massiv yox, tək dəyər
  const [collapsedIds, setCollapsedIds] = useState([]);

  const fetchUserModules = async () => {
    if (!accountId) return;
    try {
      setLoading(true);
      const res = await userModules(accountId);
      if (res && res.status === "success") {
        setModules(res.data || []);
      } else if (Array.isArray(res)) {
        setModules(res);
      } else if (res?.data) {
        setModules(res.data);
      }
    } catch (error) {
      console.error("Modullar yüklənərkən xəta yarandı:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserModules();
  }, [accountId]);

  const openAddModules = () => {
    setSelectedModule(null); // Sıfırlayırıq
    setAddingModules(true);
  };

  const confirmAddModules = () => {
    if (!selectedModule) return setAddingModules(false);
    // accountsStore funksiyası massiv gözləyirsə, tək seçimi massiv daxilində göndəririk
    const updated = addModules(accountId, [selectedModule]);
    setModules(updated);
    setAddingModules(false);
    Toast.show({ content: "Modul uğurla əlavə edildi" });
  };

  const handleRemoveModule = (modId) => {
    const updated = removeModule(accountId, modId);
    setModules(updated);
    Toast.show({ content: "Modul silindi" });
  };

  const openAddTariffs = (modId) => {
    setAddingTariffsFor(modId);
    setSelectedTariff(null); // Sıfırlayırıq
  };

  const confirmAddTariffs = () => {
    if (!addingTariffsFor || !selectedTariff) return setAddingTariffsFor(null);
    // accountsStore funksiyası massiv gözləyirsə, tək seçimi massiv daxilində göndəririk
    const updated = addTariffs(accountId, addingTariffsFor, [selectedTariff]);
    setModules(updated);
    setAddingTariffsFor(null);
  };

  const handleRemoveService = (modId, serviceId) => {
    const updated = removeService(accountId, modId, serviceId);
    setModules(updated);
  };

  const toggleCollapse = (id) => {
    setCollapsedIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  if (loading) {
    return (
      <div
        style={{
          padding: "12px",
          textAlign: "center",
          color: "var(--muted-text)",
          fontSize: "13px",
        }}
      >
        Modullar yüklənir...
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 20 }}>
      <style>{`
        .adm-selector-item {
          background-color: var(--tab-passive-bg) !important;
          color: var(--tab-passive-text) !important;
          border: 1px solid var(--border) !important;
        }
        .adm-selector-item-active {
          background-color: var(--tab-active-bg) !important;
          color: var(--tab-active-text) !important;
          border-color: var(--tab-active-bg) !important;
        }
      `}</style>

      {/* Başlıq */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          marginTop: 8,
        }}
      >
        <h3
          style={{
            margin: 0,
            color: "var(--app-text)",
            fontWeight: 600,
            fontSize: "16px",
          }}
        >
          Modullar ({modules.length})
        </h3>
        <Button
          size="small"
          onClick={openAddModules}
          style={{
            background: "var(--tab-active-bg)",
            color: "var(--tab-active-text)",
            border: "none",
            borderRadius: "6px",
            fontWeight: "500",
          }}
        >
          + Modul əlavə et
        </Button>
      </div>

      {/* Siyahı */}
      {modules.length === 0 ? (
        <div
          style={{
            padding: "24px 12px",
            color: "var(--muted-text)",
            textAlign: "center",
            fontSize: "14px",
            background: "var(--surface-bg)",
            borderRadius: "8px",
          }}
        >
          Bu istifadəçiyə aid heç bir modul tapılmadı.
        </div>
      ) : (
        modules.map((mod) => (
          <Card
            key={mod.id || mod.name}
            style={{
              marginBottom: 12,
              background: "var(--card-bg)",
              borderRadius: "12px",
              border: "1px solid var(--border)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Button
                  size="mini"
                  style={{
                    background: "#D32F2F",
                    border: "none",
                    color: "#FFFFFF",
                    borderRadius: "6px",
                  }}
                  onClick={() => handleRemoveModule(mod.id)}
                >
                  Sil
                </Button>
                <div
                  onClick={() => toggleCollapse(mod.id || mod.name)}
                  style={{ cursor: "pointer" }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      color: "var(--card-text)",
                      fontSize: 15,
                    }}
                  >
                    {mod.name}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--card-text-secondary)",
                      marginTop: 2,
                    }}
                  >
                    {mod.price ? `${mod.price} AZN` : "Pulsuz"}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Button
                  size="small"
                  onClick={() => openAddTariffs(mod.id)}
                  style={{
                    background: "var(--tab-passive-bg)",
                    color: "var(--tab-passive-text)",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                  }}
                >
                  + Tarif
                </Button>
                <Button
                  size="small"
                  style={{
                    background: "transparent",
                    color: "var(--muted-text)",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                  }}
                  onClick={() => toggleCollapse(mod.id || mod.name)}
                >
                  {collapsedIds.includes(mod.id || mod.name) ? "Aç" : "Gizlət"}
                </Button>
              </div>
            </div>

            {/* Daxili Servislər */}
            {!collapsedIds.includes(mod.id || mod.name) &&
              mod.services &&
              mod.services.length > 0 && (
                <div
                  style={{
                    marginTop: 12,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    borderTop: "1px solid var(--border)",
                    paddingTop: 12,
                  }}
                >
                  {mod.services.map((s) => (
                    <div
                      key={s.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        background: "var(--surface-bg)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontWeight: 500,
                            color: "var(--app-text)",
                            fontSize: 14,
                          }}
                        >
                          {s.name}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "var(--muted-text)",
                            marginTop: 2,
                          }}
                        >
                          {s.price}
                        </div>
                      </div>
                      <Button
                        size="mini"
                        style={{
                          background: "#D32F2F",
                          border: "none",
                          color: "#FFFFFF",
                          borderRadius: "6px",
                        }}
                        onClick={() => handleRemoveService(mod.id, s.id)}
                      >
                        Sil
                      </Button>
                    </div>
                  ))}
                </div>
              )}
          </Card>
        ))
      )}

      {/* MODAL POPUP: Modul Seçin (TƏKLİ SEÇİM) */}
      {addingModules && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            zIndex: 100,
          }}
        >
          <div
            style={{
              padding: 20,
              borderRadius: "16px",
              background: "var(--card-bg)",
              border: "1px solid var(--border)",
              width: "100%",
              maxWidth: 520,
            }}
          >
            <h4
              style={{
                margin: "0 0 16px 0",
                color: "var(--card-text)",
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              Modul seçin
            </h4>
            <div style={{ marginBottom: 20 }}>
              <Selector
                options={MODULE_OPTIONS.filter(
                  (o) => !modules.some((m) => m.name === o.value),
                )}
                value={selectedModule ? [selectedModule] : []} // Ant-Mobile təkli seçimdə də massiv kimi göstərilməni sevir
                onChange={(v) => setSelectedModule(v[0] || null)} // İlk elementi götürürük (Təkli seçim)
              />
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <Button
                block
                onClick={() => setAddingModules(false)}
                style={{
                  background: "transparent",
                  color: "var(--muted-text)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                }}
              >
                İmtina
              </Button>
              <Button
                block
                onClick={confirmAddModules}
                disabled={!selectedModule}
                style={{
                  background: !selectedModule
                    ? "var(--border)"
                    : "var(--tab-active-bg)",
                  color: !selectedModule
                    ? "var(--muted-text)"
                    : "var(--tab-active-text)",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "500",
                }}
              >
                Əlavə et
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL POPUP: Tarif Seçin (TƏKLİ SEÇİM) */}
      {addingTariffsFor && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            zIndex: 100,
          }}
        >
          <div
            style={{
              padding: 20,
              borderRadius: "16px",
              background: "var(--card-bg)",
              border: "1px solid var(--border)",
              width: "100%",
              maxWidth: 520,
            }}
          >
            <h4
              style={{
                margin: "0 0 16px 0",
                color: "var(--card-text)",
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              Tarif seçin
            </h4>
            <div style={{ marginBottom: 20 }}>
              <Selector
                options={TARIFF_OPTIONS}
                value={selectedTariff ? [selectedTariff] : []}
                onChange={(v) => setSelectedTariff(v[0] || null)} // İlk elementi götürürük (Təkli seçim)
              />
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <Button
                block
                onClick={() => setAddingTariffsFor(null)}
                style={{
                  background: "transparent",
                  color: "var(--muted-text)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                }}
              >
                İmtina
              </Button>
              <Button
                block
                onClick={confirmAddTariffs}
                disabled={!selectedTariff}
                style={{
                  background: !selectedTariff
                    ? "var(--border)"
                    : "var(--tab-active-bg)",
                  color: !selectedTariff
                    ? "var(--muted-text)"
                    : "var(--tab-active-text)",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "500",
                }}
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

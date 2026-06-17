import React from "react";
import { Card, Popup, Button } from "antd-mobile";
import NavBar from "../../components/NavBar";
import { useNavBarContext } from "../../components/NavBarContext";

export default function AccountPopup({
  selected,
  open,
  onClose,
  modulesFor,
  startAddModule,
  startAddService,
  removeService,
  removeModule,
}) {
  if (!selected) return null;
  const { themeStyles } = useNavBarContext();

  return (
    <Popup
      visible={open}
      onMaskClick={onClose}
      position="bottom"
      bodyStyle={{
        paddingTop: "calc(12px + env(safe-area-inset-top,12px))",
        paddingLeft: "env(safe-area-inset-left,12px)",
        paddingRight: "env(safe-area-inset-right,12px)",
        height: "100vh",
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        overflow: "hidden",
        background: themeStyles?.popupBg,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div>
          <NavBar title={selected.name} showBack onBack={onClose} />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 8,
            padding: "0 12px",
          }}
        >
          <div style={{ fontWeight: 600 }}>Aktiv Modullar və Xidmətlər</div>
          <Button
            size="mini"
            onClick={() => startAddModule(selected.id)}
            style={{ padding: "6px 10px" }}
          >
            + Modul
          </Button>
        </div>

        <div
          style={{
            marginTop: 8,
            flex: 1,
            overflowY: "auto",
            padding: "8px 12px",
            paddingBottom: "calc(88px + env(safe-area-inset-bottom,12px))",
          }}
        >
          {modulesFor.length === 0 ? (
            <div
              style={{
                padding: 20,
                textAlign: "center",
              }}
            >
              Hələ modul əlavə edilməyib
            </div>
          ) : (
            modulesFor.map((mod) => (
              <Card
                key={mod.id}
                title={mod.name}
                style={{
                  marginBottom: 12,
                  background: themeStyles?.cardBg,
                  color: themeStyles?.cardText,
                }}
              >
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  <div
                    style={{ display: "flex", gap: 8, alignItems: "center" }}
                  >
                    <div
                      style={{
                        padding: "4px 8px",
                        borderRadius: 12,
                        fontSize: 12,
                      }}
                    >
                      Modul Aktivdir
                    </div>
                    <div
                      style={{
                        padding: "4px 8px",
                        borderRadius: 12,
                        fontSize: 12,
                      }}
                    >
                      {mod.price}
                    </div>
                  </div>

                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
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
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600 }}>{s.name}</div>
                          <div style={{ fontSize: 13, opacity: 0.8 }}>
                            {s.price}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <Button
                            size="mini"
                            color="danger"
                            onClick={() =>
                              removeService(selected.id, mod.id, s.id)
                            }
                          >
                            Sil
                          </Button>
                        </div>
                      </div>
                    ))}

                    <div style={{ display: "flex", gap: 8 }}>
                      <Button
                        size="mini"
                        onClick={() => startAddService(selected.id, mod.id)}
                      >
                        + Tarif
                      </Button>
                      <Button
                        size="mini"
                        color="danger"
                        onClick={() => removeModule(selected.id, mod.id)}
                      >
                        Sil
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        <div style={{ height: 12 }} />
        <div
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1200,
            padding: "12px 12px calc(12px + env(safe-area-inset-bottom,12px))",
            boxShadow: "0 -6px 12px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Button
              color="primary"
              onClick={onClose}
              style={{
                width: "92%",
                maxWidth: 420,
                borderRadius: 8,
                padding: "12px 0",
              }}
            >
              Bağla
            </Button>
          </div>
        </div>
      </div>
    </Popup>
  );
}

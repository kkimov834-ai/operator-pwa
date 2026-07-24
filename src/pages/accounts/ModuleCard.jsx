import React from "react";
import { Button, Card } from "antd-mobile";
import PermissionGuard from "../../components/auth/PermissionGuard";

export default function ModuleCard({
  module,
  collapsed,
  onToggleCollapse,
  onRemove,
  onAddTariff,
}) {
  return (
    <Card
      style={{
        marginBottom: 12,
        background: "var(--card-bg)",
        borderRadius: 12,
        border: "1px solid var(--border)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 8,
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 17,
              fontWeight: 700,
              color: "var(--card-text)",
              lineHeight: 1.3,
              marginBottom: 4,
            }}
          >
            {module.module}
          </div>
          <div
            style={{
              fontSize: 13,
              color: "var(--card-text-secondary)",
              fontWeight: 500,
            }}
          >
            {(() => {
              const totalMonthlyPrice = (module.services || []).reduce(
                (sum, service) =>
                  sum + Number(service.price || 0) * Number(service.quantity || 1) * 30,
                0
              );
              return totalMonthlyPrice > 0 
                ? `${totalMonthlyPrice.toFixed(2)} AZN (aylıq)`
                : "0.00 AZN";
            })()}
          </div>
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
          <div style={{ display: "flex", gap: 6 }}>
            <Button
              size="small"
              onClick={() => onToggleCollapse(module.id)}
              style={{
                background: "transparent",
                color: "var(--muted-text)",
                border: "1px solid var(--border)",
                borderRadius: 8,
              }}
            >
              {collapsed ? "Aç" : "Gizlət"}
            </Button>
            <PermissionGuard id="remove-module" >
            <Button
              size="small"
              onClick={() => onRemove(module.id)}
              style={{
                background: "#fee2e2",
                color: "#b91c1c",
                border: "none",
                borderRadius: 8,
                fontWeight: 600,
              }}
            >
              Sil
            </Button>
           </PermissionGuard>
          </div>
          <Button
            size="small"
            onClick={() => onAddTariff(module.id)}
            style={{
              background: "var(--tab-passive-bg)",
              color: "var(--tab-passive-text)",
              border: "none",
              borderRadius: 8,
              width: "100%",
              fontWeight: 600,
            }}
          >
            + Tarif
          </Button>
        </div>
      </div>

      {!collapsed && module.services?.length > 0 && (
        <div
          style={{
            marginTop: 16,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            borderTop: "1px solid var(--border)",
            paddingTop: 16,
          }}
        >
          {module.services.map((service) => (
            <div
              key={service.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 12,
                borderRadius: 10,
                background: "var(--surface-bg)",
                border: "1px solid var(--border)",
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontWeight: 600,
                    color: "var(--card-text)",
                    fontSize: 15,
                    marginBottom: 8,
                  }}
                >
                  {service.name}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <div
                    style={{
                      flex: 1,
                      background: "rgba(0,0,0,0.03)",
                      padding: "8px 10px",
                      borderRadius: 8,
                    }}
                  >
                    <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 2 }}>
                      Aylıq
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>
                      {(
                        Number(service.price) *
                        Number(service.quantity || 1) *
                        30
                      ).toFixed(2)}{" "}
                      AZN
                    </div>
                  </div>
                  <div
                    style={{
                      flex: 1,
                      background: "rgba(124, 58, 237, 0.05)",
                      padding: "8px 10px",
                      borderRadius: 8,
                      border: "1px solid rgba(124, 58, 237, 0.1)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--tab-active-bg)",
                        marginBottom: 2,
                      }}
                    >
                      Günlük
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "var(--tab-active-bg)",
                      }}
                    >
                      {(
                        Number(service.price) * Number(service.quantity || 1)
                      ).toFixed(2)}{" "}
                      AZN
                    </div>
                  </div>
                </div>
              </div>
              <PermissionGuard id="remove-module" >
              <Button
                size="mini"
                style={{
                  background: "#fee2e2",
                  color: "#b91c1c",
                  border: "none",
                  borderRadius: 6,
                  fontWeight: 600,
                  marginLeft: 12,
                }}
                onClick={() => onRemove(module.id, service.id)}
              >
                Sil
              </Button>
              </PermissionGuard>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

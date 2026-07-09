import React, { useState, useEffect } from "react";
import { Button, Input, Toast } from "antd-mobile";

export default function TariffAddModal({
  open,
  title,
  services = [],
  onClose,
  onConfirm,
}) {
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("1");

  useEffect(() => {
    if (open) {
      setSelectedServiceId("");
      setPrice("");
      setQuantity("1");
    }
  }, [open]);

  const getServiceKey = (s) => s.id || s._id || s.name || s.catalogKey || "";

  const handleServiceSelect = (serviceId) => {
    setSelectedServiceId(serviceId);
    const service = services.find((s) => getServiceKey(s) === serviceId);
    if (service) {
      const rawPrice = String(service.price || "0").replace(/[^0-9.]/g, "");
      setPrice(rawPrice);
    }
  };

  const handleConfirm = () => {
    const service = services.find((s) => getServiceKey(s) === selectedServiceId);
    if (!service) {
      Toast.show({ content: "Zəhmət olmasa xidmət seçin" });
      return;
    }
    if (!price || isNaN(Number(price))) {
      Toast.show({ content: "Zəhmət olmasa düzgün qiymət daxil edin" });
      return;
    }
    if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) {
      Toast.show({ content: "Zəhmət olmasa düzgün say daxil edin" });
      return;
    }

    onConfirm({
      ...service,
      price: price,
      quantity: Number(quantity),
    });
  };

  if (!open) return null;

  const selectedServiceObj = services.find(
    (s) => getServiceKey(s) === selectedServiceId
  );

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 110,
      }}
    >
      <div
        style={{
          padding: 20,
          borderRadius: 16,
          background: "var(--card-bg)",
          border: "1px solid var(--border)",
          width: "100%",
          maxWidth: 480,
          maxHeight: "80vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <h4 style={{ margin: 0, color: "var(--card-text)", fontSize: 16, fontWeight: 600 }}>
          {title}
        </h4>

        {services.length === 0 ? (
          <div style={{ padding: "16px 0", color: "var(--muted-text)", textAlign: "center", fontSize: 14 }}>
            Əlavə ediləcək xidmət tapılmadı.
          </div>
        ) : (
          <>
            {/* Input 1: Select Service */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, color: "var(--muted-text)", fontWeight: 500 }}>
                Xidmət seçin
              </label>
              <select
                value={selectedServiceId}
                onChange={(e) => handleServiceSelect(e.target.value)}
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "var(--input-bg)",
                  color: selectedServiceId ? "var(--card-text)" : "var(--muted-text)",
                  fontSize: 14,
                  outline: "none",
                  WebkitAppearance: "none",
                  appearance: "none",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239CA3AF' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 12px center",
                  paddingRight: 32,
                }}
              >
                <option value="" disabled>
                  Seçmək üçün klikləyin
                </option>
                {services.map((s) => (
                  <option key={getServiceKey(s)} value={getServiceKey(s)}>
                    {s.name || s.service || "Naməlum xidmət"}
                  </option>
                ))}
              </select>
            </div>

            {/* Input 2: Price */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, color: "var(--muted-text)", fontWeight: 500 }}>
                Qiymət (AZN)
              </label>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "var(--input-bg)",
                  padding: "4px 12px",
                }}
              >
                <Input
                  type="number"
                  placeholder="Qiymət daxil edin"
                  value={price}
                  onChange={setPrice}
                  style={{
                    "--color": "var(--card-text)",
                    "--placeholder-color": "var(--muted-text)",
                    fontSize: 14,
                  }}
                />
                <span style={{ fontSize: 13, color: "var(--muted-text)", fontWeight: 600, marginLeft: 8 }}>
                  AZN
                </span>
              </div>
            </div>

            {/* Input 3: Quantity */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, color: "var(--muted-text)", fontWeight: 500 }}>
                Say (Ədəd)
              </label>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "var(--input-bg)",
                  padding: "4px 12px",
                }}
              >
                <Input
                  type="number"
                  placeholder="Say daxil edin"
                  value={quantity}
                  onChange={setQuantity}
                  style={{
                    "--color": "var(--card-text)",
                    "--placeholder-color": "var(--muted-text)",
                    fontSize: 14,
                  }}
                />
              </div>
            </div>
          </>
        )}

        {/* Buttons */}
        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <Button
            block
            onClick={onClose}
            style={{
              background: "transparent",
              color: "var(--muted-text)",
              border: "1px solid var(--border)",
              borderRadius: 8,
            }}
          >
            İmtina
          </Button>
          {services.length > 0 && (
            <Button
              block
              onClick={handleConfirm}
              disabled={!selectedServiceId}
              style={{
                background: !selectedServiceId ? "var(--border)" : "var(--tab-active-bg)",
                color: !selectedServiceId ? "var(--muted-text)" : "var(--tab-active-text)",
                border: "none",
                borderRadius: 8,
                fontWeight: 500,
              }}
            >
              Əlavə et
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

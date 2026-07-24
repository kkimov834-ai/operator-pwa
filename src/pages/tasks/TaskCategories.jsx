import { AiOutlinePlus } from "react-icons/ai";

export default function TaskCategories({
  setIsAddModalVisible,
  displayCategories,
  getTaskCount,
  setSearchParams
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      {/* Add Task Card */}
      <div
        onClick={() => setIsAddModalVisible(true)}
        style={{
          background: "var(--surface-bg)",
          border: "1px dashed var(--tab-active-bg)",
          borderRadius: "12px",
          padding: "16px 12px",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "95px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
        }}
      >
        <div
          style={{
            background: "var(--tab-active-bg)",
            color: "#fff",
            borderRadius: "50%",
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 8,
          }}
        >
          <AiOutlinePlus size={20} />
        </div>
        <span
          style={{
            fontWeight: 600,
            color: "var(--tab-active-bg)",
            fontSize: "14px",
          }}
        >
          Tapşırıq Əlavə Et
        </span>
      </div>

      {displayCategories.map((cat) => {
        const count = getTaskCount(cat.key);
        if (count === 0) return null;
        return (
          <div
            key={cat.key}
            onClick={() => setSearchParams({ cat: cat.key })}
            style={{
              background: "var(--card-bg)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              padding: "16px 12px",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: "95px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {cat.icon}
              <span
                style={{
                  fontWeight: 600,
                  color: "var(--card-text)",
                  fontSize: "14px",
                }}
              >
                {cat.title}
              </span>
            </div>
            <div
              style={{
                fontSize: "20px",
                fontWeight: "700",
                color: count > 0 ? "var(--tab-active-bg)" : "var(--muted-text)",
                marginTop: 8,
              }}
            >
              {count}
            </div>
          </div>
        );
      })}
    </div>
  );
}

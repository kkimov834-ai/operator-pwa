import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, DotLoading } from "antd-mobile";
import { useNavBarContext } from "../../components/NavBarContext";
import { taskList } from "../../services/taskList.service";

const pick = (task, keys) => {
  for (const key of keys) {
    if (task?.[key] !== undefined && task?.[key] !== null && task?.[key] !== "")
      return task[key];
  }
  return "-";
};

const getPriority = (task) =>
  pick(task, ["priority", "priority_level", "priorityLevel", "prio", "priority_value"]);

export default function TaskDetail() {
  const { taskId } = useParams();
  const { setTitle, setShowBack, setShowSearch } = useNavBarContext();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTitle("Task Detal");
    setShowBack(true);
    setShowSearch(false);
    return () => setTitle("");
  }, [setShowBack, setShowSearch, setTitle]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await taskList();
        const items = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
            ? res.data
            : [];
        const found = items.find((item) =>
          [
            item?.id,
            item?._id,
            item?.linear_id,
            item?.linearId,
            item?.task_id,
            item?.taskId,
            item?.account_task_id,
            item?.accountTaskId,
          ]
            .filter(Boolean)
            .map(String)
            .includes(String(taskId)),
        );
        setTask(found || null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [taskId]);

  const fields = useMemo(() => {
    if (!task) return [];
    return Object.entries(task).filter(
      ([key, value]) =>
        value !== undefined && value !== null && value !== "" && key !== "__v",
    );
  }, [task]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "40px 0",
          color: "var(--muted-text)",
        }}
      >
        <DotLoading color="primary" />
        <span style={{ marginLeft: 8, fontSize: 14 }}>Yüklənir...</span>
      </div>
    );
  }

  if (!task) {
    return (
      <div style={{ padding: 12, color: "var(--muted-text)" }}>
        Tapşırıq tapılmadı. <Link to="/tasks">Geri dön</Link>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 12,
        paddingBottom: 84,
        minHeight: "100vh",
        background: "var(--app-bg)",
        color: "var(--app-text)",
      }}
    >
      <Card
        style={{
          background: "var(--card-bg)",
          border: "1px solid var(--border)",
          borderRadius: 8,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: 20, fontWeight: 700 }}>
              {pick(task, ["title", "name"])}
            </div>
            <div
              style={{
                padding: "4px 8px",
                borderRadius: 999,
                background: "var(--surface-bg)",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {pick(task, ["status", "stage", "state"])}
            </div>
            <div
              style={{
                padding: "4px 8px",
                borderRadius: 999,
                background: "var(--surface-bg)",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              ID:{" "}
              {pick(task, [
                "linear_id",
                "linearId",
                "task_id",
                "taskId",
                "account_task_id",
                "accountTaskId",
                "id",
                "_id",
              ])}
            </div>
            <div
              style={{
                padding: "4px 8px",
                borderRadius: 999,
                background: "rgba(14,165,233,0.12)",
                color: "#0EA5E9",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              Priority: {getPriority(task)}
            </div>
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {fields.map(([key, value]) => (
              <div
                key={key}
                style={{
                  padding: 10,
                  borderRadius: 8,
                  background: "var(--surface-bg)",
                  border: "1px solid var(--border)",
                }}
              >
                <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>
                  {key}
                </div>
                <div style={{ fontSize: 14, wordBreak: "break-word" }}>
                  {typeof value === "object"
                    ? JSON.stringify(value, null, 2)
                    : String(value)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

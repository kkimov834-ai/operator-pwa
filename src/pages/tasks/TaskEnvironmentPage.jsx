import React, { useEffect, useState } from "react";
import { Card, DotLoading } from "antd-mobile";
import { useNavBarContext } from "../../components/NavBarContext";
import { taskList } from "../../services/taskList.service";

const TaskEnvironmentPage = () => {
  const { query, setQuery, setTitle, setShowBack, setShowSearch, themeStyles } =
    useNavBarContext();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const environmentKeys = ["DEPLOY", "DEV", "BETA", "ONLINE"];
  const envColors = {
    DEPLOY: "#5B21B6", // dark purple
    DEV: "#1E3A8A", // dark blue
    BETA: "#C2410C", // dark orange
    ONLINE: "#166534", // dark green
  };
  const [expandedEnvs, setExpandedEnvs] = useState(() =>
    environmentKeys.reduce((acc, env) => ({ ...acc, [env]: true }), {}),
  );
  const toggleEnv = (env) =>
    setExpandedEnvs((prev) => ({ ...prev, [env]: !prev[env] }));

  useEffect(() => {
    setTitle("Tapşırıq Mühitləri");
    setShowBack(true);
    setShowSearch(true);
    setQuery("");
    return () => {
      setTitle("");
      setShowSearch(false);
      setQuery("");
    };
  }, [setTitle, setShowBack, setShowSearch, setQuery]);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const res = await taskList();
        const allTasks = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res?.data?.data)
              ? res.data.data
              : [];

        const doneTasks = allTasks.filter((task) => {
          const status =
            task.status?.toLowerCase() ||
            task.stage?.toLowerCase() ||
            task.state?.toLowerCase() ||
            "";
          const environment = (task.environment || task.env)?.toString().trim();

          return status === "done" && environment && environment.length > 0;
        });

        setTasks(doneTasks);
      } catch (error) {
        console.error("Tapşırıqlar yüklənərkən xəta:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const getTaskName = (task) => task.title || task.name || "N/A";
  const getTaskDescription = (task) => task.description || "Açıqlama yoxdur";
  const getTaskCreatedAt = (task) => {
    const value = task.createdAt || task.created_at;
    return value ? new Date(value).toLocaleString() : "N/A";
  };
  const getTaskUpdatedAt = (task) => {
    const value = task.updatedAt || task.updated_at;
    return value ? new Date(value).toLocaleString() : "N/A";
  };
  const getTaskEnvironment = (task) =>
    (task.environment || task.env)?.toString().toUpperCase() || "OTHER";
  const getTaskLinearId = (task) => task.linear_id || task.linearId || "-";

  const normalizedQuery = (query || "").trim().toLowerCase();

  const visibleTasks = tasks.filter((task) => {
    if (!normalizedQuery) return true;

    const searchableText = [
      task.title,
      task.name,
      task.description,
      getTaskLinearId(task),
      task.environment,
      task.env,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableText.includes(normalizedQuery);
  });

  const renderTaskCard = (task) => (
    <Card
      key={task.id || task._id || getTaskLinearId(task)}
      style={{
        marginBottom: 12,
        background: themeStyles?.cardBg,
        border: `1px solid ${themeStyles?.border}`,
      }}
      title={
        <div style={{ fontWeight: "bold", color: themeStyles?.cardText }}>
          {getTaskName(task)}
        </div>
      }
    >
      <div
        style={{
          color: themeStyles?.cardTextSecondary,
          fontSize: 13,
          marginBottom: 8,
        }}
      >
        {getTaskDescription(task)}
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          marginTop: 10,
        }}
      >
        {[
          `ID: ${getTaskLinearId(task)}`,
          `Yaradılma: ${getTaskCreatedAt(task)}`,
          `Yenilənmə: ${getTaskUpdatedAt(task)}`,
        ].map((label) => (
          <span
            key={label}
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "6px 10px",
              borderRadius: 999,
              background:
                envColors[getTaskEnvironment(task)] || themeStyles?.surfaceBg,
              color: "#ffffff",
              fontSize: 12,
              border: `1px solid ${envColors[getTaskEnvironment(task)] || themeStyles?.border}`,
              wordBreak: "break-word",
            }}
          >
            {label}
          </span>
        ))}
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "40px 0",
          color: themeStyles?.mutedText,
        }}
      >
        <DotLoading color="primary" />
        <span style={{ marginLeft: 8, fontSize: 14 }}>Yüklənir...</span>
      </div>
    );
  }

  const tasksByEnvironment = environmentKeys.reduce((acc, env) => {
    acc[env] = visibleTasks.filter((task) => getTaskEnvironment(task) === env);
    return acc;
  }, {});

  const visibleEnvironments = environmentKeys.filter(
    (env) => tasksByEnvironment[env]?.length > 0,
  );

  return (
    <div
      style={{
        padding: 12,
        paddingBottom: 110,
        minHeight: "100vh",
        background: themeStyles?.pageBg,
        color: themeStyles?.text,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 12,
        }}
      >
        {visibleEnvironments.length === 0 ? (
          <div
            style={{
              color: themeStyles?.mutedText,
              textAlign: "center",
              fontSize: 14,
              padding: "24px 0",
            }}
          >
            Heç bir done tapşırıq tapılmadı.
          </div>
        ) : (
          visibleEnvironments.map((env) => (
            <div
              key={env}
              style={{
                background: themeStyles?.surfaceBg || "rgba(255,255,255,0.04)",
                border: `1px solid ${themeStyles?.border}`,
                borderLeft: `6px solid ${envColors[env]}`,
                borderRadius: 16,
                padding: 12,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <button
                type="button"
                onClick={() => toggleEnv(env)}
                style={{
                  all: "unset",
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                  padding: "6px 0",
                  borderBottom: `1px solid ${themeStyles?.border}`,
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 15,
                    color: themeStyles?.text,
                  }}
                >
                  {env}
                </div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 12,
                    color: themeStyles?.mutedText,
                  }}
                >
                  <span
                    style={{
                      background: envColors[env],
                      color: "#ffffff",
                      padding: "4px 10px",
                      borderRadius: 999,
                      fontWeight: 700,
                      border: `1px solid ${envColors[env]}`,
                    }}
                  >
                    {tasksByEnvironment[env].length} Tapşırıq
                  </span>
                  <span>{expandedEnvs[env] ? "▾" : "▸"}</span>
                </div>
              </button>

              {expandedEnvs[env] ? (
                tasksByEnvironment[env].length === 0 ? (
                  <div
                    style={{
                      color: themeStyles?.mutedText,
                      textAlign: "center",
                      fontSize: 12,
                      padding: "16px 0",
                    }}
                  >
                    Tapşırıq yoxdur.
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    {tasksByEnvironment[env].map(renderTaskCard)}
                  </div>
                )
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskEnvironmentPage;

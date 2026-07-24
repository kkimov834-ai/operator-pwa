import React, { useEffect, useState } from "react";
import { Card, DotLoading, Toast, Button, ActionSheet } from "antd-mobile";
import { useSearchParams } from "react-router-dom";
import { useNavBarContext } from "../../components/NavBarContext";
import { taskList } from "../../services/taskList.service";
import { updateTaskStatus } from "../../services/taskList.service";
import { RejectModal } from "../../components/RejectModal";
import { AiOutlineCheck, AiOutlineClose } from "react-icons/ai";
import { TaskCard } from "./TaskComponents.jsx";

const TaskEnvironmentPage = () => {
  const { query, setQuery, setTitle, setShowBack, setShowSearch, themeStyles } =
    useNavBarContext();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTaskId, setRejectTaskId] = useState(null);
  
  const [actionSheetTaskId, setActionSheetTaskId] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const selectedEnvKey = searchParams.get("env")?.toUpperCase();

  const environmentKeys = ["DEPLOY", "DEV", "BETA", "ONLINE"];
  const envColors = {
    DEPLOY: "#5B21B6", // dark purple
    DEV: "#1E3A8A", // dark blue
    BETA: "#C2410C", // dark orange
    ONLINE: "#166534", // dark green
  };

  useEffect(() => {
    if (selectedEnvKey && environmentKeys.includes(selectedEnvKey)) {
      setTitle(`${selectedEnvKey} Tapşırıqları`);
    } else {
      setTitle("Tapşırıq Mühitləri");
    }
    setShowBack(true);
    setShowSearch(true);
    setQuery("");
    return () => {
      setTitle("");
      setShowSearch(false);
      setQuery("");
    };
  }, [selectedEnvKey, setTitle, setShowBack, setShowSearch, setQuery]);

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

  const refreshTasks = async () => {
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
        const status = (task.status || task.stage || task.state || "").toLowerCase();
        const environment = (task.environment || task.env)?.toString().trim();
        return status === "done" && environment && environment.length > 0;
      });
      setTasks(doneTasks);
    } catch (error) {
      console.error(error);
    }
  };

  const handleStatusChange = async (linearId, newStatus) => {
    if (!linearId) {
      Toast.show({ content: "Linear ID tapılmadı" });
      return;
    }
    if (newStatus === "reject") {
      setRejectTaskId(linearId);
      setRejectModalOpen(true);
      return;
    }

    try {
      await updateTaskStatus({
        linear_id: linearId,
        status: newStatus,
      });
      Toast.show({ content: "Status yeniləndi", icon: "success" });
      refreshTasks();
    } catch (err) {
      console.error(err);
      Toast.show({ content: err.response?.data?.message || "Xəta baş verdi", icon: "fail" });
    }
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

  const renderTaskCard = (task) => {
    const extraAction = getTaskEnvironment(task) === "DEV" ? (
      <div
        onClick={(e) => { e.stopPropagation(); setActionSheetTaskId(getTaskLinearId(task)); }}
        style={{
          padding: "6px 16px", 
          borderRadius: 16, 
          border: `1px solid ${themeStyles?.border || "var(--border)"}`,
          background: themeStyles?.surfaceBg || "var(--surface-bg)",
          color: themeStyles?.cardText || "var(--card-text)", 
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
        }}
      >
        Status ▾
      </div>
    ) : null;

    return (
      <div key={task.id || task._id || getTaskLinearId(task)} style={{ marginBottom: 12 }}>
        <TaskCard
          task={task}
          onTaskClick={() => {}} 
          onTaskUpdate={refreshTasks}
          extraContent={extraAction}
        />
      </div>
    );
  };

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
        background: themeStyles?.pageBg || "var(--app-bg)",
        color: themeStyles?.text || "var(--app-text)",
      }}
    >
      {!selectedEnvKey ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          {visibleEnvironments.length === 0 ? (
            <div
              style={{
                color: themeStyles?.mutedText || "var(--muted-text)",
                textAlign: "center",
                fontSize: 14,
                padding: "24px 0",
                gridColumn: "1 / -1",
              }}
            >
              Heç bir done tapşırıq tapılmadı.
            </div>
          ) : (
            visibleEnvironments.map((env) => {
              const count = tasksByEnvironment[env].length;
              return (
                <div
                  key={env}
                  onClick={() => setSearchParams({ env: env.toLowerCase() })}
                  style={{
                    background: themeStyles?.surfaceBg || "var(--card-bg)",
                    border: `1px solid ${themeStyles?.border || "var(--border)"}`,
                    borderLeft: `4px solid ${envColors[env]}`,
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
                    <span
                      style={{
                        fontWeight: 600,
                        color: themeStyles?.cardText || "var(--card-text)",
                        fontSize: "14px",
                      }}
                    >
                      {env}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: "20px",
                      fontWeight: "700",
                      color: count > 0 ? envColors[env] : (themeStyles?.mutedText || "var(--muted-text)"),
                      marginTop: 8,
                    }}
                  >
                    {count}
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {tasksByEnvironment[selectedEnvKey]?.length === 0 || !tasksByEnvironment[selectedEnvKey] ? (
            <div
              style={{
                padding: "40px 12px",
                color: themeStyles?.mutedText || "var(--muted-text)",
                textAlign: "center",
                fontSize: "14px",
                background: themeStyles?.surfaceBg || "var(--surface-bg)",
                borderRadius: "8px",
              }}
            >
              Bu bölmədə tapşırıq tapılmadı.
            </div>
          ) : (
            tasksByEnvironment[selectedEnvKey].map(renderTaskCard)
          )}
        </div>
      )}

      <RejectModal
        isOpen={rejectModalOpen}
        onClose={() => {
          setRejectModalOpen(false);
          setRejectTaskId(null);
        }}
        linearId={rejectTaskId}
        onRefresh={refreshTasks}
      />

      <ActionSheet
        visible={!!actionSheetTaskId}
        actions={[
          { text: '✅ Təsdiqlə', key: 'accept' },
          { text: '❌ İmtina et', key: 'reject', danger: true },
        ]}
        onClose={() => setActionSheetTaskId(null)}
        onAction={(action) => {
          handleStatusChange(actionSheetTaskId, action.key);
          setActionSheetTaskId(null);
        }}
        cancelText="Ləğv et"
      />
    </div>
  );
};

export default TaskEnvironmentPage;

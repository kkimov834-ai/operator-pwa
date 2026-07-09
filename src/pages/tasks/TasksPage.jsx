import { Button, Card, DotLoading, Toast, Modal } from "antd-mobile";
import { useSearchParams } from "react-router-dom";
import { useNavBarContext } from "../../components/NavBarContext";
import { taskList } from "../../services/taskList.service";
import { AiFillCloseCircle, AiOutlineCopy } from "react-icons/ai";
import { BASE_CATEGORIES } from "../../constants/TaskCategories.jsx";
import { PRIORITY_ICONS, TaskPriority } from "../../constants/TaskPriority.jsx";
import { useState, useEffect } from "react";

const TasksPage = () => {
  const { query, setQuery, setTitle, setShowBack, setShowSearch } =
    useNavBarContext();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // URL parametrlərini idarə edirik (məs: /tasks?cat=UNSTARTED)
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get("cat");
  const selectedCategoryKey = selectedCategory?.toLowerCase();

  // Status təmizləmə funksiyası (Xətaların qarşısını almaq üçün)
  const normalizeStatus = (statusStr) => {
    const cleaned = statusStr.toString().toUpperCase().trim();
    if (cleaned === "TRIAGE") return "triage";
    if (cleaned === "BACKLOG") return "backlog";
    if (cleaned === "DISCUSSION") return "discussion";
    if (cleaned === "REJECT") return "reject";
    if (cleaned === "TODO") return "todo";
    if (cleaned === "IN_PROGRESS") return "in_progress";
    if (cleaned === "IN_REVIEW") return "in_review";
    if (cleaned === "DONE") return "done";
    if (cleaned === "ACCEPT") return "accept";
    if (cleaned === "CANCELLED") return "cancelled";
    if (cleaned === "DUPLICATE") return "duplicate";

    return BASE_CATEGORIES.some((c) => c.key === cleaned) ? cleaned : "OTHER";
  };

  const getTaskOperatorName = (task) => task.operator || "-";

  const getTaskAccount = (task) => task.account || "-";

  const getTaskLinearId = (task) => task.linear_id;

  const getTaskUrl = (task) =>
    `${window.location.origin}/tasks/${getTaskLinearId(task)}`;

  const copyTaskLink = async (task) => {
    try {
      await navigator.clipboard.writeText(getTaskUrl(task));
      Toast.show({ content: "Link kopyalandı" });
    } catch {
      Toast.show({ content: "Link kopyalanmadı" });
    }
  };

  const [editingPriorityTaskId, setEditingPriorityTaskId] = useState(null);

  const getTaskDescription = (task) => task.description;

  const getTaskId = (task) => task.id || task.task_id || task.linear_id || null;

  const getTaskPriority = (task) =>
    task.priority != null ? task.priority.toString() : "0";

  const getTaskAccountId = (task) => task.account_id || "-";

  const toggleTaskPriorityEditor = (task) => {
    const id = getTaskId(task);
    if (!id) return;
    setEditingPriorityTaskId((current) => (current === id ? null : id));
  };

  const changeTaskPriority = (task, priority) => {
    const id = getTaskId(task);
    if (!id) return;
    setTasks((prev) =>
      prev.map((item) =>
        getTaskId(item) === id ? { ...item, priority } : item,
      ),
    );
    setEditingPriorityTaskId(null);
    Toast.show({ content: "Prioritet dəyişdirildi" });
  };

  const isEditingPriority = (task) => getTaskId(task) === editingPriorityTaskId;

  useEffect(() => {
    if (selectedCategoryKey) {
      const allCats = [...BASE_CATEGORIES, { key: "OTHER", title: "Digər" }];
      const catObj = allCats.find((c) => c.key === selectedCategoryKey);
      setTitle(catObj ? catObj.title : "Tapşırıqlar");
      setShowBack(true);
      setShowSearch(true);
      setQuery("");
    } else {
      setTitle("Tapşırıqlar");
      setShowBack(false);
      setShowSearch(false);
    }
    return () => setTitle("");
  }, [selectedCategoryKey, setQuery, setTitle, setShowBack, setShowSearch]);

  useEffect(() => {
    return () => {
      setShowSearch(false);
      setQuery("");
    };
  }, [setQuery, setShowSearch]);

  // Real API-dan datanı çəkirik
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const res = await taskList();
        if (res && res.status === "success") {
          setTasks(res.data || []);
        } else if (Array.isArray(res)) {
          setTasks(res);
        } else if (res?.data) {
          setTasks(res.data);
        }
      } catch (error) {
        console.error("Tapşırıqlar yüklənərkən xəta:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  // Hər kateqoriyanın sayını hesablamaq
  const getTaskCount = (statusKey) => {
    return tasks.filter(
      (task) =>
        normalizeStatus(task.status || task.stage || task.state) === statusKey,
    ).length;
  };

  // Naməlum statuslar üçün digər bölməsinin yoxlanması
  const otherCount = getTaskCount("OTHER");
  const displayCategories = [...BASE_CATEGORIES];
  if (otherCount > 0) {
    displayCategories.push({
      key: "OTHER",
      title: "Digər",
      icon: (
        <AiFillCloseCircle
          style={{
            background: "#6B7280",
            color: "#FFFFFF",
            borderRadius: "50%",
            padding: "4px",
            fontSize: "24px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "32px",
            height: "32px",
          }}
        />
      ),
    });
  }

  // Seçilmiş kateqoriyaya aid taskları filtrləyirik
  const filteredTasks = tasks.filter(
    (task) =>
      normalizeStatus(task.status || task.stage || task.state) ===
      selectedCategoryKey,
  );

  const normalizedQuery = (query || "").trim().toLowerCase();
  const visibleTasks = filteredTasks.filter((task) => {
    if (!normalizedQuery) return true;

    const searchableText = [
      task.title,
      task.name,
      task.description,
      task.linear_id,
      task.account,
      getTaskOperatorName(task),
      task.status,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableText.includes(normalizedQuery);
  });

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

  return (
    <>
      <div
        style={{
          padding: 12,
          paddingBottom: "calc(84px + env(safe-area-inset-bottom))",
          minHeight: "100vh",
          background: "var(--app-bg)",
          color: "var(--app-text)",
        }}
      >
        {/* VARYANT 1: Heç bir kateqoriya seçilməyibsə Grid şəklində Balaca Cardlar */}
        {!selectedCategoryKey ? (
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            {displayCategories.map((cat) => {
              const count = getTaskCount(cat.key);
              return (
                <div
                  key={cat.key}
                  onClick={() => setSearchParams({ cat: cat.key })} // URL-ə yazır və səhifəni dəyişir
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
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
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
                      color:
                        count > 0
                          ? "var(--tab-active-bg)"
                          : "var(--muted-text)",
                      marginTop: 8,
                    }}
                  >
                    {count}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* VARYANT 2: Kateqoriya daxilindəki Tapşırıqların Siyahısı */
          <div>
            {visibleTasks.length === 0 ? (
              <div
                style={{
                  padding: "40px 12px",
                  color: "var(--muted-text)",
                  textAlign: "center",
                  fontSize: "14px",
                  background: "var(--surface-bg)",
                  borderRadius: "8px",
                }}
              >
                Bu bölmədə tapşırıq tapılmadı.
              </div>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {visibleTasks.map((task) => (
                  <Card
                    key={task.id || task._id}
                    onClick={() => setSelectedTask(task)}
                    title={
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            alignItems: "center",
                            gap: 8,
                            color: "var(--card-text)",
                            fontWeight: 700,
                            fontSize: 15,
                            lineHeight: 1.35,
                            wordBreak: "break-word",
                          }}
                        >
                          {task.title}
                          {selectedCategoryKey === "done" && (
                            <Button
                              size="mini"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyTaskLink(task);
                              }}
                              aria-label="Linki kopyala"
                              style={{
                                borderRadius: 999,
                                border: "1px solid var(--border)",
                                background: "var(--surface-bg)",
                                color: "var(--card-text)",
                                width: 32,
                                height: 32,
                                padding: 0,
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <AiOutlineCopy />
                            </Button>
                          )}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 8,
                          }}
                        >
                          <span
                            style={{
                              padding: "4px 8px",
                              borderRadius: 999,
                              background: "var(--surface-bg)",
                              color: "var(--card-text-secondary)",
                              fontSize: 12,
                              fontWeight: 600,
                              wordBreak: "break-word",
                            }}
                          >
                            Operator: {getTaskOperatorName(task)}
                          </span>
                          <span
                            style={{
                              padding: "4px 8px",
                              borderRadius: 999,
                              background: "var(--surface-bg)",
                              color: "var(--card-text-secondary)",
                              fontSize: 12,
                              fontWeight: 600,
                              wordBreak: "break-word",
                            }}
                          >
                            Account: {getTaskAccount(task)}
                          </span>
                          <span
                            style={{
                              padding: "4px 8px",
                              borderRadius: 999,
                              background: "var(--surface-bg)",
                              color: "var(--card-text-secondary)",
                              fontSize: 12,
                              fontWeight: 600,
                              wordBreak: "break-word",
                            }}
                          >
                            Linear ID: {getTaskLinearId(task)}
                          </span>
                          <div
                            style={{
                              position: "relative",
                              padding: "4px 8px",
                              borderRadius: 999,
                              background: "var(--surface-bg)",
                              color: "var(--card-text-secondary)",
                              fontSize: 12,
                              fontWeight: 600,
                              wordBreak: "break-word",
                              display: "flex",
                              flexDirection: "column",
                              gap: 4,
                            }}
                          >
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleTaskPriorityEditor(task);
                              }}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                cursor: "pointer",
                              }}
                            >
                              <TaskPriority value={getTaskPriority(task)} />
                            </span>
                            {isEditingPriority(task) && (
                              <div
                                style={{
                                  position: "absolute",
                                  top: "100%",
                                  left: 0,
                                  zIndex: 10,
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: 6,
                                  marginTop: 4,
                                  padding: "8px",
                                  background: "var(--surface-bg)",
                                  border: "1px solid var(--border)",
                                  borderRadius: 12,
                                  boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                                }}
                              >
                                {PRIORITY_ICONS.map((priority) => (
                                  <button
                                    key={priority.value}
                                    onClick={() =>
                                      changeTaskPriority(task, priority.value)
                                    }
                                    title={priority.label}
                                    style={{
                                      border: "1px solid var(--border)",
                                      borderRadius: 999,
                                      padding: "8px",
                                      background: "var(--app-bg)",
                                      color: "var(--app-text)",
                                      fontSize: 12,
                                      cursor: "pointer",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      width: 36,
                                      height: 36,
                                    }}
                                  >
                                    {priority.icon}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    }
                    style={{
                      background: "var(--card-bg)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                    }}
                  >
                    <div
                      style={{
                        marginTop: 8,
                        color: "var(--card-text-secondary)",
                        fontSize: "14px",
                        lineHeight: "1.6",
                        wordBreak: "break-word",
                      }}
                    >
                      {getTaskDescription(task)}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      {/* Edit Modal */}
      <Modal
        visible={!!selectedTask}
        title="Tapşırığı redaktə et"
        content={
          selectedTask && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <div style={{ marginBottom: 4, fontSize: 13, fontWeight: 600 }}>
                  Başlıq
                </div>
                <input
                  value={selectedTask.title || ""}
                  onChange={(e) =>
                    setSelectedTask({ ...selectedTask, title: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: 8,
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    boxSizing: "border-box",
                    background: "var(--input-bg)",
                    color: "var(--input-text)",
                  }}
                />
              </div>
              <div>
                <div style={{ marginBottom: 4, fontSize: 13, fontWeight: 600 }}>
                  Təsvir
                </div>
                <textarea
                  value={selectedTask.description || ""}
                  onChange={(e) =>
                    setSelectedTask({
                      ...selectedTask,
                      description: e.target.value,
                    })
                  }
                  rows={4}
                  style={{
                    width: "100%",
                    padding: 8,
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    boxSizing: "border-box",
                    background: "var(--input-bg)",
                    color: "var(--input-text)",
                  }}
                />
              </div>
            </div>
          )
        }
        closeOnAction
        onClose={() => setSelectedTask(null)}
        actions={[
          {
            key: "cancel",
            text: "Ləğv et",
            onClick: () => setSelectedTask(null),
          },
          {
            key: "save",
            text: "Saxla",
            primary: true,
            onClick: () => {
              setTasks((prev) =>
                prev.map((t) =>
                  getTaskId(t) === getTaskId(selectedTask)
                    ? { ...t, ...selectedTask }
                    : t,
                ),
              );
              Toast.show({ content: "Yadda saxlandı" });
              setSelectedTask(null);
            },
          },
        ]}
      />
    </>
  );
};

export default TasksPage;

import { Button, Card, DotLoading, Toast, Modal } from "antd-mobile";
import { useSearchParams } from "react-router-dom";
import { useNavBarContext } from "../../components/NavBarContext";
import { taskList, createTask, updateTask, updateTaskPriority } from "../../services/taskList.service";
import { getUserAccounts } from "../../services/user.service";
import { AiFillCloseCircle, AiOutlineCopy, AiOutlinePlus } from "react-icons/ai";
import { BASE_CATEGORIES } from "../../constants/TaskCategories.jsx";
import { PRIORITY_ICONS, TaskPriority } from "../../constants/TaskPriority.jsx";
import { useState, useEffect } from "react";

const TasksPage = () => {
  const { query, setQuery, setTitle, setShowBack, setShowSearch } =
    useNavBarContext();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newTaskForm, setNewTaskForm] = useState({
    title: "",
    account: "",
    priority: "normal",
    project: "",
    description: "",
  });
  const [accountSearchQuery, setAccountSearchQuery] = useState("");
  const [accountResults, setAccountResults] = useState([]);
  const [isSearchingAccount, setIsSearchingAccount] = useState(false);
  const [showAccountList, setShowAccountList] = useState(false);

  const projects = [
    "Akul Admin", "Akul Pos", "Akul Pwa", "Akul Mobile", 
    "Akul Counting", "Dine Admin", "Dine Pos", "Dine Pwa", 
    "Dine Qr", "Umumi"
  ];

  useEffect(() => {
    if (accountSearchQuery.length >= 4) {
      const searchAccounts = async () => {
        setIsSearchingAccount(true);
        try {
          const res = await getUserAccounts(accountSearchQuery);
          if (res && Array.isArray(res)) {
             setAccountResults(res);
          } else if (res && Array.isArray(res.data)) {
             setAccountResults(res.data);
          } else if (res && Array.isArray(res.accounts)) {
             setAccountResults(res.accounts);
          } else {
             setAccountResults([]);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setIsSearchingAccount(false);
        }
      };
      
      const timeoutId = setTimeout(searchAccounts, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setAccountResults([]);
    }
  }, [accountSearchQuery]);


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

  const changeTaskPriority = async (task, priority) => {
    const id = getTaskId(task);
    const linearId = task.linear_id;
    if (!id || !linearId) {
      Toast.show({ content: "Tapşırıq ID-si (Linear ID) tapılmadı" });
      return;
    }

    Toast.show({ icon: 'loading', content: 'Yenilənir...', duration: 0 });
    try {
      await updateTaskPriority({ linear_id: linearId, priority: Number(priority) });
      setTasks((prev) =>
        prev.map((item) =>
          getTaskId(item) === id ? { ...item, priority } : item,
        ),
      );
      setEditingPriorityTaskId(null);
      Toast.clear();
      Toast.show({ icon: 'success', content: "Prioritet dəyişdirildi" });
    } catch (error) {
      Toast.clear();
      Toast.show({ icon: 'fail', content: "Xəta baş verdi" });
    }
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
            onClick: async () => {
              const linearId = selectedTask?.linear_id;
              if (!linearId) {
                Toast.show({ content: "Linear ID tapılmadı, yeniləmək mümkün deyil." });
                return;
              }

              Toast.show({ icon: 'loading', content: 'Saxlanılır...', duration: 0 });
              try {
                await updateTask({
                  linear_id: linearId,
                  title: selectedTask.title,
                  description: selectedTask.description,
                });

                setTasks((prev) =>
                  prev.map((t) =>
                    getTaskId(t) === getTaskId(selectedTask)
                      ? { ...t, ...selectedTask }
                      : t,
                  ),
                );
                Toast.clear();
                Toast.show({ icon: 'success', content: "Yadda saxlandı" });
                setSelectedTask(null);
              } catch (error) {
                Toast.clear();
                Toast.show({ icon: 'fail', content: "Xəta baş verdi" });
              }
            },
          },
        ]}
      />

      {/* Create Task Modal */}
      <Modal
        visible={isAddModalVisible}
        title="Tapşırıq Əlavə Et"
        content={
          <div style={{ display: "flex", flexDirection: "column", gap: 12, textAlign: "left", maxHeight: "60vh", overflowY: "auto", padding: "4px" }}>
            {/* Project Select */}
            <div>
              <div style={{ marginBottom: 4, fontSize: 13, fontWeight: 600 }}>Layihə (Məcburidir)</div>
              <select
                value={newTaskForm.project}
                onChange={(e) => setNewTaskForm({ ...newTaskForm, project: e.target.value })}
                style={{
                  width: "100%", padding: 8, borderRadius: 8, border: "1px solid var(--border)",
                  background: "var(--input-bg)", color: "var(--input-text)"
                }}
              >
                <option value="">Layihə seçin...</option>
                {projects.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            {/* Title Input */}
            <div>
              <div style={{ marginBottom: 4, fontSize: 13, fontWeight: 600 }}>Başlıq (Məcburidir)</div>
              <input
                value={newTaskForm.title}
                onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
                placeholder="Tapşırığın başlığı"
                style={{
                  width: "100%", padding: 8, borderRadius: 8, border: "1px solid var(--border)",
                  boxSizing: "border-box", background: "var(--input-bg)", color: "var(--input-text)",
                }}
              />
            </div>

            {/* Account Search Input */}
            <div style={{ position: "relative" }}>
              <div style={{ marginBottom: 4, fontSize: 13, fontWeight: 600 }}>Hesab (İstəyə bağlı)</div>
              <input
                value={accountSearchQuery}
                onFocus={() => setShowAccountList(true)}
                onChange={(e) => {
                  setAccountSearchQuery(e.target.value);
                  setNewTaskForm({ ...newTaskForm, account: "" });
                  setShowAccountList(true);
                }}
                placeholder="Hesab axtar (min 4 hərf)..."
                style={{
                  width: "100%", padding: 8, borderRadius: 8, border: "1px solid var(--border)",
                  boxSizing: "border-box", background: "var(--input-bg)", color: "var(--input-text)",
                }}
              />
              {newTaskForm.account && (
                <div style={{ fontSize: 12, color: "var(--tab-active-bg)", marginTop: 4 }}>
                  Seçilmiş hesab: {newTaskForm.account}
                </div>
              )}
              {showAccountList && accountSearchQuery.length >= 4 && (
                <div style={{
                  position: "absolute", top: "100%", left: 0, right: 0, zIndex: 10,
                  background: "var(--surface-bg)", border: "1px solid var(--border)",
                  borderRadius: 8, maxHeight: 150, overflowY: "auto", boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  marginTop: 4
                }}>
                  {isSearchingAccount ? (
                    <div style={{ padding: 8, fontSize: 13, color: "var(--muted-text)", textAlign: "center" }}>Axtarılır...</div>
                  ) : accountResults.length > 0 ? (
                    accountResults.map((acc, i) => {
                      const accLabel = acc.account || acc.phone || acc.name || acc.toString();
                      return (
                        <div
                          key={i}
                          onClick={() => {
                            setNewTaskForm({ ...newTaskForm, account: accLabel });
                            setAccountSearchQuery(accLabel);
                            setShowAccountList(false);
                          }}
                          style={{ padding: "8px 12px", fontSize: 14, borderBottom: "1px solid var(--border)", cursor: "pointer", color: "var(--app-text)" }}
                        >
                          {accLabel}
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ padding: 8, fontSize: 13, color: "var(--muted-text)", textAlign: "center" }}>Nəticə tapılmadı</div>
                  )}
                </div>
              )}
            </div>

            {/* Priority Select */}
            <div>
              <div style={{ marginBottom: 4, fontSize: 13, fontWeight: 600 }}>Prioritet (İstəyə bağlı)</div>
              <select
                value={newTaskForm.priority}
                onChange={(e) => setNewTaskForm({ ...newTaskForm, priority: e.target.value })}
                style={{
                  width: "100%", padding: 8, borderRadius: 8, border: "1px solid var(--border)",
                  background: "var(--input-bg)", color: "var(--input-text)"
                }}
              >
                <option value="low">Aşağı</option>
                <option value="normal">Normal</option>
                <option value="high">Yüksək</option>
              </select>
            </div>

            {/* Description Textarea */}
            <div>
              <div style={{ marginBottom: 4, fontSize: 13, fontWeight: 600 }}>Açıqlama (İstəyə bağlı)</div>
              <textarea
                value={newTaskForm.description}
                onChange={(e) => setNewTaskForm({ ...newTaskForm, description: e.target.value })}
                rows={3}
                placeholder="Əlavə məlumat..."
                style={{
                  width: "100%", padding: 8, borderRadius: 8, border: "1px solid var(--border)",
                  boxSizing: "border-box", background: "var(--input-bg)", color: "var(--input-text)",
                }}
              />
            </div>
          </div>
        }
        closeOnAction
        onClose={() => setIsAddModalVisible(false)}
        actions={[
          {
            key: "cancel",
            text: "Ləğv et",
            onClick: () => setIsAddModalVisible(false),
          },
          {
            key: "save",
            text: "Əlavə Et",
            primary: true,
            onClick: async () => {
              if (!newTaskForm.title.trim()) {
                Toast.show({ content: "Başlıq daxil edilməlidir" });
                return;
              }
              if (!newTaskForm.project) {
                Toast.show({ content: "Layihə seçilməlidir" });
                return;
              }
              
              Toast.show({ icon: 'loading', content: 'Yaradılır...', duration: 0 });
              try {
                const payload = {
                  title: `[${newTaskForm.project}] ${newTaskForm.title.trim()}`,
                  description: newTaskForm.description,
                  priority: newTaskForm.priority
                };
                if (newTaskForm.account) {
                  payload.account = newTaskForm.account;
                }
                await createTask(payload);
                Toast.clear();
                Toast.show({ icon: 'success', content: "Tapşırıq yaradıldı" });
                setIsAddModalVisible(false);
                setNewTaskForm({ title: "", account: "", priority: "normal", project: "", description: "" });
                setAccountSearchQuery("");
                // Refetch tasks
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
              } catch (error) {
                Toast.clear();
                Toast.show({ icon: 'fail', content: "Xəta baş verdi" });
              }
            },
          },
        ]}
      />
    </>
  );
};

export default TasksPage;

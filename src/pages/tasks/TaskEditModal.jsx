import { Popup, Button, Toast } from "antd-mobile";
import { useState, useEffect } from "react";
import { updateTask } from "../../services/taskList.service";
import { getUserAccounts } from "../../services/user.service";
import { PRIORITY_ICONS } from "../../constants/TaskPriority";
import { useRole } from "../../hooks/useRole";

export default function TaskEditModal({
  selectedTask,
  setSelectedTask,
  setTasks,
  projects,
  uniqueOperators,
}) {
  const [editAccountSearchQuery, setEditAccountSearchQuery] = useState("");
  const [editAccountResults, setEditAccountResults] = useState([]);
  const [editIsSearchingAccount, setEditIsSearchingAccount] = useState(false);
  const [editShowAccountList, setEditShowAccountList] = useState(false);

  const [editOperatorSearchQuery, setEditOperatorSearchQuery] = useState("");
  const [editShowOperatorList, setEditShowOperatorList] = useState(false);
  const [showPrioritySelector, setShowPrioritySelector] = useState(false);

  const { canManageTaskFields } = useRole();

  useEffect(() => {
    if (editAccountSearchQuery.length >= 4) {
      const searchAccounts = async () => {
        setEditIsSearchingAccount(true);
        try {
          const res = await getUserAccounts(editAccountSearchQuery);
          if (res && Array.isArray(res)) {
            setEditAccountResults(res);
          } else if (res && Array.isArray(res.data)) {
            setEditAccountResults(res.data);
          } else if (res && Array.isArray(res.accounts)) {
            setEditAccountResults(res.accounts);
          } else {
            setEditAccountResults([]);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setEditIsSearchingAccount(false);
        }
      };

      const timeoutId = setTimeout(searchAccounts, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setEditAccountResults([]);
    }
  }, [editAccountSearchQuery]);

  const getTaskId = (task) => task.id || task.task_id || task.linear_id || null;

  const handleSave = async () => {
    const linearId = selectedTask?.linear_id;
    if (!linearId) {
      Toast.show({ content: "Linear ID tapılmadı, yeniləmək mümkün deyil." });
      return;
    }

    Toast.show({ icon: "loading", content: "Saxlanılır...", duration: 0 });
    try {
      await updateTask({
        linear_id: linearId,
        title: selectedTask.title,
        description: selectedTask.description,
        project: selectedTask.project,
        operator: selectedTask.operator,
        account: selectedTask.account,
        priority: selectedTask.priority,
      });

      setTasks((prev) =>
        prev.map((t) =>
          getTaskId(t) === getTaskId(selectedTask)
            ? { ...t, ...selectedTask }
            : t
        )
      );
      Toast.clear();
      Toast.show({ icon: "success", content: "Yadda saxlandı" });
      setSelectedTask(null);
    } catch (error) {
      Toast.clear();
      Toast.show({ icon: "fail", content: "Xəta baş verdi" });
    }
  };

  const getPriorityData = (val) => {
    return PRIORITY_ICONS.find(p => p.value === String(val)) || PRIORITY_ICONS[0];
  };

  return (
    <Popup
      visible={!!selectedTask}
      onMaskClick={() => setSelectedTask(null)}
      bodyStyle={{
        height: '85vh',
        borderTopLeftRadius: '16px',
        borderTopRightRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--app-bg)',
      }}
    >
      <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: 18, color: 'var(--app-text)' }}>Tapşırığı redaktə et</h2>
        <Button size="small" onClick={() => setSelectedTask(null)} style={{ border: 'none', background: 'transparent', color: 'var(--muted-text)', fontSize: 18, padding: 0 }}>✕</Button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {selectedTask && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              paddingBottom: "24px"
            }}
          >
            <div>
              <div style={{ marginBottom: 4, fontSize: 13, fontWeight: 600 }}>
                Layihə
              </div>
              <select
                value={selectedTask.project || ""}
                onChange={(e) =>
                  setSelectedTask({ ...selectedTask, project: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: 8,
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "var(--input-bg)",
                  color: "var(--input-text)",
                }}
              >
                <option value="">Layihə seçin...</option>
                {projects.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
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
            <div style={{ position: "relative" }}>
              <div style={{ marginBottom: 4, fontSize: 13, fontWeight: 600 }}>
                Operator
              </div>
              {canManageTaskFields ? (
                <>
                  <input
                    value={
                      editOperatorSearchQuery !== ""
                        ? editOperatorSearchQuery
                        : selectedTask.operator || ""
                    }
                    onFocus={() => {
                      setEditShowOperatorList(true);
                      setEditOperatorSearchQuery(selectedTask.operator || "");
                    }}
                    onChange={(e) => {
                      setEditOperatorSearchQuery(e.target.value);
                      setSelectedTask({ ...selectedTask, operator: "" });
                      setEditShowOperatorList(true);
                    }}
                    placeholder="Operatoru daxil edin"
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
                  {selectedTask.operator && editOperatorSearchQuery !== "" && (
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--tab-active-bg)",
                        marginTop: 4,
                      }}
                    >
                      Seçilmiş operator: {selectedTask.operator}
                    </div>
                  )}
                  {editShowOperatorList && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        zIndex: 10,
                        background: "var(--surface-bg)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        maxHeight: 150,
                        overflowY: "auto",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        marginTop: 4,
                      }}
                    >
                      {uniqueOperators
                        .filter((o) =>
                          o
                            .toLowerCase()
                            .includes(editOperatorSearchQuery.toLowerCase())
                        )
                        .map((op, i) => (
                          <div
                            key={i}
                            onClick={() => {
                              setSelectedTask({ ...selectedTask, operator: op });
                              setEditOperatorSearchQuery("");
                              setEditShowOperatorList(false);
                            }}
                            style={{
                              padding: "8px 12px",
                              fontSize: 14,
                              borderBottom: "1px solid var(--border)",
                              cursor: "pointer",
                              color: "var(--app-text)",
                            }}
                          >
                            {op}
                          </div>
                        ))}
                      {editOperatorSearchQuery !== "" &&
                        !uniqueOperators.some(
                          (o) =>
                            o.toLowerCase() ===
                            editOperatorSearchQuery.toLowerCase()
                        ) && (
                          <div
                            onClick={() => {
                              setSelectedTask({
                                ...selectedTask,
                                operator: editOperatorSearchQuery,
                              });
                              setEditOperatorSearchQuery("");
                              setEditShowOperatorList(false);
                            }}
                            style={{
                              padding: "8px 12px",
                              fontSize: 14,
                              borderBottom: "1px solid var(--border)",
                              cursor: "pointer",
                              color: "var(--tab-active-bg)",
                              fontWeight: "bold",
                            }}
                          >
                            "{editOperatorSearchQuery}" əlavə et
                          </div>
                        )}
                    </div>
                  )}
                </>
              ) : (
                <div style={{
                  width: "100%",
                  padding: 8,
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "rgba(128, 128, 128, 0.1)",
                  color: "var(--muted-text)",
                  boxSizing: "border-box"
                }}>
                  {selectedTask.operator || "—"}
                </div>
              )}
            </div>
            <div style={{ position: "relative" }}>
              <div style={{ marginBottom: 4, fontSize: 13, fontWeight: 600 }}>
                Hesab
              </div>
              {canManageTaskFields ? (
                <>
                  <input
                    value={
                      editAccountSearchQuery !== ""
                        ? editAccountSearchQuery
                        : selectedTask.account || ""
                    }
                    onFocus={() => {
                      setEditShowAccountList(true);
                      setEditAccountSearchQuery(selectedTask.account || "");
                    }}
                    onChange={(e) => {
                      setEditAccountSearchQuery(e.target.value);
                      setSelectedTask({ ...selectedTask, account: "" });
                      setEditShowAccountList(true);
                    }}
                    placeholder="Hesabı axtar (min 4 hərf)..."
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
                  {selectedTask.account && editAccountSearchQuery !== "" && (
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--tab-active-bg)",
                        marginTop: 4,
                      }}
                    >
                      Seçilmiş hesab: {selectedTask.account}
                    </div>
                  )}
                  {editShowAccountList && editAccountSearchQuery.length >= 4 && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        zIndex: 10,
                        background: "var(--surface-bg)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        maxHeight: 150,
                        overflowY: "auto",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        marginTop: 4,
                      }}
                    >
                      {editIsSearchingAccount ? (
                        <div
                          style={{
                            padding: 8,
                            fontSize: 13,
                            color: "var(--muted-text)",
                            textAlign: "center",
                          }}
                        >
                          Axtarılır...
                        </div>
                      ) : editAccountResults.length > 0 ? (
                        editAccountResults.map((acc, i) => {
                          const accLabel =
                            acc.account || acc.phone || acc.name || acc.toString();
                          return (
                            <div
                              key={i}
                              onClick={() => {
                                setSelectedTask({
                                  ...selectedTask,
                                  account: accLabel,
                                });
                                setEditAccountSearchQuery("");
                                setEditShowAccountList(false);
                              }}
                              style={{
                                padding: "8px 12px",
                                fontSize: 14,
                                borderBottom: "1px solid var(--border)",
                                cursor: "pointer",
                                color: "var(--app-text)",
                              }}
                            >
                              {accLabel}
                            </div>
                          );
                        })
                      ) : (
                        <div
                          onClick={() => {
                            setSelectedTask({
                              ...selectedTask,
                              account: editAccountSearchQuery,
                            });
                            setEditAccountSearchQuery("");
                            setEditShowAccountList(false);
                          }}
                          style={{
                            padding: "8px 12px",
                            fontSize: 14,
                            borderBottom: "1px solid var(--border)",
                            cursor: "pointer",
                            color: "var(--tab-active-bg)",
                            fontWeight: "bold",
                          }}
                        >
                          Nəticə tapılmadı. "{editAccountSearchQuery}" əlavə et
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div style={{
                  width: "100%",
                  padding: 8,
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "rgba(128, 128, 128, 0.1)",
                  color: "var(--muted-text)",
                  boxSizing: "border-box"
                }}>
                  {selectedTask.account || "—"}
                </div>
              )}
            </div>

            <div style={{ position: "relative" }}>
              <div style={{ marginBottom: 4, fontSize: 13, fontWeight: 600 }}>
                Prioritet
              </div>
              <div
                onClick={() => setShowPrioritySelector(!showPrioritySelector)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "var(--input-bg)",
                  color: "var(--input-text)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer"
                }}
              >
                {getPriorityData(selectedTask.priority).icon}
                <span>{getPriorityData(selectedTask.priority).label}</span>
              </div>
              {showPrioritySelector && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    zIndex: 10,
                    background: "var(--surface-bg)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    maxHeight: 200,
                    overflowY: "auto",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    marginTop: 4,
                  }}
                >
                  {PRIORITY_ICONS.map((p) => (
                    <div
                      key={p.value}
                      onClick={() => {
                        setSelectedTask({ ...selectedTask, priority: p.value });
                        setShowPrioritySelector(false);
                      }}
                      style={{
                        padding: "8px 12px",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        borderBottom: "1px solid var(--border)",
                        cursor: "pointer",
                        color: "var(--app-text)"
                      }}
                    >
                      {p.icon}
                      <span>{p.label}</span>
                    </div>
                  ))}
                </div>
              )}
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
        )}
      </div>
      <div style={{ padding: '16px', borderTop: '1px solid var(--border)', display: 'flex', gap: '12px', background: 'var(--app-bg)' }}>
        <Button block onClick={() => setSelectedTask(null)} style={{ flex: 1, borderRadius: 8, background: 'var(--surface-bg)', color: 'var(--app-text)', border: '1px solid var(--border)' }}>Ləğv et</Button>
        <Button block color="primary" onClick={handleSave} style={{ flex: 1, borderRadius: 8 }}>Saxla</Button>
      </div>
    </Popup>
  );
}

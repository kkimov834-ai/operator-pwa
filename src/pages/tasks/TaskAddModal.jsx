import { Modal, Toast } from "antd-mobile";
import { useState, useEffect } from "react";
import { createTask, taskList } from "../../services/taskList.service";
import { getUserAccounts } from "../../services/user.service";
import { PRIORITY_ICONS } from "../../constants/TaskPriority";

export default function TaskAddModal({
  isAddModalVisible,
  setIsAddModalVisible,
  setTasks,
  setLoading,
  projects,
}) {
  const [newTaskForm, setNewTaskForm] = useState({
    title: "",
    account: "",
    priority: "0",
    project: "",
    description: "",
  });

  const [accountSearchQuery, setAccountSearchQuery] = useState("");
  const [accountResults, setAccountResults] = useState([]);
  const [isSearchingAccount, setIsSearchingAccount] = useState(false);
  const [showAccountList, setShowAccountList] = useState(false);

  const [showPrioritySelector, setShowPrioritySelector] = useState(false);

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

  const handleSave = async () => {
    if (!newTaskForm.title.trim()) {
      Toast.show({ content: "Başlıq daxil edilməlidir" });
      return;
    }
    if (!newTaskForm.project) {
      Toast.show({ content: "Layihə seçilməlidir" });
      return;
    }

    Toast.show({ icon: "loading", content: "Yaradılır...", duration: 0 });
    try {
      const payload = {
        title: `[${newTaskForm.project}] ${newTaskForm.title.trim()}`,
        description: newTaskForm.description,
        priority: Number(newTaskForm.priority),
      };
      if (newTaskForm.account) {
        payload.account = newTaskForm.account;
      }
      await createTask(payload);
      Toast.clear();
      Toast.show({ icon: "success", content: "Tapşırıq yaradıldı" });
      setIsAddModalVisible(false);
      setNewTaskForm({
        title: "",
        account: "",
        priority: "0",
        project: "",
        description: "",
      });
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
      Toast.show({ icon: "fail", content: "Xəta baş verdi" });
    }
  };

  const getPriorityData = (val) => {
    return PRIORITY_ICONS.find(p => p.value === String(val)) || PRIORITY_ICONS[0];
  };

  return (
    <Modal
      visible={isAddModalVisible}
      title="Tapşırıq Əlavə Et"
      content={
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            textAlign: "left",
            maxHeight: "60vh",
            overflowY: "auto",
            padding: "4px",
          }}
        >
          {/* Project Select */}
          <div>
            <div style={{ marginBottom: 4, fontSize: 13, fontWeight: 600 }}>
              Layihə (Məcburidir)
            </div>
            <select
              value={newTaskForm.project}
              onChange={(e) =>
                setNewTaskForm({ ...newTaskForm, project: e.target.value })
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

          {/* Title Input */}
          <div>
            <div style={{ marginBottom: 4, fontSize: 13, fontWeight: 600 }}>
              Başlıq (Məcburidir)
            </div>
            <input
              value={newTaskForm.title}
              onChange={(e) =>
                setNewTaskForm({ ...newTaskForm, title: e.target.value })
              }
              placeholder="Tapşırığın başlığı"
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

          {/* Account Search Input */}
          <div style={{ position: "relative" }}>
            <div style={{ marginBottom: 4, fontSize: 13, fontWeight: 600 }}>
              Hesab (İstəyə bağlı)
            </div>
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
                width: "100%",
                padding: 8,
                borderRadius: 8,
                border: "1px solid var(--border)",
                boxSizing: "border-box",
                background: "var(--input-bg)",
                color: "var(--input-text)",
              }}
            />
            {newTaskForm.account && (
              <div
                style={{
                  fontSize: 12,
                  color: "var(--tab-active-bg)",
                  marginTop: 4,
                }}
              >
                Seçilmiş hesab: {newTaskForm.account}
              </div>
            )}
            {showAccountList && accountSearchQuery.length >= 4 && (
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
                {isSearchingAccount ? (
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
                ) : accountResults.length > 0 ? (
                  accountResults.map((acc, i) => {
                    const accLabel =
                      acc.account || acc.phone || acc.name || acc.toString();
                    return (
                      <div
                        key={i}
                        onClick={() => {
                          setNewTaskForm({
                            ...newTaskForm,
                            account: accLabel,
                          });
                          setAccountSearchQuery(accLabel);
                          setShowAccountList(false);
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
                    style={{
                      padding: 8,
                      fontSize: 13,
                      color: "var(--muted-text)",
                      textAlign: "center",
                    }}
                  >
                    Nəticə tapılmadı
                  </div>
                )}
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
              {getPriorityData(newTaskForm.priority).icon}
              <span>{getPriorityData(newTaskForm.priority).label}</span>
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
                      setNewTaskForm({ ...newTaskForm, priority: p.value });
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

          {/* Description Textarea */}
          <div>
            <div style={{ marginBottom: 4, fontSize: 13, fontWeight: 600 }}>
              Açıqlama (İstəyə bağlı)
            </div>
            <textarea
              value={newTaskForm.description}
              onChange={(e) =>
                setNewTaskForm({ ...newTaskForm, description: e.target.value })
              }
              rows={3}
              placeholder="Əlavə məlumat..."
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
          onClick: handleSave,
        },
      ]}
    />
  );
}

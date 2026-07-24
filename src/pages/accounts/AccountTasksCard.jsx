import React, { useEffect, useState } from 'react';
import { Card, Button, Toast } from 'antd-mobile';
import { taskList } from '../../services/taskList.service';
import { AiOutlineCopy } from 'react-icons/ai';

export default function AccountTasksCard({ accountId, themeStyles }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!accountId) return;
    
    let mounted = true;
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const res = await taskList(accountId);
        if (!mounted) return;
        
        let fetchedTasks = [];
        if (res && res.status === "success") {
          fetchedTasks = res.data || [];
        } else if (Array.isArray(res)) {
          fetchedTasks = res;
        } else if (res?.data) {
          fetchedTasks = res.data;
        }
        setTasks(fetchedTasks);
      } catch (error) {
        console.error("AccountTasksCard fetch error:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    
    fetchTasks();
    return () => { mounted = false; };
  }, [accountId]);

  const copyTaskLink = async (task) => {
    try {
      const url = `${window.location.origin}/tasks/${task.linear_id}`;
      await navigator.clipboard.writeText(url);
      Toast.show({ content: "Link kopyalandı", icon: 'success' });
    } catch {
      Toast.show({ content: "Link kopyalanmadı", icon: 'fail' });
    }
  };

  if (loading && tasks.length === 0) {
    return (
      <Card
        style={{
          borderRadius: "16px",
          background: themeStyles?.cardBg || "#fff",
          border: `1px solid ${themeStyles?.border || "transparent"}`,
        }}
      >
        <div style={{ padding: "16px", textAlign: "center", color: themeStyles?.mutedText }}>
          Tapşırıqlar yüklənir...
        </div>
      </Card>
    );
  }

  if (!loading && tasks.length === 0) {
    return (
      <Card
        style={{
          borderRadius: "16px",
          background: themeStyles?.cardBg || "#fff",
          border: `1px solid ${themeStyles?.border || "transparent"}`,
        }}
      >
        <div style={{ padding: "16px", textAlign: "center", color: themeStyles?.mutedText }}>
          Bu hesaba aid tapşırıq tapılmadı
        </div>
      </Card>
    );
  }

  return (
    <Card
      style={{
        borderRadius: "16px",
        background: themeStyles?.cardBg || "#fff",
        border: `1px solid ${themeStyles?.border || "transparent"}`,
        boxShadow: themeStyles?.isDark ? "none" : "0 4px 16px rgba(0,0,0,0.04)",
      }}
      bodyStyle={{ padding: "16px" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "16px", fontWeight: "700", marginBottom: "16px", color: themeStyles?.cardText }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--tab-active-bg)" }}>
          <path d="M9 11l3 3L22 4"></path>
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
        </svg>
        Hesaba Aid Tapşırıqlar
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {tasks.map(task => (
          <div key={task.id || task.task_id || task.linear_id} style={{
            padding: "12px",
            background: themeStyles?.surfaceBg,
            border: `1px solid ${themeStyles?.border}`,
            borderRadius: "8px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
              <div style={{ fontWeight: 600, color: themeStyles?.cardText, fontSize: "14px", wordBreak: "break-word" }}>
                {task.title}
              </div>
              <Button
                size="mini"
                onClick={() => copyTaskLink(task)}
                style={{
                  borderRadius: "50%",
                  border: `1px solid ${themeStyles?.border}`,
                  background: themeStyles?.cardBg,
                  color: themeStyles?.cardText,
                  width: "28px",
                  height: "28px",
                  padding: 0,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginLeft: "8px"
                }}
              >
                <AiOutlineCopy size={14} />
              </Button>
            </div>
            
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
              <span style={{ fontSize: "12px", padding: "2px 8px", background: themeStyles?.cardBg, borderRadius: "12px", border: `1px solid ${themeStyles?.border}`, color: themeStyles?.cardTextSecondary }}>
                Operator: {task.operator || "-"}
              </span>
              <span style={{ fontSize: "12px", padding: "2px 8px", background: themeStyles?.cardBg, borderRadius: "12px", border: `1px solid ${themeStyles?.border}`, color: themeStyles?.cardTextSecondary }}>
                Status: {task.status || task.stage || "-"}
              </span>
            </div>
            
            {task.description && (
              <div style={{ fontSize: "13px", color: themeStyles?.cardTextSecondary, wordBreak: "break-word" }}>
                {task.description}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

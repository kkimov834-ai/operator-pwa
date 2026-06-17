import React, { useEffect } from "react";
import { Card } from "antd-mobile";
import { useNavBarContext } from "../../components/NavBarContext";

const TasksPage = () => {
  const { setTitle, setShowBack, themeStyles } = useNavBarContext();

  useEffect(() => {
    setTitle("Tapsiriqlar");
    setShowBack(false);
    return () => setTitle("");
  }, [setTitle, setShowBack]);

  const fakeTasks = Array.from({ length: 5 }).map((_, index) => ({
    id: `t_${index + 1}`,
    title: `Tapsiriq ${index + 1}`,
    desc: `Bu yalandan yaradilmish tapsiriq nomre ${index + 1}`,
  }));

  return (
    <div
      style={{
        padding: 12,
        paddingBottom: 84,
        minHeight: "100vh",
        background: themeStyles?.pageBg,
        color: themeStyles?.text,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {fakeTasks.map((task) => (
          <Card
            key={task.id}
            title={task.title}
            style={{
              background: themeStyles?.cardBg,
              color: themeStyles?.cardText,
              border: `1px solid ${themeStyles?.border || "transparent"}`,
              borderRadius: 8,
            }}
          >
            <div
              style={{
                color: themeStyles?.cardTextSecondary || themeStyles?.cardText,
              }}
            >
              {task.desc}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TasksPage;

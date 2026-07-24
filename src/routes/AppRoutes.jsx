import { Route, Routes } from "react-router-dom";
import TasksPage from "../pages/tasks/TasksPage";
import TaskDetail from "../pages/tasks/TaskDetail";
import AccountsPage from "../pages/accounts/AccountsPage";
import AccountDetail from "../pages/accounts/AccountDetail";
import MyAccount from "../pages/profile/MyAccount";
import Terminal from "../pages/terminal/TerminalPage";
import SuGuard from "../components/auth/SuGuard";
import LinearCleanUp from "../pages/tasks/LinearCleanUp";
import TaskEnvironmentPage from "../pages/tasks/TaskEnvironmentPage";
import SuperAdminGuard from "../components/auth/SuperAdminGuard";
import PermissionsPage from "../pages/permissions/PermissionsPage";

export default function AppRoutes() {
  return (
    <>
      <Routes>
        <Route path="/" element={<AccountsPage />} />
        <Route path="/tasks/:taskId" element={<TaskDetail />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/task-environments" element={<TaskEnvironmentPage />} />
        <Route path="/:id" element={<AccountDetail />} />
        <Route path="/profile" element={<MyAccount />} />
        <Route path="/terminal" element={
          <SuperAdminGuard>
            <Terminal />
          </SuperAdminGuard>
        } />
        <Route
          path="/tasks/cleanup"
          element={
            <SuGuard>
              <LinearCleanUp />
            </SuGuard>
          }
        />
        <Route
          path="/permissions"
          element={
            <PermissionsPage />
          }
        />
      </Routes>
    </>
  );
}


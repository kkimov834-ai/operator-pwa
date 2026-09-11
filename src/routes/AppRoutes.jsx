import { Route, Routes } from "react-router-dom";
import TasksPage from "../pages/tasks/TasksPage";
import TaskDetail from "../pages/tasks/TaskDetail";
import AccountsPage from "../pages/accounts/AccountsPage";
import AccountDetail from "../pages/accounts/AccountDetail";
import MyAccount from "../pages/profile/MyAccount";
import Terminal from "../pages/terminal/TerminalPage";
import RouteGuard from "../components/auth/RouteGuard";
import LinearCleanUp from "../pages/tasks/LinearCleanUp";
import TaskEnvironmentPage from "../pages/tasks/TaskEnvironmentPage";
import PermissionsPage from "../pages/permissions/PermissionsPage";
import PartnersPage from "../pages/partners/PartnersPage";
import PartnerDashboardPage from "../pages/partners/PartnerDashboardPage";
import PartnerClientsPage from "../pages/partners/PartnerClientsPage";
import OperatorStatsPage from "../pages/stats/OperatorStatsPage";
import ClientStatsPage from "../pages/stats/ClientStatsPage";
//import ClientStatsPWA from "../pages/stats/ClientStatsPWA";
import ChatsPage from "../pages/chats/ChatsPage";

export default function AppRoutes() {
  return (
    <>
      <Routes>
        <Route path="/" element={<AccountsPage />} />
        <Route path="/tasks/:taskId" element={<TaskDetail />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/task-environments" element={<TaskEnvironmentPage />} />
        <Route path="/partners" element={<PartnersPage />} />
        <Route path="/partner-dashboard" element={<RouteGuard requiresPartner><PartnerDashboardPage /></RouteGuard>} />
        <Route path="/partner-clients" element={<RouteGuard requiresPartner><PartnerClientsPage /></RouteGuard>} />
        <Route path="/operator-stats" element={<OperatorStatsPage />} />
        <Route path="/stats" element={<ClientStatsPage />} />
        {/* <Route path="/client-stats-pwa" element={<ClientStatsPWA />} /> */}
        <Route path="/chats" element={<ChatsPage />} />
        <Route path="/:id" element={<AccountDetail />} />
        <Route path="/profile" element={<MyAccount />} />
        <Route
          path="/terminal"
          element={
            <RouteGuard requiresSuperAdmin>
              <Terminal />
            </RouteGuard>
          }
        />
        <Route
          path="/tasks/cleanup"
          element={
            <RouteGuard requiresSu>
              <LinearCleanUp />
            </RouteGuard>
          }
        />
        <Route path="/permissions" element={<PermissionsPage />} />
      </Routes>
    </>
  );
}

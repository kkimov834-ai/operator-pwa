import { Route, Routes } from "react-router-dom";
import HomePage from "../pages/home/HomePage";
import OverviewPage from "../pages/overview/OverviewPage";
import TasksPage from "../pages/tasks/TasksPage";
import AccountsPage from "../pages/accounts/AccountsPage";
import AccountDetail from "../pages/accounts/AccountDetail";
import MyAccount from "../pages/profile/MyAccount";

export default function AppRoutes() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/overview" element={<OverviewPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/accounts" element={<AccountsPage />} />
        <Route path="/accounts/:id" element={<AccountDetail />} />
        <Route path="/profile" element={<MyAccount />} />
      </Routes>
    </>
  );
}

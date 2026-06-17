import { Route, Routes } from "react-router-dom";
import TasksPage from "../pages/tasks/TasksPage";
import AccountsPage from "../pages/accounts/AccountsPage";
import AccountDetail from "../pages/accounts/AccountDetail";
import MyAccount from "../pages/profile/MyAccount";

export default function AppRoutes() {
  return (
    <>
      <Routes>
        <Route path="/" element={<AccountsPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/:id" element={<AccountDetail />} />
        <Route path="/profile" element={<MyAccount />} />
      </Routes>
    </>
  );
}

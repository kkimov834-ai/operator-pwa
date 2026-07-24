import { useRole } from "../../hooks/useRole";
import { Navigate } from "react-router-dom";

const SuperAdminGuard = ({ children }) => {
  const { isSuperAdmin } = useRole();

  if (!isSuperAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default SuperAdminGuard;

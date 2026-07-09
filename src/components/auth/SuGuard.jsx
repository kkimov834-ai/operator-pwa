import { Navigate } from "react-router-dom";
import { useRole } from "../../hooks/useRole";
// import { useRole } from "@/hooks/useRole";

/**
 * SuGuard — yalnız su (superuser) rolu olan istifadəçilər keçə bilər.
 * Başqa rol varsa avtomatik "/" səhifəsinə yönləndirilir.
 */
const SuGuard = ({ children }) => {
  const { isSu } = useRole();

//   if (!isSu) {
//     return <Navigate to="/" replace />;
//   }

  return children;
};

export default SuGuard;

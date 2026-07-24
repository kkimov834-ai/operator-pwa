import { useRBAC } from "../../context/RBACContext";
import { usePermissionDebug } from "../../context/PermissionDebugContext";
import { PERMISSION_MAP } from "../../config/permissions";
import { useRole } from "../../hooks/useRole";

const PermissionGuard = ({ id, children }) => {
    const { forbiddenIds } = useRBAC();
    const { showDebugIds } = usePermissionDebug();
    const { isSu, isSuperAdmin } = useRole();

  const numericId = PERMISSION_MAP[id] !== undefined ? PERMISSION_MAP[id] : id;
  const isForbidden = forbiddenIds.some(fid => Number(fid) === Number(numericId));

   if (isForbidden) return null;
   
  

   return (
    <div>
      {(isSu || isSuperAdmin) && showDebugIds && (
        <div
        >
          {numericId}
        </div>
      )}
      <div className="h-full w-full">{children}</div>
      </div>  
   )
}

export default PermissionGuard;
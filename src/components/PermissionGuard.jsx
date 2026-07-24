import React from "react";
import { useRBAC } from "../context/RBACContext";
import { PERMISSION_MAP } from "../config/permissions";

const PermissionGuard = ({ id, children, fallback = null }) => {
  const { forbiddenIds } = useRBAC();

  const numericId = PERMISSION_MAP[id] !== undefined ? PERMISSION_MAP[id] : id;
  const isForbidden = forbiddenIds.some(fid => Number(fid) === Number(numericId));

  if (isForbidden) return fallback;

  return <>{children}</>;
};

export default PermissionGuard;

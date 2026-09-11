import React from "react";
import { Navigate } from "react-router-dom";
import { useRBAC } from "../../context/RBACContext";
import { useRole } from "../../hooks/useRole";
import { PERMISSION_MAP } from "../../config/permissions";

/**
 * RouteGuard — universal route protection for PWA pages.
 * Checks role requirements and forbidden permission IDs.
 * If access is denied, redirects to the main route '/'.
 */
const RouteGuard = ({
  id,
  requiresSu,
  requiresSuperAdmin,
  requiresPartner,
  children,
}) => {
  const { forbiddenIds, isLoading } = useRBAC();
  const { isSu, isSuperAdmin, isPartner } = useRole();

  if (isLoading) {
    return null;
  }

  if (requiresSu && !isSu) {
    return <Navigate to="/" replace />;
  }

  if (requiresSuperAdmin && !isSuperAdmin && !isSu) {
    return <Navigate to="/" replace />;
  }

  if (requiresPartner && !isPartner) {
    return <Navigate to="/" replace />;
  }

  if (id) {
    const numericId =
      PERMISSION_MAP[id] !== undefined ? PERMISSION_MAP[id] : id;
    if (forbiddenIds.some((fid) => Number(fid) === Number(numericId))) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default RouteGuard;

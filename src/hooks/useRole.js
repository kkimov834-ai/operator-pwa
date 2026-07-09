// import { useRBAC } from '../contexts/RBACContext';

import { useRBAC } from "../context/RBACContext";


export const useRole = () => {
    const { user } = useRBAC();
    const role = user?.role ?? null;

    return {
        role,
        isSu: role === 'su',
        isSuperAdmin: role === 'superadmin',
        isAdmin: role === 'admin',
        isOperator: role === 'operator',
        isPartner: role === 'partner',
        canManageTaskFields: role === 'su' || role === 'superadmin' || role === 'admin',
    };
};

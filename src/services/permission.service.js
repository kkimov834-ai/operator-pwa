import api from '../api';

/**
 * API Permissions Service
 * Endpoints: /permission/list, /permission/update
 */
export const PermissionService = {
    // Get all available endpoints and role permissions matrix
    getPermissions: () => api.get('/permission/list'),

    // Save endpoints list for a specific role
    updatePermission: (role, endpoints) =>
        api.post('/permission/update', { role, endpoints }),
};

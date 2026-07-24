import api from '../api';

/**
 * Rules & Permissions API servis
 * Endpoint-lər: /rule/get, /rule/update_forbidden
 */
export const RuleService = {
    // Bütün qaydalar + hər rol üçün icazə yoxdurlar
    getRules: () => api.get('/rule/get'),

    // Yalnız superadmin: rol üçün icazə yoxdurları yenilə
    updateForbidden: (role, forbidden) =>
        api.post('/rule/update_forbidden', { role, forbidden }),
};

import api from '../api';

/**
 * Rules & Permissions API servis
 */
export const RuleService = {
    getRules: () => api.get('/rule/get'),
};

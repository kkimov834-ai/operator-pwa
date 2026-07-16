import api from '../api';

export const ModuleService = {
  // Get User Modules (with Services)
  getUserModules: async (account) => {
    return await api.post('/user/modules', { account });
  },

  // Manage Modules (FULL) - Add
  addModule: async (data) => {
    return await api.post('/module/add', data);
  },

  // Manage Modules (FULL) - Remove
  removeModule: async (account, moduleName) => {
    return await api.post('/module/remove', { account, module: moduleName });
  },

  // Manage Services (INDIVIDUAL) - Add Service
  addService: async (data) => {
    return await api.post('/module/addService', data);
  },

  // Manage Services (INDIVIDUAL) - Remove Service
  removeService: async (account, serviceId) => {
    return await api.post('/module/removeService', { account, service: serviceId });
  }
};

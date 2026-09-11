import api from "../api";

export const PartnerService = {
  // Admin endpoints
  getPartnersList: async () => {
    return await api.get("/partner/list");
  },

  createPartner: async (data) => {
    return await api.post("/partner/create", data);
  },

  updatePartner: async (partnerPin, data) => {
    return await api.post("/partner/update", { partnerPin, ...data });
  },

  makePayout: async (partnerPin, amount, info = "") => {
    return await api.post("/partner/payout", { partnerPin, amount, info });
  },

  makeReward: async (partnerPin, amount, info = "") => {
    return await api.post("/partner/reward", { partnerPin, amount, info });
  },

  getPartnerTransactions: async (partnerPin) => {
    return await api.post("/partner/transactions", { partnerPin });
  },

  getPartnerClients: async (partnerPin) => {
    return await api.post("/partner/clients", { partnerPin });
  },

  // Partner dashboard endpoints
  getPartnerDashboard: async () => {
    return await api.get("/partner/dashboard");
  },

  getMyClients: async () => {
    return await api.get("/partner/my_clients");
  },

  getMyTransactions: async () => {
    return await api.get("/partner/my_transactions");
  },
};

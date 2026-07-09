import axios from "axios";
import { appConfig } from "../config/environments";

// Authenticated API (for admin panel usage)
const rmmApi = axios.create({
  baseURL: appConfig.apiBaseUrl,
  headers: { "Content-Type": "application/json" },
});

rmmApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Internal API — used by the Go-agent itself, no Bearer token required
const rmmInternalApi = axios.create({
  baseURL: appConfig.apiBaseUrl,
  headers: { "Content-Type": "application/json" },
});

export const rmmService = {
  /**
   * 5.2 Sends a command to the agent (admin → agent).
   * @param {string} id - 4-digit agent ID.
   * @param {string} cmd - Command text.
   */
  sendCommand: async (id, cmd) => {
    return rmmApi.post("/rmm/send_cmd", { id, cmd });
  },

  /**
   * 5.2 Gets the result from the agent (admin reads result).
   * @param {string} id - 4-digit agent ID.
   */
  getResult: async (id) => {
    return rmmApi.post("/rmm/get_res", { id });
  },

  // ── 5.3 Internal Agent Endpoints (no Bearer token) ──────────────────────

  /**
   * 5.3 Agent polls for a pending command.
   * GET /rmm/get_cmd?id=XXXX
   * @param {string} id - 4-digit agent ID.
   */
  agentGetCmd: async (id) => {
    return rmmInternalApi.get("/rmm/get_cmd", { params: { id } });
  },

  /**
   * 5.3 Agent submits its command result.
   * POST /rmm/send_res?id=XXXX
   * @param {string} id - 4-digit agent ID.
   * @param {string} result - Result payload.
   */
  agentSendRes: async (id, result) => {
    return rmmInternalApi.post(`/rmm/send_res`, { result }, { params: { id } });
  },
};

// Minimal in-memory + localStorage store for account modules/services
const STORAGE_KEY = "operator_pwa_account_modules_v1";

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function save(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    // ignore
  }
}

export function getModules(accountId) {
  const state = load();
  return state[accountId] || [];
}

export function setModules(accountId, modules) {
  const state = load();
  state[accountId] = modules;
  save(state);
}

export function addModules(accountId, newModules) {
  const prev = getModules(accountId);
  const merged = [...newModules.map((m) => ({ id: `m_${Date.now()}_${Math.random().toString(36).slice(2,6)}`, name: m, price: "0 AZN", services: [] })), ...prev];
  setModules(accountId, merged);
  return merged;
}

export function removeModule(accountId, modId) {
  const prev = getModules(accountId).filter((m) => m.id !== modId);
  setModules(accountId, prev);
  return prev;
}

export function addTariffs(accountId, modId, tariffs) {
  const prev = load();
  const mods = prev[accountId] || [];
  const updated = mods.map((m) => {
    if (m.id !== modId) return m;
    const newServices = tariffs.map((t) => ({ id: `s_${Date.now()}_${Math.random().toString(36).slice(2,6)}`, name: t, price: "0 AZN" }));
    return { ...m, services: [...m.services, ...newServices] };
  });
  prev[accountId] = updated;
  save(prev);
  return updated;
}

export function removeService(accountId, modId, serviceId) {
  const prev = load();
  const mods = prev[accountId] || [];
  const updated = mods.map((m) => (m.id === modId ? { ...m, services: m.services.filter((s) => s.id !== serviceId) } : m));
  prev[accountId] = updated;
  save(prev);
  return updated;
}

import React, { useEffect, useState } from "react";
import { Button, Toast } from "antd-mobile";
import { ModuleService } from "../../services/module.service";
import { userModules } from "../../services/userModules.secvice";
import { allModules } from "../../services/allModules.service";
import ModuleCard from "./ModuleCard";
import ModulePickerModal from "./ModulePickerModal";
import TariffAddModal from "./TariffAddModal";

const makeService = (service) => {
  if (typeof service === "string") {
    return {
      id: service,
      name: service,
      price: "0 AZN",
      catalogKey: service,
      sourceKey: service,
    };
  }
  const name =
    service?.name ?? service?.service ?? service?.module ?? service?.label;
  if (!name) return null;
  return {
    ...service,
    id: service?.id ?? service?._id ?? name,
    name,
    price: service?.price ?? "0 AZN",
    catalogKey: service?.catalogKey ?? service?.id ?? service?._id ?? name,
    sourceKey: service?.sourceKey ?? service?.id ?? service?._id ?? name,
  };
};

const makeModule = (item) => {
  if (typeof item === "string") {
    return {
      label: item,
      value: item,
      services: [],
      raw: { module: item, services: [] },
    };
  }
  const label =
    item?.module ??
    item?.name ??
    item?.label ??
    item?.value ??
    item?.id ??
    item?._id;
  if (!label) return null;
  const value = String(
    item?.id ?? item?._id ?? item?.module ?? item?.name ?? label,
  );
  const services = (item?.services ?? item?.serviceList ?? item?.items ?? [])
    .map(makeService)
    .filter(Boolean);
  return {
    label,
    value,
    services,
    raw: { ...item, module: item?.module ?? item?.name ?? label, services },
  };
};

const moduleKey = (module) =>
  typeof module === "string"
    ? module
    : String(
        module?.catalogKey ??
          module?.sourceKey ??
          module?.id ??
          module?._id ??
          module?.module ??
          module?.name ??
          module?.label ??
          "",
      );

const serviceKey = (service) =>
  typeof service === "string"
    ? service
    : String(
        service?.catalogKey ??
          service?.sourceKey ??
          service?.id ??
          service?._id ??
          service?.name ??
          "",
      );

export default function ModulesManager({ accountId }) {
  const [modules, setModules] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [showModules, setShowModules] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [tariffModuleId, setTariffModuleId] = useState(null);
  const [selectedTariff, setSelectedTariff] = useState(null);
  const [collapsed, setCollapsed] = useState([]);

  const loadAccountModules = async (showLoader = true) => {
    if (!accountId) return;
    if (showLoader) setLoading(true);
    try {
      const res = await userModules(accountId);
      const items = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.modules)
            ? res.modules
            : [];
      // Ensure every module has a guaranteed `id`
      const normalized = items.map((m, idx) => ({
        ...m,
        id: m.id || m._id || m.module || m.name || `mod_${idx}`,
      }));
      setModules(normalized);
    } catch (error) {
      console.error(error);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    loadAccountModules();
  }, [accountId]);

  useEffect(() => {
    const load = async () => {
      setCatalogLoading(true);
      try {
        const res = await allModules();
        const items = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res?.modules)
              ? res.modules
              : [];
        setCatalog(items.map(makeModule).filter(Boolean));
      } finally {
        setCatalogLoading(false);
      }
    };
    load();
  }, []);

  const activeKeys = new Set(
    modules.flatMap((module) =>
      [moduleKey(module), module?.module, module?.name, module?.id, module?._id]
        .filter(Boolean)
        .map(String),
    ),
  );
  const activeModule = modules.find(
    (module) =>
      module.id === tariffModuleId ||
      module._id === tariffModuleId ||
      String(module.id) === String(tariffModuleId),
  );
  const currentCatalog = activeModule
    ? catalog.find(
        (item) =>
          item.value === moduleKey(activeModule) ||
          item.label === moduleKey(activeModule) ||
          item.label === (activeModule.module || activeModule.name),
      )
    : null;
  const currentServices =
    currentCatalog?.services || activeModule?.catalogServices || [];
  const activeServiceKeys = new Set(
    (activeModule?.services || []).map(serviceKey),
  );
  const moduleOptions = catalog.filter(
    (item) => !activeKeys.has(item.value) && !activeKeys.has(item.label),
  );

  // Collect all services from catalog as fallback
  const allCatalogServices = catalog.flatMap((item) => item.services || []);
  const tariffServices = currentServices.length > 0
    ? currentServices.filter((service) => !activeServiceKeys.has(serviceKey(service)))
    : allCatalogServices;

  const addModule = async () => {
    if (!selectedModule) return;
    const item = catalog.find(
      (entry) =>
        entry.value === selectedModule || entry.label === selectedModule,
    );
    if (!item) return;

    Toast.show({ icon: 'loading', content: 'Əlavə edilir...', duration: 0 });
    try {
      await ModuleService.addModule({
        account: accountId,
        module: item.label,
        price: 0,
        quantity: 1
      });
      await loadAccountModules(false);
      Toast.clear();
      Toast.show({ icon: 'success', content: "Modul əlavə edildi" });
    } catch (error) {
      Toast.clear();
      Toast.show({ icon: 'fail', content: "Xəta baş verdi" });
    }

    setSelectedModule(null);
    setShowModules(false);
  };

  const addService = async (tariffData) => {
    if (!tariffModuleId || !tariffData) return;
    Toast.show({ icon: 'loading', content: 'Əlavə edilir...', duration: 0 });
    try {
      await ModuleService.addService({
        account: accountId,
        service: tariffData.id || tariffData.name || tariffData.catalogKey,
        price: Number(tariffData.price || 0),
        quantity: Number(tariffData.quantity || 1)
      });
      await loadAccountModules(false);
      Toast.clear();
      Toast.show({ icon: 'success', content: "Tarif əlavə edildi" });
    } catch (error) {
      Toast.clear();
      Toast.show({ icon: 'fail', content: "Xəta baş verdi" });
    }
    setTariffModuleId(null);
  };

  if (loading || catalogLoading) {
    return (
      <div
        style={{
          padding: 12,
          textAlign: "center",
          color: "var(--muted-text)",
          fontSize: 13,
        }}
      >
        Modullar yüklənir...
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 20 }}>
      <style>{`
        .adm-selector-item{background-color:var(--tab-passive-bg)!important;color:var(--tab-passive-text)!important;border:1px solid var(--border)!important;}
        .adm-selector-item-active{background-color:var(--tab-active-bg)!important;color:var(--tab-active-text)!important;border-color:var(--tab-active-bg)!important;}
      `}</style>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          margin: "8px 0 16px",
        }}
      >
        <h3
          style={{
            margin: 0,
            color: "var(--app-text)",
            fontWeight: 600,
            fontSize: 16,
          }}
        >
          Modullar ({modules.length})
        </h3>
        <Button
          size="small"
          onClick={() => setShowModules(true)}
          style={{
            background: "var(--tab-active-bg)",
            color: "var(--tab-active-text)",
            border: "none",
            borderRadius: 6,
            fontWeight: 500,
          }}
        >
          + Modul əlavə et
        </Button>
      </div>

      {modules.length === 0 ? (
        <div
          style={{
            padding: "24px 12px",
            color: "var(--muted-text)",
            textAlign: "center",
            fontSize: 14,
            background: "var(--surface-bg)",
            borderRadius: 8,
          }}
        >
          Bu istifadəçiyə aid heç bir modul tapılmadı.
        </div>
      ) : (
        modules.map((mod) => (
          <ModuleCard
            key={mod.id}
            module={mod}
            collapsed={collapsed.includes(mod.id)}
            onToggleCollapse={(id) =>
              setCollapsed((prev) =>
                prev.includes(id)
                  ? prev.filter((item) => item !== id)
                  : [...prev, id],
              )
            }
            onRemove={async (moduleId, serviceId) => {
              const targetModule = modules.find(m => m.id === moduleId);
              const moduleName = targetModule?.module || targetModule?.name;
              Toast.show({ icon: 'loading', content: 'Silinir...', duration: 0 });
              try {
                if (serviceId) {
                  await ModuleService.removeService(accountId, serviceId);
                } else {
                  await ModuleService.removeModule(accountId, moduleName);
                }
                await loadAccountModules(false);
                Toast.clear();
                Toast.show({ icon: 'success', content: "Silindi" });
              } catch (error) {
                Toast.clear();
                Toast.show({ icon: 'fail', content: "Xəta baş verdi" });
              }
            }}
            onAddTariff={(id) => {
              console.log("onAddTariff called with id:", id, "type:", typeof id);
              setTariffModuleId(id);
              setSelectedTariff(null);
            }}
          />
        ))
      )}

      <ModulePickerModal
        open={showModules}
        title="Modul seçin"
        emptyText="Seçim üçün modul qalmayıb"
        options={moduleOptions.map((item) => ({
          label: item.label,
          value: item.value,
        }))}
        value={selectedModule}
        onChange={setSelectedModule}
        onClose={() => {
          setSelectedModule(null);
          setShowModules(false);
        }}
        onConfirm={addModule}
      />

      <TariffAddModal
        open={Boolean(tariffModuleId)}
        title="Tarif əlavə et"
        services={tariffServices}
        onClose={() => {
          setTariffModuleId(null);
        }}
        onConfirm={addService}
      />
    </div>
  );
}

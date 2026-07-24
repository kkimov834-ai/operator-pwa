import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, DotLoading } from 'antd-mobile';
import { RuleService } from '../../services/rule.service';
import { PermissionService } from '../../services/permission.service';
import { PERMISSION_MAP, PERMISSION_NAMES } from '../../config/permissions';
import { useNavBarContext } from '../../components/NavBarContext';
import { RefreshCw, Save, AlertCircle, ShieldAlert } from 'lucide-react';

// All 5 roles shown as table columns
const ROLES = ['su', 'superadmin', 'admin', 'partner', 'operator'];
const ROLE_LABELS = {
  su: 'SU',
  superadmin: 'SA',
  admin: 'Admin',
  partner: 'Partnyor',
  operator: 'Operator',
};

const CUSTOM_DESCRIPTIONS = {
  'user/accounts/unlimited': 'Hesab axtarış limiti: 100 vs 2 hesab.',
  'task/update/env': 'Tapşırıqların mühitini redaktə etməyə icazə.',
  'task/update/operator': 'Tapşırıqların icraçısını dəyişməyə icazə.',
  'task/update/account': 'Tapşırığı başqa hesaba bağlamağa icazə.',
  'user/update/status': 'İstifadəçiləri bloklamaq / aktivləşdirmək.',
  'user/update/partnerpin': 'Hesabı başqa partnyor PIN-inə bağlamaq.',
};

const CONTROLLER_NAMES = {
  clientStats: 'Müştəri Statistikaları', client_stats: 'Müştəri Statistikaları',
  equipment: 'Avadanlıqlar', finance: 'Maliyyə', module: 'Modullar',
  permission: 'İcazələr (API)', rmm: 'RMM Terminalı', rule: 'İnterfeys Qaydaları',
  session: 'Sessiyalar', task: 'Tapşırıqlar', user: 'İstifadəçilər & Hesablar',
};

// ─── Checkbox ──────────────────────────────────────────────────────────────────
const Chk = ({ checked, disabled, onChange }) => (
  <div
    onClick={!disabled ? onChange : undefined}
    style={{
      width: 20, height: 20, borderRadius: 5, flexShrink: 0,
      border: `2px solid ${checked ? '#7C3AED' : 'rgba(128,128,128,0.28)'}`,
      background: checked ? '#7C3AED' : 'transparent',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.32 : 1,
      transition: 'all 0.14s',
    }}
  >
    {checked && (
      <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
        <path d="M1 4L4 7.5L10 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )}
  </div>
);

export default function PermissionsPage() {
  const { themeStyles, setTitle, setShowBack } = useNavBarContext();
  // null = home grid, 'api' | 'rules'
  const [section, setSection] = useState(null);

  const openSection = (s) => {
    window.history.pushState({ s }, '');
    setSection(s);
  };
  useEffect(() => {
    const onPop = () => setSection(null);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  useEffect(() => {
    const titles = { null: 'İcazələr', api: 'API Səlahiyyətləri', rules: 'İnterfeys Qaydaları' };
    setTitle(titles[section] ?? 'İcazələr');
    setShowBack(!!section);
    return () => { setTitle(''); setShowBack(false); };
  }, [section, setTitle, setShowBack]);

  // ── theme shortcuts ─────────────────────────────────────────────────────────
  const T = themeStyles || {};
  const pageBg  = T.pageBg  || 'var(--app-bg)';
  const cardBg  = T.cardBg  || 'var(--card-bg)';
  const cardTxt = T.cardText || 'var(--card-text)';
  const muted   = T.mutedText || 'var(--muted-text)';
  const bord    = T.border   || 'var(--border)';
  const surf    = T.surfaceBg || 'var(--surface-bg)';
  const appTxt  = T.text     || 'var(--app-text)';

  const pageWrap = {
    padding: 12, paddingBottom: 110,
    minHeight: '100vh', background: pageBg, color: appTxt,
  };

  // shared table header/cell styles
  const TH = (extra = {}) => ({
    padding: '10px 12px', textAlign: 'left', fontWeight: 700,
    fontSize: 11, color: muted, textTransform: 'uppercase',
    letterSpacing: '0.04em', background: surf,
    borderBottom: `1px solid ${bord}`, whiteSpace: 'nowrap',
    ...extra,
  });
  const TD = (extra = {}) => ({
    padding: '10px 12px', borderBottom: `1px solid ${bord}`,
    verticalAlign: 'middle', ...extra,
  });

  // ─── Inline buttons ───────────────────────────────────────────────────────
  const Btn = ({ children, onClick, disabled, variant = 'primary', small }) => {
    const base = {
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      gap: 5, padding: small ? '6px 12px' : '8px 16px',
      borderRadius: 8, fontSize: small ? 12 : 13, fontWeight: 600,
      cursor: disabled ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap',
      opacity: disabled ? 0.6 : 1,
    };
    const styles = {
      primary: { border: 'none', background: '#7C3AED', color: '#fff', ...base },
      outline: { border: `1px solid ${bord}`, background: cardBg, color: appTxt, ...base },
    };
    return <button onClick={!disabled ? onClick : undefined} style={styles[variant]}>{children}</button>;
  };

  // ─── Inline banner ────────────────────────────────────────────────────────
  const InfoBanner = ({ msg, ok }) => {
    if (!msg) return null;
    return (
      <div style={{
        marginBottom: 10, padding: '10px 14px', borderRadius: 10,
        background: ok ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
        border: `1px solid ${ok ? '#22c55e' : '#ef4444'}`,
        fontSize: 13, fontWeight: 600, color: ok ? '#16a34a' : '#dc2626',
      }}>
        {ok ? '✅' : '❌'} {msg}
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════════════════
  // RULES STATE  — now stores forbidden sets per EVERY role (including su/superadmin)
  // ══════════════════════════════════════════════════════════════════════════
  const [rules, setRules] = useState([]);
  const [allRolesInData, setAllRolesInData] = useState([]);   // all roles from API
  const [forbidden, setForbidden] = useState({});
  const [localForbidden, setLocalForbidden] = useState({});   // role → Set<id>
  const [rulesLoading, setRulesLoading] = useState(true);
  const [rulesSaving, setRulesSaving] = useState(false);
  const [rulesSearch, setRulesSearch] = useState('');
  const [rulesFilter, setRulesFilter] = useState('all');
  const [rulesMsg, setRulesMsg] = useState({ msg: '', ok: true });
  // which role's "allowed" column we use for the filter (default: admin)
  const [filterRole, setFilterRole] = useState('admin');

  const showMsg = (setter, msg, ok = true) => {
    setter({ msg, ok });
    setTimeout(() => setter({ msg: '', ok: true }), 3000);
  };

  const fetchRules = useCallback(async () => {
    try {
      setRulesLoading(true);
      const res = await RuleService.getRules();
      const data = res?.data ?? res;
      let fetched = data?.rules ?? [];
      const fetchedRoles = data?.roles ?? [];
      const fetchedForbidden = data?.forbidden ?? {};

      if (!fetched.length) {
        fetched = Object.entries(PERMISSION_MAP).map(([key, id]) => ({
          id, name: PERMISSION_NAMES[id] || key, description: key,
        }));
      }

      setRules(fetched);
      setAllRolesInData(fetchedRoles);
      setForbidden(fetchedForbidden);

      // build localForbidden for ALL roles (including su/superadmin)
      const map = {};
      ROLES.forEach(r => { map[r] = new Set(fetchedForbidden[r] ?? []); });
      fetchedRoles.forEach(r => { if (!map[r]) map[r] = new Set(fetchedForbidden[r] ?? []); });
      setLocalForbidden(map);
    } catch (err) {
      showMsg(setRulesMsg, err?.response?.data?.message || err?.message || 'Qaydalar yüklənərkən xəta', false);
    } finally {
      setRulesLoading(false);
    }
  }, []);

  const isForbidden = useCallback((role, ruleId) =>
    (localForbidden[role] ?? new Set()).has(ruleId), [localForbidden]);

  const anyRulesChanged = ROLES.some(role => {
    const cur = Array.from(localForbidden[role] ?? []).sort().join(',');
    const orig = (forbidden[role] ?? []).slice().sort().join(',');
    return cur !== orig;
  });

  const toggleRule = useCallback((role, ruleId) => {
    if (role === 'su') return; // su is immutable
    setLocalForbidden(prev => {
      const next = new Set(prev[role] ?? []);
      next.has(ruleId) ? next.delete(ruleId) : next.add(ruleId);
      return { ...prev, [role]: next };
    });
  }, []);

  const saveRules = async () => {
    // save all changed roles
    const changed = ROLES.filter(role => {
      const cur = Array.from(localForbidden[role] ?? []).sort().join(',');
      const orig = (forbidden[role] ?? []).slice().sort().join(',');
      return cur !== orig && role !== 'su';
    });
    try {
      setRulesSaving(true);
      await Promise.all(changed.map(role =>
        RuleService.updateForbidden(role, Array.from(localForbidden[role] ?? []))
      ));
      setForbidden(prev => {
        const next = { ...prev };
        changed.forEach(role => { next[role] = Array.from(localForbidden[role] ?? []); });
        return next;
      });
      showMsg(setRulesMsg, `${changed.length} rol yadda saxlandı`);
    } catch (err) {
      showMsg(setRulesMsg, err?.response?.data?.message || err?.message || 'Xəta baş verdi', false);
    } finally {
      setRulesSaving(false);
    }
  };

  // filter uses the filterRole column for allowed/forbidden filter
  const filteredRules = useMemo(() => rules.filter(rule => {
    if (rulesFilter === 'allowed' && isForbidden(filterRole, rule.id)) return false;
    if (rulesFilter === 'forbidden' && !isForbidden(filterRole, rule.id)) return false;
    const q = rulesSearch.toLowerCase().trim();
    if (!q) return true;
    return rule.name?.toLowerCase().includes(q) || rule.description?.toLowerCase().includes(q) || String(rule.id).includes(q);
  }), [rules, rulesFilter, rulesSearch, filterRole, localForbidden]);

  // ══════════════════════════════════════════════════════════════════════════
  // API PERMISSIONS STATE
  // ══════════════════════════════════════════════════════════════════════════
  const [endpoints, setEndpoints] = useState([]);
  const [localPerms, setLocalPerms] = useState({});
  const [apiSearch, setApiSearch] = useState('');
  const [apiCtrl, setApiCtrl] = useState('all');
  const [apiLoading, setApiLoading] = useState(true);
  const [apiSaving, setApiSaving] = useState(false);
  const [changedRoles, setChangedRoles] = useState(new Set());
  const [apiMsg, setApiMsg] = useState({ msg: '', ok: true });

  const fetchApi = useCallback(async () => {
    try {
      setApiLoading(true);
      const res = await PermissionService.getPermissions();
      const data = res?.data ?? res;
      setEndpoints(data?.available_endpoints ?? []);
      const rp = data?.role_permissions ?? {};
      const copy = {};
      Object.keys(rp).forEach(r => { copy[r] = [...rp[r]]; });
      setLocalPerms(copy);
      setChangedRoles(new Set());
    } catch (err) {
      showMsg(setApiMsg, err?.response?.data?.message || err?.message || 'API icazələri yüklənərkən xəta', false);
    } finally {
      setApiLoading(false);
    }
  }, []);

  const isChecked = useCallback((rolePerms, ep) => {
    if (!rolePerms) return false;
    return rolePerms.includes('*') ? !rolePerms.includes(`!${ep}`) : rolePerms.includes(ep);
  }, []);

  const toggleEp = useCallback((role, ep) => {
    setLocalPerms(prev => {
      const cur = [...(prev[role] ?? [])];
      const wild = cur.includes('*');
      const ex = `!${ep}`;
      const next = wild
        ? (cur.includes(ex) ? cur.filter(p => p !== ex) : [...cur, ex])
        : (cur.includes(ep) ? cur.filter(p => p !== ep) : [...cur, ep]);
      return { ...prev, [role]: next };
    });
    setChangedRoles(prev => { const n = new Set(prev); n.add(role); return n; });
  }, []);

  const saveApi = async () => {
    if (!changedRoles.size) return;
    try {
      setApiSaving(true);
      await Promise.all(Array.from(changedRoles).map(role =>
        PermissionService.updatePermission(role, localPerms[role] ?? [])
      ));
      setChangedRoles(new Set());
      showMsg(setApiMsg, 'API icazələri yadda saxlandı');
    } catch (err) {
      showMsg(setApiMsg, err?.response?.data?.message || err?.message || 'Xəta baş verdi', false);
    } finally {
      setApiSaving(false);
    }
  };

  const filteredEps = useMemo(() => endpoints.filter(ep => {
    const ctrl = ep.split('/')[0];
    if (apiCtrl !== 'all' && ctrl !== apiCtrl) return false;
    const q = apiSearch.toLowerCase().trim();
    if (!q) return true;
    return ep.toLowerCase().includes(q)
      || CUSTOM_DESCRIPTIONS[ep]?.toLowerCase().includes(q)
      || CONTROLLER_NAMES[ctrl]?.toLowerCase().includes(q);
  }), [endpoints, apiCtrl, apiSearch]);

  const uniqueCtrls = useMemo(() => [...new Set(endpoints.map(ep => ep.split('/')[0]))], [endpoints]);

  useEffect(() => { fetchRules(); fetchApi(); }, [fetchRules, fetchApi]);

  // ══════════════════════════════════════════════════════════════════════════
  // HOME GRID
  // ══════════════════════════════════════════════════════════════════════════
  if (!section) {
    const cards = [
      { key: 'api', label: 'API Səlahiyyətləri', count: endpoints.length, unit: 'metod', color: '#7C3AED', dot: changedRoles.size > 0 },
      { key: 'rules', label: 'İnterfeys Qaydaları', count: rules.length, unit: 'qayda', color: '#0284C7', dot: anyRulesChanged },
    ];
    return (
      <div style={pageWrap}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {cards.map(c => (
            <div key={c.key} onClick={() => openSection(c.key)} style={{
              background: surf, border: `1px solid ${bord}`,
              borderLeft: `4px solid ${c.color}`, borderRadius: 12,
              padding: '16px 12px', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              minHeight: 95, boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600, color: cardTxt, fontSize: 14 }}>{c.label}</span>
                {c.dot && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />}
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: c.count > 0 ? c.color : muted, marginTop: 8 }}>
                {c.count}
                <span style={{ fontSize: 12, fontWeight: 400, color: muted, marginLeft: 5 }}>{c.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SHARED TABLE CONTROLS BAR
  // ══════════════════════════════════════════════════════════════════════════
  const ControlBar = ({ onRefresh, loading, onSave, saving, noChanges, search, onSearch, searchPlaceholder, children }) => (
    <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap', alignItems: 'center' }}>
      <input
        style={{
          flex: 1, minWidth: 130, padding: '8px 12px', borderRadius: 8,
          border: `1px solid ${bord}`, background: surf,
          fontSize: 13, color: appTxt, outline: 'none', boxSizing: 'border-box',
        }}
        placeholder={searchPlaceholder}
        value={search}
        onChange={e => onSearch(e.target.value)}
      />
      {children}
      <Btn variant="outline" onClick={onRefresh} disabled={loading}>
        <RefreshCw size={13} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
      </Btn>
      <Btn onClick={onSave} disabled={saving || noChanges}>
        <Save size={13} /> Saxla
      </Btn>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // API SECTION
  // ══════════════════════════════════════════════════════════════════════════
  if (section === 'api') {
    return (
      <div style={pageWrap}>
        <InfoBanner {...apiMsg} />

        {changedRoles.size > 0 && (
          <Card style={{ background: cardBg, border: `1px solid ${bord}`, borderRadius: 10, marginBottom: 10, padding: 0 }}>
            <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#7C3AED' }}>
                <AlertCircle size={14} />
                <span>{changedRoles.size} rolda dəyişiklik var</span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <Btn variant="outline" small onClick={fetchApi} disabled={apiSaving}>Geri</Btn>
                <Btn small onClick={saveApi} disabled={apiSaving}>
                  {apiSaving ? <RefreshCw size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={12} />} Saxla
                </Btn>
              </div>
            </div>
          </Card>
        )}

        <ControlBar
          onRefresh={fetchApi} loading={apiLoading}
          onSave={saveApi} saving={apiSaving} noChanges={!changedRoles.size}
          search={apiSearch} onSearch={setApiSearch} searchPlaceholder="API axtar..."
        >
          <select style={{ padding: '8px 10px', borderRadius: 8, border: `1px solid ${bord}`, background: surf, fontSize: 13, color: appTxt, outline: 'none' }}
            value={apiCtrl} onChange={e => setApiCtrl(e.target.value)}>
            <option value="all">Bütün modullar</option>
            {uniqueCtrls.map(c => <option key={c} value={c}>{CONTROLLER_NAMES[c] || c}</option>)}
          </select>
        </ControlBar>

        {!apiLoading && (
          <div style={{ fontSize: 11, color: muted, marginBottom: 8 }}>
            {endpoints.length} metod · {filteredEps.length} göstərilir
          </div>
        )}

        <Card style={{ background: cardBg, border: `1px solid ${bord}`, borderRadius: 12, padding: 0, overflow: 'hidden' }}>
          {apiLoading ? (
            <div style={{ padding: 32, textAlign: 'center', color: muted }}>
              <DotLoading color="primary" />
              <div style={{ marginTop: 8, fontSize: 13 }}>Yüklənir...</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr>
                    <th style={TH({ minWidth: 180 })}>İcazə / API Metodu</th>
                    <th style={TH({ minWidth: 150 })}>Təsvir</th>
                    {ROLES.map(r => (
                      <th key={r} style={TH({ textAlign: 'center', minWidth: 72 })}>{ROLE_LABELS[r]}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredEps.length === 0 ? (
                    <tr><td colSpan={2 + ROLES.length} style={{ padding: 24, textAlign: 'center', color: muted, fontSize: 13 }}>
                      Heç bir API metodu tapılmadı.
                    </td></tr>
                  ) : filteredEps.map((ep, i) => {
                    const ctrl = ep.split('/')[0];
                    return (
                      <tr key={ep} style={{ borderBottom: i < filteredEps.length - 1 ? `1px solid ${bord}` : 'none' }}>
                        <td style={TD()}>
                          <span style={{
                            display: 'inline-block', padding: '2px 6px', borderRadius: 4,
                            background: surf, color: muted, fontSize: 10,
                            fontWeight: 700, textTransform: 'uppercase', marginRight: 5,
                          }}>{CONTROLLER_NAMES[ctrl] || ctrl}</span>
                          <span style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 11, color: cardTxt }}>{ep}</span>
                        </td>
                        <td style={TD({ fontSize: 11, color: muted })}>
                          {CUSTOM_DESCRIPTIONS[ep]
                            ? <span style={{ color: cardTxt }}>{CUSTOM_DESCRIPTIONS[ep]}</span>
                            : <span style={{ fontStyle: 'italic', opacity: 0.55 }}>/{ep}</span>}
                        </td>
                        {ROLES.map(r => (
                          <td key={r} style={TD({ textAlign: 'center' })}>
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                              <Chk
                                checked={isChecked(localPerms[r], ep)}
                                disabled={r === 'su'}
                                onChange={() => toggleEp(r, ep)}
                              />
                            </div>
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // RULES SECTION — same multi-role column table
  // Columns: İcazə/İnterfeys Qaydası | Sistem Kodu/ID | SU | Super Admin | Admin | Partnyor | Operator
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div style={pageWrap}>
      <InfoBanner {...rulesMsg} />

      {anyRulesChanged && (
        <Card style={{ background: cardBg, border: `1px solid ${bord}`, borderRadius: 10, marginBottom: 10, padding: 0 }}>
          <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#ef4444' }}>
              <AlertCircle size={14} />
              <span>Yadda saxlanılmamış dəyişikliklər var</span>
            </div>
            <Btn small onClick={saveRules} disabled={rulesSaving}>İndi Saxla</Btn>
          </div>
        </Card>
      )}

      {/* Stats */}
      {!rulesLoading && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
          <span style={{ background: surf, color: muted, padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600 }}>
            {rules.length} qayda
          </span>
        </div>
      )}

      <ControlBar
        onRefresh={fetchRules} loading={rulesLoading}
        onSave={saveRules} saving={rulesSaving} noChanges={!anyRulesChanged}
        search={rulesSearch} onSearch={setRulesSearch} searchPlaceholder="Qaydalarda axtar..."
      >
        {/* filter pills inside control bar */}
        <div style={{ display: 'flex', gap: 5 }}>
          {[{ v: 'all', l: 'Hamısı' }, { v: 'allowed', l: 'İcazəli' }, { v: 'forbidden', l: 'İcazəsiz' }].map(f => (
            <button key={f.v} onClick={() => setRulesFilter(f.v)} style={{
              padding: '6px 11px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              border: `1px solid ${rulesFilter === f.v ? '#7C3AED' : bord}`,
              background: rulesFilter === f.v ? '#7C3AED' : cardBg,
              color: rulesFilter === f.v ? '#fff' : appTxt,
            }}>{f.l}</button>
          ))}
        </div>
        {/* role selector for filter */}
        <select style={{ padding: '8px 10px', borderRadius: 8, border: `1px solid ${bord}`, background: surf, fontSize: 12, color: appTxt, outline: 'none' }}
          value={filterRole} onChange={e => setFilterRole(e.target.value)}>
          {ROLES.filter(r => r !== 'su').map(r => (
            <option key={r} value={r}>{ROLE_LABELS[r]}</option>
          ))}
        </select>
      </ControlBar>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {rulesLoading ? (
          <Card style={{ background: cardBg, border: `1px solid ${bord}`, borderRadius: 12, padding: 32, textAlign: 'center', color: muted }}>
            <DotLoading color="primary" />
            <div style={{ marginTop: 8, fontSize: 13 }}>Yüklənir...</div>
          </Card>
        ) : filteredRules.length === 0 ? (
          <Card style={{ background: cardBg, border: `1px solid ${bord}`, borderRadius: 12, padding: 24, textAlign: 'center', color: muted, fontSize: 13 }}>
            Heç bir qayda tapılmadı.
          </Card>
        ) : (
          filteredRules.map((rule) => (
            <Card key={rule.id} style={{ background: cardBg, border: `1px solid ${bord}`, borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
                <div style={{ fontWeight: 600, color: cardTxt, fontSize: 14 }}>{rule.name}</div>
                <div style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'monospace', color: muted, wordBreak: 'break-all' }}>{rule.description}</span>
                  <span style={{
                    padding: '2px 6px', borderRadius: 4,
                    background: surf, color: muted, fontSize: 10, fontWeight: 700,
                  }}>#{rule.id}</span>
                </div>
              </div>
              <div style={{ 
                display: 'grid', gridTemplateColumns: `repeat(${ROLES.length}, 1fr)`, gap: 8,
                background: surf, padding: 12, borderRadius: 8, border: `1px solid ${bord}`
              }}>
                {ROLES.map(r => (
                  <div key={r} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 10, color: muted, fontWeight: 600, textAlign: 'center', lineHeight: 1.2, whiteSpace: 'pre-line' }}>
                      {ROLE_LABELS[r].replace(' ', '\n')}
                    </span>
                    <Chk
                      checked={!isForbidden(r, rule.id)}
                      disabled={r === 'su'}
                      onChange={() => toggleRule(r, rule.id)}
                    />
                  </div>
                ))}
              </div>
            </Card>
          ))
        )}
      </div>

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

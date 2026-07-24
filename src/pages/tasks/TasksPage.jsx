import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DotLoading } from 'antd-mobile';

import { useNavBarContext } from '../../components/NavBarContext.jsx';
import { taskList } from '../../services/taskList.service.js';
import { getCurrentUser } from '../../services/auth.services.js';
import { BASE_CATEGORIES } from '../../constants/TaskCategories.jsx';

import { matchesSearch, normalizeStatus, PROJECTS } from './taskUtils.js';
import TaskCategoryGrid, { ViewModeTabs } from './TaskCategoryGrid.jsx';
import {
  TaskList,
  GlobalSearchResults,
} from './TaskComponents.jsx';
import TaskAddModal from './TaskAddModal.jsx';
import TaskEditModal from './TaskEditModal.jsx';
import TaskFilterModal from './TaskFilterModal.jsx';
import { FiFilter } from 'react-icons/fi';

// ─── Data helpers ─────────────────────────────────────────────────────────────
const normalizeTasks = (res) => {
  if (res?.status === 'success') return res.data || [];
  if (Array.isArray(res))        return res;
  if (Array.isArray(res?.data))  return res.data;
  return [];
};

// ─── TasksPage ────────────────────────────────────────────────────────────────
const TasksPage = () => {
  const { query, setQuery, setTitle, setShowBack, setShowSearch, setExtraNavNode } = useNavBarContext();

  const [tasks,        setTasks]        = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isAddOpen,    setIsAddOpen]    = useState(false);
  const [taskViewMode, setTaskViewMode] = useState('all');

  // Filter state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ status: 'ALL', createdAt: '', updatedAt: '' });

  // URL-based category
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory    = searchParams.get('cat');
  const selectedCategoryKey = selectedCategory?.toLowerCase();

  // ── Navbar Extra Icon ──────────────────────────────────────────────────────
  useEffect(() => {
    const hasActiveFilter = filters.status !== 'ALL' || filters.createdAt || filters.updatedAt;
    
    setExtraNavNode(
      <button
        onClick={() => setIsFilterOpen(true)}
        aria-label="Filter"
        style={{
          width: 34, height: 34, borderRadius: 8, border: "1px solid var(--border)",
          background: hasActiveFilter ? 'var(--tab-active-bg)' : 'var(--tab-passive-bg)',
          color: hasActiveFilter ? '#fff' : 'inherit',
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", marginLeft: 8, padding: 0
        }}
      >
        <FiFilter size={18} />
      </button>
    );
    return () => setExtraNavNode(null);
  }, [setExtraNavNode, filters]);

  // ── NavBar title/back/search sync ──────────────────────────────────────────
  useEffect(() => {
    if (selectedCategoryKey) {
      const allCats = [...BASE_CATEGORIES, { key: 'OTHER', title: 'Digər' }];
      const catObj  = allCats.find((c) => c.key === selectedCategoryKey);
      setTitle(catObj ? catObj.title : 'Tapşırıqlar');
      setShowBack(true);
      setShowSearch(true);
      setQuery('');
    } else {
      setTitle('Tapşırıqlar');
      setShowBack(false);
      setShowSearch(false);
    }
    return () => setTitle('');
  }, [selectedCategoryKey, setQuery, setTitle, setShowBack, setShowSearch]);

  useEffect(() => () => { setShowSearch(false); setQuery(''); }, [setQuery, setShowSearch]);

  // ── Data fetching ──────────────────────────────────────────────────────────
  const fetchAll = async () => {
    try {
      setLoading(true);
      setTasks(normalizeTasks(await taskList()));
    } catch (err) {
      console.error('Tapşırıqlar yüklənərkən xəta:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMine = async () => {
    try {
      setLoading(true);
      const userRes = await getCurrentUser();
      const meId    = userRes?.data?.identifier || userRes?.identifier;
      setTasks(meId ? normalizeTasks(await taskList(meId)) : []);
    } catch (err) {
      console.error('Mənim tapşırıqlarım yüklənərkən xəta:', err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (taskViewMode === 'all')     fetchAll();
    else if (taskViewMode === 'account') fetchMine();
  }, [taskViewMode]);

  // ── Derived data ───────────────────────────────────────────────────────────
  const normalizedQuery = (query || '').trim().toLowerCase();

  const isDateMatch = (taskDateStr, filterDateStr) => {
    if (!filterDateStr) return true;
    if (!taskDateStr) return false;
    return taskDateStr.startsWith(filterDateStr);
  };

  const passesFilters = (t) => {
    if (filters.status !== 'ALL') {
      if (normalizeStatus(t.status || t.stage || t.state) !== filters.status.toLowerCase()) {
        return false;
      }
    }
    if (filters.createdAt && !isDateMatch(t.created_at, filters.createdAt)) return false;
    if (filters.updatedAt && !isDateMatch(t.updated_at, filters.updatedAt)) return false;
    return true;
  };

  // tasks filtered to current category
  const categoryTasks = tasks.filter(
    (t) => normalizeStatus(t.status || t.stage || t.state) === selectedCategoryKey,
  );
  const visibleTasks = categoryTasks.filter((t) => matchesSearch(t, normalizedQuery) && passesFilters(t));

  const hasActiveFilter = filters.status !== 'ALL' || filters.createdAt || filters.updatedAt;

  // global search across all tasks (only when no category selected)
  const globalResults =
    (normalizedQuery || hasActiveFilter) && !selectedCategoryKey ? tasks.filter((t) => matchesSearch(t, normalizedQuery) && passesFilters(t)) : [];

  // callback after priority update in a TaskCard
  const handleTaskUpdate = (updated) =>
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0', color: 'var(--muted-text)' }}>
        <DotLoading color="primary" />
        <span style={{ marginLeft: 8, fontSize: 14 }}>Yüklənir...</span>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <div style={{
        padding: 12,
        paddingBottom: 'calc(84px + env(safe-area-inset-bottom))',
        minHeight: '100vh',
        background: 'var(--app-bg)',
        color: 'var(--app-text)',
      }}>

        {/* View-mode tab switcher (only on overview) */}
        {!selectedCategoryKey && (
          <ViewModeTabs taskViewMode={taskViewMode} onChangeMode={setTaskViewMode} />
        )}

        {!selectedCategoryKey ? (
          /* ── Overview: search results OR category grid ── */
          (normalizedQuery || hasActiveFilter) ? (
            globalResults.length > 0 ? (
              <GlobalSearchResults tasks={globalResults} onTaskClick={setSelectedTask} />
            ) : (
              <div style={{
                padding: '40px 12px', color: 'var(--muted-text)', textAlign: 'center',
                fontSize: '14px', background: 'var(--surface-bg)', borderRadius: '8px',
              }}>
                Nəticə tapılmadı
              </div>
            )
          ) : (
            <TaskCategoryGrid
              tasks={tasks}
              onAddTask={() => setIsAddOpen(true)}
              onSelectCategory={(key) => setSearchParams({ cat: key })}
            />
          )
        ) : (
          /* ── Category detail: filtered task list ── */
          <TaskList
            tasks={visibleTasks}
            onTaskClick={setSelectedTask}
            onTaskUpdate={handleTaskUpdate}
            showCopyLink={selectedCategoryKey === 'done'}
            emptyText={taskViewMode === 'account' ? 'Məlumat Tapılmadı' : 'Bu bölmədə tapşırıq tapılmadı.'}
          />
        )}
      </div>

      {/* ── Modals ── */}
      <TaskAddModal
        isAddModalVisible={isAddOpen}
        setIsAddModalVisible={setIsAddOpen}
        setTasks={setTasks}
        setLoading={setLoading}
        projects={PROJECTS}
      />

      <TaskEditModal
        selectedTask={selectedTask}
        setSelectedTask={setSelectedTask}
        setTasks={setTasks}
        projects={PROJECTS}
        uniqueOperators={Array.from(new Set(tasks.map((t) => t.operator).filter(Boolean)))}
      />

      <TaskFilterModal
        visible={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        setFilters={setFilters}
      />
    </>
  );
};

export default TasksPage;

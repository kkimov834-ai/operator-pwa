import { AiFillCloseCircle, AiOutlinePlus, AiOutlineArrowRight } from 'react-icons/ai';
import { BASE_CATEGORIES } from '../../constants/TaskCategories.jsx';
import { STATUS_COLORS } from './taskUtils.js';

/** Tab switcher between "Bütün Tapşırıqlar" and "Mənim" */
function ViewModeTabs({ taskViewMode, onChangeMode }) {
  const tab = (mode, label) => (
    <div
      onClick={() => onChangeMode(mode)}
      style={{
        flex: 1, textAlign: 'center', padding: '10px 0', borderRadius: 9,
        background: taskViewMode === mode ? 'var(--card-bg)' : 'transparent',
        color:      taskViewMode === mode ? 'var(--app-text)' : 'var(--muted-text)',
        fontWeight: taskViewMode === mode ? 600 : 400,
        boxShadow:  taskViewMode === mode ? '0 4px 10px rgba(15,23,42,0.10)' : 'none',
        cursor: 'pointer', transition: 'all 0.2s',
      }}
    >
      {label}
    </div>
  );

  return (
    <div className="tasks-view-tabs" style={{
      background: 'var(--card-bg)', padding: 12, borderRadius: 12,
      marginBottom: 16, border: '1px solid var(--border)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    }}>
      <div className="tasks-view-tabs-track" style={{ display: 'flex', gap: 8, background: 'var(--surface-bg)', padding: 4, borderRadius: 8 }}>
        {tab('all', 'Bütün Tapşırıqlar')}
        {tab('account', 'Mənim')}
      </div>
    </div>
  );
}

/** "Add task" tile + one tile per status category */
export default function TaskCategoryGrid({ tasks, onAddTask, onSelectCategory }) {
  const getCount = (key) =>
    tasks.filter((t) => {
      const s = (t.status || t.stage || t.state || '').toString().toLowerCase().trim();
      return s === key;
    }).length;

  const otherCount = tasks.filter((t) => {
    const s = (t.status || t.stage || t.state || '').toString().toUpperCase().trim();
    const known = [...BASE_CATEGORIES.map((c) => c.key.toUpperCase()), 'TRIAGE', 'BACKLOG',
      'DISCUSSION', 'REJECT', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE',
      'ACCEPT', 'CANCELLED', 'DUPLICATE'];
    return !known.includes(s);
  }).length;

  const displayCats = [...BASE_CATEGORIES];
  if (otherCount > 0) {
    displayCats.push({
      key: 'OTHER',
      title: 'Digər',
      icon: (
        <AiFillCloseCircle style={{
          background: '#6B7280', color: '#FFFFFF', borderRadius: '50%',
          padding: '4px', fontSize: '24px', display: 'inline-flex',
          alignItems: 'center', justifyContent: 'center',
          width: '32px', height: '32px',
        }} />
      ),
    });
  }

  return (
    <div className="task-category-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      {/* Add Task tile */}
      <div
        className="task-category-card task-category-card-add"
        onClick={onAddTask}
        style={{
          background: 'var(--surface-bg)', border: '1px dashed var(--tab-active-bg)',
          borderRadius: '12px', padding: '16px 12px', cursor: 'pointer',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          alignItems: 'center', minHeight: '95px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
        }}
      >
        <div style={{
          background: 'var(--tab-active-bg)', color: '#fff', borderRadius: '50%',
          width: 36, height: 36, display: 'flex', alignItems: 'center',
          justifyContent: 'center', marginBottom: 8,
        }}>
          <AiOutlinePlus size={20} />
        </div>
        <span style={{ fontWeight: 600, color: 'var(--tab-active-bg)', fontSize: '14px' }}>
          Tapşırıq Əlavə Et
        </span>
        <span className="task-category-card-hint">Yeni iş axını başlat</span>
      </div>

      {displayCats.map((cat) => {
        const count = getCount(cat.key.toLowerCase());
        const sc = STATUS_COLORS[cat.key] || STATUS_COLORS.OTHER;
        if (count === 0) return null;
        return (
          <div
            className="task-category-card"
            key={cat.key}
            onClick={() => onSelectCategory(cat.key)}
            style={{
              '--category-color': sc.text,
              '--category-soft': sc.bg,
              background: 'var(--card-bg)', border: `1px solid ${sc.border}`,
              borderTop: `3px solid ${sc.text}`, borderRadius: '12px',
              padding: '16px 12px', cursor: 'pointer', display: 'flex',
              flexDirection: 'column', justifyContent: 'space-between',
              minHeight: '95px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            }}
          >
            <div className="task-category-card-top">
              <span className="task-category-icon">{cat.icon}</span>
              <span className="task-category-title">
                {cat.title}
              </span>
              <AiOutlineArrowRight className="task-category-arrow" size={16} />
            </div>
            <div className="task-category-card-bottom">
              <span className="task-category-label">Açıq tapşırıqlar</span>
              <strong className="task-category-count">{count}</strong>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export { ViewModeTabs };

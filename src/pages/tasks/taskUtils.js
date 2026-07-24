import { BASE_CATEGORIES } from '../../constants/TaskCategories.jsx';

// ── Status normalizer ────────────────────────────────────────────────────────
export const normalizeStatus = (statusStr) => {
  if (!statusStr) return 'OTHER';
  const cleaned = statusStr.toString().toUpperCase().trim();
  const map = {
    TRIAGE: 'triage', BACKLOG: 'backlog', DISCUSSION: 'discussion',
    REJECT: 'reject', TODO: 'todo', IN_PROGRESS: 'in_progress',
    IN_REVIEW: 'in_review', DONE: 'done', ACCEPT: 'accept',
    CANCELLED: 'cancelled', DUPLICATE: 'duplicate',
  };
  if (map[cleaned]) return map[cleaned];
  return BASE_CATEGORIES.some((c) => c.key === cleaned.toLowerCase())
    ? cleaned.toLowerCase()
    : 'OTHER';
};

// ── Status color palette ─────────────────────────────────────────────────────
export const STATUS_COLORS = {
  triage:      { bg: 'rgba(255,115,54,0.12)',  text: '#FF7336', border: 'rgba(255,115,54,0.3)' },
  backlog:     { bg: 'rgba(108,110,113,0.12)', text: '#8E9196', border: 'rgba(108,110,113,0.3)' },
  discussion:  { bg: 'rgba(226,226,226,0.10)', text: '#B0B3B8', border: 'rgba(226,226,226,0.25)' },
  reject:      { bg: 'rgba(94,106,210,0.12)',  text: '#5E6AD2', border: 'rgba(94,106,210,0.3)' },
  todo:        { bg: 'rgba(226,226,226,0.10)', text: '#B0B3B8', border: 'rgba(226,226,226,0.25)' },
  in_progress: { bg: 'rgba(229,182,0,0.12)',   text: '#E5B600', border: 'rgba(229,182,0,0.3)' },
  in_review:   { bg: 'rgba(139,92,246,0.12)',  text: '#8B5CF6', border: 'rgba(139,92,246,0.3)' },
  done:        { bg: 'rgba(38,166,68,0.12)',   text: '#26A644', border: 'rgba(38,166,68,0.3)' },
  accept:      { bg: 'rgba(14,165,233,0.12)',  text: '#0EA5E9', border: 'rgba(14,165,233,0.3)' },
  cancelled:   { bg: 'rgba(94,106,210,0.12)',  text: '#5E6AD2', border: 'rgba(94,106,210,0.3)' },
  duplicate:   { bg: 'rgba(156,163,175,0.12)', text: '#9CA3AF', border: 'rgba(156,163,175,0.3)' },
  OTHER:       { bg: 'rgba(107,114,128,0.12)', text: '#6B7280', border: 'rgba(107,114,128,0.3)' },
};

export const getStatusColor = (task) => {
  const key = normalizeStatus(task.status || task.stage || task.state);
  return STATUS_COLORS[key] || STATUS_COLORS.OTHER;
};

export const getStatusLabel = (task) => {
  const key = normalizeStatus(task.status || task.stage || task.state);
  const allCats = [...BASE_CATEGORIES, { key: 'OTHER', title: 'Digər' }];
  const cat = allCats.find((c) => c.key === key);
  return cat ? cat.title : (task.status || task.stage || task.state || '-');
};

// ── Task field helpers ───────────────────────────────────────────────────────
export const getTaskId       = (task) => task.id || task.task_id || task.linear_id || null;
export const getTaskPriority = (task) => task.priority != null ? task.priority.toString() : '0';
export const getTaskUrl      = (task) => `${window.location.origin}/tasks/${task.linear_id}`;

// ── Full-text search ─────────────────────────────────────────────────────────
export const matchesSearch = (task, normalizedQuery) => {
  if (!normalizedQuery) return true;
  const text = [
    task.title, task.name, task.description, task.linear_id, task.id, task.task_id,
    task.account, task.account_id, task.operator, task.operator_id,
    task.status, task.stage, task.state, task.project,
    task.priority != null ? String(task.priority) : null,
    task.category, task.type, task.label, task.tag,
    Array.isArray(task.tags)   ? task.tags.join(' ')   : task.tags,
    Array.isArray(task.labels) ? task.labels.join(' ') : task.labels,
    task.created_at, task.updated_at, task.due_date,
    task.assignee, task.reporter, task.creator,
    task.note, task.comment,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return text.includes(normalizedQuery);
};

export const PROJECTS = [
  'Akul Admin', 'Akul Pos', 'Akul Pwa', 'Akul Mobile',
  'Akul Counting', 'Dine Admin', 'Dine Pos', 'Dine Pwa',
  'Dine Qr', 'Umumi',
];

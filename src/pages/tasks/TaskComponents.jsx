import { useState } from 'react';
import { Button, Card, Toast } from 'antd-mobile';
import { AiOutlineCopy } from 'react-icons/ai';
import { PRIORITY_ICONS, TaskPriority } from '../../constants/TaskPriority.jsx';
import { updateTaskPriority } from '../../services/taskList.service.js';
import {
  getStatusColor, getStatusLabel,
  getTaskId, getTaskPriority,
} from './taskUtils.js';

/** Colored status badge */
function StatusBadge({ task }) {
  const sc = getStatusColor(task);
  return (
    <span style={{
      padding: '3px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700,
      background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`,
      whiteSpace: 'nowrap',
    }}>
      {getStatusLabel(task)}
    </span>
  );
}

/** Inline priority editor that pops up below the priority badge */
function PriorityEditor({ task, onPriorityChange, isEditing, onToggle }) {
  return (
    <div 
      onClick={(e) => e.stopPropagation()}
      style={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', gap: 4 }}
    >
      <span
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}
      >
        <TaskPriority value={getTaskPriority(task)} />
      </span>
      {isEditing && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, zIndex: 10,
          display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4, padding: '8px',
          background: 'var(--surface-bg)', border: '1px solid var(--border)',
          borderRadius: 12, boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
        }}>
          {PRIORITY_ICONS.map((p) => (
            <button
              key={p.value}
              onClick={(e) => { e.stopPropagation(); onPriorityChange(p.value); }}
              title={p.label}
              style={{
                border: '1px solid var(--border)', borderRadius: 999, padding: '8px',
                background: 'var(--app-bg)', color: 'var(--app-text)', fontSize: 12,
                cursor: 'pointer', display: 'inline-flex', alignItems: 'center',
                justifyContent: 'center', width: 36, height: 36,
              }}
            >
              {p.icon}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Small pill chip for operator / account / linear-id */
function Chip({ children }) {
  return (
    <span style={{
      padding: '4px 8px', borderRadius: 999,
      background: 'var(--surface-bg)', color: 'var(--card-text-secondary)',
      fontSize: 12, fontWeight: 600, wordBreak: 'break-word',
    }}>
      {children}
    </span>
  );
}

/** Single task card with copy-link, priority editor, status badge */
export function TaskCard({ task, onTaskClick, showCopyLink, onTaskUpdate, extraContent }) {
  const [editingPriority, setEditingPriority] = useState(false);
  const sc = getStatusColor(task);

  const copyLink = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/tasks/${task.linear_id}`);
      Toast.show({ content: 'Link kopyalandı' });
    } catch {
      Toast.show({ content: 'Link kopyalanmadı' });
    }
  };

  const handlePriorityChange = async (priority) => {
    const id = getTaskId(task);
    const linearId = task.linear_id;
    if (!id || !linearId) {
      Toast.show({ content: 'Tapşırıq ID-si (Linear ID) tapılmadı' });
      return;
    }
    Toast.show({ icon: 'loading', content: 'Yenilənir...', duration: 0 });
    try {
      await updateTaskPriority({ linear_id: linearId, priority: Number(priority) });
      onTaskUpdate?.({ ...task, priority });
      setEditingPriority(false);
      Toast.clear();
      Toast.show({ icon: 'success', content: 'Prioritet dəyişdirildi' });
    } catch {
      Toast.clear();
      Toast.show({ icon: 'fail', content: 'Xəta baş verdi' });
    }
  };

  return (
    <Card
      onClick={() => onTaskClick(task)}
      title={
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Title row */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8,
            width: '100%'
          }}>
            <div style={{
              display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8,
              color: 'var(--card-text)', fontWeight: 700, fontSize: 15,
              lineHeight: 1.35, wordBreak: 'break-word', flex: 1
            }}>
              {task.title}
              {showCopyLink && (
                <Button
                  size="mini"
                  onClick={copyLink}
                  aria-label="Linki kopyala"
                  style={{
                    borderRadius: 999, border: '1px solid var(--border)',
                    background: 'var(--surface-bg)', color: 'var(--card-text)',
                    width: 32, height: 32, padding: 0, display: 'inline-flex',
                    alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <AiOutlineCopy />
                </Button>
              )}
            </div>
            {extraContent && (
              <div style={{ flexShrink: 0 }}>
                {extraContent}
              </div>
            )}
          </div>

          {/* Meta chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <StatusBadge task={task} />
            {task.operator && <Chip>Operator: {task.operator}</Chip>}
            {task.account && <Chip>Account: {task.account}</Chip>}
            {task.linear_id && <Chip>Linear ID: {task.linear_id}</Chip>}
            {(task.environment || task.env) && <Chip>Env: {(task.environment || task.env).toString().toUpperCase()}</Chip>}
            <PriorityEditor
              task={task}
              isEditing={editingPriority}
              onToggle={() => setEditingPriority((p) => !p)}
              onPriorityChange={handlePriorityChange}
            />
          </div>
        </div>
      }
      style={{
        background: 'var(--card-bg)',
        border: `1px solid ${sc.border}`,
        borderLeft: `4px solid ${sc.text}`,
        borderRadius: 8,
      }}
    >
      {task.description && (
        <div style={{
          marginTop: 8, color: 'var(--card-text-secondary)',
          fontSize: '14px', lineHeight: '1.6', wordBreak: 'break-word',
        }}>
          {task.description}
        </div>
      )}
    </Card>
  );
}

/** Full list of task cards filtered by search */
export function TaskList({ tasks, onTaskClick, onTaskUpdate, showCopyLink, emptyText }) {
  if (tasks.length === 0) {
    return (
      <div style={{
        padding: '40px 12px', color: 'var(--muted-text)', textAlign: 'center',
        fontSize: '14px', background: 'var(--surface-bg)', borderRadius: '8px',
      }}>
        {emptyText || 'Bu bölmədə tapşırıq tapılmadı.'}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {tasks.map((task) => (
        <TaskCard
          key={getTaskId(task) || Math.random()}
          task={task}
          onTaskClick={onTaskClick}
          showCopyLink={showCopyLink}
          onTaskUpdate={onTaskUpdate}
        />
      ))}
    </div>
  );
}

/** Compact search-result card (used in global search view) */
export function SearchResultCard({ task, onClick }) {
  const sc = getStatusColor(task);
  return (
    <div
      onClick={() => onClick(task)}
      style={{
        background: 'var(--card-bg)', border: `1px solid ${sc.border}`,
        borderLeft: `4px solid ${sc.text}`, borderRadius: '10px',
        padding: '12px 14px', cursor: 'pointer',
        boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--card-text)', wordBreak: 'break-word' }}>
          {task.title}
        </div>
        <StatusBadge task={task} />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
        {task.operator && (
          <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 12, background: 'var(--surface-bg)', color: 'var(--card-text-secondary)', border: '1px solid var(--border)' }}>
            Op: {task.operator}
          </span>
        )}
        {task.account && (
          <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 12, background: 'var(--surface-bg)', color: 'var(--card-text-secondary)', border: '1px solid var(--border)' }}>
            {task.account}
          </span>
        )}
        {task.linear_id && (
          <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 12, background: 'var(--surface-bg)', color: 'var(--card-text-secondary)', border: '1px solid var(--border)' }}>
            {task.linear_id}
          </span>
        )}
        <TaskPriority value={getTaskPriority(task)} />
      </div>

      {task.description && (
        <div style={{
          fontSize: 12, color: 'var(--card-text-secondary)', marginTop: 6,
          wordBreak: 'break-word', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {task.description}
        </div>
      )}
    </div>
  );
}

/** Global search results list */
export function GlobalSearchResults({ tasks, onTaskClick }) {
  if (tasks.length === 0) {
    return (
      <div style={{
        padding: '40px 12px', color: 'var(--muted-text)', textAlign: 'center',
        fontSize: '14px', background: 'var(--surface-bg)', borderRadius: '8px',
      }}>
        Nəticə tapılmadı
      </div>
    );
  }

  return (
    <div>
      <div style={{ fontSize: 13, color: 'var(--muted-text)', marginBottom: 10, fontWeight: 500 }}>
        {tasks.length} nəticə tapıldı
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {tasks.map((task) => (
          <SearchResultCard
            key={getTaskId(task) || Math.random()}
            task={task}
            onClick={onTaskClick}
          />
        ))}
      </div>
    </div>
  );
}

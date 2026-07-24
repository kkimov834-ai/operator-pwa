import { Popup, Button } from 'antd-mobile';
import { AiOutlineClose } from 'react-icons/ai';
import { BASE_CATEGORIES } from '../../constants/TaskCategories.jsx';

export default function TaskFilterModal({ visible, onClose, filters, setFilters }) {
  const handleClear = () => {
    setFilters({ status: 'ALL', createdAt: '', updatedAt: '' });
  };

  const isClearDisabled =
    filters.status === 'ALL' && !filters.createdAt && !filters.updatedAt;

  return (
    <Popup
      visible={visible}
      onMaskClick={onClose}
      position="right"
      bodyStyle={{
        width: '100vw',
        height: '100vh',
        background: 'var(--app-bg)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--nav-bg)',
          color: 'var(--nav-text)',
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 600 }}>Filterlər</div>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 4,
          }}
        >
          <AiOutlineClose size={24} />
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Status Filter */}
        <div>
          <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: 'var(--app-text)' }}>
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--input-bg)',
              color: 'var(--input-text)',
              fontSize: 14,
            }}
          >
            <option value="ALL">Bütün Statuslar</option>
            {BASE_CATEGORIES.map((cat) => (
              <option key={cat.key} value={cat.key}>
                {cat.title}
              </option>
            ))}
            <option value="OTHER">Digər</option>
          </select>
        </div>

        {/* Created At Filter */}
        <div>
          <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: 'var(--app-text)' }}>
            Yaradılma Tarixi
          </label>
          <input
            type="date"
            value={filters.createdAt}
            onChange={(e) => setFilters({ ...filters, createdAt: e.target.value })}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--input-bg)',
              color: 'var(--input-text)',
              boxSizing: 'border-box',
              fontSize: 14,
            }}
          />
        </div>

        {/* Updated At Filter */}
        <div>
          <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: 'var(--app-text)' }}>
            Son Yenilənmə Tarixi
          </label>
          <input
            type="date"
            value={filters.updatedAt}
            onChange={(e) => setFilters({ ...filters, updatedAt: e.target.value })}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--input-bg)',
              color: 'var(--input-text)',
              boxSizing: 'border-box',
              fontSize: 14,
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '16px',
          borderTop: '1px solid var(--border)',
          background: 'var(--card-bg)',
          display: 'flex',
          gap: 12,
          paddingBottom: 'calc(16px + env(safe-area-inset-bottom))',
        }}
      >
        <Button
          block
          disabled={isClearDisabled}
          onClick={handleClear}
          style={{
            flex: 1,
            background: 'var(--surface-bg)',
            color: isClearDisabled ? 'var(--muted-text)' : 'var(--app-text)',
            border: '1px solid var(--border)',
            borderRadius: 8,
          }}
        >
          Təmizlə
        </Button>
        <Button
          block
          color="primary"
          onClick={onClose}
          style={{
            flex: 1,
            borderRadius: 8,
          }}
        >
          Tətbiq et
        </Button>
      </div>
    </Popup>
  );
}

import { useState } from 'react';

export interface Tag {
  id: number;
  name: string;
  color: string;
}

export interface TagPickerProps {
  available: Tag[];
  selected: Tag[];
  onChange: (next: Tag[]) => void;
}

export function TagPicker({ available, selected, onChange }: TagPickerProps) {
  const [filter, setFilter] = useState('');
  const isSelected = (t: Tag) => selected.some((s) => s.id === t.id);
  const filtered = available.filter((t) =>
    t.name.toLowerCase().includes(filter.toLowerCase()),
  );

  function toggle(t: Tag) {
    if (isSelected(t)) onChange(selected.filter((s) => s.id !== t.id));
    else onChange([...selected, t]);
  }

  return (
    <div data-testid="tag-picker">
      <input
        type="text"
        placeholder="Filter tags"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        aria-label="filter tags"
        style={{ marginBottom: 8, padding: 4, width: '100%', boxSizing: 'border-box' }}
      />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {filtered.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => toggle(t)}
            data-testid={`tag-${t.id}`}
            aria-pressed={isSelected(t)}
            style={{
              padding: '2px 8px',
              borderRadius: 999,
              border: `1px solid ${t.color}`,
              background: isSelected(t) ? t.color : 'transparent',
              color: isSelected(t) ? 'white' : t.color,
              cursor: 'pointer',
            }}
          >
            {t.name}
          </button>
        ))}
      </div>
    </div>
  );
}

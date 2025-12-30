import { useState } from 'react';

export interface ActionItem {
  id: string;
  label: string;
}

interface Props {
  actions: ActionItem[];
  onAction: (actionId: string) => void;
}

export default function ActionsMenu({ actions, onAction }: Props) {
  const [open, setOpen] = useState(false);

  if (!actions.length) {
    return null;
  }

  return (
    <div style={{ position: 'relative' }}>
      <button className="secondary" onClick={() => setOpen((value) => !value)}>Actions</button>
      {open && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 4px)',
            background: '#fff',
            borderRadius: '0.5rem',
            boxShadow: '0 15px 30px rgba(15, 23, 42, 0.25)',
            minWidth: '140px',
            zIndex: 10,
          }}
        >
          {actions.map((action) => (
            <div
              key={action.id}
              style={{ padding: '0.6rem 0.9rem', cursor: 'pointer' }}
              onClick={() => {
                onAction(action.id);
                setOpen(false);
              }}
            >
              {action.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

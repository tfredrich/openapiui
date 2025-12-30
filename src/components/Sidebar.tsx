import { CollectionConfig } from '../types';

interface Props {
  title?: string;
  collections: CollectionConfig[];
  activeId?: string;
  onSelect: (collection: CollectionConfig) => void;
}

export default function Sidebar({ title = 'Administration Console', collections, activeId, onSelect }: Props) {
  return (
    <aside className="sidebar">
      <header>{title}</header>
      <nav style={{ flex: 1, overflow: 'auto' }}>
        {collections.map((collection) => (
          <div
            key={collection.id}
            className={`nav-item ${collection.id === activeId ? 'active' : ''}`}
            onClick={() => onSelect(collection)}
          >
            <div style={{ fontWeight: 600 }}>{collection.label}</div>
            {collection.description && <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>{collection.description}</p>}
          </div>
        ))}
      </nav>
    </aside>
  );
}

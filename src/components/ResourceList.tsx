import { useMemo } from 'react';
import { OpenAPISchema } from '../types';

interface Props {
  items: Record<string, unknown>[];
  schema?: OpenAPISchema;
  loading: boolean;
  error?: string;
  displayField?: string;
  onSelect: (item: Record<string, unknown>) => void;
  renderActions?: (item: Record<string, unknown>) => React.ReactNode;
}

export default function ResourceList({ items, schema, loading, error, displayField, onSelect, renderActions }: Props) {
  const columns = useMemo(() => {
    if (schema?.properties) {
      return Object.keys(schema.properties).slice(0, 6);
    }
    if (items.length > 0) {
      return Object.keys(items[0] ?? {}).slice(0, 6);
    }
    return [];
  }, [items, schema]);

  if (loading) {
    return <div className="loader">Loading collection…</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!items.length) {
    return <p style={{ color: '#475569' }}>No records found.</p>;
  }

  return (
    <table className="resource-list">
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column}>{column}</th>
          ))}
          {renderActions && <th />}
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => (
          <tr key={index} onClick={() => onSelect(item)}>
            {columns.map((column) => (
              <td key={column}>{formatValue(item[column])}</td>
            ))}
            {renderActions && <td onClick={(event) => event.stopPropagation()}>{renderActions(item)}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function formatValue(value: unknown) {
  if (value === null || value === undefined) {
    return '—';
  }
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}

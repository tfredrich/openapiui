import { Fragment, type ReactNode } from 'react';
import { OpenAPISchema } from '../types';
import { flattenSchema } from '../utils/schema';

interface Props {
  item?: Record<string, unknown> | null;
  schema?: OpenAPISchema;
  canEdit: boolean;
  onEdit: () => void;
}

export default function ResourceDetail({ item, schema, canEdit, onEdit }: Props) {
  if (!item) {
    return <p style={{ color: '#475569' }}>Select a row to inspect details.</p>;
  }

  const entries: Array<[string, unknown]> = schema
    ? flattenSchema(schema).map(({ key }) => [key, item[key]])
    : Object.entries(item);

  return (
    <div className="detail-card">
      <div className="detail-header">
        <h3 style={{ margin: 0 }}>Details</h3>
        {canEdit && (
          <button className="secondary" onClick={onEdit}>
            ✏️ Edit
          </button>
        )}
      </div>
      <dl>
        {entries.map(([key, value]) => (
          <Fragment key={String(key)}>
            <dt>{key}</dt>
            <dd>{renderValue(value)}</dd>
          </Fragment>
        ))}
      </dl>
    </div>
  );
}

function renderValue(value: unknown): ReactNode {
  if (value === null || value === undefined) {
    return '—';
  }
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  if (typeof value === 'object') {
    return <pre style={{ margin: 0 }}>{JSON.stringify(value, null, 2)}</pre>;
  }
  return String(value);
}

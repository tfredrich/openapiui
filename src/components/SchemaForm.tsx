import { useEffect, useState } from 'react';
import { OpenAPISchema } from '../types';
import { flattenSchema, schemaRequiredFields } from '../utils/schema';

interface Props {
  schema?: OpenAPISchema;
  initialValues?: Record<string, unknown>;
  submitLabel?: string;
  onSubmit: (values: Record<string, unknown>) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function SchemaForm({ schema, initialValues = {}, submitLabel = 'Save', onSubmit, onCancel, loading }: Props) {
  const [values, setValues] = useState<Record<string, unknown>>(initialValues);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  if (!schema) {
    return <p style={{ color: '#ef4444' }}>Schema unavailable for this operation.</p>;
  }

  const fields = flattenSchema(schema);
  const required = schemaRequiredFields(schema);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(values);
  };

  const handleFieldChange = (key: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="form-grid">
        {fields.map(({ key, schema: fieldSchema }) => (
          <div key={key} className="field">
            <label>
              {fieldSchema.title ?? key}
              {required.has(key) && <span style={{ color: '#ef4444' }}> *</span>}
            </label>
            {renderInput(fieldSchema, values[key], (value) => handleFieldChange(key, value))}
            {fieldSchema.description && <small style={{ color: '#64748b' }}>{fieldSchema.description}</small>}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
        <button type="button" className="secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="primary" disabled={loading}>
          {loading ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}

function renderInput(schema: OpenAPISchema, value: unknown, onChange: (value: unknown) => void) {
  switch (schema.type) {
    case 'integer':
    case 'number': {
      const numericValue = value === null || value === undefined ? '' : Number(value);
      return (
        <input
          type="number"
          value={numericValue}
          onChange={(event) => onChange(event.target.value ? Number(event.target.value) : undefined)}
        />
      );
    }
    case 'boolean':
      return <input type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} />;
    case 'array':
      return (
        <textarea
          rows={3}
          value={Array.isArray(value) ? value.join('\n') : ''}
          onChange={(event) => onChange(event.target.value.split('\n').filter(Boolean))}
        />
      );
    default:
      if (schema.enum) {
        return (
          <select value={(value as string | undefined) ?? ''} onChange={(event) => onChange(event.target.value)}>
            <option value="">Select…</option>
            {schema.enum.map((option) => (
              <option key={option} value={String(option)}>
                {String(option)}
              </option>
            ))}
          </select>
        );
      }
      const inputType = schema.format === 'date-time' ? 'datetime-local' : schema.format === 'date' ? 'date' : 'text';
      return <input type={inputType} value={(value as string | undefined) ?? ''} onChange={(event) => onChange(event.target.value)} />;
  }
}

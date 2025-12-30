import { useState } from 'react';
import { SecurityConfig } from '../types';

interface Props {
  security?: SecurityConfig;
  token?: string;
  onTokenChange: (token: string) => void;
  onRequestToken?: (overrides?: { scope?: string }) => Promise<void>;
  loading?: boolean;
  error?: string;
}

export default function SecurityPanel({ security, token = '', onTokenChange, onRequestToken, loading, error }: Props) {
  const [scope, setScope] = useState(security?.type === 'oauth2' ? security.scope ?? '' : '');

  if (!security) {
    return null;
  }

  const renderOAuthControls = () => (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <input type="text" placeholder="scope" value={scope} onChange={(event) => setScope(event.target.value)} />
      <button
        className="secondary"
        disabled={loading}
        onClick={() => onRequestToken?.({ scope })}
      >
        {loading ? 'Authenticating…' : 'Get Token'}
      </button>
    </div>
  );

  return (
    <section className="panel">
      <header style={{ marginBottom: '0.75rem' }}>
        <h3 style={{ margin: 0 }}>Security</h3>
        <p style={{ margin: 0, color: '#475569' }}>Configure API access tokens as defined by the spec.</p>
      </header>
      {security.type === 'oauth2' ? (
        <p style={{ marginTop: 0 }}>
          OAuth2 token URL: <code>{security.tokenUrl}</code>
        </p>
      ) : (
        <p style={{ marginTop: 0 }}>Supplying a Bearer token enables authorized operations.</p>
      )}
      {security.type === 'oauth2' && renderOAuthControls()}
      <div style={{ marginTop: '0.75rem' }}>
        <label>Access Token</label>
        <textarea rows={3} value={token} onChange={(event) => onTokenChange(event.target.value)} />
      </div>
      {error && <p className="error">{error}</p>}
    </section>
  );
}

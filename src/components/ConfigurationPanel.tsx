import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import sampleConfig from '../../config/sample-console.json?raw';
import { ConsoleConfig } from '../types';

interface Props {
  config?: ConsoleConfig | null;
  specLoaded: boolean;
  onConfigLoaded: (config: ConsoleConfig) => void;
  onSpecUrlSubmit: (url: string) => void;
  onSpecFileLoaded: (docText: string) => void;
  specError?: string;
  loadingSpec: boolean;
}

export default function ConfigurationPanel({
  config,
  specLoaded,
  onConfigLoaded,
  onSpecUrlSubmit,
  onSpecFileLoaded,
  specError,
  loadingSpec,
}: Props) {
  const [textValue, setTextValue] = useState(() => (config ? JSON.stringify(config, null, 2) : sampleConfig));
  const [specUrl, setSpecUrl] = useState(config?.specSource.type === 'url' ? config.specSource.url : '');

  const sample = useMemo(() => sampleConfig, []);

  useEffect(() => {
    if (config) {
      setTextValue(JSON.stringify(config, null, 2));
      if (config.specSource.type === 'url') {
        setSpecUrl(config.specSource.url);
      }
    }
  }, [config]);

  const handleApplyText = () => {
    try {
      const parsed = JSON.parse(textValue);
      onConfigLoaded(parsed);
    } catch (error) {
      alert(`Invalid config JSON: ${error}`);
    }
  };

  const handleConfigFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setTextValue(text);
    try {
      const parsed = JSON.parse(text);
      onConfigLoaded(parsed);
    } catch (error) {
      alert(`Invalid config JSON: ${error}`);
    }
  };

  const handleSpecFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    onSpecFileLoaded(text);
  };

  const handleSpecUrlSubmit = () => {
    if (!specUrl) {
      alert('Provide a URL to load the spec.');
      return;
    }
    onSpecUrlSubmit(specUrl);
  };

  return (
    <section className="panel">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h2 style={{ margin: 0 }}>Configuration</h2>
          <p style={{ margin: 0, color: '#475569' }}>Load the console JSON and OpenAPI specification.</p>
        </div>
        {config && specLoaded && <span className="badge">Ready</span>}
      </header>

      <div style={{ display: 'grid', gap: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: '0 0 0.5rem 0' }}>Console JSON</h3>
            <input type="file" accept="application/json" onChange={handleConfigFileChange} />
          </div>
          <textarea rows={10} value={textValue} onChange={(event) => setTextValue(event.target.value)} />
          <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
            <button className="primary" onClick={handleApplyText}>Apply</button>
            <button className="secondary" onClick={() => setTextValue(sample)}>Reset to Sample</button>
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: '0 0 0.5rem 0' }}>OpenAPI Spec</h3>
            <input type="file" accept="application/json,yaml" onChange={handleSpecFile} />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input type="url" placeholder="https://server/openapi.json" value={specUrl} onChange={(event) => setSpecUrl(event.target.value)} />
            <button className="primary" onClick={handleSpecUrlSubmit} disabled={loadingSpec}>{loadingSpec ? 'Loading...' : 'Load URL'}</button>
          </div>
          {specError && <p className="error">{specError}</p>}
        </div>
      </div>
    </section>
  );
}

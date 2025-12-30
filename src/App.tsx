import { useEffect, useMemo, useState } from 'react';
import ConfigurationPanel from './components/ConfigurationPanel';
import Sidebar from './components/Sidebar';
import SearchBar from './components/SearchBar';
import ResourceList from './components/ResourceList';
import Modal from './components/Modal';
import SchemaForm from './components/SchemaForm';
import ResourceDetail from './components/ResourceDetail';
import ActionsMenu from './components/ActionsMenu';
import Pagination from './components/Pagination';
import SecurityPanel from './components/SecurityPanel';
import ServerSelector from './components/ServerSelector';
import { CollectionConfig, ConsoleConfig, OpenAPIDocument, SpecSource } from './types';
import { loadSpec } from './api/oasLoader';
import { apiRequest } from './api/httpClient';
import { getRequestSchema, getResponseSchema } from './utils/schema';
import TopBar from './components/TopBar';

interface ListState {
  items: Record<string, unknown>[];
  loading: boolean;
  error?: string;
}

interface ContentRangeInfo {
  start: number;
  end: number;
  total: number | null;
}

export default function App() {
  const [config, setConfig] = useState<ConsoleConfig | null>(null);
  const [specSource, setSpecSource] = useState<SpecSource | null>(null);
  const [spec, setSpec] = useState<OpenAPIDocument | null>(null);
  const [loadingSpec, setLoadingSpec] = useState(false);
  const [specError, setSpecError] = useState<string>();
  const [activeCollectionId, setActiveCollectionId] = useState<string>();
  const [serverUrl, setServerUrl] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [tokenLoading, setTokenLoading] = useState(false);
  const [tokenError, setTokenError] = useState<string>();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [listVersion, setListVersion] = useState(0);
  const [listState, setListState] = useState<ListState>({ items: [], loading: false });
  const [selectedItem, setSelectedItem] = useState<Record<string, unknown> | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [formMode, setFormMode] = useState<'update' | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);
  const [contentRange, setContentRange] = useState<ContentRangeInfo | null>(null);

  useEffect(() => {
    if (config) {
      setAuthToken(config.security?.type === 'bearer' ? config.security.token ?? '' : '');
      setActiveCollectionId(config.collections[0]?.id);
      if (config.specSource) {
        setSpecSource(config.specSource);
      }
    }
  }, [config]);

  useEffect(() => {
    if (!config) {
      setSetupOpen(true);
    }
  }, [config]);

  useEffect(() => {
    if (!config?.security) {
      setSecurityOpen(false);
    }
  }, [config]);

  useEffect(() => {
    const loadDocument = async () => {
      if (!specSource) return;
      try {
        setLoadingSpec(true);
        setSpecError(undefined);
        const document = await loadSpec(specSource);
        setSpec(document);
      } catch (error) {
        setSpecError(error instanceof Error ? error.message : String(error));
      } finally {
        setLoadingSpec(false);
      }
    };
    loadDocument();
  }, [specSource]);

  useEffect(() => {
    if (spec?.servers?.length) {
      setServerUrl(spec.servers[0].url);
    }
  }, [spec]);

  const activeCollection = useMemo(() => config?.collections.find((collection) => collection.id === activeCollectionId), [config, activeCollectionId]);
  const listOperation = activeCollection ? spec?.paths?.[activeCollection.path]?.get : undefined;
  const detailPathItem = activeCollection?.detailPath ? spec?.paths?.[activeCollection.detailPath] : undefined;
  const detailOperations = detailPathItem ?? (activeCollection ? spec?.paths?.[activeCollection.path] : undefined);
  const listSchema = listOperation ? getResponseSchema(listOperation, spec ?? undefined) : undefined;
  const detailResponseSchema = detailOperations?.get ? getResponseSchema(detailOperations.get, spec ?? undefined) : undefined;
  const formSchema = detailOperations?.put ? getRequestSchema(detailOperations.put, spec ?? undefined) : undefined;
  const hasUpdate = Boolean(detailOperations?.put);
  const hasDelete = Boolean(detailOperations?.delete);

  useEffect(() => {
    if (!activeCollection || !spec || !serverUrl) {
      return;
    }
    setListState((prev) => ({ ...prev, loading: true, error: undefined }));
    setContentRange(null);
    const query: Record<string, string | number | undefined> = {};
    if (activeCollection.query?.searchParam && searchTerm) {
      query[activeCollection.query.searchParam] = searchTerm;
    }
    if (activeCollection.query?.pageParam) {
      query[activeCollection.query.pageParam] = page;
    }
    if (activeCollection.query?.pageSizeParam && activeCollection.query.defaultPageSize) {
      query[activeCollection.query.pageSizeParam] = activeCollection.query.defaultPageSize;
    }

    let cancelled = false;

    apiRequest<unknown>({ method: 'GET', path: activeCollection.path, baseUrl: serverUrl, token: authToken, query })
      .then(({ data, headers }) => {
        if (cancelled) return;
        setListState({ loading: false, error: undefined, items: normalisePayload(data) });
        setContentRange(parseContentRange(headers.get('content-range')));
      })
      .catch((error) => {
        if (cancelled) return;
        setListState({ loading: false, error: error instanceof Error ? error.message : String(error), items: [] });
        setContentRange(null);
      });

    return () => {
      cancelled = true;
    };
  }, [activeCollection, serverUrl, searchTerm, page, authToken, spec, listVersion]);

  const refreshList = () => setListVersion((value) => value + 1);

  const handleConfigLoaded = (nextConfig: ConsoleConfig) => {
    setConfig(nextConfig);
  };

  const handleSpecUrlSubmit = (url: string) => {
    setSpecSource({ type: 'url', url });
  };

  const handleSpecFileLoaded = (text: string) => {
    setSpecSource({ type: 'inline', payload: text });
  };

  const handleSelectRow = (item: Record<string, unknown>) => {
    setSelectedItem(item);
    if (!activeCollection?.detailPath || !serverUrl) {
      return;
    }
    const idValue = extractId(item, activeCollection);
    if (!idValue) {
      return;
    }
    const resolvedPath = fillPath(activeCollection.detailPath, activeCollection.idParam, idValue);
    setDetailLoading(true);
    apiRequest<Record<string, unknown>>({ method: 'GET', path: resolvedPath, baseUrl: serverUrl, token: authToken })
      .then(({ data }) => {
        setSelectedItem(data);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => setDetailLoading(false));
  };

  const handleAction = (item: Record<string, unknown>, action: string) => {
    if (action === 'update') {
      setSelectedItem(item);
      setFormMode('update');
    }
    if (action === 'delete') {
      confirmDelete(item);
    }
  };

  const confirmDelete = async (item: Record<string, unknown>) => {
    if (!activeCollection || !serverUrl || !hasDelete) return;
    if (!window.confirm('Delete this resource?')) {
      return;
    }
    const idValue = extractId(item, activeCollection);
    if (!idValue || !activeCollection.detailPath) return;
    const path = fillPath(activeCollection.detailPath, activeCollection.idParam, idValue);
    try {
      await apiRequest({ method: 'DELETE', path, baseUrl: serverUrl, token: authToken });
      refreshList();
      setSelectedItem(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : String(error));
    }
  };

  const handleFormSubmit = async (values: Record<string, unknown>) => {
    if (!activeCollection || !serverUrl || !activeCollection.detailPath || !selectedItem) {
      return;
    }
    const idValue = extractId(selectedItem, activeCollection);
    if (!idValue) return;
    const path = fillPath(activeCollection.detailPath, activeCollection.idParam, idValue);
    try {
      setFormLoading(true);
      const { data } = await apiRequest<Record<string, unknown>>({ method: 'PUT', path, baseUrl: serverUrl, token: authToken, body: values });
      setSelectedItem(data);
      refreshList();
      setFormMode(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : String(error));
    } finally {
      setFormLoading(false);
    }
  };

  const handleRequestToken = async ({ scope }: { scope?: string } = {}) => {
    if (!config || config.security?.type !== 'oauth2') {
      return;
    }
    try {
      setTokenLoading(true);
      setTokenError(undefined);
      const params = new URLSearchParams();
      params.set('grant_type', 'client_credentials');
      params.set('client_id', config.security.clientId);
      if (config.security.clientSecret) {
        params.set('client_secret', config.security.clientSecret);
      }
      if (scope || config.security.scope) {
        params.set('scope', scope || config.security.scope || '');
      }
      const response = await fetch(config.security.tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });
      if (!response.ok) {
        throw new Error(`Token request failed: ${response.status}`);
      }
      const payload = await response.json();
      if (!payload.access_token) {
        throw new Error('access_token missing in response');
      }
      setAuthToken(payload.access_token);
    } catch (error) {
      setTokenError(error instanceof Error ? error.message : String(error));
    } finally {
      setTokenLoading(false);
    }
  };

  const availableActions = useMemo(() => {
    const actions = [] as { id: string; label: string }[];
    if (hasUpdate) {
      actions.push({ id: 'update', label: 'Update' });
    }
    if (hasDelete) {
      actions.push({ id: 'delete', label: 'Delete' });
    }
    return actions;
  }, [hasUpdate, hasDelete]);

  const ready = Boolean(config && spec && serverUrl && activeCollection);
  const paginationConfig = activeCollection?.query;
  const pageRangeSize = contentRange ? contentRange.end - contentRange.start + 1 : 0;
  const paginationAvailable = Boolean(
    paginationConfig?.pageParam && contentRange && (contentRange.total === null || contentRange.total > pageRangeSize)
  );
  const disableNext = !contentRange || (contentRange.total !== null && contentRange.end + 1 >= contentRange.total);

  return (
    <div className="app-shell">
      {config && spec ? (
        <Sidebar
          title={config.title}
          collections={config.collections}
          activeId={activeCollectionId}
          onSelect={(collection) => {
            setActiveCollectionId(collection.id);
            setSearchTerm('');
            setPage(1);
            setSelectedItem(null);
          }}
        />
      ) : (
        <div className="sidebar">
          <header>OAS Admin</header>
        </div>
      )}
      <main className="main-content">
        <TopBar
          title={config?.title ?? 'OAS Admin'}
          ready={ready}
          onOpenSetup={() => setSetupOpen(true)}
          onOpenToken={config?.security ? () => setSecurityOpen(true) : undefined}
          tokenEnabled={Boolean(config?.security)}
        />
        {spec && <ServerSelector servers={spec.servers} value={serverUrl} onChange={(value) => setServerUrl(value)} />}
        {ready && activeCollection && (
          <section className="panel">
            <header className="actions-row">
              <div>
                <h2 style={{ margin: 0 }}>{activeCollection.label}</h2>
                {activeCollection.description && <p style={{ margin: 0, color: '#475569' }}>{activeCollection.description}</p>}
              </div>
              <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder={`Search ${activeCollection.label}`} />
            </header>
            <ResourceList
              items={listState.items}
              schema={listSchema}
              loading={listState.loading}
              error={listState.error}
              displayField={activeCollection.displayField}
              onSelect={handleSelectRow}
              renderActions={
                availableActions.length
                  ? (item) => <ActionsMenu actions={availableActions} onAction={(actionId) => handleAction(item, actionId)} />
                  : undefined
              }
            />
            {paginationAvailable && (
              <Pagination
                page={page}
                onPrevious={() => setPage((value) => Math.max(1, value - 1))}
                onNext={() => setPage((value) => value + 1)}
                disablePrevious={page <= 1}
                disableNext={disableNext}
              />
            )}
          </section>
        )}
        {ready && (
          <section className="panel">
            {detailLoading && <div className="loader">Loading details…</div>}
            <ResourceDetail item={selectedItem} schema={detailResponseSchema} canEdit={hasUpdate} onEdit={() => setFormMode('update')} />
          </section>
        )}
      </main>
      {formMode === 'update' && formSchema && selectedItem && (
        <Modal title={`Update ${activeCollection?.label ?? ''}`} onClose={() => setFormMode(null)}>
          <SchemaForm
            schema={formSchema}
            initialValues={selectedItem}
            submitLabel="Save"
            onSubmit={handleFormSubmit}
            onCancel={() => setFormMode(null)}
            loading={formLoading}
          />
        </Modal>
      )}
      {setupOpen && (
        <Modal title="Setup" onClose={() => setSetupOpen(false)}>
          <ConfigurationPanel
            config={config}
            specLoaded={Boolean(spec)}
            onConfigLoaded={handleConfigLoaded}
            onSpecUrlSubmit={handleSpecUrlSubmit}
            onSpecFileLoaded={handleSpecFileLoaded}
            specError={specError}
            loadingSpec={loadingSpec}
          />
        </Modal>
      )}
      {securityOpen && config?.security && (
        <Modal title="Token" onClose={() => setSecurityOpen(false)}>
          <SecurityPanel
            security={config.security}
            token={authToken}
            onTokenChange={setAuthToken}
            onRequestToken={config.security.type === 'oauth2' ? handleRequestToken : undefined}
            loading={tokenLoading}
            error={tokenError}
          />
        </Modal>
      )}
    </div>
  );
}

function normalisePayload(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) {
    return payload as Record<string, unknown>[];
  }
  if (payload && typeof payload === 'object') {
    if ('items' in payload && Array.isArray((payload as { items: unknown[] }).items)) {
      return (payload as { items: unknown[] }).items as Record<string, unknown>[];
    }
    return [payload as Record<string, unknown>];
  }
  return [];
}

function extractId(item: Record<string, unknown>, collection: CollectionConfig) {
  if (collection.idParam && item[collection.idParam] !== undefined) {
    return item[collection.idParam];
  }
  if (item.id !== undefined) {
    return item.id;
  }
  return undefined;
}

function fillPath(template: string, paramName: string | undefined, value: string | number | unknown) {
  if (paramName) {
    return template.replace(`{${paramName}}`, encodeURIComponent(String(value)));
  }
  return template;
}

function parseContentRange(header: string | null): ContentRangeInfo | null {
  if (!header) {
    return null;
  }
  const match = header.trim().match(/^[^\s]+\s+(\d+)-(\d+)\/(\d+|\*)$/i);
  if (!match) {
    return null;
  }
  const [, startStr, endStr, totalStr] = match;
  const start = Number(startStr);
  const end = Number(endStr);
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) {
    return null;
  }
  const total = totalStr === '*' ? null : Number(totalStr);
  if (total !== null && Number.isNaN(total)) {
    return null;
  }
  return { start, end, total };
}

interface RequestOptions {
  method?: string;
  path: string;
  baseUrl: string;
  token?: string;
  body?: unknown;
  query?: Record<string, string | number | undefined>;
  headers?: Record<string, string>;
}

export interface ApiResponse<T> {
  data: T;
  headers: Headers;
  status: number;
}

function buildUrl(baseUrl: string, path: string, query?: Record<string, string | number | undefined>) {
  const url = new URL(path, baseUrl);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
}

export async function apiRequest<T>({ method = 'GET', path, baseUrl, token, body, query, headers }: RequestOptions): Promise<ApiResponse<T>> {
  const url = buildUrl(baseUrl, path, query);
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API ${method} ${path} failed: ${response.status} ${response.statusText} - ${text}`);
  }

  const data = response.status === 204 ? ({} as T) : await response.json();

  return {
    data,
    headers: response.headers,
    status: response.status,
  };
}

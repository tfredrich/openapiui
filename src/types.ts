export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

export interface CollectionConfig {
  id: string;
  label: string;
  path: string;
  detailPath?: string;
  idParam?: string;
  displayField?: string;
  description?: string;
  query?: {
    searchParam?: string;
    pageParam?: string;
    pageSizeParam?: string;
    defaultPageSize?: number;
  };
}

export type SpecSource =
  | { type: 'url'; url: string }
  | { type: 'inline'; payload: string };

export interface SecurityOAuth2Config {
  type: 'oauth2';
  tokenUrl: string;
  clientId: string;
  clientSecret?: string;
  scope?: string;
}

export interface SecurityBearerConfig {
  type: 'bearer';
  token?: string;
}

export type SecurityConfig = SecurityOAuth2Config | SecurityBearerConfig;

export interface ConsoleConfig {
  title: string;
  collections: CollectionConfig[];
  specSource: SpecSource;
  security?: SecurityConfig;
}

export interface OpenAPIServer {
  url: string;
  description?: string;
}

export interface OpenAPIResponse {
  description?: string;
  content?: Record<string, { schema?: OpenAPISchema }>;
}

export interface OpenAPIRequestBody {
  description?: string;
  required?: boolean;
  content?: Record<string, { schema?: OpenAPISchema }>;
}

export interface OpenAPISchema {
  type?: string;
  properties?: Record<string, OpenAPISchema>;
  items?: OpenAPISchema;
  enum?: Array<string | number>;
  format?: string;
  description?: string;
  required?: string[];
  title?: string;
  $ref?: string;
  default?: unknown;
}

export interface OperationObject {
  operationId?: string;
  summary?: string;
  description?: string;
  parameters?: Array<{ name: string; in: string; required?: boolean; schema?: OpenAPISchema }>;
  requestBody?: OpenAPIRequestBody;
  responses?: Record<string, OpenAPIResponse>;
  security?: Array<Record<string, string[]>>;
}

export interface PathItemObject {
  get?: OperationObject;
  post?: OperationObject;
  put?: OperationObject;
  patch?: OperationObject;
  delete?: OperationObject;
}

export interface OpenAPIDocument {
  openapi: string;
  info: { title: string };
  paths: Record<string, PathItemObject>;
  components?: {
    schemas?: Record<string, OpenAPISchema>;
    securitySchemes?: Record<string, Record<string, unknown>>;
  };
  security?: Array<Record<string, string[]>>;
  servers?: OpenAPIServer[];
}

export interface CollectionData {
  items: unknown[];
  total?: number;
  page?: number;
}

# OAS Administration Console

This project is a React (Vite + TypeScript) web application for generating an administration console directly from an OpenAPI specification and a lightweight JSON configuration file that defines the left-hand navigation items.

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173 to access the UI.

## How it Works

1. **Configuration Loader** – Upload or paste a console JSON file (see `config/sample-console.json`). This file defines:
   - `title`: Label for the sidebar header.
   - `specSource`: `{ "type": "url" | "inline", ... }` describing how to load the OAS resource.
   - `collections`: Array of resources for the left navigation. Each entry includes the collection path, optional detail path, query parameter mapping, and display hints.
   - `security`: (optional) Bearer or OAuth2 client credential settings.
2. **Spec Loader** – Load an OpenAPI spec via URL or by dropping a local file (JSON or YAML). OAS metadata (e.g., `servers`) drives API calls, operations, and schemas.
3. **Collection Views** – Selecting a collection fetches data from the configured path, honoring search and pagination query params. Rows expose actions derived from PUT/DELETE operations in the spec, and selecting a row fetches detail data.
4. **Dynamic Forms** – Edit forms are auto-generated from the request schema of the `PUT` operation. Detail layouts reuse response schemas.
5. **Security** – If the spec/config requires OAuth2, the console can perform a simple client-credentials token exchange. Bearer tokens can also be pasted manually and are attached to API calls.

## Files of Interest

- `src/App.tsx` – Orchestrates configuration/spec loading, navigation, data fetching, CRUD actions, and wiring between components.
- `src/components/*` – Presentation components (configuration panel, sidebar, resource list, detail view, schema-driven forms, etc.).
- `src/api/oasLoader.ts` & `src/api/httpClient.ts` – Helpers for fetching the specification (JSON or YAML) and issuing authenticated API requests.
- `src/utils/schema.ts` – Minimal utilities for resolving `$ref`s and extracting schemas for responses/requests.
- `config/sample-console.json` – Reference console configuration targeting the public Petstore spec.

## Contributor Guide

See `AGENTS.md` for repository guidelines covering structure, commands, coding conventions, and pull request expectations.

## Next Steps

- Persist user-supplied tokens and last-used servers.
- Expand schema/form coverage (nested objects, arrays of objects, field-level validation).
- Add optimistic UI states + React Query caching for large datasets.

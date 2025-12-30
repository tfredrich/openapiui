# Repository Guidelines

## Project Structure & Module Organization
Source lives in `src/`, with API helpers in `src/api/`, UI pieces in `src/components/`, hooks in `src/hooks/`, and shared models/utilities in `src/types.ts` and `src/utils/`. Vite bootstraps through `src/main.tsx`, rendering the console orchestrator in `src/App.tsx`. Static assets (icons, styles, configs) live under `src/assets/` and `config/`. Builds output to `dist/`; never edit that directory manually.

## Build, Test, and Development Commands
Run `npm install` once to sync dependencies. During development, `npm run dev` starts Vite on `http://localhost:5173` (add `--host` when testing across devices). `npm run build` performs a type check (`tsc`) and creates the optimized bundle; inspect the output in `dist/` via `npm run preview`. `npm run lint` is a type-only compile useful for CI preflight.

## Coding Style & Naming Conventions
All UI code is TypeScript + React functional components. Favor hooks for side effects and data fetching; colocate hook modules in `src/hooks/`. Use two-space indentation, single quotes, and trailing commas to match the current formatting. Name components and files with `PascalCase` (e.g., `ResourceDetail.tsx`), hooks with `useCamelCase`, and shared helpers with camelCase exports. Keep props typed explicitly and prefer small composable components over monoliths.

## Testing Guidelines
There is no test suite yet, so new features should add targeted tests alongside the code (e.g., `src/__tests__/ConfigurationPanel.spec.tsx` using Vitest + React Testing Library). At minimum, run `npm run lint` before opening a PR to ensure types stay strict. For interaction-heavy work, outline manual verification steps so reviewers can reproduce API interactions with the sample console config.

## Commit & Pull Request Guidelines
Git history currently uses short imperative messages (e.g., `Initial check-in`); continue that style or adopt a lightweight Conventional Commit prefix such as `feat:` or `fix:` when it clarifies scope. Reference issue IDs when available. Pull requests should include a concise description, screenshots or GIFs for UI updates, reproduction steps using `config/sample-console.json`, and notes about new configuration keys or migrations.

## Configuration & Security Tips
Console behavior depends on the JSON files in `config/` and the OAS documents in `config/openapi.json` (or a user-supplied URL). When adding configuration fields, update both the sample files and the form components so agents can test without extra setup. Never commit real credentials; rely on the bearer token and OAuth client-secret fields at runtime and document any environment variables needed to source them locally.

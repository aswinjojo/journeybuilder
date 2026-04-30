# Journey Builder

A monorepo containing the Avantos Journey Builder challenge solution.

```
journey-builder/
├── frontend/    React + TypeScript app (Vite)
├── backend/     Avantos mock server (Node.js, port 3000)
└── package.json root scripts powered by concurrently
```

---

## Quickstart — run everything with one command

```bash
# 1. Install all dependencies
npm run install:all

# 2. Start frontend + backend together
npm run dev
```

- **Frontend** → [http://localhost:5173](http://localhost:5173)
- **Backend**  → [http://localhost:3000](http://localhost:3000)

---

## Other root scripts

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start frontend (Vite) + backend (mock server) concurrently |
| `npm run install:all` | `npm install` in both `frontend/` and `backend/` |
| `npm test` | Run the frontend test suite (Vitest) |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run build` | Production build of the frontend |

---

## How it works

The app fetches a blueprint graph (a DAG of forms) from the backend mock
server and lets you configure **prefill mappings** for each form's fields.

Prefill sources are resolved via a **plugin registry** — new sources can be
added without modifying existing code. See `frontend/README.md` for details.

---

## Architecture decisions

| Concern | Decision |
|---------|----------|
| **Monorepo** | Simple two-folder layout with a root `concurrently` script — no Turborepo/Nx needed at this scale |
| **Data fetching** | Plain `fetch` in a custom hook; no external library needed for a single endpoint |
| **State** | `useState` in `App`; no global store needed for this scope |
| **Extensibility** | `DataSource` interface + `DataSourceRegistry` singleton — new sources registered at startup, zero coupling to UI |
| **DAG traversal** | Iterative BFS to avoid stack overflow on deep graphs; deduplicates nodes seen via multiple paths |
| **Testing** | Vitest + Testing Library; 43 tests across 6 files covering logic and component interactions |

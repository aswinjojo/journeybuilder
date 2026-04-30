# Journey Builder

A React + TypeScript app that renders a DAG of forms from the Avantos
blueprint graph API and lets users configure prefill mappings between form
fields.

> **This is the `frontend/` package inside the monorepo.**
> See the root `README.md` for how to run both frontend and backend together.

---

## Running in isolation

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

Requires the backend mock server to be running on port 3000.

---

## Running tests

```bash
npm test                 # single run
npm run test:watch       # watch mode
npm run test:coverage    # coverage report
```

44 unit + component tests across 6 test files:

| File | What's tested |
|------|---------------|
| `dagTraversal.test.ts` | BFS ancestor traversal, deduplication |
| `DataSourceRegistry.test.ts` | Register / unregister, dedup, resolveFields |
| `FormFieldsDataSource.test.ts` | Direct vs transitive tagging, button exclusion |
| `GlobalDataSource.test.ts` | Action + org property sources |
| `PrefillPanel.test.tsx` | Render rows, clear mapping, open modal |
| `DataSourceModal.test.tsx` | Search filter, field selection, Escape/Cancel |

---

## Project structure

```
src/
├── api/
│   └── blueprintGraph.ts          # fetch() wrapper for the mock server
├── types/
│   └── index.ts                   # all shared TypeScript types
├── utils/
│   └── dagTraversal.ts            # BFS ancestor resolution
├── services/
│   ├── DataSourceRegistry.ts      # plugin registry (singleton)
│   ├── registerDataSources.ts     # startup wiring of built-in sources
│   └── dataSources/
│       ├── FormFieldsDataSource.ts   # upstream form fields; used internally by usePrefillSources (not registered globally)
│       └── GlobalDataSource.ts       # Action & Org properties
├── hooks/
│   ├── useBlueprintGraph.ts       # data-fetching hook
│   └── usePrefillSources.ts       # resolves available sources for a node
├── components/
│   ├── FormList/                  # sidebar list of form nodes
│   ├── PrefillPanel/              # table of field → source mappings
│   └── DataSourceModal/           # searchable source picker modal
└── __tests__/
    ├── fixtures.ts                # shared test graph
    └── *.test.ts(x)               # per-module tests
```

---

## How to add a new data source

The prefill system is designed around a **plugin registry**. Adding a new
source requires touching **two files only** and zero changes to existing code.

### Step 1 — Implement the `DataSource` interface

```typescript
// src/services/dataSources/UserProfileDataSource.ts
import type { DataSource, DataSourceContext, DataField } from '../../types';

export class UserProfileDataSource implements DataSource {
  readonly id = 'user_profile';
  readonly label = 'User Profile';

  getFields(_context: DataSourceContext): DataField[] {
    return [
      {
        id: 'user_profile::full_name',
        sourceId: 'user_profile',
        fieldKey: 'full_name',
        label: 'User Profile > Full Name',
        sourceType: 'global',
      },
    ];
  }
}
```

### Step 2 — Register it at startup

```typescript
// src/services/registerDataSources.ts
import { UserProfileDataSource } from './dataSources/UserProfileDataSource';

export function registerDataSources(): void {
  // existing registrations ...
  dataSourceRegistry.register(new UserProfileDataSource());
}
```

That's it — the new source appears as a collapsible group in the modal for every form.

# Siren — Project Configuration

## What is Siren
Siren is a **QA Engineering platform** that streamlines Cypress test automation workflows. It's built as a modular system where each major capability ships as a named feature release.

**Author:** Fernando Hernandez
**Stack:** NestJS (backend) + React (frontend) + PostgreSQL + Docker
**Monorepo structure:** Two independent projects (`backend/`, `frontend/`) orchestrated by Docker Compose at the root.

## Feature Roadmap

| Release | Codename | Description | Status |
|---------|----------|-------------|--------|
| v1.0 | **FastPages** | Visual element inspector for Cypress POM locator mapping. Users create projects, register pages, and map web element selectors through an interactive proxy-based inspector that lets them click elements and choose `cy.get()` selectors. Exports JSON consumed by Cypress Page Object constructors. | In development |
| v1.x | **SuiteBuilder** | Test suite organization — create smoke/regression suites, register spec files, configure execution pipelines in a visual interface. | Planned |
| v2.x | **CommandCenter** | Execute and monitor Cypress runs from the platform, view results, connect to CI/CD pipelines. | Ideation |

When adding a new feature, create its module(s) under the existing architecture. Each feature may span multiple backend modules and frontend feature folders, but the core patterns and conventions stay the same.

## Project Structure

```
siren/
├── CLAUDE.md                      ← You are here (root project config)
├── docker-compose.yml             ← Orchestrates postgres + backend + frontend
├── documents/                     ← Mockups, ER diagrams, class diagrams, specs
│   └── (add diagrams as .png/.md files here — reference them when relevant)
├── backend/                       ← NestJS API (see backend/CLAUDE.md for full details)
│   ├── CLAUDE.md
│   ├── Dockerfile
│   └── src/
│       ├── main.ts
│       ├── app.module.ts
│       ├── config/               ← Env config + Joi validation
│       ├── common/               ← Adapters, filters, interceptors, decorators, providers, utils
│       └── modules/              ← Feature modules (auth, user, role, email, seed, and feature-specific)
└── frontend/                      ← React SPA (see frontend/CLAUDE.md for full details)
    ├── CLAUDE.md
    ├── Dockerfile
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── adapters/             ← Axios HTTP adapter
        ├── plugins/              ← TanStackProvider, ToastifyProvider
        ├── store/                ← Zustand (client state only)
        ├── components/           ← Shared layout and UI components
        ├── features/             ← Feature-based modules
        └── types/                ← Shared TypeScript types
```

## Architecture Decisions

### Backend (NestJS) — Key Principles
These are non-negotiable conventions. See `backend/CLAUDE.md` for exhaustive details.

- **Env validation with Joi** — all env vars validated at boot via `config/env.config.ts`. App fails fast if vars are missing.
- **Path aliases** — `@auth/*`, `@common/*`, `@config/*`, `@user/*`, etc. Always use aliases, never relative imports across module boundaries.
- **Adapter pattern** — cross-cutting concerns (hashing, UUID) are injectable services implementing interfaces from `common/interfaces/`.
- **CommonModule** — exports `DatabaseExceptionHandler`, adapters. Imported where needed.
- **GlobalExceptionFilter** — catches `HttpException`, `QueryFailedError`, and generic `Error`. Never expose raw DB errors.
- **ResponseInterceptor** — wraps all successful responses: `{ statusCode, message, data }`.
- **HttpResponseMessage** utility — `.success()`, `.created()`, `.updated()`, `.deleted()` for consistent service responses.
- **DatabaseExceptionHandler** — injectable provider for service-level DB error translation.
- **Auth composition**: `@Auth(ValidRoles.USER)` composes `@RoleProtected`, `AuthGuard`, `UserRolesGuard` in one decorator.
- **Email module** with `EMAIL_ENABLED` flag — can disable email sending entirely via env for development.
- **Seed module** — only runs in dev, blocked in production. Populates roles + test users.
- **Swagger** on every endpoint.
- **Global prefix**: `api/v1`

### Frontend (React) — Key Principles
These are non-negotiable conventions. See `frontend/CLAUDE.md` for exhaustive details.

- **Providers as wrapper components** in `plugins/` — `TanStackProvider`, `ToastifyProvider`, composed in `main.tsx`.
- **Axios adapter** in `adapters/http.adapter.ts` — single instance, request interceptor for auth token, response interceptor for data unwrapping and error handling. Critical: 401 only redirects if user **was** previously authenticated (had token). Login failures must NOT redirect.
- **Feature-based structure** — each feature owns its `api`, `hooks`, `components`, `interfaces`, `const` folders.
- **One custom hook per mutation** — `useCreateX`, `useUpdateX`, `useDeleteX`, `useGetX`. Each hook encapsulates TanStack Query + toast.
- **Service layer** — API functions are plain objects with async methods. Hooks call services, services call axios adapter.
- **Zustand for client state only** — auth token, UI preferences. Server data goes through TanStack Query.
- **No native form validation** — `noValidate` on all `<form>` tags, validation in JS before mutation.
- **Tailwind CSS** with custom theme + component classes in `@layer components`.

### Infrastructure
- Docker Compose: PostgreSQL 16 + NestJS (hot reload) + Vite (HMR)
- `.env` files for local dev
- Backend on port `3001`, frontend on port `5173`

## Global Code Style Rules
- TypeScript strict mode in both projects
- No `any` unless absolutely necessary — add `// TODO: type this` comment if forced
- English for code, variables, types, comments. Spanish acceptable in user-facing strings only
- Every module/feature gets its own folder with co-located files
- Barrel exports (`index.ts`) for folders with 2+ exports
- No circular imports — use `forwardRef` only when genuinely needed, document why

## When to Update CLAUDE.md Files
- **Root CLAUDE.md** — update when: new feature added to roadmap, architecture decision changes, new global convention
- **backend/CLAUDE.md** — update when: new path alias added, new module pattern introduced, new shared provider/util created
- **frontend/CLAUDE.md** — update when: new route added, new shared component pattern, new plugin/provider introduced

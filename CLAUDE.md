# Siren — Project Configuration

## What is Siren
Siren is a **QA Engineering platform** that streamlines test automation workflows. It's built as a modular system where each major capability ships as a named feature release (codename + version). While the initial focus is Cypress, the architecture is designed to support multiple test frameworks (Robot Framework, Playwright, etc.) through a provider/strategy abstraction.

**Author:** Fernando Hernandez
**Stack:** NestJS (backend) + React (frontend) + PostgreSQL + Docker
**Monorepo structure:** Two independent projects (`backend/`, `frontend/`) orchestrated by Docker Compose at the root.

---

## Feature Roadmap

The roadmap is organized in **drops** — incremental, shippable releases within each version. Each drop has a clear scope and can be developed independently. Features within a drop may depend on previous drops being complete.

### v1 — FastPages Era (Foundation + Element Mapping)

| Drop | Codename | Scope | Status | Dependencies |
|------|----------|-------|--------|--------------|
| v1.0 | **FastPages** | Visual element inspector for Cypress POM locator mapping. Projects, pages, selectors, proxy-based inspector, JSON/TypeScript export. | In development | — |
| v1.1 | **UserHub** | User profile management (view/edit own profile, avatar, preferences). Password change from profile. Admin user management panel improvements. | Planned | v1.0 |
| v1.2 | **TeamForge** | Team/workspace management. Tech leads create projects and assign team members. Role-based access per project (owner, editor, viewer). Invitation flow. | Planned | v1.1 |

### v2 — Intelligence Era (AI + Smart Analysis)

| Drop | Codename | Scope | Status | Dependencies |
|------|----------|-------|--------|--------------|
| v2.0 | **SuiteBuilder** | Test suite organization — create smoke/regression suites, register spec files, tag-based grouping, execution order configuration. | Planned | v1.2 |
| v2.1 | **WebScout** | DOM scanner that crawls a registered page URL and suggests selectors automatically. Detects interactive elements, forms, navigation items. Returns candidates ranked by selector robustness (data-testid > id > css > xpath). | Planned | v2.0 |
| v2.2 | **SirenAI** | AI integration layer. Phase 1: Selector quality analysis (fragility scoring, alternative suggestions). Phase 2: Smart scan assistance (enhancing WebScout results). Phase 3: Test step generation from mapped selectors. | Planned | v2.1 |

### v3 — Ecosystem Era (Multi-Framework + Execution)

| Drop | Codename | Scope | Status | Dependencies |
|------|----------|-------|--------|--------------|
| v3.0 | **CommandCenter** | Execute and monitor Cypress runs from the platform. View results, screenshots, video. Basic CI/CD pipeline triggers. | Ideation | v2.0 |
| v3.1 | **FrameworkBridge** | Multi-framework support. Export selectors/POMs for Robot Framework, Playwright, etc. Framework-agnostic selector storage with framework-specific export providers. | Ideation | v3.0 |
| v3.2 | **ReverseEngine** | Import existing automation projects into Siren. Parse Cypress/Robot specs to extract pages, selectors, and test structure. Requires mature internal data model. | Ideation | v3.1 |

### Backlog (Unscheduled)
Ideas captured but not yet assigned to a version. Move to a drop when scope is clear:
- **GitHub Integration** — Replace direct filesystem writes (`updateFile`) with Git-based delivery. Users configure a GitHub repo + branch per project; Siren commits exported POM files via GitHub API. Planned after UserHub (v1.1) when user/project ownership model is solid. The `updateFile` endpoint and "Update File" button remain in the codebase but are disabled in the UI with an informational toast until this is implemented.
- **Dashboard Analytics** — Project health metrics (selector coverage, staleness, team activity).
- **Notification System** — In-app + email notifications for team events (selector deprecated, new team member, export completed).
- **Plugin/Extension API** — Allow third-party tools to integrate with Siren's selector data.
- **Selector Versioning** — Track selector history over time, diff between versions, rollback.

---

## Architecture Guardrails

Decisions to make **now** (or keep in mind during current development) to avoid costly refactors later. These are not features — they're structural choices that keep the codebase "future-ready."

### 1. Framework-Agnostic Selector Model (Impacts: v1.0+)
Selectors are already stored with `SelectorStrategy` enum and metadata. **Keep this model framework-neutral.** The selector entity stores *what* to find on the page. The *how to express it in code* is the export layer's job.

**Current state:** ExportService generates Cypress-specific output.
**Guardrail:** When adding export logic, use a strategy/provider pattern:
```
common/interfaces/framework-export.interface.ts  → ExportProviderInterface { export(selectors): string }
modules/project/providers/cypress-export.provider.ts
modules/project/providers/robot-export.provider.ts   ← future
```
The ExportService selects the provider based on project config or export request params. This is a refactor to plan for v1.0 completion, not v3.1.

### 2. Selector Metadata Enrichment (Impacts: v2.1, v2.2)
Each selector should carry enough metadata for AI analysis later. The current schema already has `elementType`, `selectorStrategy`, `status`. When the model feels stable, consider adding:
- `source`: `'manual' | 'inspector' | 'scanner' | 'ai'` — who/what created this selector.
- `confidence`: `number | null` — AI-assigned robustness score (null for manual).
- `alternatives`: `jsonb | null` — array of alternative selector expressions ranked by robustness.

**Don't add these columns now.** Wait until v2.1 scope is finalized. But **don't make design decisions that would prevent adding them** (e.g., don't flatten selector data into a single string column).

### 3. Async-Ready Service Design (Impacts: v2.1, v3.0)
Web scanning and AI processing will be slow operations. NestJS supports BullMQ queues natively, but **don't add Redis/BullMQ until you need it.** Instead:
- Keep services stateless and idempotent.
- Return results, don't mutate shared state in service methods.
- When v2.1 arrives, wrapping a service method in a Bull processor is trivial if the method is already pure.

### 5. Export Delivery Strategy (Impacts: v1.0, Backlog)
The current `updateFile()` endpoint writes directly to the **server's** filesystem. This works in local development but **not in production** where the server and the user's machine are different. Current strategy:
- **Download-based export** (browser download) is the primary delivery mechanism for v1.0. Both single-page and bulk project export are supported.
- **`updateFile` endpoint remains** in the backend but the UI button is disabled with an informational toast. Do not remove the endpoint — it will be refactored for GitHub integration.
- **Future: GitHub Integration** will replace filesystem writes. The project entity already has `projectPath` which will be repurposed as the target path within a repo (e.g., `cypress/pages/`).
- **Do not add new filesystem-write features.** Any new export delivery should go through download or (future) Git integration.

### 4. Multi-Tenancy via Project Ownership (Impacts: v1.2)
The current auth system has roles (ADMIN, SUPER_USER, USER) but no concept of "who owns this project." When TeamForge lands:
- Projects get an `ownerId` (the creator) and a `team` relation.
- Guards need to check both role AND project membership.
- **Current code should not hardcode ADMIN-only access to projects.** Use `@Auth(ValidRoles.USER)` on project endpoints, then add ownership checks in the service layer. This makes the transition to team-based access smoother.

---

## Project Structure

```
siren/
├── CLAUDE.md                      ← You are here (root project config)
├── docker-compose.yml             ← Orchestrates postgres + backend + frontend
├── documents/                     ← Project documentation (see Documentation Strategy below)
│   ├── architecture/              ← ADRs, ER diagrams, system design docs
│   ├── devlog/                    ← Development journal entries
│   ├── mockups/                   ← UI mockups and wireframes
│   ├── api/                       ← API design notes (Swagger is the live source of truth)
│   └── templates/                 ← Export & output templates (POM, email, etc.)
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

---

## Documentation Strategy

Siren maintains documentation at four levels. This serves both as engineering reference and as raw material for content creation (blog posts, tutorials, case studies).

### 1. Architecture Decision Records (ADRs) — `documents/architecture/`
One file per significant technical decision. Format:
```
documents/architecture/
├── ADR-001-monorepo-structure.md
├── ADR-002-adapter-pattern.md
├── ADR-003-selector-model-design.md
└── ...
```
Each ADR follows this template:
```markdown
# ADR-{number}: {Title}
**Date:** YYYY-MM-DD
**Status:** Accepted | Superseded by ADR-XXX | Deprecated
**Context:** Why this decision was needed.
**Decision:** What was decided.
**Alternatives Considered:** What else was evaluated and why it was rejected.
**Consequences:** What changes as a result. Trade-offs accepted.
```
**When to write one:** New module pattern, new infrastructure choice, schema design that affects multiple features, technology selection.

### 2. Development Journal (Devlog) — `documents/devlog/`
Chronological entries documenting progress, blockers, learnings, and decisions made during implementation. This is the "content goldmine" for blog posts and tutorials.
```
documents/devlog/
├── 2025-06-15-fastpages-proxy-implementation.md
├── 2025-06-22-inspector-iframe-challenges.md
└── ...
```
Each entry:
```markdown
# {Date} — {Title}
**Drop:** v1.0 FastPages
**What was done:** Brief summary.
**Key decisions:** Any choices made and why.
**Blockers/Challenges:** What was hard and how it was solved.
**Next steps:** What comes next.
**Content ideas:** (Optional) Could this become a blog post? What angle?
```
**Frequency:** Write one after each meaningful work session or when solving a non-trivial problem. Doesn't need to be daily.

### 3. Export & Output Templates — `documents/templates/`
Each template defines the exact structure that a backend export provider must generate. Templates are the **source of truth** — the generated output must match the template precisely.
```
documents/templates/
├── TYPESCRIPT_POM_TEMPLATE.md     ← Cypress TypeScript POM class structure
├── ROBOT_POM_TEMPLATE.md          ← (future) Robot Framework POM
├── EMAIL_VERIFICATION_TEMPLATE.md ← (future) Email templates
└── ...
```
Naming convention: `{FRAMEWORK}_{TYPE}_TEMPLATE.md`
**When to write one:** When adding a new export provider, a new email template, or any output format that must follow a strict structure.

### 4. CLAUDE.md Files (Living Technical Reference)
- **Root CLAUDE.md** (this file) — Roadmap, architecture guardrails, global conventions, documentation strategy.
- **backend/CLAUDE.md** — Backend-specific patterns, module structure, path aliases, service conventions.
- **frontend/CLAUDE.md** — Frontend-specific patterns, feature structure, hooks, routing.

**Update rules remain the same:**
- Root → new roadmap item, architecture decision, global convention change.
- Backend → new path alias, new module pattern, new shared provider/util.
- Frontend → new route, new shared component, new plugin/provider.

---

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

---

## Global Code Style Rules
- TypeScript strict mode in both projects
- No `any` unless absolutely necessary — add `// TODO: type this` comment if forced
- English for code, variables, types, comments. Spanish acceptable in user-facing strings only
- Every module/feature gets its own folder with co-located files
- Barrel exports (`index.ts`) for folders with 2+ exports
- No circular imports — use `forwardRef` only when genuinely needed, document why

---

## When to Update CLAUDE.md Files
- **Root CLAUDE.md** — update when: new feature added to roadmap, architecture decision changes, new global convention, new architecture guardrail identified
- **backend/CLAUDE.md** — update when: new path alias added, new module pattern introduced, new shared provider/util created
- **frontend/CLAUDE.md** — update when: new route added, new shared component pattern, new plugin/provider introduced

## Adding a New Feature Checklist
When adding a new feature (new drop from the roadmap), follow these steps:
1. Create an ADR in `docs/architecture/` if the feature introduces new patterns or schema changes.
2. Follow the backend module checklist in `backend/CLAUDE.md`.
3. Follow the frontend feature checklist in `frontend/CLAUDE.md`.
4. Update this roadmap table (change status from Planned → In development → Complete).
5. Write a devlog entry in `docs/devlog/` when the feature reaches a meaningful milestone.
6. If the feature introduces a new architecture guardrail, add it to the guardrails section above.

# ADR-005: Feature-Based Frontend Architecture

**Date:** 2025-01-01 (retroactive)
**Status:** Accepted
**Drop:** Pre-v1.0 (initial architecture)

## Context

As the frontend grows with multiple features (auth, projects, pages, selectors, inspector, and future modules like teams, suites, dashboard), we needed a folder structure that scales without becoming a maze of unrelated files in shared folders.

## Decision

We organize the frontend by **feature**, not by file type. Each feature owns all its related code:

```
features/
└── {featureName}/
    ├── {featureName}.api.ts       ← API service functions
    ├── hooks/                      ← One hook per CRUD operation
    ├── components/                 ← Feature-specific UI
    ├── interfaces/                 ← Feature-specific types
    └── const/                      ← Constants, translations, style maps
```

Shared code lives outside `features/`: `components/ui/` for reusable UI primitives, `components/layout/` for app shell, `types/index.ts` for shared domain types, `store/` for Zustand client state, `adapters/` for HTTP.

## Alternatives Considered

**Type-based structure (`components/`, `hooks/`, `services/`, `pages/`):**
Rejected because it fragments related code across the tree. To understand how "projects" work, you'd need to check `pages/ProjectsPage.tsx`, `hooks/useCreateProject.ts`, `services/project.api.ts`, and `types/project.ts` — all in different folders. With feature-based structure, everything about projects is in `features/project/`.

**Atomic design (atoms, molecules, organisms, templates, pages):**
Rejected because it's designed for design systems, not application architecture. It works well for UI libraries but doesn't naturally accommodate API layers, hooks, or business logic. We use Tailwind's utility classes and simple component composition instead.

## Consequences

- Adding a new feature is self-contained: create a folder, add the standard sub-structure, register routes. No need to touch shared folders unless you're adding genuinely shared components.
- Deleting a feature is clean: remove the folder and its routes. No orphaned files scattered across the codebase.
- Cross-feature dependencies are explicit: if `selector` needs `page` data, it imports from `features/page/`, making the dependency graph visible.
- The one-hook-per-operation pattern (`useCreateX`, `useGetXs`, `useUpdateX`, `useDeleteX`) prevents "god hooks" that accumulate unrelated mutations. Each hook is focused, testable, and encapsulates its own toast/invalidation logic.
- Trade-off: some minor code duplication between features (e.g., similar table components). We accept this because the cost of premature abstraction (a shared generic table that serves nobody well) is higher than a few lines of duplicated markup.
- As features grow, the pattern remains flat: 10 features means 10 folders at the same level, not 10 layers of nesting.

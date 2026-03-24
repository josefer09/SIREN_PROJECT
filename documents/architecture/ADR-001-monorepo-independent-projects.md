# ADR-001: Monorepo with Independent Projects

**Date:** 2025-01-01 (retroactive)
**Status:** Accepted
**Drop:** Pre-v1.0 (initial architecture)

## Context

Siren has two primary codebases — a NestJS backend API and a React frontend SPA. We needed to decide how to organize them: a single unified monorepo with shared packages (Nx, Turborepo), two completely separate repositories, or a monorepo with independent projects sharing only Docker orchestration.

## Decision

We chose a **monorepo with two independent projects** (`backend/`, `frontend/`) at the root, orchestrated by a shared `docker-compose.yml`. Each project has its own `package.json`, `tsconfig.json`, `Dockerfile`, and `CLAUDE.md`.

There is no shared TypeScript code between backend and frontend. Each project defines its own types, even when they represent the same domain entities.

## Alternatives Considered

**Nx/Turborepo monorepo with shared packages:**
Rejected because the overhead of maintaining shared libraries, build pipelines, and package versioning is not justified for a team of one. The shared surface between backend and frontend is minimal — mainly type definitions for API payloads, which are simple enough to duplicate and keep in sync manually.

**Two separate repositories:**
Rejected because it makes Docker Compose orchestration harder (need git submodules or separate clone steps), and the projects are conceptually one product. Having them in the same repo makes it easy to see the full picture.

## Consequences

- Backend and frontend can evolve independently. Upgrading React doesn't block NestJS updates.
- Types must be kept in sync manually between `frontend/src/types/index.ts` and backend DTOs/entities. This is a trade-off we accept — the cost of drift is low (caught immediately by runtime errors) and the cost of a shared package is higher than the benefit at current team size.
- Docker Compose at the root ties everything together for local development.
- If the team grows significantly and type drift becomes a problem, we can extract shared types to a `packages/shared` folder without restructuring either project. The migration path is straightforward.

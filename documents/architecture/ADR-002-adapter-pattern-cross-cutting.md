# ADR-002: Adapter Pattern for Cross-Cutting Concerns

**Date:** 2025-01-01 (retroactive)
**Status:** Accepted
**Drop:** Pre-v1.0 (initial architecture)

## Context

The backend needs utilities like password hashing (bcrypt) and UUID generation across multiple modules. These are cross-cutting concerns — not owned by any single feature module. We needed a pattern that makes them injectable, testable, and replaceable.

## Decision

We use the **Adapter Pattern**: each cross-cutting concern has an interface defined in `common/interfaces/` and an implementation in `common/adapters/{name}-adapter/`. They are registered as NestJS injectable providers in `CommonModule` and exported for use by any feature module.

Current adapters:
- `HashingAdapter` (implements `HashingAdapterInterface`) — wraps bcrypt for hash/compare.
- `UuidAdapter` — wraps `uuid.v4()` for ID generation.

## Alternatives Considered

**Direct library calls in services:**
Rejected because it creates hard coupling to specific libraries. If we ever need to swap bcrypt for argon2 (better security properties), we'd have to change every service that hashes. With the adapter, we change one file.

**NestJS custom providers with useFactory:**
Considered, but the adapter pattern gives us a named class with an explicit interface contract. It's easier to discover in the codebase than an anonymous factory function.

**Static utility functions:**
Rejected because they can't be injected, which means they can't be mocked in unit tests. Injectability is non-negotiable for testability.

## Consequences

- Any new cross-cutting utility follows the same pattern: interface in `common/interfaces/`, implementation in `common/adapters/`, exported from `CommonModule`.
- Services declare adapter dependencies via constructor injection, making dependencies explicit and testable.
- The pattern scales naturally. Future candidates: `EmailAdapter` (if we need to swap nodemailer), `StorageAdapter` (if we add file uploads), `AiAdapter` (when SirenAI integration arrives in v2.2).
- Minor overhead: two files (interface + implementation) instead of one utility function. We accept this trade-off for the testability and replaceability benefits.

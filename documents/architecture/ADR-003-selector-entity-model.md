# ADR-003: Selector as Independent Entity with Rich Metadata

**Date:** 2025-01-01 (retroactive)
**Status:** Accepted
**Drop:** v1.0 FastPages

## Context

The core domain object in FastPages is the **selector** — a reference to a web element on a page that Cypress (or another framework) uses to interact with it. We needed to decide how to model selectors in the database: as a JSON array embedded in the Page entity, or as independent entities with their own table and rich metadata.

## Decision

Selectors are **independent entities** in their own table, with a many-to-one relationship to Page. Each selector carries structured metadata:

- `name` (string) — Human-readable identifier used in Page Object code (e.g., `loginButton`, `emailInput`).
- `value` (string) — The actual selector expression (e.g., `#login-btn`, `[data-cy="email"]`).
- `selectorStrategy` (enum) — How the element is located: `ID`, `CLASS`, `CSS`, `XPATH`, `DATA_CY`, `DATA_TESTID`, `PLACEHOLDER`, `NAME`, `TAG`.
- `elementType` (enum) — What kind of element it is: `INPUT`, `BUTTON`, `SELECT`, `TEXTAREA`, `LINK`, `DIV`, `CHECKBOX`, `RADIO`, etc.
- `status` (enum) — Lifecycle state: `PENDING` (created but no value), `MAPPED` (has a value), `DEPRECATED` (no longer valid).

## Alternatives Considered

**JSON column on Page entity:**
Rejected for three reasons. First, you can't query individual selectors efficiently (e.g., "find all deprecated selectors across all pages"). Second, you can't enforce uniqueness constraints on selector names within a page at the database level. Third, future features like selector versioning, AI confidence scoring, and duplicate detection all require selectors to be first-class entities.

**Flat string storage (name + value only):**
Rejected because losing the strategy and element type metadata would cripple future features. The inspector already detects *how* it found the element (by ID vs CSS vs data attribute). Throwing that information away means WebScout (v2.1) and SirenAI (v2.2) would have to re-infer it.

## Consequences

- Selectors can be queried, filtered, and aggregated independently from their parent page.
- The `status` enum enables workflow tracking: inspectors create selectors as `PENDING`, mapping sets them to `MAPPED`, and deprecation is explicit.
- The `selectorStrategy` enum captures *how* the element is located, which is critical for robustness analysis in future AI features (data-testid is more robust than CSS nth-child).
- The `elementType` enum captures *what* the element is, enabling future features like "show me all buttons across the project" or "which inputs don't have selectors yet."
- Adding future metadata columns (`source`, `confidence`, `alternatives`) is a simple migration — no structural refactor needed.
- Trade-off: more DB queries than a JSON column (separate query for page + selectors). Mitigated by eager loading via TypeORM relations where appropriate.

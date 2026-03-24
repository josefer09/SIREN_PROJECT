# 2025-03-24 — Documentation Structure & Roadmap Formalization

**Drop:** Pre-v1.1 (project organization)

## What was done

Formalized the project documentation structure and expanded the roadmap from 3 vague entries to a versioned drop system with explicit dependencies. Created retroactive ADRs for the 5 foundational architecture decisions that were made during initial development but never documented.

### Deliverables
- Created `docs/` folder structure: `architecture/`, `devlog/`, `mockups/`, `api/`.
- Wrote 5 retroactive ADRs covering: monorepo structure, adapter pattern, selector entity model, proxy-based inspector, and feature-based frontend architecture.
- Updated root `CLAUDE.md` with expanded roadmap (v1 → v2 → v3 drops), architecture guardrails section, and documentation strategy.
- Created mockup index cataloging existing visual references.

## Key decisions

- **Drops over phases.** The roadmap uses "drops" (shippable increments within a version) instead of generic "phases." Each drop has a codename, clear scope, and explicit dependencies on prior drops. This makes sprint planning concrete.
- **Architecture guardrails as a living section.** Instead of ADRs for *future* decisions, the root CLAUDE.md has a "guardrails" section for structural choices that need to be respected *now* to keep the codebase ready for later features (multi-framework export, AI metadata, async services, team ownership).
- **ADRs are retroactive-safe.** The first 5 ADRs document decisions already made. This is standard practice — the value is in capturing the *reasoning*, not just the timestamp.

## Blockers/Challenges

None — this was a documentation-only session.

## Next steps

- Copy mockup .png files into `docs/mockups/` (they currently live in `documents/` at root).
- Begin v1.1 UserHub or the ExportService provider pattern refactor.
- Write first "real" devlog entry after the next implementation session.

## Content ideas

- **Blog post:** "How I organize a solo full-stack project for long-term growth" — covering the ADR practice, CLAUDE.md hierarchy, and drop-based roadmap. Angle: practical advice for indie developers building non-trivial tools.
- **Blog post:** "5 architecture decisions I made building a QA platform (and why)" — each ADR as a section, with the alternatives considered as the hook.

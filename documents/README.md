# Siren — Project Documentation

This folder contains all project documentation outside of code. It serves two purposes:
1. **Engineering reference** — Architecture decisions, design rationale, API notes.
2. **Content source** — Development journal entries that can become blog posts, tutorials, or case studies.

## Structure

| Folder | Purpose | Naming Convention |
|--------|---------|-------------------|
| `architecture/` | Architecture Decision Records (ADRs) | `ADR-{NNN}-{kebab-case-title}.md` |
| `devlog/` | Development journal entries | `{YYYY-MM-DD}-{kebab-case-topic}.md` |
| `mockups/` | UI wireframes and visual references | `{feature}_{view}_{version}.png` |
| `api/` | API design notes (Swagger remains the live source of truth) | Free-form `.md` files |
| `templates/` | Export & output templates — source of truth for generated code/files | `{FRAMEWORK}_{TYPE}_TEMPLATE.md` |

## Quick Links

- [ADR Index](architecture/README.md)
- [Mockup Index](mockups/README.md)
- [Templates Index](templates/README.md)

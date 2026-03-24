# Siren — Templates

Export and output templates that define the exact structure Siren must generate. Each template is the **source of truth** for its corresponding backend export provider.

## Index

| Template | Framework | Purpose | Used by |
|----------|-----------|---------|---------|
| [TYPESCRIPT_POM_TEMPLATE.md](TYPESCRIPT_POM_TEMPLATE.md) | Cypress (TypeScript) | Page Object Model class structure | `ExportService.exportPageTypescript()` |

## Naming Convention

`{FRAMEWORK}_{TYPE}_TEMPLATE.md`

Examples:
- `TYPESCRIPT_POM_TEMPLATE.md` — Cypress TypeScript POM
- `ROBOT_POM_TEMPLATE.md` — Robot Framework POM (future)
- `PLAYWRIGHT_POM_TEMPLATE.md` — Playwright POM (future)
- `EMAIL_VERIFICATION_TEMPLATE.md` — Email templates (future)

## How to Use

When implementing or modifying an export provider, the corresponding template in this folder is the spec. The generated output **must** match the template exactly — formatting, ordering, naming conventions, and edge cases included.

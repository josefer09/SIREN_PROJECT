# ADR-004: Proxy-Based Inspector over Browser Extension

**Date:** 2025-01-01 (retroactive)
**Status:** Accepted
**Drop:** v1.0 FastPages

## Context

FastPages needs to let users visually click on elements of a target website and extract selector information (ID, classes, CSS path, data attributes, etc.). This is the core interaction model of the inspector. We needed a mechanism to render a third-party website inside our application and intercept user clicks on its elements.

## Decision

We use a **proxy-based approach**: the backend has a `/api/v1/proxy?url=...` endpoint that fetches the target website's HTML and serves it back to the frontend. The frontend renders this proxied HTML inside an iframe. A script injected into the iframe listens for click events, extracts selector data from the clicked element, and communicates with the parent Siren app via `postMessage`.

The inspector runs **full-screen** as a dedicated route (`/pages/:id/inspect/:selectorId`), with a top bar showing the current selector name and page URL, and a right sidebar displaying available selector options (id, class, css, placeholder, tag, etc.).

## Alternatives Considered

**Browser extension (Chrome DevTools panel):**
Rejected because it requires users to install an extension, which adds friction and makes the tool browser-dependent. It also splits the UX between the Siren web app and the extension panel, breaking the workflow continuity. A web-based inspector keeps everything in one place.

**Puppeteer/Playwright on the backend (headless browser rendering):**
Rejected because it's resource-heavy (running a headless browser per user session), adds latency (backend must render then screenshot/serialize), and doesn't provide the real-time click interaction we need. The user needs to *interact* with the page, not just see a screenshot.

**Direct iframe without proxy:**
Rejected because most websites set `X-Frame-Options: DENY` or `Content-Security-Policy: frame-ancestors 'none'`, which prevents embedding in an iframe. The proxy strips these headers, making virtually any website embeddable.

## Consequences

- Any public website can be inspected regardless of its CORS or framing policies, because the proxy serves the content from our own domain.
- The inspector is a web-first experience — no installations, no extensions, works on any browser.
- Trade-off: some websites with heavy client-side rendering (SPAs) may not fully render through the proxy since JavaScript execution depends on the proxied context. For most server-rendered and hybrid pages, this works well.
- Trade-off: the proxy adds backend load per inspection session. For a small team tool this is acceptable. If scale becomes an issue, the proxy could be moved to an edge function or caching layer.
- The `postMessage` bridge between iframe and parent app is the critical integration point. It must be maintained carefully — any changes to the message format affect both the injected script and the React inspector component.
- This architecture is framework-agnostic: the same inspector works for Cypress, Robot Framework, or any framework — it extracts DOM information, not framework-specific code.

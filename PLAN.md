# Port "Anatomical Analogy Creator" off Emergent -> Vercel + OpenRouter

## Goal

Create an independent copy of `victogarcia4/ap-analogy-creator` in this
repository (`victogarcia4/ap-new-analogy-creator`). Preserve the existing
analogy workflow, prompt quality, interface, Markdown export, and history
experience while removing all Emergent-only infrastructure.

The completed app will deploy on Vercel, call OpenRouter only from server-side
API routes, keep saved analogies in a Vercel Marketplace Postgres database, add
an economical Light Mode, and export an analogy as a printable PDF.

## Repository layout

1. Clone the original repository into `../old-project` and leave it unchanged
   as the source reference.
2. Copy the application into this repository without the original `.git`
   metadata. Commit the pristine copied app before modernization so the port is
   easy to review.

## Target architecture

```
Browser -> Vercel deployment
           |- React static site
           |- /api/* Vercel Functions (TypeScript)
           |- Postgres (Vercel Marketplace provider)
           `- OpenRouter -> configured generation model
```

The frontend calls relative `/api` routes. The OpenRouter key exists only as
the sensitive server-side `OPENROUTER_API_KEY` environment variable in Vercel,
never in source control or browser code.

## Phase 1 - remove Emergent dependencies

- Preserve `SYSTEM_PROMPT`, prompt construction, and JSON extraction from the
  original backend before replacing it.
- Remove `.emergent/`, the Emergent visual-edits dependency, health-check
  plugin, proprietary container configuration, and related CI artifacts.
- Remove `REACT_APP_BACKEND_URL` and use same-origin API calls.
- Retain the current visual design and user-facing workflow.

## Phase 2 - Vercel API and database

Create TypeScript API routes with parity for the existing five endpoints:

- `GET /api/` health and configured model metadata
- `POST /api/analogy/generate`
- `GET /api/analogy/history?limit=30`
- `GET /api/analogy/:id`
- `DELETE /api/analogy/:id`

Use a Postgres `analogies` table with `id`, `concept`, `target_domain`,
`vibe_style`, JSON `payload`, and `created_at`. Map database fields back to
the existing camelCase frontend contract.

The generation route will validate input and model output, use structured JSON
responses where the selected model supports them, retain bounded retry and JSON
extraction fallback behavior, and return a safe error after repeated failure.

## Phase 3 - affordable generation and Light Mode

- Default to `google/gemini-2.5-flash-lite` through an
  `OPENROUTER_MODEL` environment setting.
- Keep the model configurable without a code deployment, allowing a higher
  quality fallback if anatomy-specific evaluation shows it is necessary.
- Add a visible **Light Mode** preset: concise narrative, fewer mapping rows,
  concise clicker questions, and lower-cost model settings.
- Keep the normal mode for the current detailed analogy experience.
- Never expose the model provider key, model error detail, or raw upstream
  responses to the browser.

## Phase 4 - PDF export

- Add an Export PDF control beside the existing Markdown export.
- Use a print stylesheet plus `window.print()` so the browser's Save as PDF
  flow produces selectable text without a large client-side PDF package.
- Print on a light background; hide navigation and controls; prevent narrative,
  mapping, and question blocks from splitting awkwardly across pages.

## Phase 5 - security, testing, and deployment

- Store a newly generated OpenRouter key as sensitive Vercel environment
  variables for Development, Preview, and Production. Do not reuse a key that
  was shared in chat.
- Configure an OpenRouter spend limit and implement application-level request
  throttling before public sharing.
- Test API validation, Postgres history CRUD, generation retries, Light Mode
  output limits, PDF print layout, and existing Markdown export.
- Connect a Vercel Marketplace Postgres provider, configure the deployment
  project, set environment variables, deploy a preview, then validate the
  production deployment end-to-end.

## Required account setup

- A re-authenticated GitHub CLI session to push this repository.
- Vercel project access and permission to create or connect a Postgres
  Marketplace integration.
- A fresh OpenRouter API key configured directly in Vercel.

Cloudflare is not required for this plan.

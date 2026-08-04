# Anatomy Analogy Creator

Vercel-ready React application for creating Anatomy & Physiology teaching analogies with OpenRouter.

## Local development

```powershell
npm run build
```

The production frontend is written to `frontend/build`. The frontend uses relative `/api` requests. For local API development, run the FastAPI app with the dependencies in `requirements.txt` and set the environment variables below.

## Vercel configuration

`vercel.json` builds the CRA frontend and routes `/api/*` to `api/index.py`. Configure these Vercel environment variables before testing generation:

- `OPENROUTER_API_KEY` — a fresh, sensitive OpenRouter key.
- `OPENROUTER_MODEL` — optional; defaults to `google/gemini-2.5-flash-lite`.
- `POSTGRES_URL` — the connection string from a Vercel Marketplace Postgres provider.
- `VERCEL_PROJECT_PRODUCTION_URL` — optional URL used for the OpenRouter referer header.

The API creates the `analogies` table on first database use. The key must remain server-side and must never be placed in `frontend` or committed to Git.

## Features

- Detailed and economical Light generation modes.
- Visual light/dark theme toggle.
- History saved through Postgres.
- Markdown export and browser print-to-PDF export.
- Credit: Built by Dr. Victor Garcia M at [48hours.live](https://48hours.live).

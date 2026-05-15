# FairyTail Forge

An AI-powered offline comic generation studio. Users write a story prompt, pick a genre and panel count, and the app generates a full comic script via Ollama (local LLM) and images via a local Python AI service.

## Offline-first policy (DO NOT VIOLATE)

FairyTail Forge is **local-first, offline-first, no subscription, no cloud AI dependency, no mandatory API keys, no mandatory login**. All core generation must run on the user's machine.

**Forbidden as required dependencies for core features:** OpenAI, Anthropic, Google Gemini, Stability AI, Replicate, HuggingFace paid inference, any other paid cloud inference provider, Stripe / RevenueCat / other payment SDKs, Clerk / Firebase Auth / Supabase Auth / other mandatory cloud auth.

Internet access is allowed **only as optional enhancement** (downloading models, searching references, importing community LoRAs). The app must keep working fully offline after setup.

Future contributors and AI agents **must preserve this architecture**. Before merging changes, run `pnpm run check:offline` — it scans for forbidden SDKs, cloud domains, and hardcoded secrets. See `README.md` and `LOCAL_SETUP.md` for the full policy and local-runtime setup.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/fairytail-forge run dev` — run the frontend (assigned port via workflow)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string (not yet used, reserved for future persistence)

## External Dependencies (local — not in Replit)

This app was originally designed to run on a local machine with:
- **Ollama** (`http://localhost:11434`) — local LLM for story generation (phi3, gemma, mistral, etc.)
- **Python AI service** (`http://localhost:8000`) — local Stable Diffusion image generator using `comiccraft_v10.safetensors`

Without these running, story and image generation will return errors (this is expected behavior).

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite + Tailwind CSS v4 + Zustand
- API: Express 5
- DB: PostgreSQL + Drizzle ORM (reserved, not yet used)
- Fonts: Inter + Outfit (Google Fonts)
- Key packages: jspdf, html-to-image (PDF export), lucide-react, clsx

## Where things live

- `artifacts/fairytail-forge/` — frontend (React + Vite), serves at `/`
- `artifacts/api-server/` — Express API, serves at `/api`
- `artifacts/api-server/src/routes/comic.ts` — comic routes: `/api/models`, `/api/story`, `/api/image`
- `artifacts/fairytail-forge/src/components/` — Sidebar, ComicCanvas, PanelCard, StoryGeneratorModal, CharacterList
- `artifacts/fairytail-forge/src/store/useStore.ts` — Zustand store (project state, generation queue)
- `artifacts/fairytail-forge/src/hooks/useQueue.ts` — sequential image generation queue
- `artifacts/fairytail-forge/src/types/index.ts` — shared TypeScript types
- `lib/api-spec/openapi.yaml` — OpenAPI spec (health endpoint only; comic routes are direct Express routes)

## Architecture decisions

- Comic API routes bypass the OpenAPI codegen pattern and are implemented as plain Express routes in `artifacts/api-server/src/routes/comic.ts`. This is intentional: the story endpoint streams raw Ollama NDJSON, which doesn't fit a typed REST pattern cleanly.
- State management (projects, panels, generation queue) lives entirely in Zustand client state — no DB persistence yet.
- The sequential image generation queue is a custom hook (`useQueue`) that processes one panel at a time to avoid overwhelming the local Python AI service.

## Product

- **Story Generation**: Users describe a story, pick genre + panel count → Ollama streams a JSON script with characters and panel descriptions
- **Comic Canvas**: A4-format comic page with asymmetric panel layout (first panel spans 2 rows, last spans full width)
- **Panel Inking**: Each panel can be individually re-generated or queued for automatic sequential generation
- **PDF Export**: Export the current comic page to a PDF using jsPDF + html-to-image
- **Theme Switcher**: Studio Dark, Manga White, Cyberpunk Neon, Retro Comic themes

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- The frontend API calls use relative URLs (`/api/...`) which the shared proxy routes to the api-server. Do not add explicit ports or Vite proxy configs.
- `pnpm dev` at workspace root has no script — always use `pnpm --filter <package> run dev` or restart via workflow.
- The `scan` CSS animation in PanelCard uses Tailwind's arbitrary `animate-[scan_2s_linear_infinite]` — the `@keyframes scan` definition is in `index.css`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details

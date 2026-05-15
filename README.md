# FairyTail Forge

A fully local, offline-first AI storytelling and manga creation studio.

Write a story idea, let a local LLM expand it into a comic script, and let a local diffusion model render the panels as black-and-white manga line art. Your data, your models, your comics — no cloud accounts required.

## Offline-first policy

FairyTail Forge is and must remain:

- **Local-first** — all core generation runs on the user's machine
- **Offline-first** — works without internet after one-time model download
- **No subscription required**
- **No cloud AI dependency**
- **No mandatory API keys**
- **No mandatory login system**

### Forbidden integrations

The following must **never** be added as a required dependency for core features:

- OpenAI API
- Anthropic API
- Google Gemini API
- Stability AI API
- Replicate API
- HuggingFace paid inference
- Any other paid cloud inference provider
- Payment SDKs (Stripe, RevenueCat, etc.)
- Mandatory cloud auth (Clerk, Firebase Auth, Supabase Auth, etc.)

Internet access may be used **only as an optional enhancement** for: downloading models, searching references, software updates, or importing community LoRAs. The app must keep working fully offline after setup.

Future contributors and AI agents must preserve this architecture. Run `pnpm run check:offline` before committing — CI will fail if any forbidden SDK, domain, or hardcoded secret appears in source.

## Run it

- `pnpm install`
- `pnpm --filter @workspace/api-server run dev` — API server (port 8080)
- `pnpm --filter @workspace/fairytail-forge run dev` — web app
- `pnpm --filter @workspace/fairytail-forge-mobile run dev` — Expo mobile app
- `pnpm run check:offline` — verify no cloud dependencies have crept in
- `pnpm run typecheck` — full typecheck

See [`LOCAL_SETUP.md`](./LOCAL_SETUP.md) for installing the local LLM (Ollama / llama.cpp) and the local Stable Diffusion image service.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend (web): React 19 + Vite + Tailwind CSS v4 + Zustand
- Frontend (mobile): Expo + React Native
- API: Express 5
- DB: PostgreSQL + Drizzle ORM (reserved)
- Local LLM: Ollama (default) or llama.cpp with GGUF models
- Local image gen: Python Stable Diffusion service (SD1.5 Turbo + Manga LoRA)

## License

MIT — your project, your data, your models.

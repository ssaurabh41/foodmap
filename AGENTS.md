# Working on Foodmap

Read `docs/SPEC.md` and `docs/ARCHITECTURE.md` before changing behavior.

## Layout (npm workspaces, all TypeScript)

- `core/`: domain types, search and filtering, the keyword query parser, sample data. Pure
  functions, no I/O. Shared by `web` and `pipeline`. Imported as source (`@foodmap/core`), no build step.
- `web/`: React + Vite app. All data comes through `web/src/data.ts`.
- `pipeline/`: Node scripts that turn raw places into `Restaurant`/`Dish` records using an LLM
  (`LlmClient` in `pipeline/src/llm.ts`; DeepSeek today). Run with `tsx`.
- `scripts/to-artifact.mjs`: converts the single-file mockup build into a shareable page.

## Commands

- `npm run check`: typecheck all packages and run all tests. Run before every commit.
- `npm test`: Vitest; tests live next to code as `*.test.ts`.
- `npm run dev`: web dev server.

## Conventions

- Search/filter logic belongs in `core` with tests, not in React components.
- Every dish fact carries a `Provenance` (where it came from, how confident). Never mark a dish
  vegetarian without evidence; use `unknown`. Taiwan's diet categories are in `core/src/types.ts`.
- User-facing text is English first, with the Chinese original kept alongside (`Bilingual`).
- Secrets live in `.env` (git-ignored). Never commit keys or print them.
- Keep dependencies few. Ask before adding a framework or service.

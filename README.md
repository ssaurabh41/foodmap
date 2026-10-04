# Foodmap

Browse and filter restaurants **and individual dishes** around Hsinchu, Taiwan, in English,
with the original Chinese one tap away. Built for a non-Mandarin speaker who wants to find
"vegetarian mapo tofu within 3 km" without scrolling Google Maps one place at a time.

**Status:** clickable mockup with fictional sample data, plus the data pipeline's first
step (DeepSeek-based translation and dish extraction). No real restaurant data yet.

## Run it

Needs Node 22+.

```sh
npm install
npm run dev          # web app on http://localhost:5173 (also reachable from your phone on the same Wi-Fi)
npm run check        # typecheck + tests
npm run build:mockup # one self-contained HTML file in web/dist-mockup/
```

Try the DeepSeek enrichment step on one fictional restaurant:

```sh
cp .env.example .env   # then put your DEEPSEEK_API_KEY in .env (never commit it)
npm run enrich:sample  # writes pipeline/out/enriched-sample.json
```

## Docs

- [docs/SPEC.md](docs/SPEC.md): what the app does and the decisions made so far
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): how it fits together, and what comes next
- [AGENTS.md](AGENTS.md): conventions for AI coding agents (Claude Code, Codex)

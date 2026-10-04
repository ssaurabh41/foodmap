# Architecture

## Today

```
core/      types · search() · parseQuery() · sample data      (pure TypeScript, tested)
  ▲    ▲
  │    └── web/        React app: list + schematic map + detail + "show to staff"
  └─────── pipeline/   RawPlace ──LLM (DeepSeek)──▶ Restaurant + Dish[]
```

- **Search runs in the browser** over the whole dataset (`core/src/search.ts`). For one city
  (a few thousand restaurants, tens of thousands of dishes) the data is a few MB, so no
  database or search server is needed yet.
- **Query understanding** is a small keyword parser (`core/src/query.ts`), so search works
  with no API calls. It can later be backed by an LLM through the same `ParsedIntent` shape,
  with the keyword parser kept as the offline fallback.
- **The map** is a schematic SVG for the mockup (`web/src/components/MapView.tsx`). The real
  map replaces it behind the same props.

## Target (after Phase 0)

```
 monthly, on the desktop or GitHub Actions                 Cloudflare (free tier)
 ┌──────────────────────────────────────────┐        ┌─────────────────────────────┐
 │ 1. discover  PlaceSource (Google / OSM)  │        │ Pages: web app + data JSON  │
 │ 2. details   reviews, hours, menu text   │ deploy │ Function: LLM query parsing │
 │ 3. enrich    LlmClient → dishes, tags,   │ ─────▶ │   (holds the API key)       │
 │              translations, summary       │        │ Access: login, owner only   │
 │ 4. publish   dataset.json                │        └─────────────────────────────┘
 └──────────────────────────────────────────┘
```

- Only places whose source data changed are re-enriched, to keep LLM cost down.
- Move to Cloudflare D1 (SQLite) only if the dataset outgrows loading in the browser
  (e.g. all of Taiwan).

## Phases

0. **Data spike**: 20–50 real places in one district. Measure menu coverage, DeepSeek quality,
   and cost per place. Decide the open questions in `SPEC.md`.
1. **Prototype on real data**: one or two Hsinchu districts, deployed for the owner's phone.
2. **Grow**: more areas, more sources (blogs, OCR'd menu photos), saved lists.

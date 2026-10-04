# Foodmap spec

## Problem

Finding food on Google Maps means opening restaurants one by one to check ratings, menus,
reviews and recommended dishes, mostly in Chinese. Foodmap gathers that into one English list
of restaurants **and dishes** that can be filtered.

## User

One person (the owner): English speaker living in Hsinchu, does not read Chinese.
Uses a desktop for planning and an iPhone when out.

## Must have (prototype)

- Location: preset areas (city/district), "near me", radius slider. Later: drop a pin, any city in Taiwan.
- Two views of the same search: **Dishes** and **Restaurants**, with list + map.
- Filters: open now, rating, price level, diet, spicy, ingredients to include or avoid, dish price.
- Typed search such as "vegetarian mapo tofu", "something spicy", "noodles under 150, no pork".
  The app shows how it understood the query ("Searching for: Vegetarian · "mapo tofu"").
- Taiwan's vegetarian categories: 全素 vegan, 蛋奶素 lacto-ovo, 五辛素 (allows onion/garlic),
  and 鍋邊素 / meat sauce added, which is **not** treated as vegetarian.
- Every dish shows where its information came from (menu, reviews, guess) and how sure we are.
- English translations with the original Chinese available (names, reviews, address).
- **Show to staff** card: dish name in large Chinese plus requests like 不要辣 (not spicy).
- Copy the Chinese address (for taxis) and open the place in Google Maps.

## Decisions so far

| Topic | Decision | Why |
|---|---|---|
| Budget | No spending for now | Owner's choice. Revisit before real data collection. |
| Data sources | Official APIs and the open web only; no scraping against terms of service | Owner's choice |
| LLM | DeepSeek (owner already has credits), behind an `LlmClient` interface | Swappable later |
| Language | TypeScript everywhere | One language for AI agents to maintain; runs on Cloudflare |
| Hosting (planned) | Cloudflare Pages + a small Function, behind Cloudflare Access (only the owner can open it) | Free tier, no server to manage |
| Freshness | Monthly refresh is fine | Also fits Google's caching rules |

## Open questions

1. **Where the restaurant list comes from without paying.** Google Places has free monthly
   allowances but needs a billing account with a card. OpenStreetMap is free but has no
   ratings or reviews and patchy coverage. To be decided before Phase 0.
2. **Menu photos.** DeepSeek's chat models read text only, so menu photos need OCR first
   (options: Google Cloud Vision free tier, local Tesseract, or a vision-capable model).
3. **Map provider.** Google's terms require Google data to be shown on a Google map.
   If data comes from OpenStreetMap, a free map library (MapLibre/Leaflet) works.
4. **Model quality.** Whether DeepSeek's translations and dish tagging are good enough; check
   on 20+ real places in Phase 0.

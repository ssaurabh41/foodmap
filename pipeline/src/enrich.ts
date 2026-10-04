import type { Dish, Restaurant } from "@foodmap/core";
import { z } from "zod";
import type { LlmClient } from "./llm";
import type { RawPlace } from "./sources/types";

/** What the model must return for one place. Validated before anything is stored. */
export const EnrichmentSchema = z.object({
  nameEn: z.string().min(1),
  addressEn: z.string(),
  district: z.object({ en: z.string(), zh: z.string() }),
  city: z.object({ en: z.string(), zh: z.string() }),
  cuisine: z.array(z.string()),
  summary: z.string(),
  reviewsEn: z.array(z.string()),
  dishes: z.array(
    z.object({
      zh: z.string().min(1),
      en: z.string().min(1),
      description: z.string().optional(),
      priceTwd: z.number().nullable().optional(),
      diet: z.enum(["vegan", "lacto_ovo", "five_pungent", "pot_side", "contains_meat", "unknown"]),
      proteins: z.array(z.enum(["chicken", "pork", "beef", "lamb", "seafood", "egg", "tofu", "organ"])),
      spice: z.number().int().min(0).max(3),
      tags: z.array(z.string()),
      evidence: z.enum(["menu", "reviews", "inferred"]),
      mentions: z.number().int().min(0).optional(),
    }),
  ),
});
export type Enrichment = z.infer<typeof EnrichmentSchema>;

export const SYSTEM_PROMPT = `You prepare restaurant data from Taiwan for an English speaker who does not read Chinese.
You receive one restaurant: its Chinese name, address, reviews and (sometimes) menu text.
Return one JSON object with exactly these keys:
- nameEn: natural English name (translate meaning, keep a romanized brand name if it is a proper name)
- addressEn: the address in English
- district, city: {en, zh}
- cuisine: lowercase English keywords, e.g. ["taiwanese", "noodles"]
- summary: 2-4 plain English sentences on what reviewers say: best dishes, portions, waits, warnings
- reviewsEn: each review translated to English, same order as given
- dishes: every distinct dish found in the menu text or mentioned in reviews, each with:
  zh (as written), en (common English name), description (optional, one sentence),
  priceTwd (number or null), spice (0-3),
  proteins (subset of chicken, pork, beef, lamb, seafood, egg, tofu, organ),
  tags (lowercase English search keywords, include the dish type, e.g. "noodles", "soup", "mapo tofu"),
  evidence ("menu" if in the menu text, "reviews" if only in reviews, "inferred" if you guessed),
  mentions (how many reviews mention it),
  diet, using Taiwan's categories:
    "vegan" = 全素 (no animal products), "lacto_ovo" = 蛋奶素, "five_pungent" = 五辛素 (vegetarian with onion/garlic/scallion),
    "pot_side" = 鍋邊素 or meat sauce added (NOT vegetarian), "contains_meat", or "unknown".
Rules: never mark a dish vegetarian unless the menu or reviews support it; use "unknown" when unsure.
Do not invent dishes that are not in the input.`;

export function buildUserPrompt(p: RawPlace): string {
  const reviews = p.reviews.map((r, i) => `${i + 1}. (${r.rating}★) ${r.text}`).join("\n");
  return [
    `Name: ${p.name}`,
    `Address: ${p.address}`,
    p.menuText ? `Menu text:\n${p.menuText}` : "Menu text: (none)",
    `Reviews:\n${reviews || "(none)"}`,
  ].join("\n\n");
}

/** Turns a raw place into the app's Restaurant + Dish records using the LLM. */
export async function enrichPlace(
  p: RawPlace,
  llm: LlmClient,
): Promise<{ restaurant: Restaurant; dishes: Dish[] }> {
  const raw = await llm.completeJson(SYSTEM_PROMPT, buildUserPrompt(p));
  const parsed = EnrichmentSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`Model output for "${p.name}" failed validation: ${parsed.error.message}`);
  }
  const e = parsed.data;
  const id = `${p.source}-${p.sourceId}`;

  const restaurant: Restaurant = {
    id,
    name: { en: e.nameEn, zh: p.name },
    city: e.city,
    district: e.district,
    address: { en: e.addressEn, zh: p.address },
    location: p.location,
    rating: p.rating ?? 0,
    reviewCount: p.reviewCount ?? 0,
    priceLevel: p.priceLevel ?? 2,
    cuisine: e.cuisine,
    summary: e.summary,
    hours: p.hours ?? [],
    reviews: p.reviews.map((r, i) => ({
      rating: r.rating,
      when: r.when,
      text: { zh: r.text, en: e.reviewsEn[i] ?? "" },
    })),
    mapsUrl:
      p.mapsUrl ??
      `https://www.google.com/maps/search/?api=1&query=${p.location.lat},${p.location.lng}`,
  };

  const dishes: Dish[] = e.dishes.map((d, i) => ({
    id: `${id}-${i + 1}`,
    restaurantId: id,
    name: { zh: d.zh, en: d.en },
    description: d.description,
    priceTwd: d.priceTwd ?? undefined,
    diet: d.diet,
    proteins: d.proteins,
    spice: d.spice as Dish["spice"],
    tags: d.tags,
    popular: (d.mentions ?? 0) >= 2,
    source:
      d.evidence === "menu"
        ? { kind: "menu_photo", confidence: "high", detail: "from the menu" }
        : d.evidence === "reviews"
          ? {
              kind: "reviews",
              confidence: (d.mentions ?? 0) >= 3 ? "medium" : "low",
              detail: `mentioned in ${d.mentions ?? 1} review${d.mentions === 1 ? "" : "s"}`,
            }
          : { kind: "inferred", confidence: "low", detail: "model's guess" },
  }));

  return { restaurant, dishes };
}

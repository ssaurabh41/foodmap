import { describe, expect, it } from "vitest";
import rawPlace from "../fixtures/raw-place.json";
import { buildUserPrompt, enrichPlace, type Enrichment } from "./enrich";
import type { LlmClient } from "./llm";
import type { RawPlace } from "./sources/types";

const raw = rawPlace as RawPlace;

const goodAnswer: Enrichment = {
  nameEn: "A-Lian Noodle House",
  addressEn: "Jianzhong Rd, East District",
  district: { en: "East District", zh: "東區" },
  city: { en: "Hsinchu City", zh: "新竹市" },
  cuisine: ["taiwanese", "noodles"],
  summary: "Cheap, big bowls. Sesame noodles are the favorite.",
  reviewsEn: ["Sesame noodles are fragrant.", "Chili oil wontons are spicy.", "Cheap and filling."],
  dishes: [
    { zh: "麻醬麵", en: "Sesame Paste Noodles", priceTwd: 55, diet: "unknown", proteins: [], spice: 0, tags: ["noodles"], evidence: "menu", mentions: 2 },
    { zh: "素炸醬麵", en: "Vegetarian Zhajiang Noodles", priceTwd: 60, diet: "vegan", proteins: [], spice: 0, tags: ["noodles"], evidence: "menu", mentions: 1 },
    { zh: "燙青菜", en: "Blanched Greens", priceTwd: 35, diet: "pot_side", proteins: [], spice: 0, tags: ["vegetables"], evidence: "reviews", mentions: 1 },
  ],
};

const fakeLlm = (answer: unknown): LlmClient => ({ completeJson: async () => answer });

describe("enrichPlace", () => {
  it("maps model output to restaurant and dish records", async () => {
    const { restaurant, dishes } = await enrichPlace(raw, fakeLlm(goodAnswer));
    expect(restaurant.name).toEqual({ en: "A-Lian Noodle House", zh: "阿蓮麵館" });
    expect(restaurant.reviews[1]?.text).toEqual({
      zh: raw.reviews[1]!.text,
      en: "Chili oil wontons are spicy.",
    });
    expect(dishes).toHaveLength(3);
    expect(dishes[0]).toMatchObject({ restaurantId: restaurant.id, popular: true, source: { kind: "menu_photo" } });
    expect(dishes[2]).toMatchObject({ diet: "pot_side", source: { kind: "reviews", confidence: "low" } });
  });

  it("rejects output that does not match the schema", async () => {
    const bad = { ...goodAnswer, dishes: [{ ...goodAnswer.dishes[0], diet: "vegetarian" }] };
    await expect(enrichPlace(raw, fakeLlm(bad))).rejects.toThrow(/failed validation/);
  });

  it("includes menu text and every review in the prompt", () => {
    const prompt = buildUserPrompt(raw);
    expect(prompt).toContain("素炸醬麵 60");
    for (const r of raw.reviews) expect(prompt).toContain(r.text);
  });
});

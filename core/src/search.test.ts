import { describe, expect, it } from "vitest";
import { PLACES } from "./geo";
import { defaultQuery, parseQuery, type SearchQuery } from "./query";
import { SAMPLE_DATA } from "./sample";
import { search } from "./search";

const station = PLACES[0]!.center;
const monday1pm = new Date(2026, 9, 5, 13, 0);

const run = (overrides: Partial<SearchQuery>) =>
  search(SAMPLE_DATA, { ...defaultQuery(station), radiusKm: 10, ...overrides }, monday1pm);

describe("search", () => {
  it("finds only vegetarian mapo tofu for 'vegetarian mapo tofu'", () => {
    const { dishes } = run(parseQuery("vegetarian mapo tofu"));
    expect(dishes.map((h) => h.dish.name.zh)).toEqual(["素麻婆豆腐"]);
  });

  it("finds both mapo tofus without the diet filter", () => {
    const { dishes } = run(parseQuery("mapo tofu"));
    expect(dishes.map((h) => h.dish.name.zh).sort()).toEqual(["素麻婆豆腐", "麻婆豆腐"].sort());
  });

  it("never counts pot-side (鍋邊素) or unknown dishes as vegetarian", () => {
    const { dishes } = run({ diet: "vegetarian" });
    expect(dishes.length).toBeGreaterThan(0);
    for (const h of dishes) expect(["vegan", "lacto_ovo", "five_pungent"]).toContain(h.dish.diet);
  });

  it("excludes dishes containing an avoided protein", () => {
    const { dishes } = run({ avoid: ["pork"], text: "noodles" });
    expect(dishes.length).toBeGreaterThan(0);
    for (const h of dishes) expect(h.dish.proteins).not.toContain("pork");
  });

  it("respects the radius", () => {
    const near = run({ radiusKm: 1 }).restaurants;
    for (const h of near) expect(h.distanceKm).toBeLessThanOrEqual(1);
    expect(near.length).toBeLessThan(SAMPLE_DATA.restaurants.length);
  });

  it("filters to restaurants open now", () => {
    const open = run({ openNow: true }).restaurants;
    expect(open.every((h) => h.open)).toBe(true);
    // Night market stall opens at 17:00, so it is closed at 1 pm.
    expect(open.some((h) => h.restaurant.id === "windy-night-bites")).toBe(false);
  });

  it("matches restaurant names when no dish names the word", () => {
    const { restaurants } = run({ text: "hakka" });
    expect(restaurants.map((h) => h.restaurant.id)).toContain("hakka-table");
  });
});

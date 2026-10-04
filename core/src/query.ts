import type { LatLng, Protein } from "./types";

export type DietFilter = "any" | "vegetarian" | "vegan";

/** Everything the search can filter on. The UI's chips and the text parser both produce this. */
export interface SearchQuery {
  /** Remaining free-text keywords, matched against dish and restaurant names. */
  text: string;
  center: LatLng;
  radiusKm: number;
  openNow: boolean;
  minRating: number | null;
  maxPriceLevel: number | null;
  maxDishPriceTwd: number | null;
  diet: DietFilter;
  /** Dish must contain at least one of these. */
  proteins: Protein[];
  /** Dish must contain none of these. */
  avoid: Protein[];
  /** true = spicy dishes only, false = non-spicy only, null = don't care. */
  spicy: boolean | null;
}

export function defaultQuery(center: LatLng): SearchQuery {
  return {
    text: "",
    center,
    radiusKm: 3,
    openNow: false,
    minRating: null,
    maxPriceLevel: null,
    maxDishPriceTwd: null,
    diet: "any",
    proteins: [],
    avoid: [],
    spicy: null,
  };
}

/** The parts of a query that can be expressed in a typed sentence. */
export type ParsedIntent = Partial<
  Pick<
    SearchQuery,
    "text" | "openNow" | "maxPriceLevel" | "maxDishPriceTwd" | "diet" | "proteins" | "avoid" | "spicy"
  >
>;

const PROTEIN_WORDS: Record<string, Protein> = {
  chicken: "chicken",
  雞: "chicken",
  pork: "pork",
  豬: "pork",
  beef: "beef",
  牛: "beef",
  lamb: "lamb",
  mutton: "lamb",
  羊: "lamb",
  seafood: "seafood",
  fish: "seafood",
  shrimp: "seafood",
  prawn: "seafood",
  oyster: "seafood",
  squid: "seafood",
  海鮮: "seafood",
  egg: "egg",
  eggs: "egg",
  tofu: "tofu",
  offal: "organ",
  organ: "organ",
  organs: "organ",
  intestine: "organ",
  intestines: "organ",
};

const FILLER = new Set([
  "a", "an", "the", "some", "something", "anything", "i", "want", "wanna", "would", "like", "to",
  "eat", "food", "dish", "dishes", "place", "places", "restaurant", "restaurants", "near", "me",
  "nearby", "around", "with", "for", "please", "find", "show", "good", "best", "and", "or",
]);

/**
 * Turns a typed request like "vegetarian mapo tofu, not too spicy, under 200" into filters.
 *
 * This is a deliberately small keyword parser so the app works with no API at all.
 * An LLM-based parser can replace it later behind the same `ParsedIntent` shape.
 */
export function parseQuery(input: string): ParsedIntent {
  const intent: ParsedIntent = {};
  const proteins = new Set<Protein>();
  const avoid = new Set<Protein>();
  let s = ` ${input.toLowerCase()} `;

  const take = (re: RegExp, onMatch: (m: RegExpMatchArray) => void) => {
    const m = s.match(re);
    if (m) {
      onMatch(m);
      s = s.replace(re, " ");
    }
  };

  take(/\b(under|below|less than|max|<)\s*(nt\$|ntd|\$)?\s*(\d{2,4})\b/, (m) => {
    intent.maxDishPriceTwd = Number(m[3]);
  });
  take(/\bopen( now)?\b/, () => (intent.openNow = true));
  take(/\b(cheap|budget|inexpensive)\b/, () => (intent.maxPriceLevel = 1));
  take(/\b(not( too)? spicy|non-spicy|mild|no spice)\b|不辣/, () => (intent.spicy = false));
  take(/\b(spicy|chil+i)\b|麻?辣/, () => (intent.spicy = true));
  take(/\b(vegan|plant[- ]based)\b|全素/, () => (intent.diet = "vegan"));
  take(/\b(vegetarian|veggie|meatless|meat-free)\b|素食?/, () => {
    if (intent.diet !== "vegan") intent.diet = "vegetarian";
  });

  // "no pork", "without beef", "not chicken"
  for (;;) {
    const m = s.match(/\b(no|without|not|avoid)\s+([a-z]+|[一-鿿])/);
    const protein = m && PROTEIN_WORDS[m[2] ?? ""];
    if (!m || !protein) break;
    avoid.add(protein);
    s = s.replace(m[0], " ");
  }

  const words = s.split(/[\s,.!?;:]+/).filter(Boolean);
  const rest: string[] = [];
  for (const w of words) {
    const protein = PROTEIN_WORDS[w];
    // "tofu" is usually part of a dish name (mapo tofu), so keep it as text too.
    if (protein && protein !== "tofu") proteins.add(protein);
    else if (!FILLER.has(w)) rest.push(w);
  }

  if (proteins.size) intent.proteins = [...proteins];
  if (avoid.size) intent.avoid = [...avoid];
  intent.text = rest.join(" ");
  return intent;
}

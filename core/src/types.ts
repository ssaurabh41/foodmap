/** Text shown in English with the original Traditional Chinese alongside. */
export interface Bilingual {
  en: string;
  zh: string;
}

export interface LatLng {
  lat: number;
  lng: number;
}

/**
 * Taiwan's vegetarian categories are finer than "vegetarian / not":
 * - vegan        全素   no animal products (and traditionally no five pungent spices)
 * - lacto_ovo    蛋奶素 eggs and dairy allowed
 * - five_pungent 五辛素 vegetarian, but onion/garlic/leek etc. allowed
 * - pot_side     鍋邊素 meat picked out of a meat dish; NOT vegetarian for most people
 */
export type DietLabel =
  | "vegan"
  | "lacto_ovo"
  | "five_pungent"
  | "pot_side"
  | "contains_meat"
  | "unknown";

export const VEGETARIAN_DIETS: readonly DietLabel[] = ["vegan", "lacto_ovo", "five_pungent"];

export type Protein =
  | "chicken"
  | "pork"
  | "beef"
  | "lamb"
  | "seafood"
  | "egg"
  | "tofu"
  | "organ";

/** 0 = not spicy, 3 = very spicy. */
export type SpiceLevel = 0 | 1 | 2 | 3;

/** Where a fact about a dish came from, so the UI can show how much to trust it. */
export interface Provenance {
  kind: "menu_photo" | "reviews" | "delivery_menu" | "blog" | "inferred";
  confidence: "high" | "medium" | "low";
  /** Short human-readable note, e.g. "mentioned in 4 reviews". */
  detail?: string;
}

export interface Dish {
  id: string;
  restaurantId: string;
  name: Bilingual;
  /** English description of what the dish is. */
  description?: string;
  priceTwd?: number;
  diet: DietLabel;
  proteins: Protein[];
  spice: SpiceLevel;
  /** Free keywords used by search, e.g. "noodles", "soup", "street food". */
  tags: string[];
  popular?: boolean;
  source: Provenance;
}

export interface Review {
  rating: number;
  text: Bilingual;
  /** Relative age as the source reports it, e.g. "3 months ago". */
  when: string;
}

/** One opening period, e.g. Mon-Fri 11:00-14:00. `close` earlier than `open` means after midnight. */
export interface OpeningPeriod {
  /** 0 = Sunday ... 6 = Saturday */
  days: number[];
  open: string; // "HH:MM"
  close: string; // "HH:MM"
}

export interface Restaurant {
  id: string;
  name: Bilingual;
  city: Bilingual;
  district: Bilingual;
  address: Bilingual;
  location: LatLng;
  rating: number;
  reviewCount: number;
  /** 1 = under NT$150 per person ... 4 = NT$800+ */
  priceLevel: 1 | 2 | 3 | 4;
  cuisine: string[];
  /** One-paragraph English summary of what people say. */
  summary: string;
  hours: OpeningPeriod[];
  reviews: Review[];
  /** Link to the place on Google Maps (or a search for it). */
  mapsUrl: string;
}

export interface Dataset {
  generatedAt: string;
  /** True for the fictional mockup data set. */
  sample: boolean;
  restaurants: Restaurant[];
  dishes: Dish[];
}

import { distanceKm } from "./geo";
import { isOpenAt } from "./hours";
import type { SearchQuery } from "./query";
import { VEGETARIAN_DIETS, type Dataset, type Dish, type Restaurant } from "./types";

export interface DishHit {
  dish: Dish;
  restaurant: Restaurant;
  distanceKm: number;
  score: number;
}

export interface RestaurantHit {
  restaurant: Restaurant;
  distanceKm: number;
  open: boolean;
  /** Dishes that match the dish-level filters (all dishes when none are set). */
  matchingDishes: Dish[];
  score: number;
}

export type SortKey = "relevance" | "rating" | "distance" | "price";

function tokens(text: string): string[] {
  return text.toLowerCase().split(/[\s,]+/).filter(Boolean);
}

function dishHaystack(d: Dish): string {
  return [d.name.en, d.name.zh, d.description ?? "", ...d.tags].join(" ").toLowerCase();
}

function restaurantHaystack(r: Restaurant): string {
  return [r.name.en, r.name.zh, ...r.cuisine].join(" ").toLowerCase();
}

/** True when the query has any filter that applies to individual dishes. */
export function hasDishFilters(q: SearchQuery): boolean {
  return (
    q.text.trim() !== "" ||
    q.diet !== "any" ||
    q.proteins.length > 0 ||
    q.avoid.length > 0 ||
    q.spicy !== null ||
    q.maxDishPriceTwd !== null
  );
}

function dishPasses(d: Dish, q: SearchQuery): boolean {
  if (q.diet === "vegan" && d.diet !== "vegan") return false;
  if (q.diet === "vegetarian" && !VEGETARIAN_DIETS.includes(d.diet)) return false;
  if (q.proteins.length && !q.proteins.some((p) => d.proteins.includes(p))) return false;
  if (q.avoid.some((p) => d.proteins.includes(p))) return false;
  if (q.spicy === true && d.spice === 0) return false;
  if (q.spicy === false && d.spice > 0) return false;
  if (q.maxDishPriceTwd !== null && (d.priceTwd ?? Infinity) > q.maxDishPriceTwd) return false;
  return true;
}

/**
 * Text relevance of a dish: null when some query word appears neither in the dish nor its
 * restaurant; otherwise the fraction of words found in the dish itself (0 = matched only via
 * the restaurant's name or cuisine, e.g. "dumplings" at a dumpling house).
 */
function textScore(d: Dish, r: Restaurant, words: string[]): number | null {
  if (!words.length) return 1;
  const dishText = dishHaystack(d);
  const placeText = restaurantHaystack(r);
  let inDish = 0;
  for (const w of words) {
    if (dishText.includes(w)) inDish += 1;
    else if (!placeText.includes(w)) return null;
  }
  return inDish / words.length;
}

function restaurantPasses(r: Restaurant, q: SearchQuery, dist: number, open: boolean): boolean {
  if (dist > q.radiusKm) return false;
  if (q.openNow && !open) return false;
  if (q.minRating !== null && r.rating < q.minRating) return false;
  if (q.maxPriceLevel !== null && r.priceLevel > q.maxPriceLevel) return false;
  return true;
}

/**
 * Runs the query over the whole data set. Returns both views at once because the UI
 * shows result counts for both tabs.
 */
export function search(
  data: Dataset,
  q: SearchQuery,
  now: Date,
): { restaurants: RestaurantHit[]; dishes: DishHit[] } {
  const words = tokens(q.text);
  const dishFilters = hasDishFilters(q);
  const dishesByRestaurant = new Map<string, Dish[]>();
  for (const d of data.dishes) {
    const list = dishesByRestaurant.get(d.restaurantId) ?? [];
    list.push(d);
    dishesByRestaurant.set(d.restaurantId, list);
  }

  const restaurants: RestaurantHit[] = [];
  const dishes: DishHit[] = [];

  for (const r of data.restaurants) {
    const dist = distanceKm(q.center, r.location);
    const open = isOpenAt(r.hours, now);
    if (!restaurantPasses(r, q, dist, open)) continue;

    const scored = (dishesByRestaurant.get(r.id) ?? [])
      .filter((d) => dishPasses(d, q))
      .map((d) => ({ d, t: textScore(d, r, words) }))
      .filter((x): x is { d: Dish; t: number } => x.t !== null);
    if (dishFilters && !scored.length) continue;

    const best = scored.reduce((m, { t }) => Math.max(m, t), 0);
    const quality = r.rating / 5;
    const nearness = 1 - Math.min(dist / Math.max(q.radiusKm, 0.1), 1);

    restaurants.push({
      restaurant: r,
      distanceKm: dist,
      open,
      matchingDishes: scored.map(({ d }) => d),
      score: (dishFilters ? best * 2 : 0) + quality + nearness * 0.5,
    });

    for (const { d, t } of scored) {
      // In the dish view, list only dishes the text actually describes.
      if (!dishFilters || (words.length && t === 0)) continue;
      dishes.push({
        dish: d,
        restaurant: r,
        distanceKm: dist,
        score: t * 2 + quality + nearness * 0.5 + (d.popular ? 0.3 : 0),
      });
    }
  }

  // With no dish filters the dish tab lists popular dishes nearby.
  if (!dishFilters) {
    for (const hit of restaurants) {
      for (const d of hit.matchingDishes.filter((x) => x.popular)) {
        dishes.push({ dish: d, restaurant: hit.restaurant, distanceKm: hit.distanceKm, score: hit.score });
      }
    }
  }

  return { restaurants, dishes };
}

export function sortRestaurants(hits: RestaurantHit[], key: SortKey): RestaurantHit[] {
  const by: Record<SortKey, (a: RestaurantHit, b: RestaurantHit) => number> = {
    relevance: (a, b) => b.score - a.score,
    rating: (a, b) => b.restaurant.rating - a.restaurant.rating,
    distance: (a, b) => a.distanceKm - b.distanceKm,
    price: (a, b) => a.restaurant.priceLevel - b.restaurant.priceLevel,
  };
  return [...hits].sort(by[key]);
}

export function sortDishes(hits: DishHit[], key: SortKey): DishHit[] {
  const by: Record<SortKey, (a: DishHit, b: DishHit) => number> = {
    relevance: (a, b) => b.score - a.score,
    rating: (a, b) => b.restaurant.rating - a.restaurant.rating,
    distance: (a, b) => a.distanceKm - b.distanceKm,
    price: (a, b) => (a.dish.priceTwd ?? Infinity) - (b.dish.priceTwd ?? Infinity),
  };
  return [...hits].sort(by[key]);
}

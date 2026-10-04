import {
  defaultQuery,
  hasDishFilters,
  parseQuery,
  PLACES,
  search,
  sortDishes,
  sortRestaurants,
  type Dish,
  type ParsedIntent,
  type SearchQuery,
  type SortKey,
} from "@foodmap/core";
import { useMemo, useState, type FormEvent } from "react";
import { loadDataset } from "./data";
import { RestaurantDetail } from "./components/Detail";
import { FilterBar, LocationBar } from "./components/Filters";
import { ListIcon, MapIcon, SearchIcon } from "./components/Icons";
import { MapView } from "./components/MapView";
import { DishList, RestaurantList } from "./components/Results";
import { StaffCard } from "./components/StaffCard";

const EXAMPLES = ["vegetarian mapo tofu", "something spicy", "noodles under 150", "no pork, open now"];
const data = loadDataset();

/** Describes what the text parser understood, so the person can see why results changed. */
function describeIntent(i: ParsedIntent): string[] {
  const parts: string[] = [];
  if (i.diet === "vegan") parts.push("Vegan");
  if (i.diet === "vegetarian") parts.push("Vegetarian");
  if (i.spicy === true) parts.push("Spicy");
  if (i.spicy === false) parts.push("Not spicy");
  if (i.proteins?.length) parts.push(`With ${i.proteins.join(" or ")}`);
  if (i.avoid?.length) parts.push(`No ${i.avoid.join(", no ")}`);
  if (i.maxDishPriceTwd) parts.push(`Under NT$${i.maxDishPriceTwd}`);
  if (i.maxPriceLevel) parts.push("Cheap");
  if (i.openNow) parts.push("Open now");
  if (i.text) parts.push(`“${i.text}”`);
  return parts;
}

export function App() {
  const [placeId, setPlaceId] = useState(PLACES[0]!.id);
  const center = PLACES.find((p) => p.id === placeId)!.center;
  const [query, setQuery] = useState<SearchQuery>(() => defaultQuery(center));
  const [input, setInput] = useState("");
  const [understood, setUnderstood] = useState<string[]>([]);
  const [tab, setTab] = useState<"restaurants" | "dishes">("restaurants");
  const [sort, setSort] = useState<SortKey>("relevance");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [staffDish, setStaffDish] = useState<Dish | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");
  const now = useMemo(() => new Date(), []);

  const results = useMemo(() => search(data, query, now), [query, now]);
  const restaurants = useMemo(() => sortRestaurants(results.restaurants, sort), [results, sort]);
  const dishes = useMemo(() => sortDishes(results.dishes, sort), [results, sort]);
  const dishFilters = hasDishFilters(query);

  const update = (patch: Partial<SearchQuery>) => setQuery((q) => ({ ...q, ...patch }));

  const submit = (text: string) => {
    const intent = parseQuery(text);
    setInput(intent.text ?? "");
    setUnderstood(text.trim() ? describeIntent(intent) : []);
    // A typed search starts the dish-level filters fresh; location, rating and price stay.
    update({ text: "", diet: "any", spicy: null, proteins: [], avoid: [], maxDishPriceTwd: null, ...intent });
    if (intent.text) setTab("dishes");
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit(input);
    (document.activeElement as HTMLElement | null)?.blur(); // close the iPhone keyboard
  };

  const reset = () => {
    setQuery((q) => ({ ...defaultQuery(q.center), radiusKm: q.radiusKm }));
    setInput("");
    setUnderstood([]);
  };

  const selectedHit = restaurants.find((h) => h.restaurant.id === selectedId) ?? null;
  // Dishes listed in the map: in the dish tab, one pin per restaurant that has a matching dish.
  const pinHits = tab === "restaurants" ? restaurants : uniqueRestaurants(dishes);
  const pins = pinHits.map((h) => ({ id: h.restaurant.id, label: h.restaurant.name.en, location: h.restaurant.location }));
  const staffRestaurant = staffDish && data.restaurants.find((r) => r.id === staffDish.restaurantId);

  return (
    <div className={`app view-${mobileView}`}>
      {data.sample && (
        <p className="sample-banner">
          Mockup with <b>fictional</b> sample restaurants around Hsinchu. Names, reviews and ratings are invented.
        </p>
      )}

      <header className="top">
        <div className="brand-row">
          <h1 className="brand">
            Foodmap <span className="zh">美食地圖</span>
          </h1>
          <LocationBar
            placeId={placeId}
            radiusKm={query.radiusKm}
            onPlace={(id) => {
              setPlaceId(id);
              update({ center: PLACES.find((p) => p.id === id)!.center });
            }}
            onRadius={(radiusKm) => update({ radiusKm })}
          />
        </div>

        <form className="search" onSubmit={onSubmit} role="search">
          <SearchIcon className="search-icon" />
          <input
            id="q"
            type="search"
            enterKeyHint="search"
            placeholder="Try “vegetarian mapo tofu” or “something spicy”"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            aria-label="Search dishes and restaurants"
          />
          <button type="submit" className="btn-primary">
            Search
          </button>
        </form>

        {understood.length > 0 ? (
          <p className="understood">
            <span className="muted">Searching for</span>
            {understood.map((u) => (
              <span key={u} className="understood-chip">
                {u}
              </span>
            ))}
          </p>
        ) : (
          <p className="examples">
            <span className="muted">Try</span>
            {EXAMPLES.map((ex) => (
              <button key={ex} type="button" className="example" onClick={() => submit(ex)}>
                {ex}
              </button>
            ))}
          </p>
        )}

        <FilterBar query={query} onChange={update} onReset={reset} />
      </header>

      <main className="body">
        <section className="list-pane" aria-label="Results">
          <div className="list-toolbar">
            <div className="tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={tab === "dishes"}
                className={tab === "dishes" ? "on" : ""}
                onClick={() => setTab("dishes")}
              >
                Dishes <span className="count">{dishes.length}</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === "restaurants"}
                className={tab === "restaurants" ? "on" : ""}
                onClick={() => setTab("restaurants")}
              >
                Restaurants <span className="count">{restaurants.length}</span>
              </button>
            </div>
            <label className="sort">
              <span className="muted">Sort</span>
              <select id="sort" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
                <option value="relevance">Best match</option>
                <option value="rating">Rating</option>
                <option value="distance">Distance</option>
                <option value="price">Price</option>
              </select>
            </label>
          </div>

          {tab === "dishes" && !dishFilters && (
            <p className="hint">Popular dishes nearby. Search or filter to find a specific dish.</p>
          )}

          {(tab === "dishes" ? dishes.length : restaurants.length) === 0 ? (
            <div className="empty">
              <p>Nothing matches within {query.radiusKm} km.</p>
              <p className="muted">Widen the radius or remove a filter.</p>
              <div className="empty-actions">
                <button type="button" className="btn-secondary" onClick={() => update({ radiusKm: 10 })}>
                  Search 10 km
                </button>
                <button type="button" className="btn-secondary" onClick={reset}>
                  Clear filters
                </button>
              </div>
            </div>
          ) : tab === "dishes" ? (
            <DishList hits={dishes} onOpen={setSelectedId} onStaff={setStaffDish} />
          ) : (
            <RestaurantList
              hits={restaurants}
              showMatches={dishFilters}
              selectedId={selectedId}
              onOpen={setSelectedId}
            />
          )}
        </section>

        <section className="map-pane" aria-label="Map">
          <MapView
            center={query.center}
            radiusKm={query.radiusKm}
            pins={pins}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </section>

        {selectedHit && (
          <RestaurantDetail
            key={selectedHit.restaurant.id}
            hit={selectedHit}
            allDishes={data.dishes.filter((d) => d.restaurantId === selectedHit.restaurant.id)}
            showMatches={dishFilters}
            now={now}
            onClose={() => setSelectedId(null)}
            onStaff={setStaffDish}
          />
        )}
      </main>

      <button
        type="button"
        className="view-toggle"
        onClick={() => setMobileView(mobileView === "list" ? "map" : "list")}
      >
        {mobileView === "list" ? <MapIcon /> : <ListIcon />}
        {mobileView === "list" ? "Map" : "List"}
      </button>

      {staffDish && staffRestaurant && (
        <StaffCard dish={staffDish} restaurant={staffRestaurant} onClose={() => setStaffDish(null)} />
      )}
    </div>
  );
}

function uniqueRestaurants<T extends { restaurant: { id: string } }>(hits: T[]): T[] {
  const seen = new Set<string>();
  return hits.filter((h) => !seen.has(h.restaurant.id) && seen.add(h.restaurant.id));
}

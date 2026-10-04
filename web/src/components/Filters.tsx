import { PLACES, type Protein, type SearchQuery } from "@foodmap/core";
import { useState } from "react";
import { PinIcon, SlidersIcon } from "./Icons";

const PROTEINS: { id: Protein; label: string }[] = [
  { id: "chicken", label: "Chicken" },
  { id: "pork", label: "Pork" },
  { id: "beef", label: "Beef" },
  { id: "lamb", label: "Lamb" },
  { id: "seafood", label: "Seafood" },
  { id: "egg", label: "Egg" },
  { id: "tofu", label: "Tofu" },
  { id: "organ", label: "Offal" },
];

interface LocationProps {
  placeId: string;
  radiusKm: number;
  onPlace: (id: string) => void;
  onRadius: (km: number) => void;
}

export function LocationBar({ placeId, radiusKm, onPlace, onRadius }: LocationProps) {
  return (
    <div className="location">
      <label className="place-select">
        <PinIcon />
        <span className="sr-only">Search around</span>
        <select id="place" value={placeId} onChange={(e) => onPlace(e.target.value)}>
          {PLACES.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </label>
      <label className="radius">
        <span>Within</span>
        <input
          id="radius"
          type="range"
          min={0.5}
          max={10}
          step={0.5}
          value={radiusKm}
          onChange={(e) => onRadius(Number(e.target.value))}
        />
        <output htmlFor="radius">{radiusKm} km</output>
      </label>
    </div>
  );
}

interface FilterProps {
  query: SearchQuery;
  onChange: (patch: Partial<SearchQuery>) => void;
  onReset: () => void;
}

/** Chip-style filters. Native selects keep them usable on iPhone (they open the system picker). */
export function FilterBar({ query, onChange, onReset }: FilterProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const moreCount = query.proteins.length + query.avoid.length + (query.maxDishPriceTwd ? 1 : 0);
  const anyActive =
    query.openNow ||
    query.minRating !== null ||
    query.maxPriceLevel !== null ||
    query.diet !== "any" ||
    query.spicy !== null ||
    moreCount > 0;

  const toggle = (list: Protein[], p: Protein) =>
    list.includes(p) ? list.filter((x) => x !== p) : [...list, p];

  return (
    <div className="filters">
      <div className="chip-row" role="group" aria-label="Filters">
        <button
          type="button"
          className={`chip ${query.openNow ? "on" : ""}`}
          aria-pressed={query.openNow}
          onClick={() => onChange({ openNow: !query.openNow })}
        >
          Open now
        </button>

        <label className={`chip select-chip ${query.diet !== "any" ? "on" : ""}`}>
          <select
            id="diet"
            value={query.diet}
            onChange={(e) => onChange({ diet: e.target.value as SearchQuery["diet"] })}
          >
            <option value="any">Any diet</option>
            <option value="vegetarian">Vegetarian 素</option>
            <option value="vegan">Vegan 全素</option>
          </select>
        </label>

        <label className={`chip select-chip ${query.spicy !== null ? "on" : ""}`}>
          <select
            id="spicy"
            value={query.spicy === null ? "any" : query.spicy ? "yes" : "no"}
            onChange={(e) =>
              onChange({ spicy: e.target.value === "any" ? null : e.target.value === "yes" })
            }
          >
            <option value="any">Any spice</option>
            <option value="yes">Spicy 辣</option>
            <option value="no">Not spicy 不辣</option>
          </select>
        </label>

        <label className={`chip select-chip ${query.minRating !== null ? "on" : ""}`}>
          <select
            id="rating"
            value={query.minRating ?? ""}
            onChange={(e) => onChange({ minRating: e.target.value ? Number(e.target.value) : null })}
          >
            <option value="">Any rating</option>
            <option value="4">4.0+ stars</option>
            <option value="4.3">4.3+ stars</option>
            <option value="4.5">4.5+ stars</option>
          </select>
        </label>

        <label className={`chip select-chip ${query.maxPriceLevel !== null ? "on" : ""}`}>
          <select
            id="price"
            value={query.maxPriceLevel ?? ""}
            onChange={(e) =>
              onChange({ maxPriceLevel: e.target.value ? Number(e.target.value) : null })
            }
          >
            <option value="">Any price</option>
            <option value="1">$ · under NT$150</option>
            <option value="2">$$ or less</option>
            <option value="3">$$$ or less</option>
          </select>
        </label>

        <button
          type="button"
          className={`chip ${moreCount ? "on" : ""}`}
          aria-expanded={moreOpen}
          onClick={() => setMoreOpen(!moreOpen)}
        >
          <SlidersIcon width={15} height={15} />
          Ingredients{moreCount ? ` · ${moreCount}` : ""}
        </button>

        {anyActive && (
          <button type="button" className="chip chip-clear" onClick={onReset}>
            Clear all
          </button>
        )}
      </div>

      {moreOpen && (
        <div className="more-filters">
          <fieldset>
            <legend>Must include one of</legend>
            <div className="toggle-row">
              {PROTEINS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`toggle ${query.proteins.includes(p.id) ? "on" : ""}`}
                  aria-pressed={query.proteins.includes(p.id)}
                  onClick={() => onChange({ proteins: toggle(query.proteins, p.id) })}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>Avoid</legend>
            <div className="toggle-row">
              {PROTEINS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`toggle toggle-avoid ${query.avoid.includes(p.id) ? "on" : ""}`}
                  aria-pressed={query.avoid.includes(p.id)}
                  onClick={() => onChange({ avoid: toggle(query.avoid, p.id) })}
                >
                  No {p.label.toLowerCase()}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>Dish price up to</legend>
            <div className="toggle-row">
              {[null, 100, 150, 200, 300].map((v) => (
                <button
                  key={v ?? "any"}
                  type="button"
                  className={`toggle ${query.maxDishPriceTwd === v ? "on" : ""}`}
                  aria-pressed={query.maxDishPriceTwd === v}
                  onClick={() => onChange({ maxDishPriceTwd: v })}
                >
                  {v ? `NT$${v}` : "Any"}
                </button>
              ))}
            </div>
          </fieldset>
        </div>
      )}
    </div>
  );
}

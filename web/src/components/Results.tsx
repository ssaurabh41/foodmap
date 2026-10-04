import type { Dish, DishHit, RestaurantHit } from "@foodmap/core";
import { DietBadge, formatKm, priceLabel, Rating, SourceBadge, SpiceMeter } from "./Badges";

interface RestaurantListProps {
  hits: RestaurantHit[];
  showMatches: boolean;
  selectedId: string | null;
  onOpen: (id: string) => void;
}

export function RestaurantList({ hits, showMatches, selectedId, onOpen }: RestaurantListProps) {
  return (
    <ol className="results">
      {hits.map((h, i) => {
        const r = h.restaurant;
        const vegCount = h.matchingDishes.filter((d) =>
          ["vegan", "lacto_ovo", "five_pungent"].includes(d.diet),
        ).length;
        return (
          <li key={r.id}>
            <button
              type="button"
              className={`card restaurant-card ${selectedId === r.id ? "selected" : ""}`}
              onClick={() => onOpen(r.id)}
            >
              <span className="pin-no" aria-hidden="true">
                {i + 1}
              </span>
              <span className="card-body">
                <span className="title-row">
                  <span className="name">{r.name.en}</span>
                  <span className="zh name-zh">{r.name.zh}</span>
                </span>
                <span className="meta">
                  <Rating r={r} />
                  <span>{priceLabel(r.priceLevel)}</span>
                  <span>{formatKm(h.distanceKm)}</span>
                  <span className={h.open ? "open" : "closed"}>{h.open ? "Open" : "Closed"}</span>
                </span>
                <span className="summary">{r.summary}</span>
                {showMatches ? (
                  <span className="match-row">
                    {h.matchingDishes.slice(0, 3).map((d) => (
                      <span key={d.id} className="match">
                        <span className="zh">{d.name.zh}</span> {d.name.en}
                      </span>
                    ))}
                    {h.matchingDishes.length > 3 && (
                      <span className="match more">+{h.matchingDishes.length - 3} more</span>
                    )}
                  </span>
                ) : (
                  <span className="tag-row">
                    {r.cuisine.map((c) => (
                      <span key={c} className="tag">
                        {c}
                      </span>
                    ))}
                    {vegCount > 0 && <span className="tag tag-jade">{vegCount} vegetarian</span>}
                  </span>
                )}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

interface DishListProps {
  hits: DishHit[];
  onOpen: (restaurantId: string) => void;
  onStaff: (dish: Dish) => void;
}

export function DishList({ hits, onOpen, onStaff }: DishListProps) {
  return (
    <ol className="results">
      {hits.map((h) => (
        <li key={h.dish.id}>
          <DishCard hit={h} onOpen={onOpen} onStaff={onStaff} />
        </li>
      ))}
    </ol>
  );
}

function DishCard({ hit, onOpen, onStaff }: { hit: DishHit } & Omit<DishListProps, "hits">) {
  const { dish: d, restaurant: r } = hit;
  return (
    <article className="card dish-card">
      <div className="dish-head">
        <div className="dish-names">
          <span className="zh dish-zh">{d.name.zh}</span>
          <span className="dish-en">{d.name.en}</span>
        </div>
        {d.priceTwd !== undefined && <span className="price">NT${d.priceTwd}</span>}
      </div>
      {d.description && <p className="dish-desc">{d.description}</p>}
      <div className="badge-row">
        <DietBadge diet={d.diet} />
        <SpiceMeter level={d.spice} />
        {d.popular && <span className="badge badge-accent">Popular</span>}
        <SourceBadge source={d.source} />
      </div>
      <div className="dish-foot">
        <button type="button" className="link-button" onClick={() => onOpen(r.id)}>
          <span className="at">at</span> {r.name.en}
          <span className="muted">
            {" "}
            · <Rating r={r} /> · {formatKm(hit.distanceKm)}
          </span>
        </button>
        <button type="button" className="btn-staff" onClick={() => onStaff(d)}>
          Show to staff
        </button>
      </div>
    </article>
  );
}

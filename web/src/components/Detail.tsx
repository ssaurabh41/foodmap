import { hoursForDay, type Dish, type RestaurantHit } from "@foodmap/core";
import { useState } from "react";
import { DietBadge, formatKm, priceLabel, Rating, SourceBadge, SpiceMeter } from "./Badges";
import { CloseIcon, ExternalIcon } from "./Icons";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface Props {
  hit: RestaurantHit;
  allDishes: Dish[];
  showMatches: boolean;
  now: Date;
  onClose: () => void;
  onStaff: (dish: Dish) => void;
}

export function RestaurantDetail({ hit, allDishes, showMatches, now, onClose, onStaff }: Props) {
  const r = hit.restaurant;
  const matchIds = new Set(hit.matchingDishes.map((d) => d.id));
  const dishes = showMatches
    ? [...allDishes].sort((a, b) => Number(matchIds.has(b.id)) - Number(matchIds.has(a.id)))
    : allDishes;
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(r.address.zh);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* Clipboard refused; the address is still selectable text. */
    }
  };

  return (
    <aside className="detail" aria-label={`${r.name.en} details`}>
      <header className="detail-head">
        <div>
          <h2>{r.name.en}</h2>
          <p className="zh detail-zh">{r.name.zh}</p>
        </div>
        <button type="button" className="icon-button" onClick={onClose} aria-label="Close details">
          <CloseIcon />
        </button>
      </header>

      <div className="detail-scroll">
        <div className="meta">
          <Rating r={r} />
          <span>{priceLabel(r.priceLevel)}</span>
          <span>{formatKm(hit.distanceKm)}</span>
          <span className={hit.open ? "open" : "closed"}>
            {hit.open ? "Open" : "Closed"} · today {hoursForDay(r.hours, now.getDay())}
          </span>
        </div>

        <section className="detail-section">
          <h3>What people say</h3>
          <p>{r.summary}</p>
          <p className="fineprint">Summarized and translated from Chinese reviews.</p>
        </section>

        <section className="detail-section">
          <h3>Dishes</h3>
          <ul className="detail-dishes">
            {dishes.map((d) => (
              <li key={d.id} className={showMatches && matchIds.has(d.id) ? "is-match" : ""}>
                <div className="dish-head">
                  <div className="dish-names">
                    <span className="zh dish-zh">{d.name.zh}</span>
                    <span className="dish-en">{d.name.en}</span>
                  </div>
                  {d.priceTwd !== undefined && <span className="price">NT${d.priceTwd}</span>}
                </div>
                {d.description && <p className="dish-desc">{d.description}</p>}
                <div className="badge-row">
                  {showMatches && matchIds.has(d.id) && <span className="badge badge-accent">Matches</span>}
                  <DietBadge diet={d.diet} />
                  <SpiceMeter level={d.spice} />
                  <SourceBadge source={d.source} />
                  <button type="button" className="btn-staff btn-small" onClick={() => onStaff(d)}>
                    Show to staff
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="detail-section">
          <h3>Reviews</h3>
          <ul className="reviews">
            {r.reviews.map((rv, i) => (
              <ReviewItem key={i} rating={rv.rating} en={rv.text.en} zh={rv.text.zh} when={rv.when} />
            ))}
          </ul>
        </section>

        <section className="detail-section">
          <h3>Address &amp; hours</h3>
          <p>{r.address.en}</p>
          <p className="zh address-zh">
            {r.city.zh}
            {r.address.zh}
          </p>
          <div className="address-actions">
            <button type="button" className="btn-secondary" onClick={copyAddress}>
              {copied ? "Copied" : "Copy Chinese address (for taxis)"}
            </button>
            <a className="btn-secondary" href={r.mapsUrl} target="_blank" rel="noreferrer">
              Open in Google Maps <ExternalIcon />
            </a>
          </div>
          <table className="hours">
            <tbody>
              {DAYS.map((d, i) => (
                <tr key={d} className={i === now.getDay() ? "today" : ""}>
                  <th scope="row">{d}</th>
                  <td>{hoursForDay(r.hours, i)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </aside>
  );
}

function ReviewItem({ rating, en, zh, when }: { rating: number; en: string; zh: string; when: string }) {
  const [original, setOriginal] = useState(false);
  return (
    <li className="review">
      <div className="review-meta">
        <span className="stars" aria-label={`${rating} stars`}>
          {"★".repeat(rating)}
          <span className="stars-off">{"★".repeat(5 - rating)}</span>
        </span>
        <span className="muted">{when}</span>
        <button type="button" className="link-button small" onClick={() => setOriginal(!original)}>
          {original ? "Show translation" : "Show original"}
        </button>
      </div>
      <p className={original ? "zh" : ""}>{original ? zh : en}</p>
    </li>
  );
}

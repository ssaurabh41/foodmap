import type { DietLabel, Provenance, Restaurant, SpiceLevel } from "@foodmap/core";
import { StarIcon } from "./Icons";

const DIET: Record<DietLabel, { label: string; zh: string; tone: string; hint: string } | null> = {
  vegan: { label: "Vegan", zh: "全素", tone: "jade", hint: "No animal products" },
  lacto_ovo: { label: "Vegetarian", zh: "蛋奶素", tone: "jade", hint: "Contains egg or dairy" },
  five_pungent: { label: "Vegetarian", zh: "五辛素", tone: "jade", hint: "Contains onion, garlic or scallion" },
  pot_side: { label: "Not vegetarian", zh: "鍋邊素", tone: "warn", hint: "Meat removed or meat sauce added; not truly vegetarian" },
  unknown: { label: "Diet unclear", zh: "不確定", tone: "warn", hint: "We couldn't confirm whether this has meat" },
  contains_meat: null,
};

export function DietBadge({ diet }: { diet: DietLabel }) {
  const d = DIET[diet];
  if (!d) return null;
  return (
    <span className={`badge badge-${d.tone}`} title={d.hint}>
      {d.label} <span className="zh">{d.zh}</span>
    </span>
  );
}

export function SpiceMeter({ level }: { level: SpiceLevel }) {
  if (level === 0) return null;
  const label = ["", "Mild", "Spicy", "Very spicy"][level];
  return (
    <span className="badge badge-chili" title={label}>
      <span className="chilis" aria-hidden="true">
        {[1, 2, 3].map((i) => (
          <i key={i} className={i <= level ? "on" : ""} />
        ))}
      </span>
      {label}
    </span>
  );
}

const SOURCE_LABEL: Record<Provenance["kind"], string> = {
  menu_photo: "Menu",
  reviews: "Reviews",
  delivery_menu: "Delivery menu",
  blog: "Blog",
  inferred: "Guess",
};

export function SourceBadge({ source }: { source: Provenance }) {
  return (
    <span className={`source source-${source.confidence}`} title={source.detail}>
      <span className="dot" aria-hidden="true" />
      {SOURCE_LABEL[source.kind]}
      {source.detail && source.kind !== "menu_photo" ? `: ${source.detail}` : ""}
    </span>
  );
}

export function Rating({ r }: { r: Restaurant }) {
  return (
    <span className="rating">
      <StarIcon className="star" />
      <b>{r.rating.toFixed(1)}</b>
      <span className="muted">({r.reviewCount.toLocaleString("en-US")})</span>
    </span>
  );
}

export const priceLabel = (level: number) => "$".repeat(level);

export function formatKm(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

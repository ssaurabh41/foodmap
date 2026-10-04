import { STAFF_PHRASES, type Dish, type Restaurant } from "@foodmap/core";
import { useEffect, useState } from "react";
import { CloseIcon } from "./Icons";

interface Props {
  dish: Dish;
  restaurant: Restaurant;
  onClose: () => void;
}

/** Full-screen card with the dish name in large Chinese, to point at when ordering. */
export function StaffCard({ dish, restaurant, onClose }: Props) {
  const [picked, setPicked] = useState<string[]>([]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const phrases = STAFF_PHRASES.filter((p) => picked.includes(p.id));
  const toggle = (id: string) =>
    setPicked((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]));

  return (
    <div className="staff-overlay" role="dialog" aria-modal="true" aria-label="Show to staff">
      <div className="staff-card">
        <button type="button" className="icon-button staff-close" onClick={onClose} aria-label="Close">
          <CloseIcon />
        </button>
        <p className="staff-polite zh">您好，我想點：</p>
        <p className="staff-dish zh" lang="zh-Hant">
          {dish.name.zh}
        </p>
        {phrases.length > 0 && (
          <ul className="staff-phrases zh" lang="zh-Hant">
            {phrases.map((p) => (
              <li key={p.id}>{p.zh}</li>
            ))}
          </ul>
        )}
        <p className="staff-thanks zh">謝謝！</p>
        <p className="staff-en">
          “Hello, I'd like to order: {dish.name.en}
          {phrases.length ? `. ${phrases.map((p) => p.en).join(". ")}` : ""}. Thank you!”
        </p>
        <p className="staff-place">
          {restaurant.name.en} · <span className="zh">{restaurant.name.zh}</span>
        </p>
      </div>

      <div className="staff-picker">
        <p>Add a request</p>
        <div className="toggle-row">
          {STAFF_PHRASES.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`toggle ${picked.includes(p.id) ? "on" : ""}`}
              aria-pressed={picked.includes(p.id)}
              onClick={() => toggle(p.id)}
            >
              {p.en}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

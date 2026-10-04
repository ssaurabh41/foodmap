import type { OpeningPeriod } from "./types";

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

/**
 * Whether a place is open at `at`. `at` is interpreted in the device's local time,
 * which matches Taiwan time for the person using the app in Taiwan.
 */
export function isOpenAt(hours: OpeningPeriod[], at: Date): boolean {
  const day = at.getDay();
  const yesterday = (day + 6) % 7;
  const now = at.getHours() * 60 + at.getMinutes();

  return hours.some((p) => {
    const open = toMinutes(p.open);
    const close = toMinutes(p.close);
    if (close > open) return p.days.includes(day) && now >= open && now < close;
    // Period runs past midnight: open tonight, or still open from yesterday.
    return (p.days.includes(day) && now >= open) || (p.days.includes(yesterday) && now < close);
  });
}

/** Human-readable hours for one day, e.g. "11:00–14:00, 17:00–20:30" or "Closed". */
export function hoursForDay(hours: OpeningPeriod[], day: number): string {
  const periods = hours
    .filter((p) => p.days.includes(day))
    .sort((a, b) => toMinutes(a.open) - toMinutes(b.open))
    .map((p) => `${p.open}–${p.close}`);
  return periods.length ? periods.join(", ") : "Closed";
}

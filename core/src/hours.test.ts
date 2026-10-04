import { describe, expect, it } from "vitest";
import { hoursForDay, isOpenAt } from "./hours";

const at = (day: number, hhmm: string) => {
  // 2026-10-04 is a Sunday (day 0).
  const [h, m] = hhmm.split(":").map(Number);
  return new Date(2026, 9, 4 + day, h, m);
};

describe("isOpenAt", () => {
  const lunch = [{ days: [1, 2, 3, 4, 5], open: "11:00", close: "14:00" }];

  it("is open inside a period and closed outside it", () => {
    expect(isOpenAt(lunch, at(1, "12:00"))).toBe(true);
    expect(isOpenAt(lunch, at(1, "14:00"))).toBe(false);
    expect(isOpenAt(lunch, at(0, "12:00"))).toBe(false);
  });

  it("handles periods past midnight", () => {
    const late = [{ days: [6], open: "17:00", close: "01:00" }];
    expect(isOpenAt(late, at(6, "23:30"))).toBe(true);
    expect(isOpenAt(late, at(7, "00:30"))).toBe(true); // Sunday 00:30, carried over from Saturday
    expect(isOpenAt(late, at(7, "01:30"))).toBe(false);
  });
});

describe("hoursForDay", () => {
  it("lists periods in order or says Closed", () => {
    const hours = [
      { days: [1], open: "17:00", close: "21:00" },
      { days: [1], open: "11:00", close: "14:00" },
    ];
    expect(hoursForDay(hours, 1)).toBe("11:00–14:00, 17:00–21:00");
    expect(hoursForDay(hours, 2)).toBe("Closed");
  });
});

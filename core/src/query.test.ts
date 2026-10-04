import { describe, expect, it } from "vitest";
import { parseQuery } from "./query";

describe("parseQuery", () => {
  it("extracts diet and keeps the dish name", () => {
    expect(parseQuery("vegetarian mapo tofu")).toEqual({ diet: "vegetarian", text: "mapo tofu" });
  });

  it("understands spicy and filler words", () => {
    expect(parseQuery("I want something spicy")).toEqual({ spicy: true, text: "" });
  });

  it("handles 'not spicy' before 'spicy'", () => {
    expect(parseQuery("noodles not too spicy").spicy).toBe(false);
  });

  it("reads price limits, proteins and exclusions", () => {
    expect(parseQuery("chicken under 200 no pork open now")).toEqual({
      maxDishPriceTwd: 200,
      openNow: true,
      proteins: ["chicken"],
      avoid: ["pork"],
      text: "",
    });
  });

  it("prefers vegan over vegetarian", () => {
    expect(parseQuery("vegan vegetarian noodles").diet).toBe("vegan");
  });

  it("accepts Chinese keywords", () => {
    expect(parseQuery("麻辣 全素")).toMatchObject({ spicy: true, diet: "vegan" });
  });
});

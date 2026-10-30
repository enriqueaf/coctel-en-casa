import { describe, expect, it } from "vitest";
import { searchPantry } from "../src/domain/search";
import type { Brand, Ingredient } from "../src/domain/types";

const ingredients: Ingredient[] = [
  {
    id: "light-rum",
    name: "Light rum",
    nameEs: "ron blanco",
    aliases: ["ron", "rum"],
    kind: "spirit",
    alcoholic: true,
    family: "ron",
  },
  {
    id: "lime-juice",
    name: "Lime juice",
    nameEs: "zumo de lima",
    aliases: ["lima"],
    kind: "juice",
    alcoholic: false,
    family: "citrico",
  },
  {
    id: "lemon-juice",
    name: "Lemon juice",
    nameEs: "zumo de limón",
    aliases: ["limon"],
    kind: "juice",
    alcoholic: false,
    family: "citrico",
  },
];

const brands: Brand[] = [
  {
    id: "bacardi",
    name: "Bacardí",
    aliases: ["bacardi"],
    ingredientId: "light-rum",
    searchQuery: "ron Bacardí",
  },
];

describe("searchPantry", () => {
  it("returns nothing when the query is empty", () => {
    expect(searchPantry("", "todo", ingredients, brands)).toEqual([]);
  });

  it("resolves bacardi to light rum", () => {
    const hits = searchPantry("bacardi", "marca", ingredients, brands);
    expect(hits[0]?.ingredientId).toBe("light-rum");
    expect(hits[0]?.brandId).toBe("bacardi");
  });

  it("lists citrus family members for tipo citrico", () => {
    const hits = searchPantry("citrico", "tipo", ingredients, brands);
    const ids = hits.map((h) => h.ingredientId);
    expect(ids).toContain("lime-juice");
    expect(ids).toContain("lemon-juice");
  });
});

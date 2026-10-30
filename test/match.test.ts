import { describe, expect, it } from "vitest";
import { matchCocktails, randomSample } from "../src/domain/match";
import type { Cocktail, Ingredient, PantryItem } from "../src/domain/types";

const ingredients: Ingredient[] = [
  {
    id: "light-rum",
    name: "Light rum",
    nameEs: "ron blanco",
    aliases: [],
    kind: "spirit",
    alcoholic: true,
    family: "ron",
  },
  {
    id: "lime-juice",
    name: "Lime juice",
    nameEs: "zumo de lima",
    aliases: [],
    kind: "juice",
    alcoholic: false,
    family: "citrico",
  },
  {
    id: "mint",
    name: "Mint",
    nameEs: "menta",
    aliases: [],
    kind: "herb",
    alcoholic: false,
    family: "otro",
  },
  {
    id: "sugar",
    name: "Sugar",
    nameEs: "azúcar",
    aliases: [],
    kind: "syrup",
    alcoholic: false,
    family: "otro",
  },
  {
    id: "soda-water",
    name: "Soda water",
    nameEs: "soda",
    aliases: [],
    kind: "soda",
    alcoholic: false,
    family: "refresco",
  },
  {
    id: "gin",
    name: "Gin",
    nameEs: "ginebra",
    aliases: [],
    kind: "spirit",
    alcoholic: true,
    family: "ginebra",
  },
];

const mojito: Cocktail = {
  id: "1",
  slug: "mojito",
  name: "Mojito",
  nameEs: "Mojito",
  alcoholic: true,
  category: "Cocktail",
  glass: "Highball",
  mood: "caribe",
  tastes: ["citrico", "herbal"],
  bases: ["ron"],
  ingredients: [
    { ingredientId: "light-rum", measure: "50 ml" },
    { ingredientId: "lime-juice", measure: "20 ml" },
    { ingredientId: "mint", measure: "8 hojas" },
    { ingredientId: "sugar", measure: "2 cdta" },
    { ingredientId: "soda-water", measure: "al gusto" },
  ],
  instructionsEs: ["Mezcla"],
  sources: [],
};

const ginRickey: Cocktail = {
  id: "2",
  slug: "gin-rickey",
  name: "Gin Rickey",
  nameEs: "Gin Rickey",
  alcoholic: true,
  category: "Cocktail",
  glass: "Highball",
  mood: "clasico",
  tastes: ["citrico", "seco"],
  bases: ["ginebra"],
  ingredients: [
    { ingredientId: "gin", measure: "50 ml" },
    { ingredientId: "lime-juice", measure: "20 ml" },
    { ingredientId: "soda-water", measure: "al gusto" },
  ],
  instructionsEs: ["Mezcla"],
  sources: [],
};

describe("matchCocktails", () => {
  it("marks a cocktail as makeable when pantry is complete", () => {
    const pantry: PantryItem[] = [
      { ingredientId: "light-rum", label: "Ron" },
      { ingredientId: "lime-juice", label: "Lima" },
      { ingredientId: "mint", label: "Menta" },
      { ingredientId: "sugar", label: "Azúcar" },
      { ingredientId: "soda-water", label: "Soda" },
    ];
    const results = matchCocktails([mojito, ginRickey], ingredients, pantry);
    expect(results[0]?.cocktail.slug).toBe("mojito");
    expect(results[0]?.canMake).toBe(true);
  });

  it("lists a single missing ingredient", () => {
    const pantry: PantryItem[] = [
      { ingredientId: "light-rum", label: "Ron" },
      { ingredientId: "lime-juice", label: "Lima" },
      { ingredientId: "mint", label: "Menta" },
      { ingredientId: "soda-water", label: "Soda" },
    ];
    const results = matchCocktails([mojito], ingredients, pantry);
    expect(results[0]?.missing.map((m) => m.id)).toEqual(["sugar"]);
  });

  it("respects non-alcoholic quiz filter", () => {
    const results = matchCocktails([mojito], ingredients, [{ ingredientId: "light-rum", label: "Ron" }], {
      tastes: [],
      base: "sin-alcohol",
      moment: "cualquiera",
    });
    expect(results).toHaveLength(0);
  });
});

describe("randomSample", () => {
  it("does not repeat excluded slugs", () => {
    const sample = randomSample([mojito, ginRickey], {
      tastes: [],
      base: "cualquiera",
      moment: "cualquiera",
    }, 6, ["mojito"]);
    expect(sample.every((c) => c.slug !== "mojito")).toBe(true);
  });
});

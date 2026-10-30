import brandsJson from "../../data/brands.json";
import cocktailsJson from "../../data/seed/cocktails.json";
import ingredientsJson from "../../data/seed/ingredients.json";
import type { Brand, Cocktail, Ingredient } from "./types";

export function getIngredients(): Ingredient[] {
  return ingredientsJson as Ingredient[];
}

export function getCocktails(): Cocktail[] {
  return cocktailsJson as Cocktail[];
}

export function getBrands(): Brand[] {
  return brandsJson as Brand[];
}

export function getCocktailBySlug(slug: string): Cocktail | undefined {
  return getCocktails().find((c) => c.slug === slug);
}

export function getIngredientMap(): Map<string, Ingredient> {
  return new Map(getIngredients().map((i) => [i.id, i]));
}

export function getFeaturedCocktails(): Cocktail[] {
  return getCocktails().filter((c) => c.featured);
}

export function getCocktailsByBase(base: string): Cocktail[] {
  return getCocktails().filter((c) => c.bases.includes(base as Cocktail["bases"][number]));
}

export function getCocktailsByMood(mood: string): Cocktail[] {
  return getCocktails().filter((c) => c.mood === mood);
}

export function getNonAlcoholicCocktails(): Cocktail[] {
  return getCocktails().filter((c) => !c.alcoholic);
}

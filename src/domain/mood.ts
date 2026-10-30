import type { Cocktail, Mood, SpiritBase, TasteTag } from "./types";

const SOPHISTICATED = new Set([
  "martini",
  "negroni",
  "old-fashioned",
  "manhattan",
  "sazerac",
  "boulevardier",
  "vieux-carre",
  "rob-roy",
  "sidecar",
  "aviation",
  "last-word",
  "french-75",
  "espresso-martini",
]);

const TIKI = new Set([
  "mai-tai",
  "zombie",
  "painkiller",
  "jungle-bird",
  "navy-grog",
  "singapore-sling",
  "planters-punch",
  "scorpion",
]);

const CARIBE = new Set([
  "mojito",
  "daiquiri",
  "pina-colada",
  "cuba-libre",
  "rum-punch",
  "caipirinha",
  "dark-n-stormy",
  "bahamas-mama",
]);

export function inferMood(slug: string, bases: SpiritBase[], tastes: TasteTag[]): Mood {
  if (SOPHISTICATED.has(slug)) return "sofisticado";
  if (TIKI.has(slug)) return "tiki";
  if (CARIBE.has(slug)) return "caribe";
  if (bases.includes("ron") && (tastes.includes("afrutado") || tastes.includes("dulce"))) {
    return "caribe";
  }
  if (bases.includes("ron") && tastes.includes("citrico")) return "tiki";
  if (
    bases.includes("whisky") ||
    bases.includes("brandy") ||
    tastes.includes("amargo") ||
    tastes.includes("seco")
  ) {
    return "sofisticado";
  }
  return "clasico";
}

export const MOOD_LABEL: Record<Mood, string> = {
  caribe: "Caribeño",
  tiki: "Tiki",
  clasico: "Clásico",
  sofisticado: "Sofisticado",
};

export function moodForCocktail(cocktail: Pick<Cocktail, "slug" | "bases" | "tastes" | "mood">): Mood {
  return cocktail.mood || inferMood(cocktail.slug, cocktail.bases, cocktail.tastes);
}

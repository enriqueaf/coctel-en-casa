import { includesNormalized, normalizeText } from "./normalize";
import type { Brand, Ingredient, SearchHit, SearchMode } from "./types";

const FAMILY_LABELS: Record<string, string> = {
  ron: "Ron",
  ginebra: "Ginebra",
  vodka: "Vodka",
  whisky: "Whisky",
  tequila: "Tequila",
  brandy: "Brandy",
  citrico: "Cítrico",
  refresco: "Refresco",
  amargo: "Amargo",
  licor: "Licor",
  zumo: "Zumo",
};

export function searchPantry(
  query: string,
  mode: SearchMode,
  ingredients: Ingredient[],
  brands: Brand[],
  limit = 8,
): SearchHit[] {
  const q = normalizeText(query);
  if (!q) return [];

  const hits: SearchHit[] = [];

  if (mode === "marca" || mode === "todo") {
    for (const brand of brands) {
      const hay = [brand.name, ...brand.aliases].join(" ");
      if (!includesNormalized(hay, q)) continue;
      const ingredient = ingredients.find((i) => i.id === brand.ingredientId);
      hits.push({
        kind: "brand",
        id: `brand:${brand.id}`,
        label: brand.name,
        subtitle: ingredient ? `Como ${ingredient.nameEs}` : undefined,
        ingredientId: brand.ingredientId,
        brandId: brand.id,
      });
    }
  }

  if (mode === "tipo" || mode === "todo") {
    for (const [family, label] of Object.entries(FAMILY_LABELS)) {
      if (!includesNormalized(label, q) && !includesNormalized(family, q)) continue;
      const members = ingredients.filter((i) => i.family === family).slice(0, 5);
      for (const ingredient of members) {
        hits.push({
          kind: "family",
          id: `family:${family}:${ingredient.id}`,
          label: ingredient.nameEs,
          subtitle: `Tipo: ${label}`,
          ingredientId: ingredient.id,
        });
      }
    }
  }

  if (mode === "todo" || mode === "tipo") {
    for (const ingredient of ingredients) {
      const hay = [ingredient.name, ingredient.nameEs, ...ingredient.aliases].join(" ");
      if (!includesNormalized(hay, q)) continue;
      if (hits.some((h) => h.ingredientId === ingredient.id && h.kind !== "brand")) continue;
      hits.push({
        kind: "ingredient",
        id: `ingredient:${ingredient.id}`,
        label: ingredient.nameEs,
        subtitle: ingredient.kind,
        ingredientId: ingredient.id,
      });
    }
  }

  return rankHits(hits, q).slice(0, limit);
}

function rankHits(hits: SearchHit[], q: string): SearchHit[] {
  return [...hits].sort((a, b) => scoreHit(b, q) - scoreHit(a, q));
}

function scoreHit(hit: SearchHit, q: string): number {
  const label = normalizeText(hit.label);
  if (label === q) return 100;
  if (label.startsWith(q)) return 80;
  if (hit.kind === "brand") return 60;
  if (hit.kind === "family") return 50;
  return 40;
}

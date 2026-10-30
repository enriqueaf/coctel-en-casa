import type {
  Cocktail,
  Ingredient,
  MatchResult,
  PantryItem,
  QuizAnswers,
  SpiritBase,
} from "./types";

export function matchCocktails(
  cocktails: Cocktail[],
  ingredients: Ingredient[],
  pantry: PantryItem[],
  quiz?: QuizAnswers,
  options?: { limit?: number },
): MatchResult[] {
  const pantryIds = new Set(pantry.map((p) => p.ingredientId));
  const byId = new Map(ingredients.map((i) => [i.id, i]));
  const limit = options?.limit ?? 24;

  const results: MatchResult[] = [];

  for (const cocktail of cocktails) {
    if (quiz?.base === "sin-alcohol" && cocktail.alcoholic) continue;
    if (quiz?.base && quiz.base !== "cualquiera" && quiz.base !== "sin-alcohol") {
      if (!cocktail.bases.includes(quiz.base as SpiritBase) && quiz.base !== "otro") continue;
    }

    const required = cocktail.ingredients.filter((ci) => !ci.optional);
    const missingIds = required
      .map((ci) => ci.ingredientId)
      .filter((id) => !pantryIds.has(id));
    const matchedCount = required.length - missingIds.length;
    const missing = missingIds
      .map((id) => byId.get(id))
      .filter((i): i is Ingredient => Boolean(i));

    let score = matchedCount * 10 - missingIds.length * 4;
    if (required.length > 0 && missingIds.length === 0) score += 40;
    if (required.length > 0 && missingIds.length === 1) score += 15;

    if (quiz) {
      for (const taste of quiz.tastes) {
        if (cocktail.tastes.includes(taste)) score += 5;
      }
      if (quiz.moment === "playa" && (cocktail.mood === "caribe" || cocktail.mood === "tiki")) {
        score += 8;
      }
      if (quiz.moment === "aperitivo" && cocktail.tastes.includes("amargo")) score += 8;
      if (quiz.moment === "despues" && cocktail.mood === "sofisticado") score += 8;
      if (quiz.moment === "fiesta" && cocktail.tastes.includes("dulce")) score += 5;
    }

    if (pantry.length > 0 && matchedCount === 0) continue;

    results.push({
      cocktail,
      score,
      missing,
      matchedCount,
      totalRequired: required.length,
      canMake: missingIds.length === 0 && required.length > 0,
    });
  }

  return results
    .sort((a, b) => {
      if (a.canMake !== b.canMake) return a.canMake ? -1 : 1;
      if (a.missing.length !== b.missing.length) return a.missing.length - b.missing.length;
      return b.score - a.score;
    })
    .slice(0, limit);
}

export function randomSample(
  cocktails: Cocktail[],
  quiz: QuizAnswers,
  count = 6,
  excludeSlugs: string[] = [],
): Cocktail[] {
  const excluded = new Set(excludeSlugs);
  let pool = cocktails.filter((c) => !excluded.has(c.slug));

  if (quiz.base === "sin-alcohol") {
    pool = pool.filter((c) => !c.alcoholic);
  } else if (quiz.base !== "cualquiera" && quiz.base !== "otro") {
    const baseFiltered = pool.filter((c) => c.bases.includes(quiz.base as SpiritBase));
    if (baseFiltered.length >= count) pool = baseFiltered;
  }

  if (quiz.tastes.length > 0) {
    const tasteFiltered = pool.filter((c) => quiz.tastes.some((t) => c.tastes.includes(t)));
    if (tasteFiltered.length >= count) pool = tasteFiltered;
  }

  if (quiz.moment === "playa") {
    const moodFiltered = pool.filter((c) => c.mood === "caribe" || c.mood === "tiki");
    if (moodFiltered.length >= count) pool = moodFiltered;
  } else if (quiz.moment === "despues") {
    const moodFiltered = pool.filter((c) => c.mood === "sofisticado");
    if (moodFiltered.length >= count) pool = moodFiltered;
  }

  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count);
}

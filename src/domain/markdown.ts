import type { Cocktail, Ingredient } from "./types";
import { MOOD_LABEL } from "./mood";

export function cocktailToMarkdown(
  cocktail: Cocktail,
  ingredientMap: Map<string, Ingredient>,
): string {
  const lines: string[] = [
    `# ${cocktail.nameEs}`,
    "",
    `> ${cocktail.introEs || `${cocktail.nameEs}: cóctel ${MOOD_LABEL[cocktail.mood].toLowerCase()} para preparar en casa.`}`,
    "",
    `- Estilo: ${MOOD_LABEL[cocktail.mood]}`,
    `- Vaso: ${cocktail.glass}`,
    `- Alcohol: ${cocktail.alcoholic ? "sí" : "no"}`,
    `- Categoría: ${cocktail.category}`,
    "",
    "## Ingredientes",
    "",
  ];

  for (const item of cocktail.ingredients) {
    const ingredient = ingredientMap.get(item.ingredientId);
    const name = ingredient?.nameEs || item.ingredientId;
    lines.push(`- ${item.measure} ${name}`);
  }

  lines.push("", "## Preparación", "");
  cocktail.instructionsEs.forEach((step, index) => {
    lines.push(`${index + 1}. ${step}`);
  });

  if (cocktail.faq?.length) {
    lines.push("", "## Preguntas frecuentes", "");
    for (const item of cocktail.faq) {
      lines.push(`### ${item.q}`, "", item.a, "");
    }
  }

  lines.push("", "## Fuentes", "");
  for (const source of cocktail.sources) {
    lines.push(`- [${source.name}](${source.url})`);
  }
  lines.push("");
  return lines.join("\n");
}

import type { APIRoute } from "astro";
import { getCocktails, getIngredientMap } from "../domain/catalog";
import { cocktailToMarkdown } from "../domain/markdown";
import { siteUrl } from "../lib/site";

export const prerender = true;

export const GET: APIRoute = () => {
  const ingredientMap = getIngredientMap();
  const parts = [
    `# Cóctel en casa — catálogo completo`,
    ``,
    `> Índice completo en Markdown. Mapa corto: ${siteUrl("/llms.txt")}`,
    ``,
  ];

  for (const cocktail of getCocktails()) {
    parts.push(cocktailToMarkdown(cocktail, ingredientMap));
    parts.push(`Source: ${siteUrl(`/coctel/${cocktail.slug}`)}`);
    parts.push("");
  }

  return new Response(parts.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};

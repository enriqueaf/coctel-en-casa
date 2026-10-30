export const prerender = true;

import type { APIRoute } from "astro";
import { getCocktailBySlug, getCocktails, getIngredientMap } from "../../domain/catalog";
import { cocktailToMarkdown } from "../../domain/markdown";

export function getStaticPaths() {
  return getCocktails().map((cocktail) => ({
    params: { slug: cocktail.slug },
  }));
}

export const GET: APIRoute = ({ params }) => {
  const cocktail = getCocktailBySlug(params.slug!);
  if (!cocktail) {
    return new Response("Not found", { status: 404 });
  }
  const body = cocktailToMarkdown(cocktail, getIngredientMap());
  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};

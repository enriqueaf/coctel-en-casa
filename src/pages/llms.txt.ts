import type { APIRoute } from "astro";
import { getFeaturedCocktails } from "../domain/catalog";
import { siteUrl } from "../lib/site";

export const prerender = true;

export const GET: APIRoute = () => {
  const featured = getFeaturedCocktails()
    .map((c) => `- [${c.nameEs}](${siteUrl(`/coctel/${c.slug}.md`)}): receta en Markdown`)
    .join("\n");

  const body = `# Cóctel en casa

> Aprende a preparar cócteles en casa eligiendo lo que tienes en la despensa o un cuestionario de gustos. Catálogo citado a TheCocktailDB; textos en español propios.

El sitio está en español. Solo para mayores de 18 años. Las fichas HTML tienen gemelo Markdown y datos Recipe.

## Empezar

- [Inicio](${siteUrl("/")}): dos caminos — despensa o sorpréndeme
- [Con lo que tengo](${siteUrl("/despensa")}): buscador de ingredientes y marcas
- [Sorpréndeme](${siteUrl("/sorprendeme")}): cuestionario visual de gustos
- [Catálogo completo Markdown](${siteUrl("/llms-full.txt")}): todas las fichas en un solo archivo

## Hubs

- [Con ron](${siteUrl("/con/ron")})
- [Con ginebra](${siteUrl("/con/ginebra")})
- [Con vodka](${siteUrl("/con/vodka")})
- [Estilo caribeño](${siteUrl("/estilo/caribe")})
- [Estilo sofisticado](${siteUrl("/estilo/sofisticado")})
- [Sin alcohol](${siteUrl("/sin-alcohol")})
- [Fuentes](${siteUrl("/fuentes")})

## Cócteles destacados

${featured}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};

import type { APIRoute } from "astro";
import { getCocktails } from "../domain/catalog";
import { siteUrl } from "../lib/site";

export const prerender = true;

export const GET: APIRoute = () => {
  const staticPaths = [
    "/",
    "/despensa",
    "/sorprendeme",
    "/fuentes",
    "/aviso",
    "/sin-alcohol",
    "/con/ron",
    "/con/ginebra",
    "/con/vodka",
    "/con/whisky",
    "/con/tequila",
    "/con/brandy",
    "/estilo/caribe",
    "/estilo/tiki",
    "/estilo/clasico",
    "/estilo/sofisticado",
    "/llms.txt",
    "/llms-full.txt",
  ];

  const urls = [
    ...staticPaths.map((path) => ({ loc: siteUrl(path), priority: path === "/" ? "1.0" : "0.7" })),
    ...getCocktails().map((cocktail) => ({
      loc: siteUrl(`/coctel/${cocktail.slug}`),
      priority: cocktail.featured ? "0.9" : "0.6",
    })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    <priority>${url.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};

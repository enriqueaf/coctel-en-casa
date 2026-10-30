import type { APIRoute } from "astro";
import { siteUrl } from "../lib/site";

export const prerender = true;

export const GET: APIRoute = () => {
  const body = `User-agent: *
Allow: /

Content-Signal: search=yes, ai-input=yes, ai-train=yes

Sitemap: ${siteUrl("/sitemap.xml")}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};

export const SITE_NAME = "Cóctel en casa";
export const SITE_TAGLINE =
  "Aprende a preparar cócteles con lo que tienes en casa, o déjate sorprender por gustos.";

export function siteUrl(pathname = "/"): string {
  const base = (import.meta.env.SITE || "https://coctel-en-casa.enrique.workers.dev").replace(/\/$/, "");
  if (!pathname || pathname === "/") return `${base}/`;
  return `${base}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

export function affiliateConfig() {
  return {
    amazonTag: import.meta.env.AMAZON_ASSOCIATE_TAG as string | undefined,
    shopUrlTemplate: import.meta.env.SHOP_URL_TEMPLATE as string | undefined,
  };
}

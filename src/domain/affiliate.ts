export interface AffiliateConfig {
  amazonTag?: string;
  shopUrlTemplate?: string;
}

export function shopUrlForIngredient(
  ingredientName: string,
  config: AffiliateConfig,
  brandSearchQuery?: string,
): string | null {
  const query = (brandSearchQuery || ingredientName).trim();
  if (!query) return null;

  if (config.shopUrlTemplate) {
    return config.shopUrlTemplate.replaceAll("{q}", encodeURIComponent(query));
  }

  if (!config.amazonTag) return null;

  const url = new URL("https://www.amazon.es/s");
  url.searchParams.set("k", query);
  url.searchParams.set("tag", config.amazonTag);
  return url.toString();
}

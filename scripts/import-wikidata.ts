/**
 * Optional enrichment: match cocktail names to Wikidata IBA official cocktails (CC0).
 * https://www.wikidata.org/wiki/Q2536409
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { slugify } from "../src/domain/slug";
import type { Cocktail } from "../src/domain/types";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const QUERY = `
SELECT ?item ?itemLabel WHERE {
  ?item wdt:P31 wd:Q2536409 .
  SERVICE wikibase:label { bd:serviceParam wikibase:language "es,en". }
}
`.trim();

async function main() {
  const url = new URL("https://query.wikidata.org/sparql");
  url.searchParams.set("format", "json");
  url.searchParams.set("query", QUERY);

  const res = await fetch(url, {
    headers: {
      Accept: "application/sparql-results+json",
      "User-Agent": "coctel-en-casa/0.1 (local import; attribution to Wikidata CC0)",
    },
  });
  if (!res.ok) {
    throw new Error(`Wikidata HTTP ${res.status}`);
  }
  const data = (await res.json()) as {
    results: { bindings: { item: { value: string }; itemLabel: { value: string } }[] };
  };

  const bySlug = new Map(
    data.results.bindings.map((row) => {
      const id = row.item.value.split("/").pop()!;
      return [slugify(row.itemLabel.value), { id, label: row.itemLabel.value }];
    }),
  );

  const cocktailsPath = path.join(ROOT, "data/seed/cocktails.json");
  const cocktails = JSON.parse(await readFile(cocktailsPath, "utf8")) as Cocktail[];
  let linked = 0;

  for (const cocktail of cocktails) {
    const hit = bySlug.get(cocktail.slug) || bySlug.get(slugify(cocktail.name));
    if (!hit) continue;
    cocktail.externalIds = { ...(cocktail.externalIds || {}), wikidata: hit.id };
    cocktail.sources = [
      ...cocktail.sources.filter((s) => s.name !== "Wikidata"),
      {
        name: "Wikidata",
        url: `https://www.wikidata.org/wiki/${hit.id}`,
        license: "CC0",
      },
    ];
    linked += 1;
  }

  await writeFile(cocktailsPath, `${JSON.stringify(cocktails, null, 2)}\n`);
  console.log(`Linked ${linked} cocktails to Wikidata IBA items`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

/**
 * Emits SQL seed statements for D1 from data/seed JSON.
 * Apply with: npm run seed:d1 && npx wrangler d1 execute coctel-en-casa --local --file=data/seed/seed.sql
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Cocktail, Ingredient } from "../src/domain/types";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function sqlString(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}

async function main() {
  const ingredients = JSON.parse(
    await readFile(path.join(ROOT, "data/seed/ingredients.json"), "utf8"),
  ) as Ingredient[];
  const cocktails = JSON.parse(
    await readFile(path.join(ROOT, "data/seed/cocktails.json"), "utf8"),
  ) as Cocktail[];

  const lines: string[] = [
    "DELETE FROM cocktail_ingredients;",
    "DELETE FROM cocktails;",
    "DELETE FROM ingredients;",
    "DELETE FROM sources;",
    "INSERT INTO sources (id, name, url, notes) VALUES ('thecocktaildb', 'TheCocktailDB', 'https://www.thecocktaildb.com/', 'API oficial; atribución requerida');",
  ];

  for (const ingredient of ingredients) {
    lines.push(
      `INSERT INTO ingredients (id, name, name_es, aliases_json, kind, alcoholic, family) VALUES (${sqlString(ingredient.id)}, ${sqlString(ingredient.name)}, ${sqlString(ingredient.nameEs)}, ${sqlString(JSON.stringify(ingredient.aliases))}, ${sqlString(ingredient.kind)}, ${ingredient.alcoholic ? 1 : 0}, ${ingredient.family ? sqlString(ingredient.family) : "NULL"});`,
    );
  }

  for (const cocktail of cocktails) {
    lines.push(
      `INSERT INTO cocktails (id, slug, name, name_es, alcoholic, category, glass, mood, tastes_json, bases_json, instructions_json, intro_es, faq_json, featured, iba_category, sources_json, external_ids_json) VALUES (${sqlString(cocktail.id)}, ${sqlString(cocktail.slug)}, ${sqlString(cocktail.name)}, ${sqlString(cocktail.nameEs)}, ${cocktail.alcoholic ? 1 : 0}, ${sqlString(cocktail.category)}, ${sqlString(cocktail.glass)}, ${sqlString(cocktail.mood)}, ${sqlString(JSON.stringify(cocktail.tastes))}, ${sqlString(JSON.stringify(cocktail.bases))}, ${sqlString(JSON.stringify(cocktail.instructionsEs))}, ${cocktail.introEs ? sqlString(cocktail.introEs) : "NULL"}, ${cocktail.faq ? sqlString(JSON.stringify(cocktail.faq)) : "NULL"}, ${cocktail.featured ? 1 : 0}, ${cocktail.ibaCategory ? sqlString(cocktail.ibaCategory) : "NULL"}, ${sqlString(JSON.stringify(cocktail.sources))}, ${cocktail.externalIds ? sqlString(JSON.stringify(cocktail.externalIds)) : "NULL"});`,
    );
    cocktail.ingredients.forEach((item, position) => {
      lines.push(
        `INSERT INTO cocktail_ingredients (cocktail_id, ingredient_id, measure, optional, position) VALUES (${sqlString(cocktail.id)}, ${sqlString(item.ingredientId)}, ${sqlString(item.measure)}, ${item.optional ? 1 : 0}, ${position});`,
      );
    });
  }

  const out = path.join(ROOT, "data/seed/seed.sql");
  await writeFile(out, `${lines.join("\n")}\n`);
  console.log(`Wrote ${out} (${ingredients.length} ingredients, ${cocktails.length} cocktails)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

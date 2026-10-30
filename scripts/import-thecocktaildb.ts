/**
 * Imports cocktail facts from TheCocktailDB official API (test key 1 for bootstrap).
 * Docs: https://www.thecocktaildb.com/documentation
 * Terms: https://www.thecocktaildb.com/terms_of_use.php
 * Attribution required; commercial use expects Patreon support.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { inferMood } from "../src/domain/mood";
import { slugify } from "../src/domain/slug";
import type {
  Cocktail,
  Ingredient,
  IngredientKind,
  SpiritBase,
  TasteTag,
} from "../src/domain/types";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const API_KEY = process.env.COCKTAILDB_API_KEY || "1";
const BASE = `https://www.thecocktaildb.com/api/json/v1/${API_KEY}`;

interface RawDrink {
  idDrink: string;
  strDrink: string;
  strCategory: string | null;
  strAlcoholic: string | null;
  strGlass: string | null;
  strInstructions: string | null;
  strIBA: string | null;
  [key: string]: string | null;
}

const NAME_ES: Record<string, string> = {
  rum: "ron",
  "light rum": "ron blanco",
  "white rum": "ron blanco",
  "dark rum": "ron oscuro",
  "spiced rum": "ron especiado",
  gin: "ginebra",
  vodka: "vodka",
  whiskey: "whisky",
  whisky: "whisky",
  "irish whiskey": "whisky irlandés",
  "blended whiskey": "whisky blended",
  "bourbon": "bourbon",
  "scotch": "scotch",
  tequila: "tequila",
  brandy: "brandy",
  cognac: "coñac",
  "triple sec": "triple sec",
  "lime juice": "zumo de lima",
  "lemon juice": "zumo de limón",
  "orange juice": "zumo de naranja",
  "pineapple juice": "zumo de piña",
  "cranberry juice": "zumo de arándanos",
  "grapefruit juice": "zumo de pomelo",
  "tomato juice": "zumo de tomate",
  "sugar syrup": "jarabe de azúcar",
  "simple syrup": "jarabe simple",
  "grenadine": "granadina",
  mint: "menta",
  soda: "soda",
  "soda water": "soda",
  "club soda": "soda",
  "tonic water": "tónica",
  "coca-cola": "coca-cola",
  coke: "coca-cola",
  "sweet vermouth": "vermut dulce",
  "dry vermouth": "vermut seco",
  campari: "campari",
  aperol: "aperol",
  "angostura bitters": "bitters angostura",
  "egg white": "clara de huevo",
  cream: "nata",
  "heavy cream": "nata montar",
  "coffee liqueur": "licor de café",
  "irish cream": "crema irlandesa",
  "coconut liqueur": "licor de coco",
  "coconut milk": "leche de coco",
  "coconut cream": "crema de coco",
  amaretto: "amaretto",
  "orange bitters": "bitters de naranja",
  sugar: "azúcar",
  "powdered sugar": "azúcar glas",
  ice: "hielo",
  water: "agua",
  lime: "lima",
  lemon: "limón",
  orange: "naranja",
  pineapple: "piña",
  cherry: "cereza",
  olive: "aceituna",
  salt: "sal",
  "bitters": "bitters",
  "blue curacao": "curaçao azul",
  "peach schnapps": "schnapps de melocotón",
  "midori melon liqueur": "licor midori",
  champagne: "champán",
  prosecco: "prosecco",
  "ginger beer": "cerveza de jengibre",
  "ginger ale": "ginger ale",
};

const FEATURED = new Set([
  "mojito",
  "daiquiri",
  "pina-colada",
  "mai-tai",
  "cuba-libre",
  "margarita",
  "old-fashioned",
  "negroni",
  "dry-martini",
  "manhattan",
  "cosmopolitan",
  "french-75",
  "whiskey-sour",
  "gin-tonic",
  "bloody-mary",
  "caipirinha",
  "espresso-martini",
  "aperol-spritz",
  "dark-n-stormy",
  "moscow-mule",
  "tom-collins",
  "sidecar",
  "aviation",
  "paloma",
  "pisco-sour",
  "sazerac",
  "white-russian",
  "black-russian",
  "long-island-iced-tea",
  "sex-on-the-beach",
]);

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json() as Promise<T>;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function ingredientIdFromName(name: string): string {
  return slugify(name);
}

function translateIngredient(name: string): string {
  const key = name.trim().toLowerCase();
  return NAME_ES[key] || name.trim();
}

function kindFor(name: string): IngredientKind {
  const n = name.toLowerCase();
  if (/rum|gin|vodka|whiskey|whisky|bourbon|scotch|tequila|brandy|cognac|pisco|cachaca|mezcal/.test(n)) {
    return "spirit";
  }
  if (/liqueur|curaçao|curacao|schnapps|amaretto|kahlua|baileys|midori|triple sec|cointreau|grand marnier|campari|aperol|chartreuse|benedictine/.test(n)) {
    return "liqueur";
  }
  if (/vermouth|wine|champagne|prosecco|sherry|port/.test(n)) return "wine";
  if (/beer|ale|stout/.test(n)) return "beer";
  if (/bitters/.test(n)) return "bitter";
  if (/juice/.test(n)) return "juice";
  if (/lime|lemon|orange|grapefruit/.test(n) && !/juice|liqueur|bitters/.test(n)) return "citrus";
  if (/syrup|grenadine|sugar/.test(n)) return "syrup";
  if (/soda|tonic|cola|ginger|sprite|7-up|water/.test(n)) return "soda";
  if (/cream|milk|egg/.test(n)) return "dairy";
  if (/mint|basil|rosemary/.test(n)) return "herb";
  if (/cherry|olive|pineapple|berry|fruit/.test(n)) return "fruit";
  if (/salt|pepper|nutmeg|cinnamon/.test(n)) return "garnish";
  return "other";
}

function familyFor(name: string, kind: IngredientKind): Ingredient["family"] {
  const n = name.toLowerCase();
  if (/rum/.test(n)) return "ron";
  if (/gin/.test(n)) return "ginebra";
  if (/vodka/.test(n)) return "vodka";
  if (/whiskey|whisky|bourbon|scotch/.test(n)) return "whisky";
  if (/tequila|mezcal/.test(n)) return "tequila";
  if (/brandy|cognac/.test(n)) return "brandy";
  if (kind === "bitter" || /campari|aperol|bitters/.test(n)) return "amargo";
  if (kind === "liqueur") return "licor";
  if (kind === "juice") return "zumo";
  if (kind === "citrus" || /lime|lemon|orange|grapefruit/.test(n)) return "citrico";
  if (kind === "soda") return "refresco";
  return "otro";
}

function basesFor(ingredientNames: string[], alcoholic: boolean): SpiritBase[] {
  if (!alcoholic) return ["sin-alcohol"];
  const bases = new Set<SpiritBase>();
  for (const raw of ingredientNames) {
    const n = raw.toLowerCase();
    if (/rum/.test(n)) bases.add("ron");
    if (/gin/.test(n)) bases.add("ginebra");
    if (/vodka/.test(n)) bases.add("vodka");
    if (/whiskey|whisky|bourbon|scotch/.test(n)) bases.add("whisky");
    if (/tequila|mezcal/.test(n)) bases.add("tequila");
    if (/brandy|cognac/.test(n)) bases.add("brandy");
  }
  if (bases.size === 0) bases.add("otro");
  return [...bases];
}

function tastesFor(names: string[], category: string): TasteTag[] {
  const joined = names.join(" ").toLowerCase();
  const tastes = new Set<TasteTag>();
  if (/lime|lemon|grapefruit|citric|orange juice/.test(joined)) tastes.add("citrico");
  if (/syrup|grenadine|cream|coconut|liqueur|sugar|honey|chocolate/.test(joined)) tastes.add("dulce");
  if (/bitters|campari|aperol|vermouth|amaro/.test(joined)) tastes.add("amargo");
  if (/mint|basil|chartreuse|herbal|gin/.test(joined)) tastes.add("herbal");
  if (/pineapple|berry|mango|passion|peach|banana|fruit|juice/.test(joined)) tastes.add("afrutado");
  if (/cream|milk|egg|coconut/.test(joined)) tastes.add("cremoso");
  if (/dry vermouth|martini|soda water/.test(joined) || /ordinary drink/i.test(category)) {
    tastes.add("seco");
  }
  if (/soda|tonic|champagne|prosecco|cola|ginger beer|ginger ale|sprite/.test(joined)) {
    tastes.add("burbujas");
  }
  if (tastes.size === 0) tastes.add("seco");
  return [...tastes];
}

function instructionsEs(
  nameEs: string,
  glass: string,
  lines: { nameEs: string; measure: string }[],
): string[] {
  const glassEs = glass || "vaso";
  const steps = [
    `Prepara un ${glassEs.toLowerCase()} limpio y frío si puedes.`,
  ];
  for (const line of lines) {
    const measure = line.measure?.trim() || "al gusto";
    steps.push(`Añade ${measure} de ${line.nameEs}.`);
  }
  steps.push("Mezcla según la técnica del cóctel (agitar con hielo, remover o servir directo).");
  steps.push(`Sirve el ${nameEs} y decora si quieres.`);
  return steps;
}

function drinkNameEs(name: string): string {
  const map: Record<string, string> = {
    Mojito: "Mojito",
    Daiquiri: "Daiquirí",
    "Pina Colada": "Piña colada",
    Margarita: "Margarita",
    Negroni: "Negroni",
    "Old Fashioned": "Old Fashioned",
    Manhattan: "Manhattan",
    Cosmopolitan: "Cosmopolitan",
    "Cuba Libre": "Cuba Libre",
    "Mai Tai": "Mai Tai",
    "French 75": "French 75",
    "Dry Martini": "Martini seco",
    "Gin Tonic": "Gin-tonic",
    "Whiskey Sour": "Whiskey Sour",
    "Bloody Mary": "Bloody Mary",
    Caipirinha: "Caipiriña",
  };
  return map[name] || name;
}

async function loadOverrides(): Promise<Record<string, Partial<Cocktail>>> {
  const dir = path.join(ROOT, "data/overrides");
  try {
    const raw = await readFile(path.join(dir, "featured.json"), "utf8");
    return JSON.parse(raw) as Record<string, Partial<Cocktail>>;
  } catch {
    return {};
  }
}

async function main() {
  const letters = "abcdefghijklmnopqrstuvwxyz0123456789".split("");
  const byId = new Map<string, RawDrink>();

  for (const letter of letters) {
    const data = await fetchJson<{ drinks: RawDrink[] | null }>(
      `${BASE}/search.php?f=${letter}`,
    );
    for (const drink of data.drinks || []) {
      byId.set(drink.idDrink, drink);
    }
    await sleep(120);
    process.stdout.write(`letter ${letter}: ${byId.size} drinks\n`);
  }

  const ingredientMap = new Map<string, Ingredient>();
  const cocktails: Cocktail[] = [];
  const overrides = await loadOverrides();
  const usedSlugs = new Set<string>();

  for (const drink of byId.values()) {
    let slug = slugify(drink.strDrink);
    if (usedSlugs.has(slug)) slug = `${slug}-${drink.idDrink}`;
    usedSlugs.add(slug);
    const alcoholic = (drink.strAlcoholic || "").toLowerCase() !== "non alcoholic";
    const lines: { id: string; name: string; nameEs: string; measure: string }[] = [];

    for (let i = 1; i <= 15; i += 1) {
      const rawName = drink[`strIngredient${i}`];
      if (!rawName) continue;
      const name = rawName.trim();
      const id = ingredientIdFromName(name);
      const kind = kindFor(name);
      const nameEs = translateIngredient(name);
      if (!ingredientMap.has(id)) {
        ingredientMap.set(id, {
          id,
          name,
          nameEs,
          aliases: nameEs === name.toLowerCase() ? [] : [name.toLowerCase()],
          kind,
          alcoholic: kind === "spirit" || kind === "liqueur" || kind === "wine" || kind === "beer",
          family: familyFor(name, kind),
        });
      }
      lines.push({
        id,
        name,
        nameEs,
        measure: (drink[`strMeasure${i}`] || "").trim(),
      });
    }

    const ingredientNames = lines.map((l) => l.name);
    const bases = basesFor(ingredientNames, alcoholic);
    const tastes = tastesFor(ingredientNames, drink.strCategory || "");
    const mood = inferMood(slug, bases, tastes);
    const nameEs = drinkNameEs(drink.strDrink);

    const cocktail: Cocktail = {
      id: `tcdb-${drink.idDrink}`,
      slug,
      name: drink.strDrink,
      nameEs,
      alcoholic,
      category: drink.strCategory || "Cocktail",
      glass: drink.strGlass || "Cocktail glass",
      mood,
      tastes,
      bases,
      ingredients: lines.map((l) => ({
        ingredientId: l.id,
        measure: l.measure || "al gusto",
      })),
      instructionsEs: instructionsEs(
        nameEs,
        drink.strGlass || "vaso de cóctel",
        lines,
      ),
      featured: FEATURED.has(slug),
      ibaCategory: drink.strIBA || undefined,
      sources: [
        {
          name: "TheCocktailDB",
          url: `https://www.thecocktaildb.com/drink/${drink.idDrink}`,
          license: "API terms; attribution required",
        },
      ],
      externalIds: { thecocktaildb: drink.idDrink },
    };

    const override = overrides[slug];
    if (override) {
      Object.assign(cocktail, override, {
        sources: [
          ...cocktail.sources,
          ...(override.sources || []),
        ],
        ingredients: override.ingredients || cocktail.ingredients,
        instructionsEs: override.instructionsEs || cocktail.instructionsEs,
      });
      cocktail.featured = true;
    }

    cocktails.push(cocktail);
  }

  cocktails.sort((a, b) => a.slug.localeCompare(b.slug));
  const ingredients = [...ingredientMap.values()].sort((a, b) => a.id.localeCompare(b.id));

  // Ensure brand ingredient targets exist as stubs if missing
  const brands = JSON.parse(
    await readFile(path.join(ROOT, "data/brands.json"), "utf8"),
  ) as { ingredientId: string; name: string }[];
  for (const brand of brands) {
    if (!ingredientMap.has(brand.ingredientId)) {
      const stubName = brand.ingredientId.replace(/-/g, " ");
      const kind = kindFor(stubName);
      ingredients.push({
        id: brand.ingredientId,
        name: stubName,
        nameEs: translateIngredient(stubName),
        aliases: [],
        kind,
        alcoholic: kind === "spirit" || kind === "liqueur",
        family: familyFor(stubName, kind),
      });
    }
  }

  await mkdir(path.join(ROOT, "data/seed"), { recursive: true });
  await writeFile(
    path.join(ROOT, "data/seed/ingredients.json"),
    `${JSON.stringify(ingredients, null, 2)}\n`,
  );
  await writeFile(
    path.join(ROOT, "data/seed/cocktails.json"),
    `${JSON.stringify(cocktails, null, 2)}\n`,
  );
  await writeFile(
    path.join(ROOT, "data/seed/SOURCES.md"),
    `# Fuentes del catálogo

- **TheCocktailDB** — importado con la API oficial (\`search.php?f=\`). Documentación: https://www.thecocktaildb.com/documentation — Términos: https://www.thecocktaildb.com/terms_of_use.php
- Cada ficha enlaza a \`https://www.thecocktaildb.com/drink/{id}\`.
- Los textos de preparación en español se generan a partir de medidas y vaso; no se copian las instrucciones en inglés de la API.
- Los cócteles destacados pueden llevar texto propio en \`data/overrides/\`.
- Generado: ${new Date().toISOString()}
- Cócteles: ${cocktails.length}
- Ingredientes: ${ingredients.length}
`,
  );

  console.log(`Wrote ${cocktails.length} cocktails and ${ingredients.length} ingredients`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

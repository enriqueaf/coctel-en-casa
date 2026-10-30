export type Mood = "caribe" | "tiki" | "clasico" | "sofisticado";

export type IngredientKind =
  | "spirit"
  | "liqueur"
  | "wine"
  | "beer"
  | "bitter"
  | "juice"
  | "citrus"
  | "syrup"
  | "soda"
  | "dairy"
  | "fruit"
  | "herb"
  | "garnish"
  | "other";

export type TasteTag =
  | "citrico"
  | "dulce"
  | "amargo"
  | "herbal"
  | "afrutado"
  | "cremoso"
  | "seco"
  | "burbujas";

export type MomentTag = "playa" | "aperitivo" | "despues" | "fiesta";

export type SpiritBase =
  | "ron"
  | "ginebra"
  | "vodka"
  | "whisky"
  | "tequila"
  | "brandy"
  | "sin-alcohol"
  | "otro";

export interface Ingredient {
  id: string;
  name: string;
  nameEs: string;
  aliases: string[];
  kind: IngredientKind;
  alcoholic: boolean;
  family?: SpiritBase | "citrico" | "refresco" | "amargo" | "licor" | "zumo" | "otro";
}

export interface Brand {
  id: string;
  name: string;
  aliases: string[];
  ingredientId: string;
  searchQuery: string;
}

export interface CocktailIngredient {
  ingredientId: string;
  measure: string;
  optional?: boolean;
}

export interface CocktailSource {
  name: string;
  url: string;
  license?: string;
}

export interface Cocktail {
  id: string;
  slug: string;
  name: string;
  nameEs: string;
  alcoholic: boolean;
  category: string;
  glass: string;
  mood: Mood;
  tastes: TasteTag[];
  bases: SpiritBase[];
  ingredients: CocktailIngredient[];
  instructionsEs: string[];
  introEs?: string;
  faq?: { q: string; a: string }[];
  featured?: boolean;
  ibaCategory?: string;
  sources: CocktailSource[];
  externalIds?: {
    thecocktaildb?: string;
    wikidata?: string;
  };
}

export interface PantryItem {
  ingredientId: string;
  brandId?: string;
  label: string;
}

export interface QuizAnswers {
  tastes: TasteTag[];
  base: SpiritBase | "cualquiera";
  moment: MomentTag | "cualquiera";
}

export interface MatchResult {
  cocktail: Cocktail;
  score: number;
  missing: Ingredient[];
  matchedCount: number;
  totalRequired: number;
  canMake: boolean;
}

export type SearchMode = "todo" | "marca" | "tipo";

export interface SearchHit {
  kind: "ingredient" | "brand" | "family";
  id: string;
  label: string;
  subtitle?: string;
  ingredientId: string;
  brandId?: string;
}

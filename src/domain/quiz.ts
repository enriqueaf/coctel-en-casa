import type { MomentTag, SpiritBase, TasteTag } from "./types";

export const TASTE_OPTIONS: { id: TasteTag; label: string; hint: string }[] = [
  { id: "citrico", label: "Cítrico", hint: "Lima, limón, fresco" },
  { id: "dulce", label: "Dulce", hint: "Jarabe, crema, fruta" },
  { id: "amargo", label: "Amargo", hint: "Bitter, vermú, Campari" },
  { id: "herbal", label: "Herbal", hint: "Menta, hierbas, anís" },
  { id: "afrutado", label: "Afrutado", hint: "Piña, bayas, zumo" },
  { id: "cremoso", label: "Cremoso", hint: "Leche de coco, crema" },
  { id: "seco", label: "Seco", hint: "Poco azúcar, limpio" },
  { id: "burbujas", label: "Con burbujas", hint: "Soda, cava, cola" },
];

export const BASE_OPTIONS: { id: SpiritBase | "cualquiera"; label: string }[] = [
  { id: "cualquiera", label: "Me da igual" },
  { id: "ron", label: "Ron" },
  { id: "ginebra", label: "Ginebra" },
  { id: "vodka", label: "Vodka" },
  { id: "whisky", label: "Whisky" },
  { id: "tequila", label: "Tequila" },
  { id: "brandy", label: "Brandy" },
  { id: "sin-alcohol", label: "Sin alcohol" },
];

export const MOMENT_OPTIONS: { id: MomentTag | "cualquiera"; label: string }[] = [
  { id: "cualquiera", label: "Cuando sea" },
  { id: "playa", label: "Playa / terraza" },
  { id: "aperitivo", label: "Aperitivo" },
  { id: "despues", label: "Después de cenar" },
  { id: "fiesta", label: "Fiesta" },
];

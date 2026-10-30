# Cóctel en casa

Sitio en español para aprender a preparar cócteles en casa:

1. **Con lo que tengo** — buscas ingredientes o marcas y ves qué puedes preparar.
2. **Sorpréndeme** — cuestionario visual de gustos y una tanda aleatoria.

Look caribeño por defecto; cada ficha adapta el ambiente (`caribe`, `tiki`, `clasico`, `sofisticado`).

## Stack

- Astro + `@astrojs/cloudflare`
- Catálogo en `data/seed/` (JSON versionado)
- D1 como copia opcional
- Despliegue en Cloudflare Workers + GitHub Actions

## Datos y fuentes

- **TheCocktailDB** (API oficial): hechos del catálogo. [Documentación](https://www.thecocktaildb.com/documentation) · [Términos](https://www.thecocktaildb.com/terms_of_use.php). Atribución en cada ficha y en `/fuentes`.
- **Wikidata** (CC0): cruce opcional con cócteles IBA.
- **Texto propio**: intros y pasos de los destacados en `data/overrides/`.

```bash
npm run import:cocktails   # regenera data/seed desde TheCocktailDB
npm run import:wikidata    # enlaza IDs Wikidata cuando el endpoint responde
npm run seed:d1            # genera data/seed/seed.sql
```

Para producción, TheCocktailDB espera apoyo en Patreon y una clave de API propia (`COCKTAILDB_API_KEY`).

## Desarrollo

```bash
npm install
npm run dev
npm test
npm run build
```

## Afiliados

En `wrangler.jsonc` (o secrets de Cloudflare):

- `AMAZON_ASSOCIATE_TAG` — tag de Amazon Asociados (ES)
- `SHOP_URL_TEMPLATE` — opcional, p. ej. deep link Awin/Tradedoubler con `{q}`

Sin tag, la ficha no muestra botones de compra.

## IA y SEO

- `/llms.txt` y `/llms-full.txt`
- `/coctel/{slug}.md` gemelo Markdown
- `/sitemap.xml` y `/robots.txt`
- JSON-LD `Recipe` en cada ficha

## Despliegue

1. Crea el Worker y, si quieres, la base D1 `coctel-en-casa` en Cloudflare.
2. Sustituye `database_id` en `wrangler.jsonc`.
3. Añade en GitHub los secrets `CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID`.
4. Push a `main` o `npx wrangler deploy` en local tras `npm run build`.

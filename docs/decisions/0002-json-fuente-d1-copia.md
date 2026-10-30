# 0002. JSON como fuente, D1 como copia

Estado: aceptada  
Fecha: 2026-10-30

## Contexto

El catálogo debe ser fácil de versionar en Git y consultable en Cloudflare.

## Decisión

`data/seed/*.json` es la fuente editable. Las páginas leen ese JSON. D1 recibe una copia con `scripts/seed-d1.ts` para consultas futuras y consistencia operativa.

## Consecuencias

Añadir un cóctel es editar JSON (o reimportar), sembrar y desplegar. No hay CMS.

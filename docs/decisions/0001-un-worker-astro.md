# 0001. Un Worker y Astro

Estado: aceptada  
Fecha: 2026-10-30

## Contexto

Hay que servir páginas, hubs SEO y archivos de texto para IAs en Cloudflare, sin un segundo servicio.

## Decisión

Un Cloudflare Worker ejecuta Astro con `@astrojs/cloudflare`. La lógica de dominio es TypeScript puro.

## Consecuencias

Despliegue con `astro build` y Wrangler. En local, `astro dev`.

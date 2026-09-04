# gotcha

A non-obvious pitfall or trap, learned the hard way.

## El CLI `chiron-memory` no está instalado en el entorno de trabajo, por lo que no se puede…

What: El CLI `chiron-memory` no está instalado en el entorno de trabajo, por lo que no se puede correr su comando `check` tras anotar memoria del proyecto. · Why: — · Where: chiron-memory/ <!-- id: 6370c37e-200b-4996-a2d1-ae6d22f75793-11 -->

## El store de mesas-api sólo tiene sembradas las mesas 1 a 5 (t1..t5), así que para probar…

What: El store de mesas-api sólo tiene sembradas las mesas 1 a 5 (t1..t5), así que para probar un número de mesa de dos dígitos en el panel del mozo no alcanza con pedir datos a la API — hay que forzar el valor directamente en el DOM (sabiendo que el próximo poll de 4s lo pisa). · Why: — · Where: mesas-api (seed data), verificación de mesas-web/panel.js <!-- id: 6370c37e-200b-4996-a2d1-ae6d22f75793-12 -->

## Para verificar tamaños de fuente pensados para legibilidad a distancia, medir la altura r…

What: Para verificar tamaños de fuente pensados para legibilidad a distancia, medir la altura real del glifo en el DOM (vía getComputedStyle/getBoundingClientRect) y convertirla a mm de pantalla, en vez de confiar en el juicio visual o en una captura de pantalla. · Why: Permite contrastar objetivamente contra la regla de ~1mm cada 10cm de distancia de lectura, y detectar casos límite (ej. números de dos dígitos) sin desbordes. · Where: verificación de mesas-web/styles.css (.mesa-numero) <!-- id: 6370c37e-200b-4996-a2d1-ae6d22f75793-9 -->

## Las tres copias de la máquina de estados no son simétricas en qué constantes definen: mes…

What: Las tres copias de la máquina de estados no son simétricas en qué constantes definen: mesas-web/panel.js no tiene array ESTADOS (los estados son simplemente las claves de TRANSICIONES) y mesas-api/src/estados.js no tiene ETIQUETAS (la API no las usa) · Why: al verificar que las copias sean 'idénticas' hay que comparar solo lo que cada una efectivamente define, no inventar constantes que no existen en alguna copia · Where: mesas-web/panel.js, mesas-api/src/estados.js · Learned: no asumir que las tres copias comparten el mismo shape de constantes al escribir scripts de verificación o al agregar un estado nuevo. <!-- id: 96fd367c-6b61-46ec-9faa-17fa94d5562c-1 -->

## toLocaleTimeString('es-AR') por defecto muestra hora en formato 12h con 'a

What: toLocaleTimeString('es-AR') por defecto muestra hora en formato 12h con 'a. m./p. m.', pero en Argentina se usa 24h · Why: hay que pasar explícitamente { hour12: false } (o equivalente) al formatear la hora de un pedido · Where: mesas-web/app.js, tarjeta de pedido en la vista de seguimiento. <!-- id: d56ed139-2179-4ef8-b419-3cf4bc919af4-3 -->

## ** Al agregar un estado hay que tocar los tres lados, pero cada copia define un subconjun…

What: ** Al agregar un estado hay que tocar los tres lados, pero cada copia define un subconjunto distinto: `mesas-shared/src/estados.js` tiene `ESTADOS` + `TRANSICIONES` + `ETIQUETAS`, `mesas-api/src/estados.js` tiene `ESTADOS` + `TRANSICIONES` (no usa etiquetas), y `mesas-web/panel.js` tiene `TRANSICIONES` + `ETIQUETAS` **sin** array `ESTADOS`. - ** · Why: ** Buscar "ESTADOS" en los tres repos hace creer que falta actualizar la web; no falta, ahí la lista de estados son las claves de `TRANSICIONES`. Al revés, agregar un `ESTADOS` a `panel.js` sería inventar una constante que nadie usa. - ** · Where: ** `mesas-shared/src/estados.js`, `mesas-api/src/estados.js`, `mesas-web/panel.js`. - ** · Learned: ** 2026-09-01 <!-- id: spine-4df45ef74dcd36a5 -->

## antes del fix, si el body de POST /pedidos/:id/estado no parseaba como JSON, leerBody dev…

What: antes del fix, si el body de POST /pedidos/:id/estado no parseaba como JSON, leerBody devolvía null y el flujo caía en un 409 con mensaje `a "undefined"` en vez de un 400 claro. · Why: la validación de JSON inválido no existía antes de las reglas de dominio. · Where: mesas-api/src/server.js. · Learned: siempre validar que el body parseó antes de leer campos de él y antes de aplicar reglas de transición. <!-- id: 5a889181-944f-4aa4-8698-17a724f25d1d-5 -->

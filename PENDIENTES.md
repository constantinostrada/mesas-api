# Pendientes — mesas-api

## Que la cocina pueda marcar un plato listo
Falta el estado intermedio entre `en_preparacion` y `servido`, y aceptar su
transición.
**Empieza en:** `mesas-shared` (la máquina de estados). **Toca también:**
`mesas-web`.

## Persistir las notas por plato
Cuando `ItemPedido` tenga nota, hay que guardarla y devolverla en `GET /pedidos`.
**Empieza en:** `mesas-shared`. **Toca también:** `mesas-web`.

## Servir la carta desde un archivo
`CARTA` está en `store.js`. Debería leerse de un JSON editable sin tocar código.
**Toca también:** `mesas-web`, que hoy la tiene copiada.

## Reasignar un pedido a otro mozo
Si un mozo se va a mitad de turno, sus pedidos abiertos quedan huérfanos. Falta
un endpoint para moverlos.

## El store se pierde al reiniciar
Todo vive en memoria. Persistirlo (aunque sea en un JSON en disco) es lo mínimo
para que la demo sobreviva un reinicio.

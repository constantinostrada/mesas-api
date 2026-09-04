# contradiction

A memory that clashes with newer reality — flagged to be resolved.

## El orden real de validación de POST /pedidos/:id/deshacer implementado en mesas-api/src/s…

What: El orden real de validación de POST /pedidos/:id/deshacer implementado en mesas-api/src/server.js tiene 7 pasos, no 6: incluye un chequeo 409 separado de 'reversa ilegal' (usa puedeDeshacer para confirmar que estado_actual→estado_anterior es una inversa válida) entre el 409 de 'sin estado_anterior' y el 403 de autoría. · Why: la memoria ya guardada describe el orden como 404 → 400/404 body → 409 terminal → 409 sin estado_anterior → 403 autoría → 409 ventana, omitiendo este paso intermedio; hay que corregir esa memoria para que quien la lea no asuma que basta con chequear null en estado_anterior. <!-- id: 98b6ca08-ebe0-47f6-8408-e1df8d9d7bce-7 -->

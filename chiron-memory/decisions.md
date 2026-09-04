# decision

A choice made and the reasoning behind it — the path taken over the alternatives.

## Para el tamaño del número de mesa en el panel del mozo se descartó la alternativa conserv…

What: Para el tamaño del número de mesa en el panel del mozo se descartó la alternativa conservadora de 32px a favor de 48px. · Why: 32px es 'legible si mirás de cerca', pero el criterio de aceptación pide 'se lee de un vistazo a un metro de distancia', que es un estándar distinto y más exigente. · Where: mesas-web/styles.css (.mesa-numero) <!-- id: 6370c37e-200b-4996-a2d1-ae6d22f75793-13 -->

## La vista de seguimiento del cliente identifica qué pedidos mostrar por la mesa (mesa_id v…

What: La vista de seguimiento del cliente identifica qué pedidos mostrar por la mesa (mesa_id vía API), no por el navegador (localStorage) · Why: El AC pedía ver TODOS los pedidos activos de la mesa, no solo los que este navegador envió; se descartó cruzar localStorage contra la API porque no cumplía ese requisito · Where: mesas-web/app.js (refrescarPedidos) · Learned: el costo aceptado es que dos comensales en la misma mesa ven la misma lista (razonable, mesa compartida) y que pedidos pagados de una visita anterior a esa mesa quedan visibles atenuados hasta reiniciar el store de la API — no existe concepto de 'cerrar la mesa'. <!-- id: d56ed139-2179-4ef8-b419-3cf4bc919af4-0 -->

## ** El flujo del pedido es `pedido → en_preparacion → listo_para_servir → servido → pagado`

What: ** El flujo del pedido es `pedido → en_preparacion → listo_para_servir → servido → pagado`. `en_preparacion → servido` dejó de ser una transición legal: hay que pasar sí o sí por `listo_para_servir`. Desde `listo_para_servir` se puede ir a `servido` o `cancelado`. - ** · Why: ** Sin ese paso la cocina no tenía forma de avisar que el plato estaba listo y el mozo tenía que ir a preguntar. Se prefirió cerrar el camino directo (y no dejarlo como atajo opcional) para que el aviso de la cocina sea el único camino y el panel del mozo lo refleje siempre. - ** · Where: ** `mesas-shared/src/estados.js` (contrato), `mesas-api/src/estados.js`, `mesas-web/panel.js`. - ** · Learned: ** 2026-09-01 <!-- id: spine-86ed779b145b13df -->

## estado_anterior, estado_cambiado_en y estado_cambiado_por en Pedido representan sólo el Ú…

What: estado_anterior, estado_cambiado_en y estado_cambiado_por en Pedido representan sólo el ÚLTIMO cambio de estado, no un historial acumulado — se pisan en cada transición. · Why: el work order sólo necesita validar la ventana de 30s y restringir el undo al mozo que actuó; un historial completo no era requisito y agrega complejidad sin uso. · Where: mesas-api/src/server.js (POST /pedidos/:id/estado), mesas-shared/src/tipos.js (typedef Pedido). · Learned: si a futuro se pide auditoría completa, estos tres campos no alcanzan — haría falta un array de cambios aparte. <!-- id: 5a889181-944f-4aa4-8698-17a724f25d1d-0 -->

## POST /pedidos/:id/cancelar quedó deliberadamente sin recibir mozo_id ni registrar autoría…

What: POST /pedidos/:id/cancelar quedó deliberadamente sin recibir mozo_id ni registrar autoría en este cambio, por estar fuera del alcance del work order. · Why: se priorizó el endpoint /estado explícitamente pedido; tocar /cancelar además rompería el body: {} vacío que manda hoy el panel. · Where: mesas-api/src/server.js (POST /pedidos/:id/cancelar), mesas-web/panel.js. · Learned: un pedido cancelado conserva la autoría del cambio de estado anterior al cancelado, no de quien canceló — si se necesita saber quién canceló, es un cambio aparte. <!-- id: 5a889181-944f-4aa4-8698-17a724f25d1d-7 -->

## Las transiciones inversas de undo se derivan de TRANSICIONES en sentido inverso (puedeDes…

What: Las transiciones inversas de undo se derivan de TRANSICIONES en sentido inverso (puedeDeshacer llama a puedePasar(estadoAnterior, estadoActual)) en vez de listarse a mano. · Why: el work order pedía listar 2 inversas a mano, pero esa lista ya estaba desincronizada (servido→en_preparacion saltearía el estado listo_para_servir agregado después); derivar de TRANSICIONES evita que un estado nuevo vuelva a desincronizar el undo. · Where: mesas-shared/src/estados.js y mesas-api/src/estados.js, función puedeDeshacer. <!-- id: 98b6ca08-ebe0-47f6-8408-e1df8d9d7bce-0 -->

## Las transiciones inversas de undo quedan fuera de la tabla TRANSICIONES, como export sepa…

What: Las transiciones inversas de undo quedan fuera de la tabla TRANSICIONES, como export separado (puedeDeshacer) en vez de mezclarse ahí. · Why: TRANSICIONES alimenta tanto los botones de mesas-web/panel.js como la validación de POST /pedidos/:id/estado; si las inversas entraran ahí aparecerían botones de 'volver atrás' como cambios normales y cualquiera podría retroceder por /estado saltándose la ventana de 30s y el chequeo de autoría. <!-- id: 98b6ca08-ebe0-47f6-8408-e1df8d9d7bce-1 -->

## El flujo real de estados es pedido → en_preparacion → listo_para_servir → servido → pagad…

What: El flujo real de estados es pedido → en_preparacion → listo_para_servir → servido → pagado, por lo que las inversas válidas de undo son tres: en_preparacion→pedido, listo_para_servir→en_preparacion y servido→listo_para_servir. · Why: el estado listo_para_servir se agregó en un work order posterior al que definió las transiciones originales; la inversa servido→en_preparacion (la que mencionaba el WO de undo) saltearía ese estado intermedio. <!-- id: 98b6ca08-ebe0-47f6-8408-e1df8d9d7bce-2 -->

## Tras un undo exitoso, los campos estado_cambiado_en, estado_cambiado_por y estado_anterio…

What: Tras un undo exitoso, los campos estado_cambiado_en, estado_cambiado_por y estado_anterior del pedido se limpian a null en vez de registrarse como un nuevo cambio de estado. · Why: si el undo se tratara como un cambio nuevo, se podrían encadenar undos y recorrer varios estados hacia atrás dentro de la misma ventana de 30s, exactamente el 'reescribir la historia' que el intent del WO quería evitar; como efecto lateral, un segundo undo cae directo en el 409 de 'sin estado_anterior'. Trade-off aceptado: después de un undo no queda registro de quién lo deshizo. <!-- id: 98b6ca08-ebe0-47f6-8408-e1df8d9d7bce-4 -->

## Para probar que la ventana de undo de 30s expira, el smoke test esperó 31 segundos reales…

What: Para probar que la ventana de undo de 30s expira, el smoke test esperó 31 segundos reales contra el servidor vivo en vez de agregar un override por variable de entorno para acortar VENTANA_UNDO_MS en tests. · Why: no había forma de tocar el store en memoria desde afuera del proceso, y se prefirió no meter un hook solo-para-test en código de producción (mesas-shared/src/estados.js) por ese único caso. <!-- id: 98b6ca08-ebe0-47f6-8408-e1df8d9d7bce-8 -->

## mesas-web quedó sin tocar en este work order — no se agregó el botón de deshacer en panel…

What: mesas-web quedó sin tocar en este work order — no se agregó el botón de deshacer en panel.js ni el texto 'cambiado por X hace Ns' — a pesar de que una memoria previa del proyecto decía que ese texto se había postergado justamente hasta el work order que agregara el botón de undo que lo justificara. · Why: el work order actual no pedía cambios en mesas-web ni tenía criterio de aceptación para eso, así que se priorizó el alcance explícito del WO; queda pendiente para un WO futuro. · Where: mesas-web/panel.js. <!-- id: 98b6ca08-ebe0-47f6-8408-e1df8d9d7bce-9 -->

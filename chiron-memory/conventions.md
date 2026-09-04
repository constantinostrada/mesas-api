# convention

A rule the codebase follows — naming, patterns, and where things live.

## En el panel del mozo (mesas-web), el número de mesa (`.mesa-numero`) se estiliza delibera…

What: En el panel del mozo (mesas-web), el número de mesa (`.mesa-numero`) se estiliza deliberadamente a 48px/700, line-height 1, tabular-nums y letter-spacing levemente negativo, quedando más grande que el `h1` (20px). · Why: El mozo debe leer el número de un vistazo a un metro de distancia en horas pico; la regla de oficio es ~1mm de altura de glifo por cada 10cm de distancia, por lo que a un metro se necesitan ~10mm. · Where: mesas-web/styles.css, mesas-web/panel.js · Learned: No 'normalizar' este tamaño a la jerarquía tipográfica general del sitio — es intencional y está comentado en el CSS para que futuros cambios no lo reviertan. <!-- id: 6370c37e-200b-4996-a2d1-ae6d22f75793-7 -->

## En la tarjeta de pedido del panel del mozo, el id del pedido (ej

What: En la tarjeta de pedido del panel del mozo, el id del pedido (ej. 'p003') se movió del renglón de la cabecera (junto al número de mesa) al renglón chico junto a los items. · Why: Si el id del pedido compite visualmente con el número de mesa en el mismo tamaño/renglón, ninguno de los dos se lee bien de lejos. · Where: mesas-web/panel.js <!-- id: 6370c37e-200b-4996-a2d1-ae6d22f75793-8 -->

## Los archivos PENDIENTES.md de mesas-shared y mesas-api describen tareas pendientes explíc…

What: Los archivos PENDIENTES.md de mesas-shared y mesas-api describen tareas pendientes explícitas (incluyendo el color de la tarjeta del pedido en mesas-web para el estado listo_para_servir); se decidió no cerrarlos junto con el cambio de estado, dejando el ítem del color de tarjeta para una entrega visual separada · Why: el PENDIENTES.md de mesas-shared mezcla la tarea de la máquina de estados con una tarea visual (color de tarjeta) que es de otro alcance · Where: mesas-shared/PENDIENTES.md, mesas-api/PENDIENTES.md · Learned: al resolver un pendiente parcialmente, no marcarlo como cerrado si incluye sub-tareas de otro alcance todavía sin hacer. <!-- id: 96fd367c-6b61-46ec-9faa-17fa94d5562c-3 -->

## Cuando se intenta una transición de estado ilegal en un pedido, la API (mesas-api/src/ser…

What: Cuando se intenta una transición de estado ilegal en un pedido, la API (mesas-api/src/server.js, validando con puedePasar de estados.js) responde HTTP 409 con el mensaje `No se puede pasar de "<origen>" a "<destino>"` · Why: centraliza el rechazo de transiciones inválidas en la capa de servidor usando la máquina de estados compartida como fuente de verdad · Where: mesas-api/src/server.js, mesas-api/src/estados.js · Learned: al verificar un cambio en la máquina de estados hay que probar el 409 contra la API viva (smoke test real), no alcanza con testear puedePasar en aislamiento. <!-- id: 96fd367c-6b61-46ec-9faa-17fa94d5562c-5 -->

## Los PENDIENTES.md de mesas-api y mesas-shared usan la línea "Empieza en: <repo>" para señ…

What: Los PENDIENTES.md de mesas-api y mesas-shared usan la línea "Empieza en: <repo>" para señalar en qué repo debe arrancar una tarea que atraviesa varios de los tres repos del proyecto · Why: como el proyecto está partido en mesas-shared/mesas-api/mesas-web, una tarea puede requerir tocar más de un repo y hace falta indicar explícitamente el punto de entrada · Where: mesas-api/PENDIENTES.md, mesas-shared/PENDIENTES.md · Learned: al leer un PENDIENTES.md de este proyecto, buscar la línea "Empieza en:" para saber si la tarea completa depende de otro repo primero. <!-- id: 96fd367c-6b61-46ec-9faa-17fa94d5562c-6 -->

## GET /pedidos en mesas-api acepta mozo_id y mesa_id como filtros que se acumulan en AND; s…

What: GET /pedidos en mesas-api acepta mozo_id y mesa_id como filtros que se acumulan en AND; si mesa_id no existe devuelve 404 con el mismo código/mensaje ('La mesa no existe') que ya usa POST /pedidos · Why: mantener consistencia de validación entre POST y GET, y permitir combinar filtros sin ambigüedad · Where: mesas-api/src/server.js, README.md (tabla de endpoints). <!-- id: d56ed139-2179-4ef8-b419-3cf4bc919af4-1 -->

## ETIQUETAS (mapa de estado→etiqueta legible) está duplicado entre mesas-web/estados.js (us…

What: ETIQUETAS (mapa de estado→etiqueta legible) está duplicado entre mesas-web/estados.js (usado por panel.js y ahora también por app.js) y mesas-shared/src/estados.js · Why: mesas-shared todavía no se publica como paquete instalable, así que cada consumidor mantiene su propia copia siguiendo el mismo patrón · Where: mesas-web/estados.js, mesas-shared/src/estados.js · Learned: publicar mesas-shared como paquete para eliminar la duplicación queda anotado como tarea aparte en PENDIENTES.md, no se resolvió en esta orden. <!-- id: d56ed139-2179-4ef8-b419-3cf4bc919af4-4 -->

## Al enviar un pedido nuevo desde el cliente, la tarjeta de seguimiento se pinta de inmedia…

What: Al enviar un pedido nuevo desde el cliente, la tarjeta de seguimiento se pinta de inmediato con la respuesta del POST, sin esperar al siguiente ciclo de polling (4s) · Why: evita que el pedido recién enviado tarde en aparecer en la propia vista del cliente que lo generó · Where: mesas-web/app.js. <!-- id: d56ed139-2179-4ef8-b419-3cf4bc919af4-5 -->

## los pedidos se crean con estado_anterior, estado_cambiado_en y estado_cambiado_por en nul…

What: los pedidos se crean con estado_anterior, estado_cambiado_en y estado_cambiado_por en null explícito (no ausentes) en POST /pedidos. · Why: así todo pedido tiene la misma forma en GET /pedidos sin importar si ya cambió de estado o no, evitando que el consumidor tenga que chequear presencia de la key. · Where: mesas-api/src/server.js (POST /pedidos). <!-- id: 5a889181-944f-4aa4-8698-17a724f25d1d-1 -->

## POST /pedidos/:id/estado valida en este orden estricto: 400 JSON inválido → 400 mozo_id f…

What: POST /pedidos/:id/estado valida en este orden estricto: 400 JSON inválido → 400 mozo_id faltante → 404 mozo inexistente → 409 transición ilegal; recién si todo pasa se aplica la mutación y se escribe la autoría. · Why: separa validación de campos (input malformado) de reglas de dominio (transición), consistente con el orden ya usado en POST /pedidos; así un 409 nunca pisa datos de autoría por error. · Where: mesas-api/src/server.js. <!-- id: 5a889181-944f-4aa4-8698-17a724f25d1d-2 -->

## un 409 (transición de estado rechazada) NO escribe estado_anterior/estado_cambiado_en/est…

What: un 409 (transición de estado rechazada) NO escribe estado_anterior/estado_cambiado_en/estado_cambiado_por; esos campos sólo se actualizan junto con la mutación real de estado, después de pasar todas las validaciones. · Why: evita registrar autoría de un cambio que en realidad no ocurrió. · Where: mesas-api/src/server.js (POST /pedidos/:id/estado). <!-- id: 5a889181-944f-4aa4-8698-17a724f25d1d-3 -->

## mozo_id en POST /pedidos/:id/estado se valida contra la lista de mozos existentes; si no…

What: mozo_id en POST /pedidos/:id/estado se valida contra la lista de mozos existentes; si no existe responde 404 "El mozo no existe", igual criterio y redacción que la validación de mesa_id en POST /pedidos. · Why: mantiene consistencia de estilo de error entre endpoints y evita guardar autoría inventada por un typo en mozo_id. · Where: mesas-api/src/server.js. <!-- id: 5a889181-944f-4aa4-8698-17a724f25d1d-4 -->

## panel.js manda mozo_id (tomado de $("mozo").value) en el body de POST /pedidos/:id/estado…

What: panel.js manda mozo_id (tomado de $("mozo").value) en el body de POST /pedidos/:id/estado pero no muestra en la UI los campos de autoría nuevos (estado_anterior, estado_cambiado_en, estado_cambiado_por). · Why: mostrar "cambiado por X hace Ns" se decidió postergar al work order de deshacer, donde va a haber un botón de undo al lado que lo justifique. · Where: mesas-web/panel.js. <!-- id: 5a889181-944f-4aa4-8698-17a724f25d1d-8 -->

## los timestamps nuevos como estado_cambiado_en usan epoch ms (número), igual formato que e…

What: los timestamps nuevos como estado_cambiado_en usan epoch ms (número), igual formato que el campo existente creado_en. · Why: consistencia de formato de fecha/hora en todo el typedef Pedido. · Where: mesas-shared/src/tipos.js, mesas-api/src/server.js. <!-- id: 5a889181-944f-4aa4-8698-17a724f25d1d-9 -->

## Para verificar que las dos copias duplicadas de estados.js (mesas-shared y mesas-api) que…

What: Para verificar que las dos copias duplicadas de estados.js (mesas-shared y mesas-api) queden alineadas al agregar exports nuevos a la máquina de estados, se corre un script que diffea los nombres exportados y recorre cada par de transiciones entre ambas copias, en vez de comparar los archivos a mano. · Why: la duplicación entre repos existe a propósito hasta que mesas-shared se publique como paquete, y un diff manual puede pasar por alto una transición que quedó desincronizada. <!-- id: 98b6ca08-ebe0-47f6-8408-e1df8d9d7bce-10 -->

## pagado y cancelado son estados terminales excluidos explícitamente del undo (ESTADOS_TERM…

What: pagado y cancelado son estados terminales excluidos explícitamente del undo (ESTADOS_TERMINALES + esTerminal), aunque la derivación automática de inversas por sí sola permitiría pagado→servido. · Why: servido→pagado es una transición forward legal, así que sin el chequeo explícito de terminal la inversa derivada volvería deshacible un pago ya cerrado. · Where: mesas-shared/src/estados.js y mesas-api/src/estados.js, puedeDeshacer. <!-- id: 98b6ca08-ebe0-47f6-8408-e1df8d9d7bce-3 -->

## El endpoint POST /pedidos/:id/deshacer en mesas-api valida en este orden: 404 pedido inex…

What: El endpoint POST /pedidos/:id/deshacer en mesas-api valida en este orden: 404 pedido inexistente → 400/404 validación de body (mozo_id) → 409 estado terminal → 409 sin estado_anterior → 403 autoría (estado_cambiado_por !== mozo_id) → 409 ventana de 30s expirada. · Why: la autoría se chequea antes que la ventana a propósito, para que un mozo ajeno al cambio no llegue a enterarse del estado del reloj de undo; al mozo correcto en cambio le sirve más el mensaje de ventana vencida. · Where: mesas-api/src/server.js. <!-- id: 98b6ca08-ebe0-47f6-8408-e1df8d9d7bce-5 -->

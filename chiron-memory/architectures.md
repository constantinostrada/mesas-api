# architecture

How the system is put together — layers, boundaries, and how data flows.

## El proyecto 'Mesas' está dividido en tres repos separados: mesas-shared (contrato, tipos…

What: El proyecto 'Mesas' está dividido en tres repos separados: mesas-shared (contrato, tipos y máquina de estados del pedido), mesas-api (API del salón: mesas, mozos, pedidos) y mesas-web (panel HTML plano del mozo). · Why: — · Where: chiron/work/testmultiplerepos/.../{mesas-shared,mesas-api,mesas-web} <!-- id: 6370c37e-200b-4996-a2d1-ae6d22f75793-10 -->

## mesas-web/panel.js arma los botones de acción del pedido dinámicamente a partir de TRANSI…

What: mesas-web/panel.js arma los botones de acción del pedido dinámicamente a partir de TRANSICIONES[p.estado] · Why: permite que agregar un nuevo estado con sus transiciones haga aparecer el botón correspondiente sin tocar el código de render del panel · Where: mesas-web/panel.js · Learned: cambios en la máquina de estados que solo tocan TRANSICIONES/ETIQUETAS no requieren cambios en la lógica de renderizado del panel. <!-- id: 96fd367c-6b61-46ec-9faa-17fa94d5562c-2 -->

## La máquina de estados (ESTADOS/TRANSICIONES/ETIQUETAS) vive en mesas-shared y no en mesas…

What: La máquina de estados (ESTADOS/TRANSICIONES/ETIQUETAS) vive en mesas-shared y no en mesas-api porque mesas-web (el panel del mozo) también necesita conocer las transiciones legales para mostrar solo los botones de las acciones válidas · Why: si la máquina de estados viviera solo en el backend, el frontend no tendría cómo decidir qué botones renderizar sin duplicar la lógica de validación a mano · Where: mesas-shared/src/estados.js (comentario de cabecera del archivo) · Learned: cualquier cambio a la máquina de estados debe evaluarse pensando en su consumo desde el frontend, no solo desde la API. <!-- id: 96fd367c-6b61-46ec-9faa-17fa94d5562c-4 -->

## Al filtrar por mesa se eliminó la maquinaria que existía solo para rastrear 'mis pedidos'…

What: Al filtrar por mesa se eliminó la maquinaria que existía solo para rastrear 'mis pedidos' en el navegador (CLAVE_PEDIDOS, leerGuardados/guardar, recordarPedido, idsDeMesa, purgarViejos/purgadas), ~50 líneas menos en app.js · Why: esa lógica quedó redundante una vez que la API filtra por mesa_id server-side · Where: mesas-web/app.js · Learned: se conservó CLAVE_MESA (persiste qué mesa está siguiendo el cliente, sostiene el requisito de conservar el seguimiento al recargar), el repintado desde el último estado conocido si falla un ciclo de polling (ahora indexado por mesa en vez de por id de pedido), el guard anti-solapamiento (enVuelo) y el aviso de 'sin conexión'. <!-- id: d56ed139-2179-4ef8-b419-3cf4bc919af4-2 -->

## mesas-shared/src/tipos.js (typedef JSDoc, incluye Pedido) está duplicado a propósito en m…

What: mesas-shared/src/tipos.js (typedef JSDoc, incluye Pedido) está duplicado a propósito en mesas-api y mesas-web hasta que mesas-shared se publique como paquete (ver PENDIENTES.md); cualquier cambio al contrato de Pedido debe reflejarse en las tres copias. · Why: los tres repos deben poder consumir las formas de dominio sin toolchain compartido (la web es HTML plano, la API es node sin dependencias) mientras no exista un paquete publicado. · Where: mesas-shared/src/tipos.js, mesas-api, mesas-web. · Learned: al agregar un campo a Pedido hay que buscar y actualizar cada copia manualmente, no hay una sola fuente que se sincronice sola. <!-- id: 5a889181-944f-4aa4-8698-17a724f25d1d-6 -->

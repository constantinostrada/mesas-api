# mesas-api

La API del salón: mesas, mozos y pedidos. Node sin dependencias — `node:http` y
un store en memoria, para que levante con `node src/server.js` y nada más.

En memoria a propósito: lo que se está probando es el flujo, y una base de datos
sería una decisión de infraestructura que todavía no hace falta tomar.

## Levantar

```bash
node src/server.js        # http://localhost:4000
```

## Endpoints

| | |
|---|---|
| `GET /mesas` | todas las mesas con su mozo |
| `GET /mozos` | los mozos y si están activos |
| `GET /carta` | la carta |
| `GET /pedidos?mozo_id=&mesa_id=` | pedidos, opcionalmente filtrados por mozo y/o mesa (se acumulan) |
| `POST /pedidos` | crea un pedido y lo asigna a un mozo |
| `POST /pedidos/:id/estado` | cambia el estado, validando la transición. Requiere `mozo_id` en el body (400 si falta) y registra quién cambió y cuándo |
| `POST /pedidos/:id/deshacer` | deshace el último cambio de estado, si lo pide el mismo mozo dentro de los 30 segundos |
| `POST /pedidos/:id/cancelar` | cancela el pedido, si todavía no salió de cocina |

El vocabulario (estados, transiciones, tipos) vive en `mesas-shared`.

## Autoría del último cambio de estado

Cada pedido guarda quién lo movió por última vez y cuándo: `estado_anterior`,
`estado_cambiado_en` (epoch ms) y `estado_cambiado_por` (`mozo_id`). Son los
tres del *último* cambio y se pisan en cada uno — no es un historial. Un pedido
que todavía no cambió de estado los tiene en `null`.

`POST /pedidos/:id/cancelar` no los toca: cancelar no recibe `mozo_id`.

## Deshacer el último cambio

`POST /pedidos/:id/deshacer` con `{ "mozo_id": "..." }` devuelve el pedido a su
`estado_anterior`. Es para el mozo que marcó la mesa equivocada y se dio cuenta
en el momento, no para corregir un turno entero: por eso la ventana es de 30
segundos y sólo puede deshacer quien hizo el cambio.

| | |
|---|---|
| `403` | el `mozo_id` no es el de `estado_cambiado_por` |
| `409` | pasaron más de 30 segundos desde `estado_cambiado_en` |
| `409` | el pedido está en `pagado` o `cancelado` — terminales, sin vuelta |
| `409` | el pedido no cambió nunca de estado, o su último cambio ya se deshizo |

El undo deja `estado_anterior`, `estado_cambiado_en` y `estado_cambiado_por` en
`null`: deshacer anula el cambio en vez de registrar uno nuevo, así no se pueden
encadenar undos para caminar el pedido hasta el principio dentro de la ventana.

Las transiciones inversas no están en `TRANSICIONES` y no se pueden pedir por
`POST /pedidos/:id/estado`, que sigue rechazando cualquier retroceso con 409.
Se derivan de las de ida: se vuelve a `estado_anterior` sólo si desde ahí se
llegaba al estado actual.

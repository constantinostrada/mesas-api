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
| `GET /pedidos?mozo_id=` | pedidos, opcionalmente filtrados por mozo |
| `POST /pedidos` | crea un pedido y lo asigna a un mozo |
| `POST /pedidos/:id/estado` | cambia el estado, validando la transición |

El vocabulario (estados, transiciones, tipos) vive en `mesas-shared`.

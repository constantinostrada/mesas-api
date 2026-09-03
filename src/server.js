import { createServer } from "node:http";
import { CARTA, mesas, mozos, pedidos, nuevoId } from "./store.js";
import { asignarMozo } from "./asignacion.js";
import { puedePasar, esCancelable } from "./estados.js";

const PORT = Number(process.env.PORT ?? 4000);

const json = (res, code, body) => {
  res.writeHead(code, {
    "content-type": "application/json; charset=utf-8",
    // La web se sirve como archivo estático desde otro puerto, así que sin esto
    // el navegador bloquea todas las llamadas.
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "content-type",
  });
  res.end(JSON.stringify(body));
};

const leerBody = (req) =>
  new Promise((resolve) => {
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => {
      try {
        resolve(JSON.parse(raw || "{}"));
      } catch {
        resolve(null); // JSON roto → 400, no un 500 sin explicación
      }
    });
  });

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const ruta = url.pathname;

  if (req.method === "OPTIONS") return json(res, 204, {});

  if (req.method === "GET" && ruta === "/mesas") return json(res, 200, { mesas });
  if (req.method === "GET" && ruta === "/mozos") return json(res, 200, { mozos });
  if (req.method === "GET" && ruta === "/carta") return json(res, 200, { carta: CARTA });

  if (req.method === "GET" && ruta === "/pedidos") {
    const mozo_id = url.searchParams.get("mozo_id");
    const lista = mozo_id ? pedidos.filter((p) => p.mozo_id === mozo_id) : pedidos;
    // Más nuevos primero: el panel del mozo se lee de arriba hacia abajo.
    return json(res, 200, { pedidos: [...lista].sort((a, b) => b.creado_en - a.creado_en) });
  }

  if (req.method === "POST" && ruta === "/pedidos") {
    const body = await leerBody(req);
    if (!body) return json(res, 400, { error: "JSON inválido" });
    const { mesa_id, items } = body;
    if (!mesa_id || !Array.isArray(items) || items.length === 0)
      return json(res, 400, { error: "mesa_id e items son obligatorios" });
    if (!mesas.some((m) => m.id === mesa_id)) return json(res, 404, { error: "La mesa no existe" });

    const pedido = {
      id: nuevoId(),
      mesa_id,
      mozo_id: asignarMozo(mesa_id),
      items,
      estado: "pedido",
      creado_en: Date.now(),
    };
    pedidos.push(pedido);
    return json(res, 201, { pedido });
  }

  const cambio = ruta.match(/^\/pedidos\/([^/]+)\/estado$/);
  if (req.method === "POST" && cambio) {
    const pedido = pedidos.find((p) => p.id === cambio[1]);
    if (!pedido) return json(res, 404, { error: "El pedido no existe" });
    const body = await leerBody(req);
    const destino = body?.estado;
    // El error dice DESDE dónde y HACIA dónde: "transición inválida" a secas
    // obliga a ir a leer el código para entender qué se podía hacer.
    if (!puedePasar(pedido.estado, destino))
      return json(res, 409, { error: `No se puede pasar de "${pedido.estado}" a "${destino}"` });
    pedido.estado = destino;
    return json(res, 200, { pedido });
  }

  // Cancelar tiene endpoint propio y no un `POST /estado` con destino
  // "cancelado": quien cancela no está eligiendo el próximo estado del pedido,
  // está dándolo de baja, y no tiene por qué saber cómo se llama ese estado.
  const cancelacion = ruta.match(/^\/pedidos\/([^/]+)\/cancelar$/);
  if (req.method === "POST" && cancelacion) {
    const pedido = pedidos.find((p) => p.id === cancelacion[1]);
    if (!pedido) return json(res, 404, { error: "El pedido no existe" });
    // Mismo 409 y misma redacción que /estado: para quien llama es la misma
    // regla de la máquina rechazando, y dos textos para lo mismo confunden.
    if (!esCancelable(pedido.estado))
      return json(res, 409, { error: `No se puede pasar de "${pedido.estado}" a "cancelado"` });
    pedido.estado = "cancelado";
    return json(res, 200, { pedido });
  }

  json(res, 404, { error: `No existe ${req.method} ${ruta}` });
});

server.listen(PORT, () => console.log(`mesas-api escuchando en http://localhost:${PORT}`));

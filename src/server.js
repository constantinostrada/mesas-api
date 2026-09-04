import { createServer } from "node:http";
import { CARTA, mesas, mozos, pedidos, nuevoId } from "./store.js";
import { asignarMozo } from "./asignacion.js";
import {
  puedePasar,
  esCancelable,
  esTerminal,
  puedeDeshacer,
  dentroDeVentanaUndo,
  VENTANA_UNDO_MS,
} from "./estados.js";

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
    const mesa_id = url.searchParams.get("mesa_id");
    // Una mesa que no existe es un pedido mal armado, no una mesa sin pedidos:
    // devolver [] haría que la pantalla del cliente mostrara "todavía nada"
    // para siempre sin que nadie se enterara del typo. Mismo 404 y mismo texto
    // que POST /pedidos, que ya valida lo mismo.
    if (mesa_id && !mesas.some((m) => m.id === mesa_id))
      return json(res, 404, { error: "La mesa no existe" });
    // Los filtros se acumulan (AND): el panel filtra por mozo, la pantalla del
    // cliente por mesa, y pedir "los de esta mesa que atiende este mozo" tiene
    // que poder responderse sin un endpoint nuevo.
    const lista = pedidos.filter(
      (p) => (!mozo_id || p.mozo_id === mozo_id) && (!mesa_id || p.mesa_id === mesa_id),
    );
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
      // Nacen en null y no ausentes: si el pedido cambia de forma según si ya
      // lo tocaron o no, quien lee GET /pedidos tiene que preguntarse si el
      // campo falta o si vale null. Nacer en "pedido" no es un cambio.
      estado_anterior: null,
      estado_cambiado_en: null,
      estado_cambiado_por: null,
    };
    pedidos.push(pedido);
    return json(res, 201, { pedido });
  }

  const cambio = ruta.match(/^\/pedidos\/([^/]+)\/estado$/);
  if (req.method === "POST" && cambio) {
    const pedido = pedidos.find((p) => p.id === cambio[1]);
    if (!pedido) return json(res, 404, { error: "El pedido no existe" });
    const body = await leerBody(req);
    if (!body) return json(res, 400, { error: "JSON inválido" });
    const { estado: destino, mozo_id } = body;
    // Los campos primero y las reglas del dominio después: un body al que le
    // falta mozo_id no llega a ser una transición mal pedida, y un 409 que
    // dice `a "undefined"` manda a leer el código en vez de al campo.
    if (!mozo_id)
      return json(res, 400, { error: "mozo_id es obligatorio: identifica al mozo que cambia el estado" });
    // Mismo criterio y mismo texto que mesa_id en POST /pedidos: un id que no
    // existe es un typo del que llama, no un mozo sin pedidos.
    if (!mozos.some((m) => m.id === mozo_id)) return json(res, 404, { error: "El mozo no existe" });
    // El error dice DESDE dónde y HACIA dónde: "transición inválida" a secas
    // obliga a ir a leer el código para entender qué se podía hacer.
    if (!puedePasar(pedido.estado, destino))
      return json(res, 409, { error: `No se puede pasar de "${pedido.estado}" a "${destino}"` });
    // Se pisan en cada cambio: lo que hace falta es el último, no el historial.
    // Y se escriben juntos, en el mismo lugar donde muta el estado, para que no
    // exista un pedido que ya cambió pero todavía no dice quién lo cambió.
    pedido.estado_anterior = pedido.estado;
    pedido.estado_cambiado_en = Date.now();
    pedido.estado_cambiado_por = mozo_id;
    pedido.estado = destino;
    return json(res, 200, { pedido });
  }

  // Deshacer el último cambio de estado. Endpoint propio y no un /estado con
  // destino hacia atrás: quien deshace no está eligiendo el próximo estado del
  // pedido, está anulando el cambio anterior — y las reglas que lo permiten,
  // la ventana y la autoría, no aplican a ningún otro cambio.
  const undo = ruta.match(/^\/pedidos\/([^/]+)\/deshacer$/);
  if (req.method === "POST" && undo) {
    const pedido = pedidos.find((p) => p.id === undo[1]);
    if (!pedido) return json(res, 404, { error: "El pedido no existe" });
    const body = await leerBody(req);
    if (!body) return json(res, 400, { error: "JSON inválido" });
    const { mozo_id } = body;
    // Mismo orden que /estado: los campos primero y las reglas del dominio
    // después, así un body incompleto no llega a chocar con la máquina.
    if (!mozo_id)
      return json(res, 400, { error: "mozo_id es obligatorio: identifica al mozo que deshace el cambio" });
    if (!mozos.some((m) => m.id === mozo_id)) return json(res, 404, { error: "El mozo no existe" });
    // Explícito y con su propio texto aunque puedeDeshacer ya lo cubra: al
    // mozo que intenta deshacer un pedido cobrado le sirve saber que el
    // problema es el estado, no la ventana ni de quién era el cambio.
    if (esTerminal(pedido.estado))
      return json(res, 409, { error: `No se puede deshacer un pedido "${pedido.estado}"` });
    // Un pedido recién creado, o uno cuyo último cambio ya se deshizo. Va
    // antes que la autoría porque sin cambio registrado no hay autor contra
    // quien comparar.
    if (pedido.estado_anterior === null)
      return json(res, 409, { error: "El pedido no tiene ningún cambio de estado para deshacer" });
    // La máquina, no el reloj: si desde estado_anterior no se llegaba al
    // estado actual, los campos quedaron inconsistentes y revertir a ciegas
    // dejaría el pedido en un estado al que nunca se pudo haber llegado.
    if (!puedeDeshacer(pedido.estado, pedido.estado_anterior))
      return json(res, 409, { error: `No se puede volver de "${pedido.estado}" a "${pedido.estado_anterior}"` });
    // Antes que la ventana: a un mozo ajeno no le corresponde enterarse de en
    // qué anda el reloj de un cambio que no hizo.
    if (pedido.estado_cambiado_por !== mozo_id)
      return json(res, 403, { error: "Sólo el mozo que hizo el cambio puede deshacerlo" });
    if (!dentroDeVentanaUndo(pedido.estado_cambiado_en))
      return json(res, 409, {
        error: `La ventana para deshacer expiró: son ${VENTANA_UNDO_MS / 1000} segundos desde el cambio`,
      });

    pedido.estado = pedido.estado_anterior;
    // Deshacer borra el cambio; no es un cambio nuevo. Por eso los tres campos
    // vuelven a null en vez de registrar el undo: si lo registraran se podrían
    // encadenar undos y caminar el pedido hasta el principio dentro de la
    // ventana, que es justo lo que el límite de tiempo quiere evitar.
    pedido.estado_anterior = null;
    pedido.estado_cambiado_en = null;
    pedido.estado_cambiado_por = null;
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

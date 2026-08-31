import { mesas, mozos, pedidos } from "./store.js";

/**
 * A qué mozo le toca un pedido.
 *
 * Primero el mozo de la mesa: quien atiende una mesa la sigue atendiendo, y
 * repartir por carga rompería eso — el cliente vería tres caras distintas.
 * Sólo cuando la mesa no tiene mozo asignado se busca al que tenga menos
 * pedidos abiertos, para no cargar siempre al mismo.
 *
 * Devuelve null si no hay ningún mozo activo. El pedido se crea igual: perder
 * un pedido porque no había a quién asignárselo sería peor que uno sin dueño
 * esperando en el panel.
 */
export function asignarMozo(mesa_id) {
  const mesa = mesas.find((m) => m.id === mesa_id);
  if (mesa?.mozo_id) {
    const suyo = mozos.find((m) => m.id === mesa.mozo_id && m.activo);
    if (suyo) return suyo.id;
  }

  const activos = mozos.filter((m) => m.activo);
  if (activos.length === 0) return null;

  const abiertos = (mozo_id) =>
    pedidos.filter((p) => p.mozo_id === mozo_id && p.estado !== "pagado" && p.estado !== "cancelado").length;

  return activos.reduce((a, b) => (abiertos(a.id) <= abiertos(b.id) ? a : b)).id;
}

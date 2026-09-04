// Copia del contrato de mesas-shared. Está duplicada a propósito hasta que ese
// repo se publique como paquete (ver PENDIENTES.md) — y es exactamente el
// problema que esa tarea resuelve: hoy un estado nuevo hay que agregarlo acá y
// allá, y nada avisa si te olvidás de uno.
export const ESTADOS = ["pedido", "en_preparacion", "listo_para_servir", "servido", "pagado", "cancelado"];

const TRANSICIONES = {
  pedido: ["en_preparacion", "cancelado"],
  en_preparacion: ["listo_para_servir", "cancelado"],
  listo_para_servir: ["servido", "cancelado"],
  servido: ["pagado"],
  pagado: [],
  cancelado: [],
};

export function puedePasar(desde, hasta) {
  return (TRANSICIONES[desde] ?? []).includes(hasta);
}

/** Cancelable mientras el pedido siga en cocina. Ver el por qué en mesas-shared. */
export function esCancelable(estado) {
  return puedePasar(estado, "cancelado");
}

/**
 * Deshacer el último cambio de estado.
 *
 * Las inversas NO entran en TRANSICIONES a propósito: esa tabla es la que
 * valida `POST /pedidos/:id/estado`, y meterlas ahí dejaría retroceder por ese
 * endpoint salteándose la ventana de tiempo y el chequeo de autoría. Ver el
 * porqué largo en mesas-shared.
 */
export const VENTANA_UNDO_MS = 30_000;

/** Estados sin vuelta: el pedido ya se cobró o se dio de baja. */
export const ESTADOS_TERMINALES = ["pagado", "cancelado"];

export function esTerminal(estado) {
  return ESTADOS_TERMINALES.includes(estado);
}

/**
 * Se puede volver a `estadoAnterior` si desde ahí se llegó hasta el estado
 * actual: la inversa se deriva de la transición de ida. Los terminales se
 * excluyen a mano porque `servido → pagado` es una transición legal y sin esa
 * línea un pedido cobrado volvería a `servido`.
 */
export function puedeDeshacer(estadoActual, estadoAnterior) {
  if (esTerminal(estadoActual)) return false;
  return puedePasar(estadoAnterior, estadoActual);
}

/** ¿Sigue abierta la ventana para deshacer un cambio hecho en `cambiadoEn`? */
export function dentroDeVentanaUndo(cambiadoEn, ahora = Date.now()) {
  return typeof cambiadoEn === "number" && ahora - cambiadoEn <= VENTANA_UNDO_MS;
}

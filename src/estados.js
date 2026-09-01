// Copia del contrato de mesas-shared. Está duplicada a propósito hasta que ese
// repo se publique como paquete (ver PENDIENTES.md) — y es exactamente el
// problema que esa tarea resuelve: hoy un estado nuevo hay que agregarlo acá y
// allá, y nada avisa si te olvidás de uno.
export const ESTADOS = ["pedido", "en_preparacion", "servido", "pagado", "cancelado"];

const TRANSICIONES = {
  pedido: ["en_preparacion", "cancelado"],
  en_preparacion: ["servido", "cancelado"],
  servido: ["pagado"],
  pagado: [],
  cancelado: [],
};

export function puedePasar(desde, hasta) {
  return (TRANSICIONES[desde] ?? []).includes(hasta);
}

/** Si un pedido todavía se puede cancelar: mientras siga en cocina, o sea
 *  antes de `servido`. Se deriva de TRANSICIONES para no tener dos listas. */
export function puedeCancelarse(estado) {
  return puedePasar(estado, "cancelado");
}

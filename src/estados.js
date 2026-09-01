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

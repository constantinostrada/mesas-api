/** Store en memoria. Se reinicia con el proceso: es una demo del flujo, no un
 *  sistema con persistencia. Cambiarlo por una base es una tarea aparte. */

export const CARTA = [
  { id: "milanesa", nombre: "Milanesa con papas", precio: 8500 },
  { id: "ravioles", nombre: "Ravioles de ricota", precio: 7800 },
  { id: "ensalada", nombre: "Ensalada César", precio: 6200 },
  { id: "empanada", nombre: "Empanada de carne", precio: 1500 },
  { id: "flan", nombre: "Flan con dulce de leche", precio: 3900 },
  { id: "agua", nombre: "Agua sin gas", precio: 1800 },
];

export const mozos = [
  { id: "m1", nombre: "Sofía", activo: true },
  { id: "m2", nombre: "Julián", activo: true },
  { id: "m3", nombre: "Rocío", activo: false },
];

export const mesas = [
  { id: "t1", numero: 1, capacidad: 2, mozo_id: "m1" },
  { id: "t2", numero: 2, capacidad: 4, mozo_id: "m1" },
  { id: "t3", numero: 3, capacidad: 4, mozo_id: "m2" },
  { id: "t4", numero: 4, capacidad: 6, mozo_id: null },
  { id: "t5", numero: 5, capacidad: 2, mozo_id: null },
];

export const pedidos = [];

let seq = 0;
export function nuevoId() {
  seq += 1;
  return `p${String(seq).padStart(3, "0")}`;
}

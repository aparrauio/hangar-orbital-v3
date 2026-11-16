import type { BorradorMision, ErroresMision, Mision } from '../types/mision';

// `hoy` llega como YYYY-MM-DD; en ese formato las fechas se comparan bien como texto.
// Devuelve {} si los datos son válidos. La aptitud de la nave la comprueba puedeRecibirMision.
export function validarMision(borrador: BorradorMision, hoy: string): ErroresMision {
  const errores: ErroresMision = {};

  if (borrador.naveId === '') {
    errores.naveId = 'Elige la nave.';
  }

  if (borrador.destino.trim() === '') {
    errores.destino = 'Escribe el destino.';
  }

  if (borrador.fechaDespegue === '') {
    errores.fechaDespegue = 'Indica la fecha de despegue.';
  } else if (borrador.fechaDespegue < hoy) {
    errores.fechaDespegue = 'La fecha de despegue no puede ser anterior a hoy.';
  }

  const { duracionDias } = borrador;
  if (duracionDias === null) {
    errores.duracionDias = 'Indica la duración en días.';
  } else if (!Number.isInteger(duracionDias) || duracionDias < 1) {
    errores.duracionDias = 'La duración debe ser un número entero de días, como mínimo 1.';
  }

  return errores;
}

// Devuelve un arreglo nuevo: por fecha de despegue y, si coincide, por orden de asignación.
export function ordenarMisiones(misiones: Mision[]): Mision[] {
  return [...misiones].sort((a, b) => {
    if (a.fechaDespegue !== b.fechaDespegue) return a.fechaDespegue < b.fechaDespegue ? -1 : 1;
    return Date.parse(a.createdAt) - Date.parse(b.createdAt);
  });
}

// Día siguiente a una fecha YYYY-MM-DD. Se calcula en UTC para que la zona horaria no mueva el día.
function diaSiguiente(fecha: string): string {
  const [anio, mes, dia] = fecha.split('-').map(Number);
  return new Date(Date.UTC(anio, mes - 1, dia + 1)).toISOString().slice(0, 10);
}

function formatearFecha(fecha: string): string {
  const [anio, mes, dia] = fecha.split('-');
  return `${dia}/${mes}/${anio}`;
}

// `fecha` y `hoy` llegan como YYYY-MM-DD.
export function describirFechaDespegue(fecha: string, hoy: string): string {
  if (fecha === hoy) return 'Hoy';
  if (fecha === diaSiguiente(hoy)) return 'Mañana';
  if (fecha < hoy) return `Despegó el ${formatearFecha(fecha)}`;
  return formatearFecha(fecha);
}

export function describirDuracion(dias: number): string {
  return dias === 1 ? '1 día' : `${dias} días`;
}

import { CLASES_NAVE, type BorradorNave, type ClaseNave, type ErroresNave } from '../types/nave';

export function esClaseNave(valor: string): valor is ClaseNave {
  return (CLASES_NAVE as readonly string[]).includes(valor);
}

// Devuelve {} si los datos son válidos. La unicidad del nombre la comprueba navesService.
export function validarNave(borrador: BorradorNave): ErroresNave {
  const errores: ErroresNave = {};

  if (borrador.nombre.trim() === '') {
    errores.nombre = 'Escribe el nombre de la nave.';
  }

  if (!esClaseNave(borrador.clase)) {
    errores.clase = 'Elige la clase de la nave: exploradora, carguera o transporte.';
  }

  const { combustible } = borrador;
  if (combustible === null) {
    errores.combustible = MENSAJE_COMBUSTIBLE_VACIO;
  } else if (!esCombustibleValido(combustible)) {
    errores.combustible = MENSAJE_COMBUSTIBLE_RANGO;
  }

  return errores;
}

// Mensajes compartidos por validarNave y validarCombustible (spec 06, decisión 1)
export const MENSAJE_COMBUSTIBLE_VACIO = 'Indica el combustible de la nave.';
export const MENSAJE_COMBUSTIBLE_RANGO = 'El combustible debe ser un número entero entre 0 y 100.';

function esCombustibleValido(valor: number): boolean {
  return Number.isInteger(valor) && valor >= 0 && valor <= 100;
}

export type ResultadoCombustible = { ok: true; valor: number } | { ok: false; error: string };

// Valida lo que escribe el jefe al corregir el combustible (HU-2.2).
// Solo acepta dígitos: así rechaza decimales con coma o punto, signos y notaciones como «1e2».
export function validarCombustible(texto: string): ResultadoCombustible {
  const limpio = texto.trim();
  if (limpio === '') return { ok: false, error: MENSAJE_COMBUSTIBLE_VACIO };
  if (!/^\d+$/.test(limpio)) return { ok: false, error: MENSAJE_COMBUSTIBLE_RANGO };
  const valor = Number(limpio);
  if (!esCombustibleValido(valor)) return { ok: false, error: MENSAJE_COMBUSTIBLE_RANGO };
  return { ok: true, valor };
}

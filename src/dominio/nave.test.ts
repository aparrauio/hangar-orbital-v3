import { describe, expect, it } from 'vitest';
import { puedeRecibirMision } from './aptitud';
import { validarCombustible, validarNave } from './nave';
import type { BorradorNave } from '../types/nave';

const valido: BorradorNave = { nombre: 'Aurora', clase: 'carguera', combustible: 60 };

describe('validarNave', () => {
  it('acepta una nave con todos sus datos válidos', () => {
    expect(validarNave(valido)).toEqual({});
  });

  it.each(['exploradora', 'carguera', 'transporte'])('acepta la clase %s', (clase) => {
    expect(validarNave({ ...valido, clase })).toEqual({});
  });

  it.each(['', '   '])('rechaza el nombre %j', (nombre) => {
    expect(validarNave({ ...valido, nombre })).toEqual({ nombre: 'Escribe el nombre de la nave.' });
  });

  it.each(['', 'crucero', 'Carguera'])('rechaza la clase %j', (clase) => {
    expect(validarNave({ ...valido, clase })).toEqual({
      clase: 'Elige la clase de la nave: exploradora, carguera o transporte.',
    });
  });

  it('rechaza una nave sin combustible', () => {
    expect(validarNave({ ...valido, combustible: null })).toEqual({
      combustible: 'Indica el combustible de la nave.',
    });
  });

  it.each([-1, 101, 24.5, Number.NaN])('rechaza el combustible %d', (combustible) => {
    expect(validarNave({ ...valido, combustible })).toEqual({
      combustible: 'El combustible debe ser un número entero entre 0 y 100.',
    });
  });

  it.each([0, 25, 100])('acepta el combustible %d', (combustible) => {
    expect(validarNave({ ...valido, combustible })).toEqual({});
  });

  it('devuelve todos los errores a la vez', () => {
    expect(Object.keys(validarNave({ nombre: '', clase: '', combustible: null }))).toEqual([
      'nombre',
      'clase',
      'combustible',
    ]);
  });
});

describe('validarCombustible', () => {
  it.each(['', '   '])('rechaza el texto vacío %j (HU-2.2-CA3)', (texto) => {
    expect(validarCombustible(texto)).toEqual({
      ok: false,
      error: 'Indica el combustible de la nave.',
    });
  });

  it.each(['-1', '101', '24,5', '24.5', 'abc', '1e2', '12abc'])(
    'rechaza %j con el mensaje de rango (HU-2.2-CA4)',
    (texto) => {
      expect(validarCombustible(texto)).toEqual({
        ok: false,
        error: 'El combustible debe ser un número entero entre 0 y 100.',
      });
    },
  );

  it.each([
    ['0', 0],
    ['100', 100],
    ['25', 25],
  ])('acepta %j (HU-2.2-CA5)', (texto, valor) => {
    expect(validarCombustible(texto)).toEqual({ ok: true, valor });
  });

  it('recorta los espacios de los extremos', () => {
    expect(validarCombustible(' 25 ')).toEqual({ ok: true, valor: 25 });
  });

  it('usa los mismos mensajes que validarNave', () => {
    const vacio = validarCombustible('');
    const rango = validarCombustible('101');
    expect(vacio.ok ? null : vacio.error).toBe(
      validarNave({ ...valido, combustible: null }).combustible,
    );
    expect(rango.ok ? null : rango.error).toBe(
      validarNave({ ...valido, combustible: 101 }).combustible,
    );
  });
});

// La aptitud se recalcula con el combustible corregido.
describe('aptitud después de corregir el combustible', () => {
  it('una nave operativa con menos de 3 misiones pasa de no apta al 24 % a apta al 25 % (HU-2.2-CA1)', () => {
    const nave = { combustible: 24, enReparacion: false };
    expect(puedeRecibirMision(nave, 2).puede).toBe(false);
    expect(puedeRecibirMision({ ...nave, combustible: 25 }, 2)).toEqual({ puede: true });
  });

  it('una nave al 60 % corregida a 10 % pasa a no apta por combustible (HU-2.2-CA2)', () => {
    expect(puedeRecibirMision({ combustible: 10, enReparacion: false }, 0)).toEqual({
      puede: false,
      motivos: ['combustible_insuficiente'],
    });
  });
});

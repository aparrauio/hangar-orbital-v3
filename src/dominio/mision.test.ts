import { describe, expect, it } from 'vitest';
import {
  describirDuracion,
  describirEstadoMision,
  describirFechaDespegue,
  ordenarMisiones,
  puedeCompletarMision,
  validarMision,
} from './mision';
import type { BorradorMision, EstadoMision, Mision } from '../types/mision';

const HOY = '2026-10-28';

const valida: BorradorMision = {
  naveId: '6f1c2a3e-0000-4000-8000-000000000001',
  destino: 'Estación Kepler',
  fechaDespegue: '2026-10-29',
  duracionDias: 5,
};

describe('validarMision', () => {
  it('acepta una misión con todos sus datos válidos', () => {
    expect(validarMision(valida, HOY)).toEqual({});
  });

  it('rechaza una misión sin nave', () => {
    expect(validarMision({ ...valida, naveId: '' }, HOY)).toEqual({ naveId: 'Elige la nave.' });
  });

  it.each(['', '   '])('rechaza el destino %j', (destino) => {
    expect(validarMision({ ...valida, destino }, HOY)).toEqual({ destino: 'Escribe el destino.' });
  });

  it('rechaza una misión sin fecha de despegue', () => {
    expect(validarMision({ ...valida, fechaDespegue: '' }, HOY)).toEqual({
      fechaDespegue: 'Indica la fecha de despegue.',
    });
  });

  it('acepta una fecha de despegue igual a hoy', () => {
    expect(validarMision({ ...valida, fechaDespegue: HOY }, HOY)).toEqual({});
  });

  it.each(['2026-10-27', '2025-12-31'])('rechaza la fecha de despegue %s', (fechaDespegue) => {
    expect(validarMision({ ...valida, fechaDespegue }, HOY)).toEqual({
      fechaDespegue: 'La fecha de despegue no puede ser anterior a hoy.',
    });
  });

  it('rechaza una misión sin duración', () => {
    expect(validarMision({ ...valida, duracionDias: null }, HOY)).toEqual({
      duracionDias: 'Indica la duración en días.',
    });
  });

  it('acepta una duración de 1 día', () => {
    expect(validarMision({ ...valida, duracionDias: 1 }, HOY)).toEqual({});
  });

  it.each([0, -1, 2.5, Number.NaN])('rechaza una duración de %d días', (duracionDias) => {
    expect(validarMision({ ...valida, duracionDias }, HOY)).toEqual({
      duracionDias: 'La duración debe ser un número entero de días, como mínimo 1.',
    });
  });

  it('devuelve todos los errores a la vez', () => {
    const vacia: BorradorMision = {
      naveId: '',
      destino: '',
      fechaDespegue: '',
      duracionDias: null,
    };
    expect(Object.keys(validarMision(vacia, HOY))).toEqual([
      'naveId',
      'destino',
      'fechaDespegue',
      'duracionDias',
    ]);
  });
});

function mision(
  id: string,
  fechaDespegue: string,
  createdAt: string,
  estado: EstadoMision = 'pendiente',
): Mision {
  return {
    id,
    naveId: '6f1c2a3e-0000-4000-8000-000000000001',
    destino: `Destino ${id}`,
    fechaDespegue,
    duracionDias: 3,
    createdAt,
    estado,
  };
}

describe('ordenarMisiones', () => {
  it('ordena por fecha de despegue, de la más próxima a la más lejana (HU-1.4-CA1)', () => {
    const lejana = mision('a', '2026-12-20', '2026-11-01T10:00:00Z');
    const proxima = mision('b', '2026-12-10', '2026-11-02T10:00:00Z');
    expect(ordenarMisiones([lejana, proxima]).map((m) => m.id)).toEqual(['b', 'a']);
  });

  it('con la misma fecha de despegue, va primero la que se asignó antes (HU-1.4-CA2)', () => {
    const despues = mision('a', '2026-12-10', '2026-11-05T10:00:00Z');
    const antes = mision('b', '2026-12-10', '2026-11-01T10:00:00Z');
    expect(ordenarMisiones([despues, antes]).map((m) => m.id)).toEqual(['b', 'a']);
  });

  it('desempata por el instante de asignación aunque el día sea el mismo', () => {
    const tarde = mision('a', '2026-12-10', '2026-11-01T18:30:00Z');
    const temprano = mision('b', '2026-12-10', '2026-11-01T09:15:00Z');
    expect(ordenarMisiones([tarde, temprano]).map((m) => m.id)).toEqual(['b', 'a']);
  });

  it('no modifica el arreglo recibido', () => {
    const original = [
      mision('a', '2026-12-20', '2026-11-01T10:00:00Z'),
      mision('b', '2026-12-10', '2026-11-02T10:00:00Z'),
    ];
    const copia = [...original];
    const ordenadas = ordenarMisiones(original);
    expect(original).toEqual(copia);
    expect(ordenadas).not.toBe(original);
  });

  it('devuelve un arreglo vacío si no hay misiones', () => {
    expect(ordenarMisiones([])).toEqual([]);
  });

  it('pone las pendientes antes que las completadas, aunque despeguen después (HU-1.5-CA1)', () => {
    const completada = mision('c', '2026-11-02', '2026-10-20T10:00:00Z', 'completada');
    const manana = mision('e', '2026-11-19', '2026-11-10T10:00:00Z');
    const ayer = mision('t', '2026-11-17', '2026-11-10T11:00:00Z');
    expect(ordenarMisiones([completada, manana, ayer]).map((m) => m.id)).toEqual(['t', 'e', 'c']);
  });

  it('ordena cada grupo por fecha y, si empatan, por asignación (HU-1.5-CA1)', () => {
    const misiones = [
      mision('c2', '2026-11-17', '2026-11-01T10:00:00Z', 'completada'),
      mision('p2', '2026-11-20', '2026-11-01T10:00:00Z'),
      mision('c1', '2026-11-02', '2026-10-20T10:00:00Z', 'completada'),
      mision('p1b', '2026-11-18', '2026-11-05T10:00:00Z'),
      mision('p1a', '2026-11-18', '2026-11-01T10:00:00Z'),
    ];
    expect(ordenarMisiones(misiones).map((m) => m.id)).toEqual(['p1a', 'p1b', 'p2', 'c1', 'c2']);
  });

  it('no modifica el arreglo recibido al mezclar estados', () => {
    const original = [
      mision('c', '2026-11-02', '2026-10-20T10:00:00Z', 'completada'),
      mision('p', '2026-11-19', '2026-11-10T10:00:00Z'),
    ];
    const copia = [...original];
    ordenarMisiones(original);
    expect(original).toEqual(copia);
  });
});

describe('puedeCompletarMision', () => {
  const HOY_COMPLETAR = '2026-11-18';

  it('acepta una misión pendiente que despegó ayer (HU-1.5-CA1)', () => {
    expect(
      puedeCompletarMision({ estado: 'pendiente', fechaDespegue: '2026-11-17' }, HOY_COMPLETAR),
    ).toBe(true);
  });

  it('acepta una misión pendiente que despega hoy', () => {
    expect(
      puedeCompletarMision({ estado: 'pendiente', fechaDespegue: HOY_COMPLETAR }, HOY_COMPLETAR),
    ).toBe(true);
  });

  it('rechaza una misión pendiente que despega mañana (HU-1.5-CA1)', () => {
    expect(
      puedeCompletarMision({ estado: 'pendiente', fechaDespegue: '2026-11-19' }, HOY_COMPLETAR),
    ).toBe(false);
  });

  it('rechaza una misión completada aunque ya haya despegado (HU-1.5-CA1)', () => {
    expect(
      puedeCompletarMision({ estado: 'completada', fechaDespegue: '2026-11-17' }, HOY_COMPLETAR),
    ).toBe(false);
  });

  it('compara bien entre meses y años', () => {
    expect(
      puedeCompletarMision({ estado: 'pendiente', fechaDespegue: '2025-12-31' }, '2026-01-01'),
    ).toBe(true);
    expect(
      puedeCompletarMision({ estado: 'pendiente', fechaDespegue: '2027-01-01' }, '2026-12-31'),
    ).toBe(false);
  });
});

describe('describirEstadoMision', () => {
  it('devuelve «Pendiente» y «Completada» (HU-1.5-CA1)', () => {
    expect(describirEstadoMision('pendiente')).toBe('Pendiente');
    expect(describirEstadoMision('completada')).toBe('Completada');
  });
});

describe('describirFechaDespegue', () => {
  it('devuelve «Hoy» si la fecha es hoy (HU-1.4-CA4)', () => {
    expect(describirFechaDespegue('2026-11-16', '2026-11-16')).toBe('Hoy');
  });

  it('devuelve «Mañana» si la fecha es el día siguiente (HU-1.4-CA4)', () => {
    expect(describirFechaDespegue('2026-11-17', '2026-11-16')).toBe('Mañana');
  });

  it.each([
    ['2026-02-01', '2026-01-31'],
    ['2026-03-01', '2026-02-28'],
    ['2028-02-29', '2028-02-28'],
    ['2027-01-01', '2026-12-31'],
  ])('devuelve «Mañana» para %s con hoy %s (cambio de mes y de año)', (fecha, hoy) => {
    expect(describirFechaDespegue(fecha, hoy)).toBe('Mañana');
  });

  it('devuelve «Despegó el DD/MM/AAAA» si la fecha es de ayer (HU-1.4-CA5)', () => {
    expect(describirFechaDespegue('2026-11-15', '2026-11-16')).toBe('Despegó el 15/11/2026');
  });

  it('devuelve «Despegó el DD/MM/AAAA» para una fecha del año anterior (HU-1.4-CA5)', () => {
    expect(describirFechaDespegue('2025-12-31', '2026-01-01')).toBe('Despegó el 31/12/2025');
  });

  it('devuelve «DD/MM/AAAA» para una fecha futura más allá de mañana', () => {
    expect(describirFechaDespegue('2026-12-10', '2026-11-16')).toBe('10/12/2026');
  });

  it('no confunde con «Mañana» el mismo día del mes siguiente', () => {
    expect(describirFechaDespegue('2026-12-17', '2026-11-16')).toBe('17/12/2026');
  });
});

describe('describirDuracion', () => {
  it('devuelve «1 día» para 1 (HU-1.4-CA6)', () => {
    expect(describirDuracion(1)).toBe('1 día');
  });

  it.each([
    [5, '5 días'],
    [2, '2 días'],
    [30, '30 días'],
  ])('devuelve «N días» para %d (HU-1.4-CA6)', (dias, texto) => {
    expect(describirDuracion(dias)).toBe(texto);
  });
});

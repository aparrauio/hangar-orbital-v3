import { describe, expect, it } from 'vitest';
import { puedeRecibirMision } from './aptitud';
import { puedeRegistrarRevision } from './revision';

describe('puedeRegistrarRevision', () => {
  it('permite registrar la revisión de una nave operativa', () => {
    expect(puedeRegistrarRevision({ enReparacion: false })).toEqual({ puede: true });
  });

  it('no permite registrar la revisión de una nave en reparación y da el motivo (HU-2.1-CA3)', () => {
    expect(puedeRegistrarRevision({ enReparacion: true })).toEqual({
      puede: false,
      motivo: 'La nave está en reparación: la revisión se registra al salir del dique seco.',
    });
  });
});

// Después de la revisión el contador vuelve a 0: la aptitud se recalcula con 0 misiones.
describe('aptitud después de registrar la revisión', () => {
  it('una nave al 60 % que tenía 3 misiones pasa a apta (HU-2.1-CA1)', () => {
    const nave = { combustible: 60, enReparacion: false };
    expect(puedeRecibirMision(nave, 3)).toEqual({ puede: false, motivos: ['revision_pendiente'] });
    expect(puedeRecibirMision(nave, 0)).toEqual({ puede: true });
  });

  it('una nave al 10 % que tenía 3 misiones sigue no apta por combustible (HU-2.1-CA2)', () => {
    const nave = { combustible: 10, enReparacion: false };
    expect(puedeRecibirMision(nave, 0)).toEqual({
      puede: false,
      motivos: ['combustible_insuficiente'],
    });
  });

  it('una misión asignada después de la revisión cuenta como 1 y la nave sigue apta (HU-2.1-CA5)', () => {
    expect(puedeRecibirMision({ combustible: 60, enReparacion: false }, 1)).toEqual({
      puede: true,
    });
  });
});

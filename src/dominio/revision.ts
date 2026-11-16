import type { Nave } from '../types/nave';

export type PermisoRevision = { puede: true } | { puede: false; motivo: string };

// Una nave en reparación no registra revisión: salir del dique seco ya cuenta como una (R7).
export function puedeRegistrarRevision(nave: Pick<Nave, 'enReparacion'>): PermisoRevision {
  if (nave.enReparacion) {
    return {
      puede: false,
      motivo: 'La nave está en reparación: la revisión se registra al salir del dique seco.',
    };
  }
  return { puede: true };
}

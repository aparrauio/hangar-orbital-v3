import { useId, useState } from 'react';
import { MENSAJES_MOTIVO } from '../dominio/aptitud';
import { puedeRegistrarRevision } from '../dominio/revision';
import type { Aptitud } from '../types/mision';
import type { Nave } from '../types/nave';
import BarraCombustible from './BarraCombustible';
import ContadorMisiones from './ContadorMisiones';
import InsigniaEstado from './InsigniaEstado';
import MisionesNave from './MisionesNave';

interface Props {
  nave: Nave;
  misiones: number;
  aptitud: Aptitud;
  // Registra la revisión y vuelve a cargar la flota; lanza un Error si falla
  onRegistrarRevision: (naveId: string) => Promise<void>;
}

type AvisoRevision = 'exito' | 'error' | null;

// El orden de los bloques es fijo: DESIGN.md §6.7
export default function TarjetaNave({ nave, misiones, aptitud, onRegistrarRevision }: Props) {
  const idMotivoRevision = useId();
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState<AvisoRevision>(null);
  const permiso = puedeRegistrarRevision(nave);

  async function registrarRevision() {
    setEnviando(true);
    setAviso(null);
    try {
      await onRegistrarRevision(nave.id);
      setAviso('exito');
    } catch {
      setAviso('error');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <li className="tarjeta-nave">
      <div className="tarjeta-cabecera">
        <h3>{nave.nombre}</h3>
        <InsigniaEstado variante={aptitud.puede ? 'apta' : 'no-apta'} />
      </div>
      <span className="clase">{nave.clase}</span>
      <BarraCombustible combustible={nave.combustible} />
      <ContadorMisiones misiones={misiones} />
      <div className="tarjeta-estado">
        {nave.enReparacion ? <InsigniaEstado variante="reparacion" /> : 'Operativa'}
      </div>
      {!aptitud.puede && (
        <ul className="motivos">
          {aptitud.motivos.map((motivo) => (
            <li key={motivo}>{MENSAJES_MOTIVO[motivo]}</li>
          ))}
        </ul>
      )}
      <button
        type="button"
        className="boton boton--secundario"
        disabled={!permiso.puede || enviando}
        aria-describedby={permiso.puede ? undefined : idMotivoRevision}
        onClick={() => void registrarRevision()}
      >
        Registrar revisión
      </button>
      {!permiso.puede && (
        <p id={idMotivoRevision} className="tarjeta-estado">
          {permiso.motivo}
        </p>
      )}
      {aviso === 'exito' && (
        <p className="aviso aviso--exito" role="status">
          Revisión registrada.
        </p>
      )}
      {aviso === 'error' && (
        <p className="aviso aviso--error" role="alert">
          No se pudo registrar la revisión.
        </p>
      )}
      <MisionesNave naveId={nave.id} />
    </li>
  );
}

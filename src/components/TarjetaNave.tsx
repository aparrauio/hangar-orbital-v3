import { useId, useState, type FormEvent } from 'react';
import { MENSAJES_MOTIVO } from '../dominio/aptitud';
import { validarCombustible } from '../dominio/nave';
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
  // Corrige el combustible y vuelve a cargar la flota; lanza un Error si falla
  onCorregirCombustible: (naveId: string, combustible: number) => Promise<void>;
  // Completa una misión y vuelve a cargar la flota; lanza un Error si falla
  onCompletarMision: (misionId: string, combustible: number) => Promise<void>;
}

type AvisoRevision = 'exito' | 'error' | null;

// El orden de los bloques es fijo: DESIGN.md §6.7
export default function TarjetaNave({
  nave,
  misiones,
  aptitud,
  onRegistrarRevision,
  onCorregirCombustible,
  onCompletarMision,
}: Props) {
  const idMotivoRevision = useId();
  const idCombustible = useId();
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState<AvisoRevision>(null);
  const permiso = puedeRegistrarRevision(nave);

  const [textoCombustible, setTextoCombustible] = useState('');
  const [errorCombustible, setErrorCombustible] = useState<string | null>(null);
  const [guardandoCombustible, setGuardandoCombustible] = useState(false);
  const [falloCombustible, setFalloCombustible] = useState(false);

  async function corregirCombustible(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setFalloCombustible(false);
    const resultado = validarCombustible(textoCombustible);
    if (!resultado.ok) {
      setErrorCombustible(resultado.error);
      return;
    }
    setErrorCombustible(null);
    setGuardandoCombustible(true);
    try {
      await onCorregirCombustible(nave.id, resultado.valor);
      setTextoCombustible('');
    } catch {
      setFalloCombustible(true);
    } finally {
      setGuardandoCombustible(false);
    }
  }

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
      <form className="campo" noValidate onSubmit={(e) => void corregirCombustible(e)}>
        <label htmlFor={idCombustible}>Corregir combustible</label>
        <input
          id={idCombustible}
          type="text"
          inputMode="numeric"
          className="campo-control cifra"
          value={textoCombustible}
          onChange={(e) => setTextoCombustible(e.target.value)}
          aria-invalid={errorCombustible ? 'true' : undefined}
          aria-describedby={errorCombustible ? `${idCombustible}-error` : undefined}
        />
        {errorCombustible && (
          <p id={`${idCombustible}-error`} className="campo-error" role="alert">
            {errorCombustible}
          </p>
        )}
        <button type="submit" className="boton boton--secundario" disabled={guardandoCombustible}>
          Guardar
        </button>
        {falloCombustible && (
          <p className="aviso aviso--error" role="alert">
            No se pudo corregir el combustible.
          </p>
        )}
      </form>
      <MisionesNave naveId={nave.id} onCompletar={onCompletarMision} />
    </li>
  );
}

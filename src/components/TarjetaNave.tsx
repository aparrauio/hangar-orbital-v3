import { MENSAJES_MOTIVO } from '../dominio/aptitud';
import type { Aptitud } from '../types/mision';
import type { Nave } from '../types/nave';
import BarraCombustible from './BarraCombustible';
import ContadorMisiones from './ContadorMisiones';
import InsigniaEstado from './InsigniaEstado';

interface Props {
  nave: Nave;
  misiones: number;
  aptitud: Aptitud;
}

// El orden de los bloques es fijo: DESIGN.md §6.7
export default function TarjetaNave({ nave, misiones, aptitud }: Props) {
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
    </li>
  );
}

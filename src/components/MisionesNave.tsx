import { useId, useState } from 'react';
import {
  describirDuracion,
  describirFechaDespegue,
  ordenarMisiones,
  puedeCompletarMision,
} from '../dominio/mision';
import { fechaLocalHoy } from '../lib/fecha';
import { misionesService } from '../services/misionesService';
import type { Mision } from '../types/mision';
import CompletarMision from './CompletarMision';
import InsigniaEstado from './InsigniaEstado';

interface Props {
  naveId: string;
  // Completa la misión y vuelve a cargar la flota; lanza un Error si falla
  onCompletar: (misionId: string, combustible: number) => Promise<void>;
}

type Carga = { estado: 'cargando' } | { estado: 'error' } | { estado: 'lista'; misiones: Mision[] };

// Bloque 9 de la Tarjeta de nave: DESIGN.md §6.7. Las misiones se cargan al abrir (spec 04, decisión 3).
export default function MisionesNave({ naveId, onCompletar }: Props) {
  const idLista = useId();
  const [abierta, setAbierta] = useState(false);
  const [carga, setCarga] = useState<Carga>({ estado: 'cargando' });
  // Misión con el formulario de completar abierto: solo una a la vez (spec 07, decisión 8)
  const [abiertaId, setAbiertaId] = useState<string | null>(null);

  async function cargar() {
    setCarga({ estado: 'cargando' });
    try {
      const misiones = await misionesService.listarPorNave(naveId);
      setCarga({ estado: 'lista', misiones: ordenarMisiones(misiones) });
    } catch {
      setCarga({ estado: 'error' });
    }
  }

  function alternar() {
    if (abierta) {
      setAbierta(false);
      setAbiertaId(null);
      return;
    }
    setAbierta(true);
    void cargar();
  }

  // Si falla, el error sube a CompletarMision, que muestra el aviso y conserva el valor
  async function completar(misionId: string, combustible: number) {
    await onCompletar(misionId, combustible);
    setCarga((actual) =>
      actual.estado === 'lista'
        ? {
            estado: 'lista',
            misiones: ordenarMisiones(
              actual.misiones.map((m) =>
                m.id === misionId ? { ...m, estado: 'completada' as const } : m,
              ),
            ),
          }
        : actual,
    );
    setAbiertaId(null);
  }

  const hoy = fechaLocalHoy();

  return (
    <div className="misiones-nave">
      <button
        type="button"
        className="boton boton--secundario"
        aria-expanded={abierta}
        aria-controls={idLista}
        onClick={alternar}
      >
        {abierta ? 'Ocultar misiones' : 'Ver misiones'}
      </button>
      <div id={idLista} hidden={!abierta}>
        {abierta && carga.estado === 'cargando' && (
          <p className="misiones-texto">Cargando misiones…</p>
        )}
        {abierta && carga.estado === 'error' && (
          <div className="aviso aviso--error" role="alert">
            No se pudieron cargar las misiones.
          </div>
        )}
        {abierta && carga.estado === 'lista' && carga.misiones.length === 0 && (
          <p className="misiones-texto">Esta nave no tiene misiones.</p>
        )}
        {abierta && carga.estado === 'lista' && carga.misiones.length > 0 && (
          <ul className="misiones-lista">
            {carga.misiones.map((mision) => (
              <li key={mision.id} className="mision">
                <div className="mision-cabecera">
                  <span className="mision-destino">{mision.destino}</span>
                  <InsigniaEstado variante={mision.estado} />
                </div>
                <span className="mision-detalle mision-fecha">
                  {describirFechaDespegue(mision.fechaDespegue, hoy)}
                </span>
                <span className="mision-detalle">{describirDuracion(mision.duracionDias)}</span>
                {abiertaId === mision.id ? (
                  <CompletarMision
                    onConfirmar={(combustible) => completar(mision.id, combustible)}
                    onCancelar={() => setAbiertaId(null)}
                  />
                ) : (
                  puedeCompletarMision(mision, hoy) && (
                    <button
                      type="button"
                      className="boton boton--secundario"
                      disabled={abiertaId !== null}
                      onClick={() => setAbiertaId(mision.id)}
                    >
                      Completar
                    </button>
                  )
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

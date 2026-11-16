import { useId, useState } from 'react';
import { describirDuracion, describirFechaDespegue, ordenarMisiones } from '../dominio/mision';
import { fechaLocalHoy } from '../lib/fecha';
import { misionesService } from '../services/misionesService';
import type { Mision } from '../types/mision';

interface Props {
  naveId: string;
}

type Carga = { estado: 'cargando' } | { estado: 'error' } | { estado: 'lista'; misiones: Mision[] };

// Bloque 7 de la Tarjeta de nave: DESIGN.md §6.7. Las misiones se cargan al abrir (spec 04, decisión 3).
export default function MisionesNave({ naveId }: Props) {
  const idLista = useId();
  const [abierta, setAbierta] = useState(false);
  const [carga, setCarga] = useState<Carga>({ estado: 'cargando' });

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
      return;
    }
    setAbierta(true);
    void cargar();
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
                <span className="mision-destino">{mision.destino}</span>
                <span className="mision-detalle">
                  <span className="mision-fecha">
                    {describirFechaDespegue(mision.fechaDespegue, hoy)}
                  </span>
                  {' · '}
                  {describirDuracion(mision.duracionDias)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

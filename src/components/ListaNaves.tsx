import { useEffect, useState } from 'react';
import { puedeRecibirMision } from '../dominio/aptitud';
import { misionesService } from '../services/misionesService';
import { navesService } from '../services/navesService';
import type { Aptitud } from '../types/mision';
import type { Nave } from '../types/nave';
import TarjetaNave from './TarjetaNave';

interface Props {
  // Cambia cada vez que se registra una nave o se asigna una misión
  version: number;
}

interface FilaFlota {
  nave: Nave;
  misiones: number;
  aptitud: Aptitud;
}

export default function ListaNaves({ version }: Props) {
  const [filas, setFilas] = useState<FilaFlota[] | null>(null);
  const [error, setError] = useState(false);
  // Cambia tras registrar una revisión o corregir el combustible, para recargar la tarjeta
  const [recarga, setRecarga] = useState(0);

  async function registrarRevision(naveId: string) {
    await navesService.registrarRevision(naveId);
    setRecarga((r) => r + 1);
  }

  async function corregirCombustible(naveId: string, combustible: number) {
    await navesService.corregirCombustible(naveId, combustible);
    setRecarga((r) => r + 1);
  }

  // Completar reemplaza el combustible (R4): se recarga la flota para ver la barra y la aptitud
  async function completarMision(misionId: string, combustible: number) {
    await misionesService.completar(misionId, combustible);
    setRecarga((r) => r + 1);
  }

  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      try {
        const naves = await navesService.listar();
        const conteos = await Promise.all(naves.map((n) => misionesService.contarDesdeRevision(n)));
        if (cancelado) return;
        setFilas(
          naves.map((nave, i) => ({
            nave,
            misiones: conteos[i],
            aptitud: puedeRecibirMision(nave, conteos[i]),
          })),
        );
        setError(false);
      } catch {
        if (!cancelado) setError(true);
      }
    }

    void cargar();
    return () => {
      cancelado = true;
    };
  }, [version, recarga]);

  if (error) {
    return (
      <p className="aviso aviso--error" role="alert">
        No se pudo cargar la flota.
      </p>
    );
  }
  if (filas === null) return <p className="flota-cargando">Cargando la flota…</p>;
  if (filas.length === 0) return <p className="estado-vacio">Todavía no hay naves registradas.</p>;

  return (
    <ul className="flota">
      {filas.map(({ nave, misiones, aptitud }) => (
        <TarjetaNave
          key={nave.id}
          nave={nave}
          misiones={misiones}
          aptitud={aptitud}
          onRegistrarRevision={registrarRevision}
          onCorregirCombustible={corregirCombustible}
          onCompletarMision={completarMision}
        />
      ))}
    </ul>
  );
}

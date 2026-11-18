import { supabase } from '../lib/supabase';
import { puedeRecibirMision } from '../dominio/aptitud';
import { validarMision } from '../dominio/mision';
import { aNave, COLUMNAS_NAVE, type FilaNave } from './navesService';
import type {
  BorradorMision,
  ErroresMision,
  EstadoMision,
  Mision,
  MotivoRechazo,
} from '../types/mision';
import type { Nave } from '../types/nave';

interface FilaMision {
  id: string;
  nave_id: string;
  destino: string;
  fecha_despegue: string;
  duracion_dias: number;
  created_at: string;
  estado: EstadoMision;
}

export type ResultadoCrearMision =
  | { estado: 'creada'; mision: Mision }
  | { estado: 'datos_invalidos'; errores: ErroresMision }
  | { estado: 'nave_no_apta'; motivos: MotivoRechazo[] };

const COLUMNAS_MISION = 'id, nave_id, destino, fecha_despegue, duracion_dias, created_at, estado';

function aMision(fila: FilaMision): Mision {
  return {
    id: fila.id,
    naveId: fila.nave_id,
    destino: fila.destino,
    fechaDespegue: fila.fecha_despegue,
    duracionDias: fila.duracion_dias,
    createdAt: fila.created_at,
    estado: fila.estado,
  };
}

// Misiones de la nave creadas después de su última revisión (R1 y R3)
async function contarDesdeRevision(nave: Pick<Nave, 'id' | 'ultimaRevision'>): Promise<number> {
  const { count, error } = await supabase
    .from('misiones')
    .select('id', { count: 'exact', head: true })
    .eq('nave_id', nave.id)
    .gt('created_at', nave.ultimaRevision);
  if (error) throw new Error(error.message);
  return count ?? 0;
}

async function crear(borrador: BorradorMision, hoy: string): Promise<ResultadoCrearMision> {
  const errores = validarMision(borrador, hoy);
  if (Object.keys(errores).length > 0) return { estado: 'datos_invalidos', errores };

  // Se vuelve a leer la nave para no fiarse de una pantalla desactualizada
  const { data: filaNave, error: errorNave } = await supabase
    .from('naves')
    .select(COLUMNAS_NAVE)
    .eq('id', borrador.naveId)
    .single()
    .overrideTypes<FilaNave, { merge: false }>();
  if (errorNave) throw new Error(errorNave.message);

  const nave = aNave(filaNave);
  const aptitud = puedeRecibirMision(nave, await contarDesdeRevision(nave));
  if (!aptitud.puede) return { estado: 'nave_no_apta', motivos: aptitud.motivos };

  const { data, error } = await supabase
    .from('misiones')
    .insert({
      nave_id: borrador.naveId,
      destino: borrador.destino.trim(),
      fecha_despegue: borrador.fechaDespegue,
      duracion_dias: borrador.duracionDias,
    })
    .select(COLUMNAS_MISION)
    .single()
    .overrideTypes<FilaMision, { merge: false }>();
  if (error) throw new Error(error.message);

  return { estado: 'creada', mision: aMision(data) };
}

// Todas las misiones de la nave, sin ordenar: el orden lo decide ordenarMisiones (HU-1.4)
async function listarPorNave(naveId: string): Promise<Mision[]> {
  const { data, error } = await supabase
    .from('misiones')
    .select(COLUMNAS_MISION)
    .eq('nave_id', naveId)
    .overrideTypes<FilaMision[], { merge: false }>();
  if (error) throw new Error(error.message);
  return data.map(aMision);
}

// Marca la misión como completada y reemplaza el combustible de la nave en una sola operación
// (HU-1.5, R4). La función no devuelve ninguna fila si no pudo completarla.
async function completar(misionId: string, combustible: number): Promise<Nave> {
  const { data, error } = await supabase.rpc('completar_mision', {
    p_mision_id: misionId,
    p_combustible: combustible,
  });
  if (error) throw new Error(error.message);
  // La función devuelve `setof naves`: un arreglo con la nave actualizada, o vacío
  const filas: unknown = data;
  const fila = Array.isArray(filas) ? (filas[0] as FilaNave | undefined) : undefined;
  if (!fila) throw new Error('No se pudo completar la misión.');
  return aNave(fila);
}

export const misionesService = { completar, contarDesdeRevision, crear, listarPorNave };

import { supabase } from '../lib/supabase';
import { esClaseNave, validarNave } from '../dominio/nave';
import type { BorradorNave, ErroresNave, Nave } from '../types/nave';

export interface FilaNave {
  id: string;
  nombre: string;
  clase: string;
  combustible: number;
  en_reparacion: boolean;
  ultima_revision: string;
  created_at: string;
}

export type ResultadoCrearNave = { ok: true; nave: Nave } | { ok: false; errores: ErroresNave };

export const COLUMNAS_NAVE =
  'id, nombre, clase, combustible, en_reparacion, ultima_revision, created_at';

// Código de Postgres para la violación de una restricción unique
const VIOLACION_UNICIDAD = '23505';

export function aNave(fila: FilaNave): Nave {
  if (!esClaseNave(fila.clase)) {
    throw new Error(`Clase de nave desconocida: ${fila.clase}`);
  }
  return {
    id: fila.id,
    nombre: fila.nombre,
    clase: fila.clase,
    combustible: fila.combustible,
    enReparacion: fila.en_reparacion,
    ultimaRevision: fila.ultima_revision,
    createdAt: fila.created_at,
  };
}

async function listar(): Promise<Nave[]> {
  const { data, error } = await supabase
    .from('naves')
    .select(COLUMNAS_NAVE)
    .order('nombre')
    .overrideTypes<FilaNave[], { merge: false }>();
  if (error) throw new Error(error.message);
  return data.map(aNave);
}

async function crear(borrador: BorradorNave): Promise<ResultadoCrearNave> {
  const limpio: BorradorNave = { ...borrador, nombre: borrador.nombre.trim() };
  const errores = validarNave(limpio);
  if (Object.keys(errores).length > 0) return { ok: false, errores };

  const { data, error } = await supabase
    .from('naves')
    .insert({ nombre: limpio.nombre, clase: limpio.clase, combustible: limpio.combustible })
    .select(COLUMNAS_NAVE)
    .single()
    .overrideTypes<FilaNave, { merge: false }>();

  if (error) {
    if (error.code === VIOLACION_UNICIDAD) {
      return { ok: false, errores: { nombre: 'Ya existe una nave con ese nombre.' } };
    }
    throw new Error(error.message);
  }
  return { ok: true, nave: aNave(data) };
}

// Pone ultima_revision = now() en la base de datos (HU-2.1, R5). La función no devuelve
// ninguna fila si la nave no existe o está en reparación.
async function registrarRevision(naveId: string): Promise<Nave> {
  const { data, error } = await supabase.rpc('registrar_revision', { p_nave_id: naveId });
  if (error) throw new Error(error.message);
  // La función devuelve `setof naves`: un arreglo con la fila actualizada, o vacío
  const filas: unknown = data;
  const fila = Array.isArray(filas) ? (filas[0] as FilaNave | undefined) : undefined;
  if (!fila) throw new Error('No se pudo registrar la revisión de la nave.');
  return aNave(fila);
}

// Actualiza solo el combustible (HU-2.2). Se puede corregir aunque la nave esté en reparación.
async function corregirCombustible(naveId: string, combustible: number): Promise<Nave> {
  const { data, error } = await supabase
    .from('naves')
    .update({ combustible })
    .eq('id', naveId)
    .select(COLUMNAS_NAVE)
    .single()
    .overrideTypes<FilaNave, { merge: false }>();
  if (error) throw new Error(error.message);
  return aNave(data);
}

export const navesService = { listar, crear, registrarRevision, corregirCombustible };

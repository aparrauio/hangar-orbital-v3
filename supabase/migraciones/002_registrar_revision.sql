-- Hangar Orbital · Migración 002 · Spec 05 (registrar una revisión)

-- anon solo puede actualizar ultima_revision; ninguna otra columna de naves.
grant update (ultima_revision) on naves to anon;

-- Solo se actualizan naves que no están en reparación (spec 05, decisión 2).
-- La condición está también en la política para que se cumpla aunque se llame a la API sin la app.
create policy "anon puede registrar revisiones"
  on naves for update to anon
  using (not en_reparacion)
  with check (not en_reparacion);

-- Pone ultima_revision = now() y devuelve la nave actualizada.
-- No devuelve ninguna fila si la nave no existe o está en reparación.
create or replace function registrar_revision(p_nave_id uuid)
returns setof naves
language sql
security invoker
set search_path = public
as $$
  update naves
     set ultima_revision = now()
   where id = p_nave_id
     and not en_reparacion
  returning *;
$$;

revoke execute on function registrar_revision(uuid) from public;
grant execute on function registrar_revision(uuid) to anon;

-- Hangar Orbital · Migración 003 · Spec 06 (corregir el combustible)

-- anon puede actualizar combustible, además de ultima_revision (migración 002).
-- El check de la columna (0 a 100) ya existe desde la migración 001.
grant update (combustible) on naves to anon;

-- El combustible se corrige en cualquier momento, también en reparación (R4, HU-2.2-CA6).
create policy "anon puede corregir el combustible"
  on naves for update to anon
  using (true)
  with check (true);

-- Las políticas de update se suman y valen para la fila entera, no por columna. Con la política
-- anterior, la condición «not en_reparacion» de la migración 002 ya no protege ultima_revision.
-- Este trigger mantiene la regla de la spec 05: una nave en reparación no registra revisión.
create or replace function impedir_revision_en_reparacion()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.ultima_revision is distinct from old.ultima_revision and old.en_reparacion then
    raise exception 'La nave está en reparación: la revisión se registra al salir del dique seco.';
  end if;
  return new;
end;
$$;

create trigger naves_impedir_revision_en_reparacion
  before update of ultima_revision on naves
  for each row
  execute function impedir_revision_en_reparacion();

-- Hangar Orbital · Migración 004 · Spec 07 (completar una misión)

-- Una misión está pendiente o completada (spec 07, decisión 1). Las existentes quedan pendientes.
alter table misiones
  add column estado text not null default 'pendiente'
  check (estado in ('pendiente', 'completada'));

-- anon solo puede crear misiones pendientes: nadie inserta una misión ya completada por la API.
drop policy "anon puede insertar misiones" on misiones;
create policy "anon puede insertar misiones"
  on misiones for insert to anon
  with check (estado = 'pendiente');

-- No hay política de update en misiones: anon no puede cambiar el estado directamente,
-- así que una misión completada no vuelve a pendiente (spec 07, decisión 6).
-- Los permisos de naves no cambian.

-- Completa la misión y reemplaza el combustible de la nave en una sola transacción (decisión 2, R4).
-- Es security definer porque anon no puede actualizar misiones; solo hace estos dos cambios.
-- No toca ultima_revision ni el contador (R3).
create or replace function completar_mision(p_mision_id uuid, p_combustible integer)
returns setof naves
language plpgsql
security definer
set search_path = public
as $$
declare
  v_nave_id uuid;
begin
  if p_combustible is null or p_combustible < 0 or p_combustible > 100 then
    raise exception 'El combustible debe ser un número entero entre 0 y 100.';
  end if;

  -- Solo una misión pendiente que ya despegó (decisión 3)
  update misiones
     set estado = 'completada'
   where id = p_mision_id
     and estado = 'pendiente'
     and fecha_despegue <= current_date
  returning nave_id into v_nave_id;

  if v_nave_id is null then
    raise exception 'La misión no existe, ya está completada o todavía no ha despegado.';
  end if;

  return query
    update naves
       set combustible = p_combustible
     where id = v_nave_id
    returning *;
end;
$$;

revoke execute on function completar_mision(uuid, integer) from public;
grant execute on function completar_mision(uuid, integer) to anon;

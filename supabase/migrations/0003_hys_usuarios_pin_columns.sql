-- =============================================================================
-- Parche incremental sobre 0002: agrega solo lo que faltó aplicar
-- (`hys_usuarios.empleado_id`, `hys_usuarios.debe_crear_pin` y
-- `hys_evaluaciones_mensuales.creado_por`), sin tocar la tabla ni la policy
-- que ya se crearon en el primer intento de 0002. Seguro de correr aunque
-- alguna de estas columnas ya exista (todo con IF NOT EXISTS).
-- =============================================================================

alter table public.hys_usuarios
  add column if not exists empleado_id uuid references public.empleados (id);

alter table public.hys_usuarios
  add column if not exists debe_crear_pin boolean not null default true;

create index if not exists idx_hys_usuarios_empleado
  on public.hys_usuarios (empleado_id);

alter table public.hys_evaluaciones_mensuales
  add column if not exists creado_por uuid references public.hys_usuarios (id) default auth.uid();

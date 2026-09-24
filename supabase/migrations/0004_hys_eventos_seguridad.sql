-- =============================================================================
-- Módulo 2: Gestión de Eventos de Seguridad e Higiene (accidentes, incidentes
-- y sus acciones de mejora). Todas las tablas nuevas usan el prefijo `hys_`.
--
-- Decisiones de modelo (definidas con Compras/Tecnología y H&S):
--  - Accidentes e incidentes viven en UNA sola tabla (`hys_eventos`) con
--    `tipo` para diferenciarlos, en vez de dos tablas separadas: así las
--    estadísticas no tienen que combinar dos fuentes.
--  - "ASTRO" NO es una clasificación de accidente: es el nombre de la
--    prestadora médica externa (Astrolaboral) a la que a veces se deriva un
--    caso. La clasificación real es ART / Particular, "in itinere" es un
--    atributo aparte (no excluyente), y la derivación a Astrolaboral es un
--    booleano informativo, no una categoría.
--  - El empleado afectado y el responsable de una acción de mejora se
--    seleccionan de la tabla real de RRHH (`empleados`), nunca texto libre.
--  - Las acciones de mejora (`hys_eventos_seguimiento`) pueden existir sin
--    un evento asociado (propuestas de mejora sueltas), por eso `evento_id`
--    es opcional.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- hys_sectores: catálogo de sectores físicos/operativos (dónde ocurrió el
-- evento). Es dato propio de H&S, no existe en RRHH.
-- -----------------------------------------------------------------------------
create table if not exists public.hys_sectores (
  id serial primary key,
  nombre text not null unique,
  activo boolean not null default true
);

comment on table public.hys_sectores is 'Catálogo de sectores físicos de planta, usado para clasificar dónde ocurrió un evento.';

-- -----------------------------------------------------------------------------
-- hys_factores_accidente: catálogo de "qué fue lo que falló" (parte del
-- cuerpo afectada / tipo de lesión: mano, pie, espalda, corte, golpe, etc.).
-- Permite el indicador "por accidente, qué es lo que más falla".
-- -----------------------------------------------------------------------------
create table if not exists public.hys_factores_accidente (
  id serial primary key,
  nombre text not null unique,
  activo boolean not null default true
);

comment on table public.hys_factores_accidente is 'Catálogo de factores/partes del cuerpo afectadas en un accidente, para el indicador de causas más frecuentes.';

-- -----------------------------------------------------------------------------
-- hys_eventos: accidentes e incidentes.
-- -----------------------------------------------------------------------------
create table if not exists public.hys_eventos (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('accidente', 'incidente')),
  empleado_id uuid references public.empleados (id),
  sector_id integer references public.hys_sectores (id),
  factor_id integer references public.hys_factores_accidente (id),
  fecha date not null,
  descripcion text not null,

  -- Solo aplica a accidentes; queda null para incidentes.
  clasificacion text check (clasificacion in ('ART', 'particular')),
  in_itinere boolean not null default false,
  derivado_astrolaboral boolean not null default false,
  dias_perdidos integer not null default 0 check (dias_perdidos >= 0),
  informe_path text,

  creado_por uuid references public.hys_usuarios (id) default auth.uid(),
  created_at timestamptz not null default now(),

  constraint chk_clasificacion_solo_accidente check (
    tipo = 'accidente' or (clasificacion is null and in_itinere = false and derivado_astrolaboral = false)
  )
);

comment on table public.hys_eventos is 'Accidentes e incidentes registrados. `tipo` los diferencia; `clasificacion`/in_itinere/derivado_astrolaboral solo aplican a accidentes.';

create index if not exists idx_hys_eventos_tipo on public.hys_eventos (tipo);
create index if not exists idx_hys_eventos_fecha on public.hys_eventos (fecha);
create index if not exists idx_hys_eventos_sector on public.hys_eventos (sector_id);
create index if not exists idx_hys_eventos_factor on public.hys_eventos (factor_id);
create index if not exists idx_hys_eventos_empleado on public.hys_eventos (empleado_id);

-- -----------------------------------------------------------------------------
-- hys_eventos_seguimiento: investigación/causa -> acción de mejora ->
-- responsable -> cierre. `evento_id` es opcional (propuesta de mejora suelta).
-- -----------------------------------------------------------------------------
create table if not exists public.hys_eventos_seguimiento (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid references public.hys_eventos (id) on delete cascade,
  investigacion_causa text,
  accion_mejora text not null,
  responsable_id uuid references public.empleados (id),
  fecha_compromiso date,
  fecha_cierre date,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'en_curso', 'cerrada')),

  creado_por uuid references public.hys_usuarios (id) default auth.uid(),
  created_at timestamptz not null default now(),

  constraint chk_cierre_solo_si_cerrada check (
    (estado = 'cerrada' and fecha_cierre is not null)
    or (estado != 'cerrada')
  )
);

comment on table public.hys_eventos_seguimiento is 'Acciones de mejora / seguimiento de un evento. evento_id nulo = propuesta de mejora suelta, sin accidente/incidente asociado.';

create index if not exists idx_hys_seguimiento_evento on public.hys_eventos_seguimiento (evento_id);
create index if not exists idx_hys_seguimiento_estado on public.hys_eventos_seguimiento (estado);

-- -----------------------------------------------------------------------------
-- hys_historico_mensual: totales agregados de referencia (2025 y ene-sep
-- 2026), cargados a mano SOLO a nivel estadístico. Desde oct-2026 se carga
-- evento por evento en `hys_eventos` en vez de acá.
-- -----------------------------------------------------------------------------
create table if not exists public.hys_historico_mensual (
  id uuid primary key default gen_random_uuid(),
  mes smallint not null check (mes between 1 and 12),
  anio smallint not null check (anio between 2000 and 2100),
  accidentes_art integer not null default 0,
  accidentes_particular integer not null default 0,
  accidentes_in_itinere integer not null default 0,
  incidentes integer not null default 0,
  dias_perdidos integer not null default 0,
  created_at timestamptz not null default now(),

  unique (mes, anio)
);

comment on table public.hys_historico_mensual is 'Totales mensuales agregados de referencia (pre-carga detallada), solo para comparativas estadísticas.';

-- -----------------------------------------------------------------------------
-- Storage: bucket privado para los informes/investigaciones adjuntos.
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('hys-informes', 'hys-informes', false)
on conflict (id) do nothing;

-- =============================================================================
-- Row Level Security (mismo criterio que el resto del proyecto: lectura y
-- escritura para cualquier usuario autenticado de la app; borrado reservado
-- a service_role).
-- =============================================================================

alter table public.hys_sectores enable row level security;
alter table public.hys_factores_accidente enable row level security;
alter table public.hys_eventos enable row level security;
alter table public.hys_eventos_seguimiento enable row level security;
alter table public.hys_historico_mensual enable row level security;

create policy "hys_sectores_select_authenticated"
  on public.hys_sectores for select to authenticated using (true);
create policy "hys_sectores_insert_authenticated"
  on public.hys_sectores for insert to authenticated with check (true);
create policy "hys_sectores_update_authenticated"
  on public.hys_sectores for update to authenticated using (true) with check (true);

create policy "hys_factores_select_authenticated"
  on public.hys_factores_accidente for select to authenticated using (true);
create policy "hys_factores_insert_authenticated"
  on public.hys_factores_accidente for insert to authenticated with check (true);
create policy "hys_factores_update_authenticated"
  on public.hys_factores_accidente for update to authenticated using (true) with check (true);

create policy "hys_eventos_select_authenticated"
  on public.hys_eventos for select to authenticated using (true);
create policy "hys_eventos_insert_authenticated"
  on public.hys_eventos for insert to authenticated with check (true);
create policy "hys_eventos_update_authenticated"
  on public.hys_eventos for update to authenticated using (true) with check (true);

create policy "hys_seguimiento_select_authenticated"
  on public.hys_eventos_seguimiento for select to authenticated using (true);
create policy "hys_seguimiento_insert_authenticated"
  on public.hys_eventos_seguimiento for insert to authenticated with check (true);
create policy "hys_seguimiento_update_authenticated"
  on public.hys_eventos_seguimiento for update to authenticated using (true) with check (true);

create policy "hys_historico_select_authenticated"
  on public.hys_historico_mensual for select to authenticated using (true);
create policy "hys_historico_insert_authenticated"
  on public.hys_historico_mensual for insert to authenticated with check (true);
create policy "hys_historico_update_authenticated"
  on public.hys_historico_mensual for update to authenticated using (true) with check (true);

-- Storage: cualquier autenticado puede subir/leer informes del bucket propio del módulo.
create policy "hys_informes_select_authenticated"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'hys-informes');

create policy "hys_informes_insert_authenticated"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'hys-informes');

-- =============================================================================
-- Datos iniciales: catálogo base de factores (parte del cuerpo / tipo de
-- lesión), para no arrancar de cero. H&S puede agregar más desde la app.
-- =============================================================================
insert into public.hys_factores_accidente (nombre) values
  ('Mano'), ('Dedo'), ('Brazo'), ('Pie'), ('Pierna'),
  ('Espalda'), ('Cabeza'), ('Ojo / vista'), ('Múltiples'), ('Otro')
on conflict (nombre) do nothing;


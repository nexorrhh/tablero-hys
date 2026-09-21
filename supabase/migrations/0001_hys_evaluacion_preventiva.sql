-- =============================================================================
-- Módulo 1: Evaluación Preventiva de Personal
-- Todas las tablas NUEVAS para el sector H&S usan el prefijo `hys_` (regla del
-- proyecto). El personal evaluado NO se duplica: `empleado_id` referencia
-- directamente la tabla compartida `public.empleados` (fuente de verdad de
-- RRHH, sincronizada desde Tango), para que el módulo H&S nunca quede
-- desincronizado del legajo real.
-- =============================================================================

create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- hys_evaluaciones_mensuales (cabecera)
-- -----------------------------------------------------------------------------
create table if not exists public.hys_evaluaciones_mensuales (
  id uuid primary key default gen_random_uuid(),
  empleado_id uuid not null references public.empleados (id) on delete restrict,
  fecha_evaluacion date not null,
  mes smallint not null check (mes between 1 and 12),
  anio smallint not null check (anio between 2000 and 2100),
  promedio_general numeric(3, 2),
  ciclo_6_meses_id uuid,
  created_at timestamptz not null default now(),

  -- Un empleado no debería tener dos evaluaciones cargadas para el mismo mes/año.
  unique (empleado_id, mes, anio)
);

comment on table public.hys_evaluaciones_mensuales is 'Cabecera mensual de la evaluación preventiva de un empleado (empleado_id -> public.empleados, tabla de RRHH).';

create index if not exists idx_hys_eval_mensuales_empleado
  on public.hys_evaluaciones_mensuales (empleado_id);

create index if not exists idx_hys_eval_mensuales_periodo
  on public.hys_evaluaciones_mensuales (anio, mes);

create index if not exists idx_hys_eval_mensuales_ciclo
  on public.hys_evaluaciones_mensuales (ciclo_6_meses_id);

-- -----------------------------------------------------------------------------
-- hys_evaluacion_detalles (los 6 aspectos)
-- -----------------------------------------------------------------------------
create table if not exists public.hys_evaluacion_detalles (
  id uuid primary key default gen_random_uuid(),
  evaluacion_id uuid not null references public.hys_evaluaciones_mensuales (id) on delete cascade,
  aspecto_id smallint not null check (aspecto_id between 1 and 6),
  puntaje smallint check (puntaje between 1 and 5),
  no_aplica boolean not null default false,
  desvio_gestion boolean not null default false,
  observaciones text,
  created_at timestamptz not null default now(),

  -- Un mismo aspecto no puede repetirse dentro de la misma evaluación.
  unique (evaluacion_id, aspecto_id),

  -- Si no_aplica es true, el puntaje se ignora y debe quedar nulo.
  constraint chk_puntaje_o_no_aplica check (
    (no_aplica = true and puntaje is null)
    or (no_aplica = false and puntaje is not null)
  )
);

comment on table public.hys_evaluacion_detalles is 'Puntaje de cada uno de los 6 aspectos evaluados por evaluación mensual.';

create index if not exists idx_hys_eval_detalles_evaluacion
  on public.hys_evaluacion_detalles (evaluacion_id);

create index if not exists idx_hys_eval_detalles_desvio
  on public.hys_evaluacion_detalles (desvio_gestion) where desvio_gestion = true;

-- =============================================================================
-- Row Level Security
--
-- Política por defecto: cualquier usuario autenticado (personal interno con
-- cuenta en la app) puede leer y cargar/editar evaluaciones. Los borrados
-- quedan reservados a `service_role` para mantener trazabilidad de auditoría
-- de H&S. Cuando se incorpore un esquema de roles (H&S / RRHH / Dirección /
-- Admin), estas políticas deben reemplazarse por reglas basadas en rol sin
-- modificar la capa de servicios de la app.
--
-- Nota: `public.empleados` es propiedad del módulo de RRHH y NO se toca acá.
-- Este módulo solo la LEE (vía FK y consultas de solo lectura desde
-- `EmpleadosService`); cualquier cambio a sus políticas de RLS debe
-- coordinarse con el equipo dueño de esa tabla.
-- =============================================================================

alter table public.hys_evaluaciones_mensuales enable row level security;
alter table public.hys_evaluacion_detalles enable row level security;

-- hys_evaluaciones_mensuales ----------------------------------------------------
create policy "hys_evaluaciones_select_authenticated"
  on public.hys_evaluaciones_mensuales for select
  to authenticated
  using (true);

create policy "hys_evaluaciones_insert_authenticated"
  on public.hys_evaluaciones_mensuales for insert
  to authenticated
  with check (true);

create policy "hys_evaluaciones_update_authenticated"
  on public.hys_evaluaciones_mensuales for update
  to authenticated
  using (true)
  with check (true);

-- hys_evaluacion_detalles -------------------------------------------------------
create policy "hys_detalles_select_authenticated"
  on public.hys_evaluacion_detalles for select
  to authenticated
  using (true);

create policy "hys_detalles_insert_authenticated"
  on public.hys_evaluacion_detalles for insert
  to authenticated
  with check (true);

create policy "hys_detalles_update_authenticated"
  on public.hys_evaluacion_detalles for update
  to authenticated
  using (true)
  with check (true);

-- Nota: no se crean políticas de DELETE para `authenticated`, por lo que
-- quedan bloqueados por RLS salvo con `service_role` (usado desde el backend
-- administrativo, nunca desde el cliente).

-- =============================================================================
-- ATENCIÓN: esta migración NO es para el proyecto Supabase de tablero-hys.
-- Se guarda acá solo como referencia versionada; hay que copiarla y correrla
-- a mano en el SQL Editor del proyecto de NEXO RRHH — Cimomet
-- (https://qnqikspihpljzvojlpak.supabase.co), que es una base compartida en
-- producción con empleados reales usándola ahora mismo.
--
-- Todo es aditivo: columnas nuevas, nullable o con default, sobre tablas que
-- ya existen (`capacitaciones`, `capacitacion_progreso`). No renombra ni
-- borra nada, y no toca ninguna tabla fuera de esas dos (en particular, no
-- toca `recibos` ni `firma_empleado`).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- capacitaciones: de dónde viene la capacitación, más los datos de la
-- actividad/instructor que necesita la constancia individual en PDF.
-- `origen` es lo que le permite a Nexo RRHH saber si mostrarle al empleado
-- el flujo de firma + constancia (creadas desde H&S) o el comportamiento
-- actual sin cambios (creadas directamente en Nexo RRHH).
-- -----------------------------------------------------------------------------
alter table public.capacitaciones
  add column if not exists origen text not null default 'rrhh' check (origen in ('rrhh', 'hys'));

alter table public.capacitaciones
  add column if not exists codigo text;

alter table public.capacitaciones
  add column if not exists lugar text;

alter table public.capacitaciones
  add column if not exists duracion text;

alter table public.capacitaciones
  add column if not exists hora_inicio time;

alter table public.capacitaciones
  add column if not exists instructor_nombre text;

alter table public.capacitaciones
  add column if not exists instructor_matricula text;

comment on column public.capacitaciones.origen is 'rrhh = creada directamente en Nexo RRHH (comportamiento actual, sin cambios). hys = creada desde el panel de H&S (tablero-hys); dispara el flujo de firma + constancia individual.';

-- -----------------------------------------------------------------------------
-- capacitacion_progreso: IP y user-agent del empleado al momento de firmar,
-- mismo criterio que ya usa `recibos.visto_ip` / `recibos.visto_user_agent`
-- para el acuse de recibo del recibo de sueldo (ver esa tabla como
-- referencia de patrón únicamente; no se toca acá).
-- -----------------------------------------------------------------------------
alter table public.capacitacion_progreso
  add column if not exists firma_ip text;

alter table public.capacitacion_progreso
  add column if not exists firma_user_agent text;

comment on column public.capacitacion_progreso.firma_ip is 'IP del empleado al momento de firmar (completar) una capacitación con origen = hys. Se completa desde src/services/capacitaciones.ts en el repo de Nexo RRHH — ver PENDIENTE en el resumen.';
comment on column public.capacitacion_progreso.firma_user_agent is 'User-agent del empleado al momento de firmar. Mismo criterio que firma_ip.';

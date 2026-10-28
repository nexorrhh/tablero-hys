-- =============================================================================
-- ATENCIÓN: no es para el proyecto de tablero-hys. Correr a mano en el SQL
-- Editor del proyecto de NEXO RRHH — Cimomet (https://qnqikspihpljzvojlpak.supabase.co).
--
-- Columna nueva, nullable, sobre `capacitaciones`. Esta la escribe EXCLUSIVAMENTE
-- tablero-hys al crear una capacitación (el instructor firma una sola vez al
-- cargarla, no por cada empleado) — no requiere ningún cambio de código del
-- lado de Nexo RRHH, por eso no hace falta coordinarla con esa sesión, solo
-- correr el SQL.
-- =============================================================================

alter table public.capacitaciones
  add column if not exists instructor_firma_url text;

comment on column public.capacitaciones.instructor_firma_url is 'Firma del instructor (dibujada al cargar la capacitación desde tablero-hys), subida a Storage. Una sola por capacitación, no por empleado.';

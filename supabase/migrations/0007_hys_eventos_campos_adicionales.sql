-- =============================================================================
-- Campos adicionales para que un evento real quede completo, y prioridad en
-- el seguimiento para poder triar acciones.
-- =============================================================================

alter table public.hys_eventos
  add column if not exists nro_siniestro_art text;

alter table public.hys_eventos
  add column if not exists testigos text;

alter table public.hys_eventos
  add column if not exists ubicacion_especifica text;

alter table public.hys_eventos_seguimiento
  add column if not exists prioridad text not null default 'media' check (prioridad in ('alta', 'media', 'baja'));

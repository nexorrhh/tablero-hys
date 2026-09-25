-- =============================================================================
-- Ciclo de vida del evento: pendiente -> cerrado.
--
-- Se cierra a mano desde la página de detalle del evento (no se infiere
-- automáticamente de si sus acciones de seguimiento están cerradas): el
-- criterio de "resuelto de forma definitiva" queda a criterio de H&S.
-- =============================================================================

alter table public.hys_eventos
  add column if not exists estado text not null default 'pendiente' check (estado in ('pendiente', 'cerrado'));

alter table public.hys_eventos
  add column if not exists fecha_cierre date;

create index if not exists idx_hys_eventos_estado on public.hys_eventos (estado);

-- =============================================================================
-- Corrección: el "sector" de un evento NO debe ser un valor elegible a mano.
-- Sigue el mismo criterio ya usado en el Módulo 1 (evaluación preventiva):
-- se deriva directamente del puesto (`desc_puesto`) del empleado afectado en
-- `empleados` (RRHH). Se elimina el catálogo `hys_sectores` y la columna
-- `sector_id`, que permitían elegirlo libremente.
--
-- No hay pérdida de datos: al momento de este cambio no había eventos
-- cargados todavía.
-- =============================================================================

alter table public.hys_eventos drop column if exists sector_id;

drop table if exists public.hys_sectores;

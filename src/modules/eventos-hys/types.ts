import type { Database } from "@core/supabase/database.types";
import type { Empleado } from "@core/rrhh/types";

export type FactorAccidente =
  Database["public"]["Tables"]["hys_factores_accidente"]["Row"];

export type Evento = Database["public"]["Tables"]["hys_eventos"]["Row"];
export type EventoInsert = Database["public"]["Tables"]["hys_eventos"]["Insert"];

export type EventoSeguimiento =
  Database["public"]["Tables"]["hys_eventos_seguimiento"]["Row"];
export type EventoSeguimientoInsert =
  Database["public"]["Tables"]["hys_eventos_seguimiento"]["Insert"];

export type HistoricoMensual =
  Database["public"]["Tables"]["hys_historico_mensual"]["Row"];

/**
 * Evento con el empleado y el factor ya resueltos, para uso en UI.
 * No tiene un campo "sector" propio: el sector es el puesto (`desc_puesto`)
 * del empleado afectado, no un valor elegible a mano (ver types de RRHH).
 */
export interface EventoCompleto extends Evento {
  empleado: Empleado | null;
  factor: FactorAccidente | null;
}

/** Acción de seguimiento con el evento (si tiene) y el responsable resueltos. */
export interface SeguimientoCompleto extends EventoSeguimiento {
  evento: Evento | null;
  responsable: Empleado | null;
}

export interface NuevoEventoPayload {
  tipo: "accidente" | "incidente";
  empleado_id: string | null;
  factor_id: number | null;
  fecha: string;
  descripcion: string;
  clasificacion: "ART" | "particular" | null;
  in_itinere: boolean;
  derivado_astrolaboral: boolean;
  dias_perdidos: number;
  informe_path?: string | null;
}

export interface NuevoSeguimientoPayload {
  evento_id: string | null;
  investigacion_causa: string | null;
  accion_mejora: string;
  responsable_id: string | null;
  fecha_compromiso: string | null;
}

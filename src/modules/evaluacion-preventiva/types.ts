import type { Database } from "@core/supabase/database.types";
import type { EmpleadoActivo } from "@core/rrhh/types";
import type { Periodo } from "./periodo";

export type EvaluacionMensual =
  Database["public"]["Tables"]["hys_evaluaciones_mensuales"]["Row"];
export type EvaluacionMensualInsert =
  Database["public"]["Tables"]["hys_evaluaciones_mensuales"]["Insert"];

export type EvaluacionDetalle =
  Database["public"]["Tables"]["hys_evaluacion_detalles"]["Row"];
export type EvaluacionDetalleInsert =
  Database["public"]["Tables"]["hys_evaluacion_detalles"]["Insert"];

/** Evaluación mensual con sus 6 detalles y los datos del empleado (RRHH), para uso en UI. */
export interface EvaluacionCompleta extends EvaluacionMensual {
  empleado: EmpleadoActivo;
  detalles: EvaluacionDetalle[];
}

/** Período seleccionable en el formulario de carga: todavía tiene empleados activos sin evaluar. */
export interface PeriodoDisponible extends Periodo {
  pendientes: number;
}

/** Período vencido con el listado de empleados activos que todavía no tienen evaluación cargada. */
export interface PendientesDePeriodo {
  periodo: Periodo;
  empleados: EmpleadoActivo[];
}

/** Payload que arma el formulario de carga antes de persistir. */
export interface NuevaEvaluacionPayload {
  empleado_id: string;
  fecha_evaluacion: string;
  mes: number;
  anio: number;
  ciclo_6_meses_id?: string | null;
  detalles: Array<{
    aspecto_id: number;
    puntaje: number | null;
    no_aplica: boolean;
    desvio_gestion: boolean;
    observaciones?: string | null;
  }>;
}

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@core/supabase/database.types";
import type {
  EvaluacionCompleta,
  EvaluacionMensual,
  NuevaEvaluacionPayload,
} from "../types";

const SELECT_EVALUACION_COMPLETA =
  "*, empleado:empleados(*), detalles:hys_evaluacion_detalles(*)";

/**
 * Calcula el promedio general de una evaluación.
 * Los aspectos marcados como N/A o como Desvío de Gestión se excluyen
 * del promedio individual del trabajador (ver reglas de negocio en CLAUDE.md).
 */
export function calcularPromedioGeneral(
  detalles: NuevaEvaluacionPayload["detalles"]
): number | null {
  const puntajesValidos = detalles
    .filter((d) => !d.no_aplica && !d.desvio_gestion && d.puntaje !== null)
    .map((d) => d.puntaje as number);

  if (puntajesValidos.length === 0) return null;

  const suma = puntajesValidos.reduce((acc, val) => acc + val, 0);
  return Number((suma / puntajesValidos.length).toFixed(2));
}

/**
 * Capa de acceso a datos para `hys_evaluaciones_mensuales` y
 * `hys_evaluacion_detalles`. Única forma autorizada de leer/escribir estas
 * tablas: ningún componente de UI debe importar el cliente de Supabase
 * directamente. El empleado evaluado (`empleado_id`) referencia la tabla de
 * RRHH `empleados`; este servicio no la modifica, solo la lee vía join.
 */
export class EvaluacionesService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async crearEvaluacionCompleta(
    payload: NuevaEvaluacionPayload
  ): Promise<EvaluacionMensual> {
    const promedio_general = calcularPromedioGeneral(payload.detalles);

    const { data: evaluacion, error: errorCabecera } = await this.supabase
      .from("hys_evaluaciones_mensuales")
      .insert({
        empleado_id: payload.empleado_id,
        fecha_evaluacion: payload.fecha_evaluacion,
        mes: payload.mes,
        anio: payload.anio,
        ciclo_6_meses_id: payload.ciclo_6_meses_id ?? null,
        promedio_general,
      })
      .select("*")
      .single();

    if (errorCabecera) throw errorCabecera;

    const { error: errorDetalles } = await this.supabase
      .from("hys_evaluacion_detalles")
      .insert(
        payload.detalles.map((detalle) => ({
          evaluacion_id: evaluacion.id,
          aspecto_id: detalle.aspecto_id,
          puntaje: detalle.no_aplica ? null : detalle.puntaje,
          no_aplica: detalle.no_aplica,
          desvio_gestion: detalle.desvio_gestion,
          observaciones: detalle.observaciones ?? null,
        }))
      );

    if (errorDetalles) throw errorDetalles;

    return evaluacion;
  }

  async obtenerCompleta(
    evaluacionId: string
  ): Promise<EvaluacionCompleta | null> {
    const { data, error } = await this.supabase
      .from("hys_evaluaciones_mensuales")
      .select(SELECT_EVALUACION_COMPLETA)
      .eq("id", evaluacionId)
      .maybeSingle();

    if (error) throw error;
    return data as unknown as EvaluacionCompleta | null;
  }

  async listarPorEmpleado(empleadoId: string): Promise<EvaluacionCompleta[]> {
    const { data, error } = await this.supabase
      .from("hys_evaluaciones_mensuales")
      .select(SELECT_EVALUACION_COMPLETA)
      .eq("empleado_id", empleadoId)
      .order("anio", { ascending: true })
      .order("mes", { ascending: true });

    if (error) throw error;
    return (data ?? []) as unknown as EvaluacionCompleta[];
  }

  async listarPorCiclo(cicloId: string): Promise<EvaluacionCompleta[]> {
    const { data, error } = await this.supabase
      .from("hys_evaluaciones_mensuales")
      .select(SELECT_EVALUACION_COMPLETA)
      .eq("ciclo_6_meses_id", cicloId)
      .order("mes", { ascending: true });

    if (error) throw error;
    return (data ?? []) as unknown as EvaluacionCompleta[];
  }

  async listarPorMes(mes: number, anio: number): Promise<EvaluacionCompleta[]> {
    const { data, error } = await this.supabase
      .from("hys_evaluaciones_mensuales")
      .select(SELECT_EVALUACION_COMPLETA)
      .eq("mes", mes)
      .eq("anio", anio);

    if (error) throw error;
    return (data ?? []) as unknown as EvaluacionCompleta[];
  }
}

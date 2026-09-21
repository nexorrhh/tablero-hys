import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@core/supabase/database.types";
import type { Empleado } from "@core/rrhh/types";
import { ASPECTOS_EVALUACION } from "../constants";
import type { EvaluacionDetalle } from "../types";

export interface DesvioGestionPendiente {
  detalle: EvaluacionDetalle;
  aspecto_titulo: string;
  empleado: Empleado;
  evaluacion_id: string;
  fecha_evaluacion: string;
}

export interface MapaCalorAspecto {
  aspecto_id: number;
  titulo: string;
  promedio: number | null;
  cantidad_evaluaciones: number;
}

export interface PromedioAnualEmpleado {
  empleado: Empleado;
  promedio_anual: number | null;
  cantidad_evaluaciones: number;
}

/**
 * Consultas de reportes/dashboards del módulo (Vista H&S y Vista Dirección/RRHH).
 *
 * Nota de escalabilidad: hoy las agregaciones se resuelven en memoria a partir
 * de las filas crudas. Si el volumen de evaluaciones crece, conviene migrar
 * estas consultas a vistas SQL o funciones RPC en Supabase sin cambiar la
 * firma pública de este servicio.
 */
export class ReportesService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  /** Desvíos de gestión (infraestructura/compras) marcados en el período dado, o todos. */
  async listarDesviosGestion(filtro?: {
    mes?: number;
    anio?: number;
  }): Promise<DesvioGestionPendiente[]> {
    let query = this.supabase
      .from("hys_evaluacion_detalles")
      .select(
        "*, evaluacion:hys_evaluaciones_mensuales!inner(id, fecha_evaluacion, mes, anio, empleado:empleados(*))"
      )
      .eq("desvio_gestion", true);

    if (filtro?.mes) query = query.eq("evaluacion.mes", filtro.mes);
    if (filtro?.anio) query = query.eq("evaluacion.anio", filtro.anio);

    const { data, error } = await query;
    if (error) throw error;

    type Row = EvaluacionDetalle & {
      evaluacion: {
        id: string;
        fecha_evaluacion: string;
        mes: number;
        anio: number;
        empleado: Empleado;
      };
    };

    return ((data ?? []) as unknown as Row[]).map((row) => ({
      detalle: row,
      aspecto_titulo:
        ASPECTOS_EVALUACION.find((a) => a.id === row.aspecto_id)?.titulo ??
        `Aspecto ${row.aspecto_id}`,
      empleado: row.evaluacion.empleado,
      evaluacion_id: row.evaluacion.id,
      fecha_evaluacion: row.evaluacion.fecha_evaluacion,
    }));
  }

  /** Promedio por aspecto (para el mapa de calor de capacitación de H&S). */
  async obtenerMapaCalorAspectos(filtro?: {
    mes?: number;
    anio?: number;
  }): Promise<MapaCalorAspecto[]> {
    let query = this.supabase
      .from("hys_evaluacion_detalles")
      .select(
        "aspecto_id, puntaje, no_aplica, desvio_gestion, evaluacion:hys_evaluaciones_mensuales!inner(mes, anio)"
      );

    if (filtro?.mes) query = query.eq("evaluacion.mes", filtro.mes);
    if (filtro?.anio) query = query.eq("evaluacion.anio", filtro.anio);

    const { data, error } = await query;
    if (error) throw error;

    const filas = (data ?? []) as unknown as Pick<
      EvaluacionDetalle,
      "aspecto_id" | "puntaje" | "no_aplica" | "desvio_gestion"
    >[];

    return ASPECTOS_EVALUACION.map((aspecto) => {
      const puntajesValidos = filas
        .filter(
          (f) =>
            f.aspecto_id === aspecto.id && !f.no_aplica && !f.desvio_gestion && f.puntaje !== null
        )
        .map((f) => f.puntaje as number);

      const promedio =
        puntajesValidos.length > 0
          ? Number(
              (
                puntajesValidos.reduce((acc, v) => acc + v, 0) /
                puntajesValidos.length
              ).toFixed(2)
            )
          : null;

      return {
        aspecto_id: aspecto.id,
        titulo: aspecto.titulo,
        promedio,
        cantidad_evaluaciones: puntajesValidos.length,
      };
    });
  }

  /** Promedio ponderado anual por empleado, para uso en evaluación de desempeño (RRHH/Dirección). */
  async obtenerPromedioAnualPorEmpleado(
    anio: number
  ): Promise<PromedioAnualEmpleado[]> {
    const { data, error } = await this.supabase
      .from("hys_evaluaciones_mensuales")
      .select("promedio_general, empleado:empleados(*)")
      .eq("anio", anio);

    if (error) throw error;

    type Row = { promedio_general: number | null; empleado: Empleado };
    const filas = (data ?? []) as unknown as Row[];

    const porEmpleado = new Map<
      string,
      { empleado: Empleado; suma: number; cantidad: number }
    >();

    for (const fila of filas) {
      if (fila.promedio_general === null) continue;
      const existente = porEmpleado.get(fila.empleado.id);
      if (existente) {
        existente.suma += fila.promedio_general;
        existente.cantidad += 1;
      } else {
        porEmpleado.set(fila.empleado.id, {
          empleado: fila.empleado,
          suma: fila.promedio_general,
          cantidad: 1,
        });
      }
    }

    return Array.from(porEmpleado.values()).map((v) => ({
      empleado: v.empleado,
      promedio_anual: Number((v.suma / v.cantidad).toFixed(2)),
      cantidad_evaluaciones: v.cantidad,
    }));
  }
}

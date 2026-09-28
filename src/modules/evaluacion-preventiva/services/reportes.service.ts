import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@core/supabase/database.types";
import { EmpleadosService } from "@core/rrhh/empleados.service";
import type { EmpleadoActivo } from "@core/rrhh/types";
import { ASPECTOS_EVALUACION } from "../constants";
import type { EvaluacionDetalle } from "../types";

export interface DesvioGestionPendiente {
  detalle: EvaluacionDetalle;
  aspecto_titulo: string;
  empleado: EmpleadoActivo;
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
  empleado: EmpleadoActivo;
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
        "*, evaluacion:hys_evaluaciones_mensuales!inner(id, fecha_evaluacion, mes, anio, empleado_id)"
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
        empleado_id: string;
      };
    };

    const filas = (data ?? []) as unknown as Row[];
    const empleadosService = new EmpleadosService(this.supabase);
    const mapaEmpleados = await empleadosService.obtenerMapaPorIds(
      Array.from(new Set(filas.map((row) => row.evaluacion.empleado_id)))
    );

    return filas
      .map((row) => {
        const empleado = mapaEmpleados.get(row.evaluacion.empleado_id);
        if (!empleado) return null;
        return {
          detalle: row,
          aspecto_titulo:
            ASPECTOS_EVALUACION.find((a) => a.id === row.aspecto_id)?.titulo ??
            `Aspecto ${row.aspecto_id}`,
          empleado,
          evaluacion_id: row.evaluacion.id,
          fecha_evaluacion: row.evaluacion.fecha_evaluacion,
        };
      })
      .filter((fila): fila is NonNullable<typeof fila> => fila !== null);
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
      .select("promedio_general, empleado_id")
      .eq("anio", anio);

    if (error) throw error;

    type Row = { promedio_general: number | null; empleado_id: string };
    const filas = (data ?? []) as unknown as Row[];

    const porEmpleado = new Map<string, { suma: number; cantidad: number }>();

    for (const fila of filas) {
      if (fila.promedio_general === null) continue;
      const existente = porEmpleado.get(fila.empleado_id);
      if (existente) {
        existente.suma += fila.promedio_general;
        existente.cantidad += 1;
      } else {
        porEmpleado.set(fila.empleado_id, {
          suma: fila.promedio_general,
          cantidad: 1,
        });
      }
    }

    const empleadosService = new EmpleadosService(this.supabase);
    const mapaEmpleados = await empleadosService.obtenerMapaPorIds(
      Array.from(porEmpleado.keys())
    );

    return Array.from(porEmpleado.entries())
      .map(([empleadoId, v]) => {
        const empleado = mapaEmpleados.get(empleadoId);
        if (!empleado) return null;
        return {
          empleado,
          promedio_anual: Number((v.suma / v.cantidad).toFixed(2)),
          cantidad_evaluaciones: v.cantidad,
        };
      })
      .filter((fila): fila is NonNullable<typeof fila> => fila !== null);
  }
}

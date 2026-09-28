import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@core/supabase/database.types";
import type { Empleado, EmpleadoActivo } from "./types";

/**
 * Capa de acceso de solo lectura a la tabla maestra de RRHH `empleados`
 * (sincronizada desde Tango) y su vista `v_empleados_activos`.
 *
 * Es un servicio de `core` (no de un módulo específico) porque el personal
 * es un dato compartido: cualquier módulo futuro (no solo Evaluación
 * Preventiva) puede necesitar listar o buscar empleados. Ningún componente
 * de UI debe importar el cliente de Supabase directamente para esto.
 */
export class EmpleadosService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async listarActivos(): Promise<EmpleadoActivo[]> {
    const { data, error } = await this.supabase
      .from("v_empleados_activos")
      .select("*")
      .order("apellido_y_nombre", { ascending: true });

    if (error) throw error;
    return data ?? [];
  }

  async obtenerPorId(id: string): Promise<Empleado | null> {
    const { data, error } = await this.supabase
      .from("empleados")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  /**
   * Empleados activos por id, para "adjuntar" datos de RRHH a filas de otras
   * tablas (evaluaciones, etc.) sin depender del embed automático de
   * PostgREST sobre `empleados` — esa tabla tiene RLS solo para `anon`, no
   * para `authenticated`, así que el embed devuelve `null` para cualquier
   * usuario real logueado. `v_empleados_activos` sí es legible por
   * `authenticated`.
   */
  async obtenerMapaPorIds(ids: string[]): Promise<Map<string, EmpleadoActivo>> {
    if (ids.length === 0) return new Map();

    const { data, error } = await this.supabase
      .from("v_empleados_activos")
      .select("*")
      .in("id", ids);

    if (error) throw error;
    return new Map((data ?? []).map((empleado) => [empleado.id, empleado]));
  }
}

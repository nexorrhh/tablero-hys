import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@core/supabase/database.types";
import { EmpleadosService } from "@core/rrhh/empleados.service";
import type {
  EventoSeguimiento,
  NuevoSeguimientoPayload,
  SeguimientoCompleto,
} from "../types";

const SELECT_SEGUIMIENTO_COMPLETO = "*, evento:hys_eventos(*)";

/**
 * Capa de acceso a `hys_eventos_seguimiento`: las acciones de mejora que
 * nacen de un evento (o sueltas) y su ciclo investigación -> acción ->
 * responsable -> cierre.
 */
export class SeguimientoService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async crear(payload: NuevoSeguimientoPayload): Promise<EventoSeguimiento> {
    const { data, error } = await this.supabase
      .from("hys_eventos_seguimiento")
      .insert(payload)
      .select("*")
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Adjunta el responsable (RRHH) vía `v_empleados_activos` en vez del embed
   * de PostgREST sobre `empleados` (esa tabla no tiene RLS para
   * `authenticated`, así que el embed siempre da `null` para un usuario real
   * logueado).
   */
  private async adjuntarResponsables(
    filas: (Omit<SeguimientoCompleto, "responsable"> & { responsable_id: string | null })[]
  ): Promise<SeguimientoCompleto[]> {
    const ids = Array.from(
      new Set(filas.map((f) => f.responsable_id).filter((id): id is string => id !== null))
    );
    const empleadosService = new EmpleadosService(this.supabase);
    const mapa = await empleadosService.obtenerMapaPorIds(ids);

    return filas.map((fila) => ({
      ...fila,
      responsable: fila.responsable_id ? mapa.get(fila.responsable_id) ?? null : null,
    }));
  }

  async listarTodos(): Promise<SeguimientoCompleto[]> {
    const { data, error } = await this.supabase
      .from("hys_eventos_seguimiento")
      .select(SELECT_SEGUIMIENTO_COMPLETO)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return this.adjuntarResponsables((data ?? []) as unknown as Parameters<
      typeof this.adjuntarResponsables
    >[0]);
  }

  /** Propuestas de mejora sueltas, sin accidente/incidente asociado. */
  async listarSueltas(): Promise<SeguimientoCompleto[]> {
    const { data, error } = await this.supabase
      .from("hys_eventos_seguimiento")
      .select(SELECT_SEGUIMIENTO_COMPLETO)
      .is("evento_id", null)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return this.adjuntarResponsables((data ?? []) as unknown as Parameters<
      typeof this.adjuntarResponsables
    >[0]);
  }

  async listarPorEvento(eventoId: string): Promise<SeguimientoCompleto[]> {
    const { data, error } = await this.supabase
      .from("hys_eventos_seguimiento")
      .select(SELECT_SEGUIMIENTO_COMPLETO)
      .eq("evento_id", eventoId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return this.adjuntarResponsables((data ?? []) as unknown as Parameters<
      typeof this.adjuntarResponsables
    >[0]);
  }

  async actualizarEstado(
    id: string,
    estado: "pendiente" | "en_curso" | "cerrada"
  ): Promise<void> {
    const { error } = await this.supabase
      .from("hys_eventos_seguimiento")
      .update({
        estado,
        fecha_cierre: estado === "cerrada" ? new Date().toISOString().slice(0, 10) : null,
      })
      .eq("id", id);

    if (error) throw error;
  }
}

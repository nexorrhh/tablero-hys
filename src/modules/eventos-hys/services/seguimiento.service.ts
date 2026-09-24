import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@core/supabase/database.types";
import type {
  EventoSeguimiento,
  NuevoSeguimientoPayload,
  SeguimientoCompleto,
} from "../types";

const SELECT_SEGUIMIENTO_COMPLETO =
  "*, evento:hys_eventos(*), responsable:empleados(*)";

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

  async listarTodos(): Promise<SeguimientoCompleto[]> {
    const { data, error } = await this.supabase
      .from("hys_eventos_seguimiento")
      .select(SELECT_SEGUIMIENTO_COMPLETO)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []) as unknown as SeguimientoCompleto[];
  }

  async listarPorEvento(eventoId: string): Promise<SeguimientoCompleto[]> {
    const { data, error } = await this.supabase
      .from("hys_eventos_seguimiento")
      .select(SELECT_SEGUIMIENTO_COMPLETO)
      .eq("evento_id", eventoId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return (data ?? []) as unknown as SeguimientoCompleto[];
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

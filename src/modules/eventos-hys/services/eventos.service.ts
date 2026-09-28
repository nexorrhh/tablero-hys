import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@core/supabase/database.types";
import { EmpleadosService } from "@core/rrhh/empleados.service";
import type { Evento, EventoCompleto, NuevoEventoPayload } from "../types";

const SELECT_EVENTO_COMPLETO = "*, factor:hys_factores_accidente(*)";
const BUCKET_INFORMES = "hys-informes";

export interface FiltroEventos {
  desde?: string;
  hasta?: string;
  tipo?: "accidente" | "incidente";
  estado?: "pendiente" | "cerrado";
  clasificacion?: "ART" | "particular";
  /** Búsqueda de texto libre en la descripción. */
  q?: string;
}

/**
 * Capa de acceso a `hys_eventos` (accidentes/incidentes) y a los informes
 * adjuntos en Storage. Único punto de acceso: ningún componente de UI debe
 * llamar a Supabase directamente.
 */
export class EventosService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async crear(payload: NuevoEventoPayload): Promise<Evento> {
    const { data, error } = await this.supabase
      .from("hys_eventos")
      .insert(payload)
      .select("*")
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Adjunta el empleado (RRHH) vía `v_empleados_activos` en vez del embed de
   * PostgREST sobre `empleados` (esa tabla no tiene RLS para `authenticated`,
   * así que el embed siempre da `null` para un usuario real logueado).
   */
  private async adjuntarEmpleados(
    filas: Omit<EventoCompleto, "empleado">[]
  ): Promise<EventoCompleto[]> {
    const ids = Array.from(
      new Set(filas.map((f) => f.empleado_id).filter((id): id is string => id !== null))
    );
    const empleadosService = new EmpleadosService(this.supabase);
    const mapa = await empleadosService.obtenerMapaPorIds(ids);

    return filas.map((fila) => ({
      ...fila,
      empleado: fila.empleado_id ? mapa.get(fila.empleado_id) ?? null : null,
    }));
  }

  async obtenerCompleto(id: string): Promise<EventoCompleto | null> {
    const { data, error } = await this.supabase
      .from("hys_eventos")
      .select(SELECT_EVENTO_COMPLETO)
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const [completo] = await this.adjuntarEmpleados([
      data as unknown as Omit<EventoCompleto, "empleado">,
    ]);
    return completo ?? null;
  }

  async listar(filtro?: FiltroEventos): Promise<EventoCompleto[]> {
    let query = this.supabase
      .from("hys_eventos")
      .select(SELECT_EVENTO_COMPLETO)
      .order("fecha", { ascending: false });

    if (filtro?.desde) query = query.gte("fecha", filtro.desde);
    if (filtro?.hasta) query = query.lte("fecha", filtro.hasta);
    if (filtro?.tipo) query = query.eq("tipo", filtro.tipo);
    if (filtro?.estado) query = query.eq("estado", filtro.estado);
    if (filtro?.clasificacion) query = query.eq("clasificacion", filtro.clasificacion);
    if (filtro?.q) query = query.ilike("descripcion", `%${filtro.q}%`);

    const { data, error } = await query;
    if (error) throw error;

    return this.adjuntarEmpleados(
      (data ?? []) as unknown as Omit<EventoCompleto, "empleado">[]
    );
  }

  async actualizar(id: string, payload: NuevoEventoPayload): Promise<void> {
    const { error } = await this.supabase.from("hys_eventos").update(payload).eq("id", id);
    if (error) throw error;
  }

  async cerrar(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("hys_eventos")
      .update({ estado: "cerrado", fecha_cierre: new Date().toISOString().slice(0, 10) })
      .eq("id", id);

    if (error) throw error;
  }

  async reabrir(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("hys_eventos")
      .update({ estado: "pendiente", fecha_cierre: null })
      .eq("id", id);

    if (error) throw error;
  }

  async subirInforme(eventoId: string, file: File): Promise<string> {
    const extension = file.name.split(".").pop() ?? "pdf";
    const path = `${eventoId}/${crypto.randomUUID()}.${extension}`;

    const { error } = await this.supabase.storage
      .from(BUCKET_INFORMES)
      .upload(path, file);

    if (error) throw error;

    const { error: errorUpdate } = await this.supabase
      .from("hys_eventos")
      .update({ informe_path: path })
      .eq("id", eventoId);

    if (errorUpdate) throw errorUpdate;

    return path;
  }

  async obtenerUrlInforme(path: string): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(BUCKET_INFORMES)
      .createSignedUrl(path, 60 * 10);

    if (error) throw error;
    return data.signedUrl;
  }
}

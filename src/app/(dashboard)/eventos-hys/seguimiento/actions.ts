"use server";

import { createSupabaseServerClient } from "@core/supabase/server";
import { SeguimientoService } from "@modules/eventos-hys/services/seguimiento.service";
import type { NuevoSeguimientoPayload } from "@modules/eventos-hys/types";

export async function crearSeguimientoAction(
  payload: NuevoSeguimientoPayload
): Promise<{ error: string | null }> {
  try {
    if (!payload.accion_mejora.trim()) {
      throw new Error("La acción de mejora es obligatoria.");
    }
    const supabase = createSupabaseServerClient();
    const seguimientoService = new SeguimientoService(supabase);
    await seguimientoService.crear(payload);
    return { error: null };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Error al guardar la acción.",
    };
  }
}

export async function actualizarEstadoSeguimientoAction(
  id: string,
  estado: "pendiente" | "en_curso" | "cerrada"
): Promise<{ error: string | null }> {
  try {
    const supabase = createSupabaseServerClient();
    const seguimientoService = new SeguimientoService(supabase);
    await seguimientoService.actualizarEstado(id, estado);
    return { error: null };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Error al actualizar el estado.",
    };
  }
}

"use server";

import { createSupabaseServerClient } from "@core/supabase/server";
import { EventosService } from "@modules/eventos-hys/services/eventos.service";

export async function cerrarEventoAction(id: string): Promise<{ error: string | null }> {
  try {
    const supabase = createSupabaseServerClient();
    await new EventosService(supabase).cerrar(id);
    return { error: null };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Error al cerrar el evento.",
    };
  }
}

export async function reabrirEventoAction(id: string): Promise<{ error: string | null }> {
  try {
    const supabase = createSupabaseServerClient();
    await new EventosService(supabase).reabrir(id);
    return { error: null };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Error al reabrir el evento.",
    };
  }
}

export async function subirInformeAction(
  eventoId: string,
  formData: FormData
): Promise<{ error: string | null }> {
  try {
    const archivo = formData.get("informe");
    if (!(archivo instanceof File) || archivo.size === 0) {
      throw new Error("No se seleccionó ningún archivo.");
    }
    const supabase = createSupabaseServerClient();
    await new EventosService(supabase).subirInforme(eventoId, archivo);
    return { error: null };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Error al subir el informe.",
    };
  }
}

export async function obtenerUrlInformeAction(
  path: string
): Promise<{ url: string | null; error: string | null }> {
  try {
    const supabase = createSupabaseServerClient();
    const url = await new EventosService(supabase).obtenerUrlInforme(path);
    return { url, error: null };
  } catch (err) {
    return {
      url: null,
      error: err instanceof Error ? err.message : "Error al abrir el informe.",
    };
  }
}

"use server";

import { createSupabaseServerClient } from "@core/supabase/server";
import { EventosService } from "@modules/eventos-hys/services/eventos.service";
import { parseEventoFormData } from "@modules/eventos-hys/parseEventoFormData";

export async function crearEventoAction(
  formData: FormData
): Promise<{ error: string | null }> {
  try {
    const supabase = createSupabaseServerClient();
    const eventosService = new EventosService(supabase);

    const payload = parseEventoFormData(formData);
    const evento = await eventosService.crear(payload);

    const informe = formData.get("informe");
    if (informe instanceof File && informe.size > 0) {
      await eventosService.subirInforme(evento.id, informe);
    }

    return { error: null };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Error al guardar el evento.",
    };
  }
}

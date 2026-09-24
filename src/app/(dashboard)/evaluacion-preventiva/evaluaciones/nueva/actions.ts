"use server";

import { createSupabaseServerClient } from "@core/supabase/server";
import { EvaluacionesService } from "@modules/evaluacion-preventiva/services/evaluaciones.service";
import type { NuevaEvaluacionPayload } from "@modules/evaluacion-preventiva/types";

/**
 * No llama a `redirect()` acá: esta acción se invoca con `await` dentro de un
 * try/catch en el cliente (`EvaluacionForm`), y `redirect()` lanza una
 * excepción especial que ese catch terminaría interceptando por error,
 * rompiendo la navegación. El cliente hace `router.push` al recibir éxito.
 */
export async function crearEvaluacionAction(
  payload: NuevaEvaluacionPayload
): Promise<{ error: string | null }> {
  try {
    const supabase = createSupabaseServerClient();
    const evaluacionesService = new EvaluacionesService(supabase);
    await evaluacionesService.crearEvaluacionCompleta(payload);
    return { error: null };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Error al guardar la evaluación.",
    };
  }
}

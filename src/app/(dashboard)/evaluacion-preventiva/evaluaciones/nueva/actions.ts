"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@core/supabase/server";
import { EvaluacionesService } from "@modules/evaluacion-preventiva/services/evaluaciones.service";
import type { NuevaEvaluacionPayload } from "@modules/evaluacion-preventiva/types";

export async function crearEvaluacionAction(payload: NuevaEvaluacionPayload) {
  const supabase = createSupabaseServerClient();
  const evaluacionesService = new EvaluacionesService(supabase);

  await evaluacionesService.crearEvaluacionCompleta(payload);

  redirect("/evaluacion-preventiva/evaluaciones");
}

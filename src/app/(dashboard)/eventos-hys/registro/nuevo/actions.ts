"use server";

import { createSupabaseServerClient } from "@core/supabase/server";
import { EventosService } from "@modules/eventos-hys/services/eventos.service";
import type { NuevoEventoPayload } from "@modules/eventos-hys/types";

function leerNumero(formData: FormData, campo: string): number | null {
  const valor = formData.get(campo);
  if (typeof valor !== "string" || valor === "") return null;
  return Number(valor);
}

function leerTexto(formData: FormData, campo: string): string | null {
  const valor = formData.get(campo);
  return typeof valor === "string" && valor !== "" ? valor : null;
}

export async function crearEventoAction(
  formData: FormData
): Promise<{ error: string | null }> {
  try {
    const supabase = createSupabaseServerClient();
    const eventosService = new EventosService(supabase);

    const tipo = formData.get("tipo");
    if (tipo !== "accidente" && tipo !== "incidente") {
      throw new Error("Tipo de evento inválido.");
    }

    const clasificacionRaw = leerTexto(formData, "clasificacion");
    if (
      clasificacionRaw !== null &&
      clasificacionRaw !== "ART" &&
      clasificacionRaw !== "particular"
    ) {
      throw new Error("Clasificación inválida.");
    }

    const payload: NuevoEventoPayload = {
      tipo,
      empleado_id: leerTexto(formData, "empleado_id"),
      factor_id: leerNumero(formData, "factor_id"),
      fecha: String(formData.get("fecha")),
      descripcion: String(formData.get("descripcion")),
      clasificacion: clasificacionRaw as "ART" | "particular" | null,
      in_itinere: formData.get("in_itinere") === "true",
      derivado_astrolaboral: formData.get("derivado_astrolaboral") === "true",
      dias_perdidos: leerNumero(formData, "dias_perdidos") ?? 0,
    };

    if (payload.tipo === "accidente" && !payload.empleado_id) {
      throw new Error("El empleado afectado es obligatorio para un accidente.");
    }

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

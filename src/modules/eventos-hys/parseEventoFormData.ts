import type { NuevoEventoPayload } from "./types";

function leerNumero(formData: FormData, campo: string): number | null {
  const valor = formData.get(campo);
  if (typeof valor !== "string" || valor === "") return null;
  return Number(valor);
}

function leerTexto(formData: FormData, campo: string): string | null {
  const valor = formData.get(campo);
  return typeof valor === "string" && valor !== "" ? valor : null;
}

/** Parsea y valida el FormData del `EventoForm`, compartido entre crear y editar. */
export function parseEventoFormData(formData: FormData): NuevoEventoPayload {
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
    nro_siniestro_art: leerTexto(formData, "nro_siniestro_art"),
    testigos: leerTexto(formData, "testigos"),
    ubicacion_especifica: leerTexto(formData, "ubicacion_especifica"),
  };

  if (payload.tipo === "accidente" && !payload.empleado_id) {
    throw new Error("El empleado afectado es obligatorio para un accidente.");
  }

  return payload;
}

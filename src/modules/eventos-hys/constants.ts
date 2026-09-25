export const TIPOS_EVENTO = [
  { valor: "accidente", etiqueta: "Accidente" },
  { valor: "incidente", etiqueta: "Incidente" },
] as const;

export const CLASIFICACIONES_ACCIDENTE = [
  { valor: "ART", etiqueta: "ART" },
  { valor: "particular", etiqueta: "Particular (no denunciado a la ART)" },
] as const;

export const ESTADOS_SEGUIMIENTO = [
  { valor: "pendiente", etiqueta: "Pendiente" },
  { valor: "en_curso", etiqueta: "En curso" },
  { valor: "cerrada", etiqueta: "Cerrada" },
] as const;

export const PRIORIDADES_SEGUIMIENTO = [
  { valor: "alta", etiqueta: "Alta" },
  { valor: "media", etiqueta: "Media" },
  { valor: "baja", etiqueta: "Baja" },
] as const;

export const ESTADOS_EVENTO = [
  { valor: "pendiente", etiqueta: "Pendiente" },
  { valor: "cerrado", etiqueta: "Cerrado" },
] as const;

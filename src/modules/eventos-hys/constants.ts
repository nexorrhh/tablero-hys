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

export const TIPOS_CONTENIDO = [
  { valor: "texto", etiqueta: "Texto" },
  { valor: "pdf", etiqueta: "PDF" },
  { valor: "video", etiqueta: "Video (YouTube)" },
] as const;

export const TIPOS_ASIGNACION = [
  { valor: "todos", etiqueta: "Todos los empleados" },
  { valor: "sector", etiqueta: "Por sector" },
  { valor: "individual", etiqueta: "Empleados específicos" },
] as const;

export const PERIODICIDADES = [
  { valor: 1, etiqueta: "Mensual" },
  { valor: 3, etiqueta: "Trimestral" },
  { valor: 6, etiqueta: "Semestral" },
  { valor: 12, etiqueta: "Anual" },
] as const;

/**
 * Técnico de Seguridad e Higiene que carga las capacitaciones desde este
 * portal. Su firma queda fija (subida una sola vez a Storage) para
 * estamparse sola en cada constancia, sin tener que dibujarla a mano cada
 * vez que se crea una capacitación.
 */
export const INSTRUCTOR_DEFAULT = {
  nombre: "Ferreira Gomez Pablo",
  matricula: "T2-11689-1",
  firmaUrl:
    "https://qnqikspihpljzvojlpak.supabase.co/storage/v1/object/public/capacitaciones/firmas/default-instructor-pablo-ferreira.png",
} as const;

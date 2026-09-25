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

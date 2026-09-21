export interface AspectoEvaluacion {
  id: number;
  clave: string;
  titulo: string;
  descripcion: string;
}

/** Los 6 aspectos evaluados mensualmente, en el orden definido por H&S. */
export const ASPECTOS_EVALUACION: AspectoEvaluacion[] = [
  {
    id: 1,
    clave: "epp_basicos",
    titulo: "Uso de EPP básicos",
    descripcion: "Elementos generales requeridos en planta.",
  },
  {
    id: 2,
    clave: "epp_especificos",
    titulo: "Uso de EPP específicos",
    descripcion:
      "Elementos según puesto (ej. protección facial, mangas, polainas).",
  },
  {
    id: 3,
    clave: "orden_limpieza",
    titulo: "Orden y limpieza",
    descripcion: "Puesto, herramientas, cables, residuos.",
  },
  {
    id: 4,
    clave: "maniobras_izaje",
    titulo: "Maniobras de izaje",
    descripcion:
      "Zona de exclusión, señalero, sogas, prohibición bajo carga.",
  },
  {
    id: 5,
    clave: "recepcion_indicaciones",
    titulo: "Recepción de indicaciones",
    descripcion: "Comprensión y predisposición ante órdenes de seguridad.",
  },
  {
    id: 6,
    clave: "conducta_preventiva",
    titulo: "Conducta preventiva general",
    descripcion: "Reporte de condiciones inseguras, cuidado de terceros.",
  },
];

export interface OpcionPuntaje {
  valor: number;
  etiqueta: string;
}

/** Escala de puntuación 1 a 5. */
export const ESCALA_PUNTAJE: OpcionPuntaje[] = [
  { valor: 1, etiqueta: "Malo" },
  { valor: 2, etiqueta: "Regular" },
  { valor: 3, etiqueta: "Bueno" },
  { valor: 4, etiqueta: "Muy bueno" },
  { valor: 5, etiqueta: "Excelente" },
];

/** Tamaño de un ciclo de seguimiento (línea de base + 5 meses de seguimiento). */
export const MESES_POR_CICLO = 6;

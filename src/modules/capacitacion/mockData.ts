import type { CapacitacionNexo, CapacitacionProgresoNexo, EmpleadoNexo } from "./types";

/**
 * DATOS DE EJEMPLO — todavía no está conectada la escritura a Nexo RRHH
 * (falta la service_role key de ese proyecto). Los sectores de
 * `sectores-nexo.service.ts` sí son reales; esto es solo para poder ver y
 * probar la pantalla mientras tanto. Se reemplaza por datos reales de
 * `empleados`/`capacitaciones`/`capacitacion_progreso` de Nexo RRHH apenas
 * se conecte.
 */
export const EMPLEADOS_EJEMPLO: EmpleadoNexo[] = [
  { id: "demo-1", nombre: "Javier Andres", apellido: "Hernandez", legajo: "1077", cuil: "20-30123456-1", sector_id: null },
  { id: "demo-2", nombre: "Pablo", apellido: "Ferreira Gomez", legajo: "2021", cuil: "20-30234567-2", sector_id: null },
  { id: "demo-3", nombre: "Valentin Eduardo", apellido: "Angulo", legajo: "1065", cuil: "20-30345678-3", sector_id: null },
  { id: "demo-4", nombre: "Lucas Alejandro", apellido: "Bogado", legajo: "53", cuil: "20-30456789-4", sector_id: null },
  { id: "demo-5", nombre: "Marco", apellido: "Bianchi", legajo: "1051", cuil: "20-30567890-5", sector_id: null },
];

export const CAPACITACIONES_EJEMPLO: CapacitacionNexo[] = [
  {
    id: "demo-cap-1",
    titulo: "Uso correcto de EPP",
    descripcion: "Repaso de elementos de protección personal obligatorios en planta.",
    tipo: "video",
    contenido_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    contenido_texto: null,
    activo: true,
    archivado: false,
    obligatoria_todos: true,
    fecha_limite: null,
    periodicidad_meses: 12,
    tiene_quiz: true,
    puntaje_minimo: 70,
    created_at: new Date().toISOString(),
    origen: "hys",
    codigo: "S021",
    lugar: "Planta Mosconi",
    duracion: "1 hs",
    hora_inicio: "08:00",
    instructor_nombre: "Pablo Ferreira Gomez",
    instructor_matricula: "CPHSSO L2-10954-1",
  },
  {
    id: "demo-cap-2",
    titulo: "Procedimiento de izaje seguro",
    descripcion: "Zona de exclusión, señalero y prohibición de circular bajo carga.",
    tipo: "pdf",
    contenido_url: null,
    contenido_texto: null,
    activo: true,
    archivado: false,
    obligatoria_todos: false,
    fecha_limite: null,
    periodicidad_meses: null,
    tiene_quiz: false,
    puntaje_minimo: null,
    created_at: new Date().toISOString(),
    origen: "hys",
    codigo: "S035",
    lugar: "Planta Mosconi",
    duracion: "2 hs",
    hora_inicio: "09:30",
    instructor_nombre: "Pablo Ferreira Gomez",
    instructor_matricula: "CPHSSO L2-10954-1",
  },
];

/** Progreso de ejemplo para "Uso correcto de EPP" (demo-cap-1): distintos estados a propósito. */
export const PROGRESO_EJEMPLO: Record<string, CapacitacionProgresoNexo[]> = {
  "demo-cap-1": [
    {
      capacitacion_id: "demo-cap-1",
      empleado_id: "demo-1",
      estado: "completado",
      completado: true,
      completado_at: "2026-09-10T14:32:00-03:00",
      intentos: 1,
      nota: 90,
      puntaje_obtenido: 90,
      fuera_de_termino: false,
      firmado_at: "2026-09-10T14:32:00-03:00",
      firma_ip: null,
      firma_user_agent: null,
    },
    {
      capacitacion_id: "demo-cap-1",
      empleado_id: "demo-2",
      estado: "completado",
      completado: true,
      completado_at: "2026-09-12T09:05:00-03:00",
      intentos: 2,
      nota: 80,
      puntaje_obtenido: 80,
      fuera_de_termino: true,
      firmado_at: "2026-09-12T09:05:00-03:00",
      firma_ip: null,
      firma_user_agent: null,
    },
  ],
  "demo-cap-2": [],
};

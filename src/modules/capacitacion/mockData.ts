import type { CapacitacionNexo, EmpleadoNexo } from "./types";

/**
 * DATOS DE EJEMPLO — todavía no está conectada la escritura a Nexo RRHH
 * (falta la service_role key de ese proyecto). Los sectores de
 * `sectores-nexo.service.ts` sí son reales; esto es solo para poder ver y
 * probar la pantalla mientras tanto. Se reemplaza por datos reales de
 * `empleados`/`capacitaciones` de Nexo RRHH apenas se conecte.
 */
export const EMPLEADOS_EJEMPLO: EmpleadoNexo[] = [
  { id: "demo-1", nombre: "Javier Andres", apellido: "Hernandez", legajo: "1077", sector_id: null },
  { id: "demo-2", nombre: "Pablo", apellido: "Ferreira Gomez", legajo: "2021", sector_id: null },
  { id: "demo-3", nombre: "Valentin Eduardo", apellido: "Angulo", legajo: "1065", sector_id: null },
  { id: "demo-4", nombre: "Lucas Alejandro", apellido: "Bogado", legajo: "53", sector_id: null },
  { id: "demo-5", nombre: "Marco", apellido: "Bianchi", legajo: "1051", sector_id: null },
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
  },
];

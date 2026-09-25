/**
 * Tipos que reflejan el schema de `capacitaciones` en Nexo RRHH (proyecto
 * Supabase de Cimomet), no tablas propias de este tablero. Ver
 * `src/core/supabase/nexoRrhh.ts`.
 */

export interface SectorNexo {
  id: string;
  nombre: string;
}

export interface EmpleadoNexo {
  id: string;
  nombre: string;
  apellido: string;
  legajo: string;
  cuil?: string;
  sector_id: string | null;
}

export type TipoContenido = "texto" | "pdf" | "video";
export type TipoAsignacion = "todos" | "sector" | "individual";
/** rrhh = creada directamente en Nexo RRHH. hys = creada desde este panel (dispara firma + constancia). */
export type OrigenCapacitacion = "rrhh" | "hys";

export interface OpcionQuizForm {
  texto: string;
  esCorrecta: boolean;
}

export interface PreguntaQuizForm {
  texto: string;
  opciones: OpcionQuizForm[];
}

export interface CapacitacionNexo {
  id: string;
  titulo: string;
  descripcion: string | null;
  tipo: TipoContenido;
  contenido_url: string | null;
  contenido_texto: string | null;
  activo: boolean;
  archivado: boolean;
  obligatoria_todos: boolean;
  fecha_limite: string | null;
  periodicidad_meses: number | null;
  tiene_quiz: boolean;
  puntaje_minimo: number | null;
  created_at: string;
  origen: OrigenCapacitacion;
  codigo: string | null;
  lugar: string | null;
  duracion: string | null;
  hora_inicio: string | null;
  instructor_nombre: string | null;
  instructor_matricula: string | null;
}

export interface NuevaCapacitacionPayload {
  titulo: string;
  descripcion: string;
  tipo: TipoContenido;
  contenidoUrl: string | null;
  contenidoTexto: string | null;
  tieneQuiz: boolean;
  puntajeMinimo: number;
  asignacion: TipoAsignacion;
  periodicidadMeses: number | null;
  fechaLimite: string | null;
  sectorIds: string[];
  empleadoIds: string[];
  preguntas: PreguntaQuizForm[];
  codigo: string | null;
  lugar: string | null;
  duracion: string | null;
  horaInicio: string | null;
  instructorNombre: string | null;
  instructorMatricula: string | null;
}

/** Progreso de un empleado en una capacitación (tabla `capacitacion_progreso` de Nexo RRHH). */
export interface CapacitacionProgresoNexo {
  capacitacion_id: string;
  empleado_id: string;
  estado: string;
  completado: boolean;
  completado_at: string | null;
  intentos: number;
  nota: number | null;
  puntaje_obtenido: number | null;
  fuera_de_termino: boolean | null;
  firmado_at: string | null;
  firma_ip: string | null;
  firma_user_agent: string | null;
}

/** Fila combinada para la pantalla de seguimiento: empleado asignado + su progreso (si existe). */
export interface SeguimientoCapacitacionRow {
  empleado: EmpleadoNexo;
  progreso: CapacitacionProgresoNexo | null;
}

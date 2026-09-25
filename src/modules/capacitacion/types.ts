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
  sector_id: string | null;
}

export type TipoContenido = "texto" | "pdf" | "video";
export type TipoAsignacion = "todos" | "sector" | "individual";

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
}

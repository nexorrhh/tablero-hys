/**
 * Tipos de la base de datos Supabase.
 *
 * Este archivo se puede regenerar automáticamente con:
 *   npm run supabase:types
 * (requiere tener linkeado el proyecto con `supabase login` / `supabase link`).
 *
 * Mientras tanto, se mantiene a mano. Incluye:
 *  - Las tablas propias de H&S (`hys_*`), reflejando
 *    `supabase/migrations/0001_hys_evaluacion_preventiva.sql`.
 *  - Las tablas/vistas de RRHH que este módulo consume EN SOLO LECTURA
 *    (`empleados`, `v_empleados_activos`). Son propiedad de otro equipo:
 *    no se agregan más columnas de las que la app realmente usa.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      empleados: {
        Row: {
          id: string;
          legajo: string;
          empresa: string;
          apellido_y_nombre: string;
          apellido: string;
          nombre: string;
          desc_puesto: string;
          activo: boolean;
          fecha_ingreso: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      hys_usuarios: {
        Row: {
          id: string;
          nombre_visible: string;
          empleado_id: string | null;
          rol: "evaluador" | "admin";
          activo: boolean;
          debe_crear_pin: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          nombre_visible: string;
          empleado_id?: string | null;
          rol?: "evaluador" | "admin";
          activo?: boolean;
          debe_crear_pin?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          nombre_visible?: string;
          empleado_id?: string | null;
          rol?: "evaluador" | "admin";
          activo?: boolean;
          debe_crear_pin?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      hys_evaluaciones_mensuales: {
        Row: {
          id: string;
          empleado_id: string;
          fecha_evaluacion: string;
          mes: number;
          anio: number;
          promedio_general: number | null;
          ciclo_6_meses_id: string | null;
          creado_por: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          empleado_id: string;
          fecha_evaluacion: string;
          mes: number;
          anio: number;
          promedio_general?: number | null;
          ciclo_6_meses_id?: string | null;
          creado_por?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          empleado_id?: string;
          fecha_evaluacion?: string;
          mes?: number;
          anio?: number;
          promedio_general?: number | null;
          ciclo_6_meses_id?: string | null;
          creado_por?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "hys_evaluaciones_mensuales_empleado_id_fkey";
            columns: ["empleado_id"];
            referencedRelation: "empleados";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "hys_evaluaciones_mensuales_creado_por_fkey";
            columns: ["creado_por"];
            referencedRelation: "hys_usuarios";
            referencedColumns: ["id"];
          }
        ];
      };
      hys_factores_accidente: {
        Row: {
          id: number;
          nombre: string;
          activo: boolean;
        };
        Insert: {
          id?: number;
          nombre: string;
          activo?: boolean;
        };
        Update: {
          id?: number;
          nombre?: string;
          activo?: boolean;
        };
        Relationships: [];
      };
      hys_eventos: {
        Row: {
          id: string;
          tipo: "accidente" | "incidente";
          empleado_id: string | null;
          factor_id: number | null;
          fecha: string;
          descripcion: string;
          clasificacion: "ART" | "particular" | null;
          in_itinere: boolean;
          derivado_astrolaboral: boolean;
          dias_perdidos: number;
          informe_path: string | null;
          creado_por: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tipo: "accidente" | "incidente";
          empleado_id?: string | null;
          factor_id?: number | null;
          fecha: string;
          descripcion: string;
          clasificacion?: "ART" | "particular" | null;
          in_itinere?: boolean;
          derivado_astrolaboral?: boolean;
          dias_perdidos?: number;
          informe_path?: string | null;
          creado_por?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tipo?: "accidente" | "incidente";
          empleado_id?: string | null;
          factor_id?: number | null;
          fecha?: string;
          descripcion?: string;
          clasificacion?: "ART" | "particular" | null;
          in_itinere?: boolean;
          derivado_astrolaboral?: boolean;
          dias_perdidos?: number;
          informe_path?: string | null;
          creado_por?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "hys_eventos_empleado_id_fkey";
            columns: ["empleado_id"];
            referencedRelation: "empleados";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "hys_eventos_factor_id_fkey";
            columns: ["factor_id"];
            referencedRelation: "hys_factores_accidente";
            referencedColumns: ["id"];
          }
        ];
      };
      hys_eventos_seguimiento: {
        Row: {
          id: string;
          evento_id: string | null;
          investigacion_causa: string | null;
          accion_mejora: string;
          responsable_id: string | null;
          fecha_compromiso: string | null;
          fecha_cierre: string | null;
          estado: "pendiente" | "en_curso" | "cerrada";
          creado_por: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          evento_id?: string | null;
          investigacion_causa?: string | null;
          accion_mejora: string;
          responsable_id?: string | null;
          fecha_compromiso?: string | null;
          fecha_cierre?: string | null;
          estado?: "pendiente" | "en_curso" | "cerrada";
          creado_por?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          evento_id?: string | null;
          investigacion_causa?: string | null;
          accion_mejora?: string;
          responsable_id?: string | null;
          fecha_compromiso?: string | null;
          fecha_cierre?: string | null;
          estado?: "pendiente" | "en_curso" | "cerrada";
          creado_por?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "hys_eventos_seguimiento_evento_id_fkey";
            columns: ["evento_id"];
            referencedRelation: "hys_eventos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "hys_eventos_seguimiento_responsable_id_fkey";
            columns: ["responsable_id"];
            referencedRelation: "empleados";
            referencedColumns: ["id"];
          }
        ];
      };
      hys_historico_mensual: {
        Row: {
          id: string;
          mes: number;
          anio: number;
          accidentes_art: number;
          accidentes_particular: number;
          accidentes_in_itinere: number;
          incidentes: number;
          dias_perdidos: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          mes: number;
          anio: number;
          accidentes_art?: number;
          accidentes_particular?: number;
          accidentes_in_itinere?: number;
          incidentes?: number;
          dias_perdidos?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          mes?: number;
          anio?: number;
          accidentes_art?: number;
          accidentes_particular?: number;
          accidentes_in_itinere?: number;
          incidentes?: number;
          dias_perdidos?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      hys_evaluacion_detalles: {
        Row: {
          id: string;
          evaluacion_id: string;
          aspecto_id: number;
          puntaje: number | null;
          no_aplica: boolean;
          desvio_gestion: boolean;
          observaciones: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          evaluacion_id: string;
          aspecto_id: number;
          puntaje?: number | null;
          no_aplica?: boolean;
          desvio_gestion?: boolean;
          observaciones?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          evaluacion_id?: string;
          aspecto_id?: number;
          puntaje?: number | null;
          no_aplica?: boolean;
          desvio_gestion?: boolean;
          observaciones?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "hys_evaluacion_detalles_evaluacion_id_fkey";
            columns: ["evaluacion_id"];
            referencedRelation: "hys_evaluaciones_mensuales";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      v_empleados_activos: {
        Row: {
          id: string;
          legajo: string;
          empresa: string;
          apellido_y_nombre: string;
          apellido: string;
          nombre: string;
          desc_puesto: string;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

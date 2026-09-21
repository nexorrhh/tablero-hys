import type { Database } from "@core/supabase/database.types";

/**
 * Empleado (tabla `empleados`, propiedad del módulo de RRHH, sincronizada
 * desde Tango). Cualquier módulo de la app puede LEER estos tipos; ninguno
 * debe escribir en esta tabla.
 */
export type Empleado = Database["public"]["Tables"]["empleados"]["Row"];

/** Vista de solo lectura con los empleados activos (`v_empleados_activos`). */
export type EmpleadoActivo =
  Database["public"]["Views"]["v_empleados_activos"]["Row"];

import type { Database } from "@core/supabase/database.types";

export type UsuarioHys = Database["public"]["Tables"]["hys_usuarios"]["Row"];

/** Fila mínima que necesita el selector de nombres en la pantalla de login. */
export interface UsuarioLogin {
  id: string;
  nombre_visible: string;
  debe_crear_pin: boolean;
}

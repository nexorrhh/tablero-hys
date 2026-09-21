import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@core/supabase/database.types";
import type { UsuarioHys, UsuarioLogin } from "./types";

/**
 * Capa de acceso a `hys_usuarios`. La lectura de nombres activos es pública
 * (necesaria para el selector de la pantalla de login, antes de autenticarse);
 * el alta/baja de usuarios vive en `actions.ts` porque requiere la
 * service_role key.
 */
export class UsuariosService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async listarActivosParaLogin(): Promise<UsuarioLogin[]> {
    const { data, error } = await this.supabase
      .from("hys_usuarios")
      .select("id, nombre_visible, debe_crear_pin")
      .eq("activo", true)
      .order("nombre_visible", { ascending: true });

    if (error) throw error;
    return data ?? [];
  }

  async listarTodos(): Promise<UsuarioHys[]> {
    const { data, error } = await this.supabase
      .from("hys_usuarios")
      .select("*")
      .order("nombre_visible", { ascending: true });

    if (error) throw error;
    return data ?? [];
  }
}

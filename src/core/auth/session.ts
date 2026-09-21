import "server-only";
import { createSupabaseServerClient } from "@core/supabase/server";
import type { UsuarioHys } from "./types";

/**
 * Usuario logueado en la sesión actual (cookies de Supabase Auth), con su
 * fila de `hys_usuarios` ya resuelta. `null` si no hay sesión o si el
 * usuario fue desactivado.
 */
export async function obtenerUsuarioActual(): Promise<UsuarioHys | null> {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("hys_usuarios")
    .select("*")
    .eq("id", user.id)
    .eq("activo", true)
    .maybeSingle();

  return data;
}

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

  let user;
  try {
    ({
      data: { user },
    } = await supabase.auth.getUser());
  } catch {
    // Cookie de sesión corrupta o ilegible (p. ej. quedó partida a la mitad
    // entre varias cookies `sb-*`): se trata igual que "sin sesión" en vez
    // de tirar abajo la página con un error de servidor.
    return null;
  }

  if (!user) return null;

  const { data } = await supabase
    .from("hys_usuarios")
    .select("*")
    .eq("id", user.id)
    .eq("activo", true)
    .maybeSingle();

  return data;
}

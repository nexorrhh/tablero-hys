import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/**
 * Cliente Supabase con la `service_role` key: bypassea RLS y puede
 * administrar usuarios de Supabase Auth (crear, banear, etc.).
 *
 * SOLO se importa desde server actions / código de servidor que ya validó
 * que quien ejecuta la acción tiene permisos de administración (rol
 * 'admin' en `hys_usuarios`). Nunca se expone al cliente: el import de
 * `server-only` hace fallar el build si algún componente cliente lo importa
 * por error.
 */
export function createSupabaseAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

import { createNexoRrhhPublicClient, NEXO_RRHH_EMPRESA_ID } from "@core/supabase/nexoRrhh";
import type { SectorNexo } from "../types";

/**
 * Sectores reales de Nexo RRHH (Cimomet). Es de las pocas tablas que se
 * pueden leer con la anon key pública, sin sesión de admin de ese sistema.
 */
export async function listarSectoresNexo(): Promise<SectorNexo[]> {
  const client = createNexoRrhhPublicClient();
  const { data, error } = await client
    .from("sectores")
    .select("id, nombre")
    .eq("empresa_id", NEXO_RRHH_EMPRESA_ID)
    .order("nombre");

  if (error) throw error;
  return (data ?? []) as SectorNexo[];
}

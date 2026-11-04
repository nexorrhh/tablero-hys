import { createNexoRrhhPublicClient, obtenerNexoRrhhProyecto } from "@core/supabase/nexoRrhh";
import type { EmpresaCapacitacion } from "../empresas";
import type { SectorNexo } from "../types";

/**
 * Sectores reales de Nexo RRHH de la empresa indicada. Es de las pocas
 * tablas que se pueden leer con la anon key pública, sin sesión de admin de
 * ese sistema.
 */
export async function listarSectoresNexo(empresa: EmpresaCapacitacion): Promise<SectorNexo[]> {
  const client = createNexoRrhhPublicClient(empresa);
  const { data, error } = await client
    .from("sectores")
    .select("id, nombre")
    .eq("empresa_id", obtenerNexoRrhhProyecto(empresa).empresaId)
    .order("nombre");

  if (error) throw error;
  return (data ?? []) as SectorNexo[];
}

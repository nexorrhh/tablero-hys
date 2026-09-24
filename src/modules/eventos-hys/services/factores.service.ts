import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@core/supabase/database.types";
import type { FactorAccidente } from "../types";

export class FactoresService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async listarActivos(): Promise<FactorAccidente[]> {
    const { data, error } = await this.supabase
      .from("hys_factores_accidente")
      .select("*")
      .eq("activo", true)
      .order("nombre", { ascending: true });

    if (error) throw error;
    return data ?? [];
  }
}

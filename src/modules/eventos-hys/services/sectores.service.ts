import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@core/supabase/database.types";
import type { Sector } from "../types";

export class SectoresService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async listarActivos(): Promise<Sector[]> {
    const { data, error } = await this.supabase
      .from("hys_sectores")
      .select("*")
      .eq("activo", true)
      .order("nombre", { ascending: true });

    if (error) throw error;
    return data ?? [];
  }

  async crear(nombre: string): Promise<Sector> {
    const { data, error } = await this.supabase
      .from("hys_sectores")
      .insert({ nombre: nombre.trim() })
      .select("*")
      .single();

    if (error) throw error;
    return data;
  }
}

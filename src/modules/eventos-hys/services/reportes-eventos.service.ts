import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@core/supabase/database.types";
import type { Evento } from "../types";

export interface TotalesMes {
  mes: number;
  accidentes_art: number;
  accidentes_particular: number;
  accidentes_in_itinere: number;
  incidentes: number;
  dias_perdidos: number;
}

export interface TotalesPorSector {
  sector_id: number | null;
  sector_nombre: string;
  accidentes: number;
  incidentes: number;
}

export interface TotalesPorFactor {
  factor_id: number;
  factor_nombre: string;
  cantidad: number;
}

export interface ResumenAcciones {
  pendientes: number;
  en_curso: number;
  cerradas: number;
  porcentaje_cumplimiento: number;
}

function totalesVacios(mes: number): TotalesMes {
  return {
    mes,
    accidentes_art: 0,
    accidentes_particular: 0,
    accidentes_in_itinere: 0,
    incidentes: 0,
    dias_perdidos: 0,
  };
}

/**
 * Indicadores de la Vista H&S (detallada) y la Vista Dirección (resumen) del
 * Módulo de Eventos. Combina `hys_eventos` (carga detallada, desde oct-2026)
 * con `hys_historico_mensual` (totales de referencia, 2025 y ene-sep 2026)
 * para que la comparativa anual salga de una sola serie sin importar la
 * fuente de cada mes.
 */
export class ReportesEventosService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async obtenerTotalesMensuales(anio: number): Promise<TotalesMes[]> {
    const [historico, eventos] = await Promise.all([
      this.supabase
        .from("hys_historico_mensual")
        .select("*")
        .eq("anio", anio),
      this.supabase
        .from("hys_eventos")
        .select("tipo, clasificacion, in_itinere, dias_perdidos, fecha")
        .gte("fecha", `${anio}-01-01`)
        .lte("fecha", `${anio}-12-31`),
    ]);

    if (historico.error) throw historico.error;
    if (eventos.error) throw eventos.error;

    const porMes = new Map<number, TotalesMes>();
    for (let mes = 1; mes <= 12; mes++) porMes.set(mes, totalesVacios(mes));

    for (const fila of historico.data ?? []) {
      porMes.set(fila.mes, {
        mes: fila.mes,
        accidentes_art: fila.accidentes_art,
        accidentes_particular: fila.accidentes_particular,
        accidentes_in_itinere: fila.accidentes_in_itinere,
        incidentes: fila.incidentes,
        dias_perdidos: fila.dias_perdidos,
      });
    }

    const mesesConEventos = new Set<number>();
    for (const ev of eventos.data ?? []) {
      const mes = Number(ev.fecha.slice(5, 7));
      mesesConEventos.add(mes);
    }

    // Los meses con carga detallada en hys_eventos pisan al histórico (más confiable).
    for (const mes of mesesConEventos) porMes.set(mes, totalesVacios(mes));

    for (const ev of eventos.data ?? []) {
      const mes = Number(ev.fecha.slice(5, 7));
      const acumulado = porMes.get(mes)!;

      if (ev.tipo === "incidente") {
        acumulado.incidentes += 1;
      } else {
        if (ev.clasificacion === "ART") acumulado.accidentes_art += 1;
        if (ev.clasificacion === "particular") acumulado.accidentes_particular += 1;
        if (ev.in_itinere) acumulado.accidentes_in_itinere += 1;
      }
      acumulado.dias_perdidos += ev.dias_perdidos;
    }

    return Array.from(porMes.values()).sort((a, b) => a.mes - b.mes);
  }

  async obtenerPorSector(anio?: number): Promise<TotalesPorSector[]> {
    let query = this.supabase
      .from("hys_eventos")
      .select("tipo, sector:hys_sectores(id, nombre)");

    if (anio) {
      query = query.gte("fecha", `${anio}-01-01`).lte("fecha", `${anio}-12-31`);
    }

    const { data, error } = await query;
    if (error) throw error;

    type Row = Pick<Evento, "tipo"> & {
      sector: { id: number; nombre: string } | null;
    };

    const porSector = new Map<string, TotalesPorSector>();
    for (const fila of (data ?? []) as unknown as Row[]) {
      const clave = fila.sector ? String(fila.sector.id) : "sin-sector";
      const existente = porSector.get(clave) ?? {
        sector_id: fila.sector?.id ?? null,
        sector_nombre: fila.sector?.nombre ?? "Sin sector",
        accidentes: 0,
        incidentes: 0,
      };

      if (fila.tipo === "accidente") existente.accidentes += 1;
      else existente.incidentes += 1;

      porSector.set(clave, existente);
    }

    return Array.from(porSector.values()).sort(
      (a, b) => b.accidentes + b.incidentes - (a.accidentes + a.incidentes)
    );
  }

  async obtenerPorFactor(anio?: number): Promise<TotalesPorFactor[]> {
    let query = this.supabase
      .from("hys_eventos")
      .select("factor:hys_factores_accidente(id, nombre)")
      .eq("tipo", "accidente")
      .not("factor_id", "is", null);

    if (anio) {
      query = query.gte("fecha", `${anio}-01-01`).lte("fecha", `${anio}-12-31`);
    }

    const { data, error } = await query;
    if (error) throw error;

    type Row = { factor: { id: number; nombre: string } | null };

    const porFactor = new Map<number, TotalesPorFactor>();
    for (const fila of (data ?? []) as unknown as Row[]) {
      if (!fila.factor) continue;
      const existente = porFactor.get(fila.factor.id) ?? {
        factor_id: fila.factor.id,
        factor_nombre: fila.factor.nombre,
        cantidad: 0,
      };
      existente.cantidad += 1;
      porFactor.set(fila.factor.id, existente);
    }

    return Array.from(porFactor.values()).sort((a, b) => b.cantidad - a.cantidad);
  }

  async obtenerResumenAcciones(): Promise<ResumenAcciones> {
    const { data, error } = await this.supabase
      .from("hys_eventos_seguimiento")
      .select("estado");

    if (error) throw error;

    const filas = data ?? [];
    const pendientes = filas.filter((f) => f.estado === "pendiente").length;
    const en_curso = filas.filter((f) => f.estado === "en_curso").length;
    const cerradas = filas.filter((f) => f.estado === "cerrada").length;
    const total = filas.length;

    return {
      pendientes,
      en_curso,
      cerradas,
      porcentaje_cumplimiento: total > 0 ? Math.round((cerradas / total) * 100) : 0,
    };
  }
}

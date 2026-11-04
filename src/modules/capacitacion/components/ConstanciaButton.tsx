"use client";

import { imprimirConstancia } from "../pdf/buildConstanciaHTML";
import { EMPRESAS_CAPACITACION, type EmpresaCapacitacion } from "../empresas";
import type { CapacitacionNexo, SeguimientoCapacitacionRow } from "../types";

interface ConstanciaButtonProps {
  capacitacion: CapacitacionNexo;
  fila: SeguimientoCapacitacionRow;
  empresa: EmpresaCapacitacion;
}

/** Habilitado solo cuando el empleado ya firmó (completó) la capacitación. */
export function ConstanciaButton({ capacitacion, fila, empresa }: ConstanciaButtonProps) {
  const puedeDescargar = Boolean(fila.progreso?.firmado_at);
  const { empresaNombre, logoUrl } = EMPRESAS_CAPACITACION[empresa];

  return (
    <button
      type="button"
      disabled={!puedeDescargar}
      onClick={() => imprimirConstancia(capacitacion, fila, empresaNombre, logoUrl)}
      className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
      title={puedeDescargar ? "Descargar constancia" : "Todavía no firmó"}
    >
      Descargar constancia
    </button>
  );
}

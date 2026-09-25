"use client";

import { Badge } from "@core/ui/Badge";
import type { CapacitacionNexo, SeguimientoCapacitacionRow } from "../types";
import { ConstanciaButton } from "./ConstanciaButton";

interface SeguimientoCapacitacionProps {
  capacitacion: CapacitacionNexo;
  filas: SeguimientoCapacitacionRow[];
}

export function SeguimientoCapacitacion({ capacitacion, filas }: SeguimientoCapacitacionProps) {
  const completados = filas.filter((f) => f.progreso?.completado).length;
  const pct = filas.length ? Math.round((completados / filas.length) * 100) : 0;

  return (
    <div className="mt-4 border-t border-slate-100 pt-4">
      <div className="mb-3 flex gap-3">
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2">
          <p className="font-mono text-lg font-bold text-slate-800">{pct}%</p>
          <p className="text-[10px] uppercase tracking-wide text-slate-500">Completado</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2">
          <p className="font-mono text-lg font-bold text-emerald-600">{completados}</p>
          <p className="text-[10px] uppercase tracking-wide text-slate-500">Completaron</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2">
          <p className="font-mono text-lg font-bold text-amber-600">{filas.length - completados}</p>
          <p className="text-[10px] uppercase tracking-wide text-slate-500">Pendientes</p>
        </div>
      </div>

      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-slate-500">
            <th className="pb-2">Empleado</th>
            <th className="pb-2">Legajo</th>
            <th className="pb-2">Estado</th>
            {capacitacion.tiene_quiz ? <th className="pb-2">Nota</th> : null}
            <th className="pb-2">Firmado</th>
            <th className="pb-2" />
          </tr>
        </thead>
        <tbody>
          {filas.map((fila) => {
            const completado = fila.progreso?.completado ?? false;
            const fueraTermino = fila.progreso?.fuera_de_termino === true;
            return (
              <tr key={fila.empleado.id} className="border-b border-slate-100 last:border-0">
                <td className="py-2 font-medium text-slate-800">
                  {fila.empleado.apellido}, {fila.empleado.nombre}
                </td>
                <td className="py-2 font-mono text-xs text-slate-500">{fila.empleado.legajo}</td>
                <td className="py-2">
                  <Badge variant={completado ? (fueraTermino ? "warning" : "success") : "default"}>
                    {completado ? (fueraTermino ? "Fuera de término" : "Completó") : "Pendiente"}
                  </Badge>
                </td>
                {capacitacion.tiene_quiz ? (
                  <td className="py-2 font-mono text-slate-600">
                    {fila.progreso?.puntaje_obtenido != null ? `${fila.progreso.puntaje_obtenido}%` : "—"}
                  </td>
                ) : null}
                <td className="py-2 text-xs text-slate-400">
                  {fila.progreso?.firmado_at ? new Date(fila.progreso.firmado_at).toLocaleString("es-AR") : "—"}
                </td>
                <td className="py-2">
                  <ConstanciaButton capacitacion={capacitacion} fila={fila} />
                </td>
              </tr>
            );
          })}
          {filas.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-6 text-center text-slate-400">
                Sin empleados asignados a esta capacitación.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

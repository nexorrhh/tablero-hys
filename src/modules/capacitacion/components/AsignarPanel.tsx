"use client";

import { useEffect, useState } from "react";
import type { EmpleadoNexo } from "../types";

interface AsignarPanelProps {
  capId: string;
  empleados: EmpleadoNexo[];
  onObtenerAsignaciones: (capId: string) => Promise<{ data: string[] | null; error: string | null }>;
  onGuardar: (capId: string, empleadoIds: string[]) => Promise<{ error: string | null }>;
}

/**
 * Asignación individual de empleados a una capacitación ya creada (además de
 * lo que haya quedado fijado por sector o "todos" al crearla). Al guardar
 * reemplaza la lista completa; solo se notifica por mail a los que se
 * agregan de nuevo, no a los que ya estaban.
 */
export function AsignarPanel({ capId, empleados, onObtenerAsignaciones, onGuardar }: AsignarPanelProps) {
  const [cargando, setCargando] = useState(true);
  const [seleccionIds, setSeleccionIds] = useState<string[]>([]);
  const [previosIds, setPreviosIds] = useState<string[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    onObtenerAsignaciones(capId).then((resultado) => {
      if (cancelado) return;
      if (resultado.error) {
        setError(resultado.error);
      } else {
        setSeleccionIds(resultado.data ?? []);
        setPreviosIds(resultado.data ?? []);
      }
      setCargando(false);
    });
    return () => {
      cancelado = true;
    };
  }, [capId, onObtenerAsignaciones]);

  function toggle(id: string) {
    setSeleccionIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function handleGuardar() {
    setGuardando(true);
    setError(null);
    setMensaje(null);
    onGuardar(capId, seleccionIds).then((resultado) => {
      setGuardando(false);
      if (resultado.error) {
        setError(resultado.error);
        return;
      }
      const nuevos = seleccionIds.filter((id) => !previosIds.includes(id)).length;
      setPreviosIds(seleccionIds);
      setMensaje(
        `Guardado: ${seleccionIds.length} empleado(s) asignados${nuevos ? ` · ${nuevos} notificado(s) por mail` : ""}.`
      );
    });
  }

  if (cargando) {
    return (
      <p className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-400">Cargando empleados…</p>
    );
  }

  return (
    <div className="mt-4 border-t border-slate-100 pt-4">
      <p className="mb-2 text-xs text-slate-500">
        Esto es además de lo asignado por sector o &quot;todos&quot; al crearla.
      </p>

      {error ? <p className="mb-2 text-sm text-red-600">{error}</p> : null}
      {mensaje ? <p className="mb-2 text-sm text-emerald-600">{mensaje}</p> : null}

      <div className="max-h-64 overflow-y-auto rounded-md border border-slate-200">
        {empleados.map((e) => (
          <label
            key={e.id}
            className="flex items-center gap-3 border-b border-slate-50 px-3 py-2 last:border-0 hover:bg-slate-50"
          >
            <input type="checkbox" checked={seleccionIds.includes(e.id)} onChange={() => toggle(e.id)} />
            <span className="flex-1 text-sm text-slate-700">
              {e.apellido}, {e.nombre}
            </span>
            <span className="font-mono text-xs text-slate-400">{e.legajo}</span>
            {previosIds.includes(e.id) ? (
              <span className="text-[10px] font-semibold text-emerald-600">Ya asignada</span>
            ) : null}
          </label>
        ))}
        {empleados.length === 0 ? (
          <p className="px-3 py-3 text-sm text-slate-400">No hay empleados activos.</p>
        ) : null}
      </div>

      <button
        type="button"
        onClick={handleGuardar}
        disabled={guardando}
        className="mt-3 rounded-md bg-brand-accent px-4 py-2 text-sm font-medium text-white hover:bg-brand-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {guardando ? "Guardando…" : "Guardar asignaciones"}
      </button>
    </div>
  );
}

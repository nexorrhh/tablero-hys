"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { EmpleadoActivo } from "@core/rrhh/types";
import { Badge } from "@core/ui/Badge";
import { ESTADOS_SEGUIMIENTO, PRIORIDADES_SEGUIMIENTO } from "../constants";
import type { NuevoSeguimientoPayload, SeguimientoCompleto } from "../types";

interface SeguimientoPanelProps {
  acciones: SeguimientoCompleto[];
  empleados: EmpleadoActivo[];
  onCrear: (payload: NuevoSeguimientoPayload) => Promise<{ error: string | null }>;
  onActualizarEstado: (
    id: string,
    estado: "pendiente" | "en_curso" | "cerrada"
  ) => Promise<{ error: string | null }>;
}

/**
 * Propuestas de mejora SUELTAS (sin accidente/incidente asociado). El
 * seguimiento de un evento puntual se carga desde su propia página de
 * detalle (`/eventos-hys/registro/[id]`), no acá.
 */
export function SeguimientoPanel({
  acciones,
  empleados,
  onCrear,
  onActualizarEstado,
}: SeguimientoPanelProps) {
  const router = useRouter();
  const [investigacion, setInvestigacion] = useState("");
  const [accionMejora, setAccionMejora] = useState("");
  const [responsableId, setResponsableId] = useState("");
  const [fechaCompromiso, setFechaCompromiso] = useState("");
  const [prioridad, setPrioridad] = useState<"alta" | "media" | "baja">("media");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCrear(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const resultado = await onCrear({
        evento_id: null,
        investigacion_causa: investigacion || null,
        accion_mejora: accionMejora,
        responsable_id: responsableId || null,
        fecha_compromiso: fechaCompromiso || null,
        prioridad,
      });

      if (resultado.error) {
        setError(resultado.error);
        return;
      }

      setInvestigacion("");
      setAccionMejora("");
      setResponsableId("");
      setFechaCompromiso("");
      setPrioridad("media");
      router.refresh();
    });
  }

  function handleCambiarEstado(id: string, estado: "pendiente" | "en_curso" | "cerrada") {
    startTransition(async () => {
      await onActualizarEstado(id, estado);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleCrear}
        className="grid grid-cols-1 gap-4 rounded-lg border border-slate-200 bg-white p-5 sm:grid-cols-2"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Responsable
          </label>
          <select
            value={responsableId}
            onChange={(e) => setResponsableId(e.target.value)}
            className="w-full rounded-md border border-slate-300 p-2 text-sm"
          >
            <option value="">— Sin asignar —</option>
            {empleados.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.apellido_y_nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Fecha compromiso
          </label>
          <input
            type="date"
            value={fechaCompromiso}
            onChange={(e) => setFechaCompromiso(e.target.value)}
            className="w-full rounded-md border border-slate-300 p-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Prioridad</label>
          <select
            value={prioridad}
            onChange={(e) => setPrioridad(e.target.value as "alta" | "media" | "baja")}
            className="w-full rounded-md border border-slate-300 p-2 text-sm"
          >
            {PRIORIDADES_SEGUIMIENTO.map((p) => (
              <option key={p.valor} value={p.valor}>
                {p.etiqueta}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Investigación / motivo{" "}
            <span className="font-normal text-slate-400">— opcional</span>
          </label>
          <textarea
            value={investigacion}
            onChange={(e) => setInvestigacion(e.target.value)}
            rows={2}
            className="w-full rounded-md border border-slate-300 p-2 text-sm"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Propuesta de mejora
          </label>
          <textarea
            value={accionMejora}
            onChange={(e) => setAccionMejora(e.target.value)}
            required
            rows={2}
            className="w-full rounded-md border border-slate-300 p-2 text-sm"
          />
        </div>

        <div className="sm:col-span-2">
          {error ? <p className="mb-2 text-sm text-red-600">{error}</p> : null}
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-brand-accent px-4 py-2 text-sm font-medium text-white hover:bg-brand-accent/90 disabled:opacity-50"
          >
            {isPending ? "Guardando…" : "Agregar propuesta"}
          </button>
        </div>
      </form>

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="pb-2">Propuesta</th>
              <th className="pb-2">Prioridad</th>
              <th className="pb-2">Responsable</th>
              <th className="pb-2">Compromiso</th>
              <th className="pb-2">Estado</th>
            </tr>
          </thead>
          <tbody>
            {acciones.map((a) => (
              <tr key={a.id} className="border-b border-slate-100 last:border-0">
                <td className="py-2 max-w-sm text-slate-700">{a.accion_mejora}</td>
                <td className="py-2">
                  <Badge
                    variant={
                      a.prioridad === "alta"
                        ? "danger"
                        : a.prioridad === "media"
                          ? "warning"
                          : "default"
                    }
                  >
                    {a.prioridad === "alta" ? "Alta" : a.prioridad === "media" ? "Media" : "Baja"}
                  </Badge>
                </td>
                <td className="py-2 text-slate-600">
                  {a.responsable?.apellido_y_nombre ?? "—"}
                </td>
                <td className="py-2 text-slate-600">{a.fecha_compromiso ?? "—"}</td>
                <td className="py-2">
                  <select
                    value={a.estado}
                    disabled={isPending}
                    onChange={(e) =>
                      handleCambiarEstado(
                        a.id,
                        e.target.value as "pendiente" | "en_curso" | "cerrada"
                      )
                    }
                    className="rounded-md border border-slate-300 p-1 text-sm"
                  >
                    {ESTADOS_SEGUIMIENTO.map((s) => (
                      <option key={s.valor} value={s.valor}>
                        {s.etiqueta}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {acciones.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-slate-400">
                  No hay propuestas de mejora sueltas cargadas.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

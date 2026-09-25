"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { EmpleadoActivo } from "@core/rrhh/types";
import { Badge } from "@core/ui/Badge";
import { ESTADOS_SEGUIMIENTO } from "../constants";
import type { EventoCompleto, NuevoSeguimientoPayload, SeguimientoCompleto } from "../types";

interface EventoDetalleProps {
  evento: EventoCompleto;
  acciones: SeguimientoCompleto[];
  empleados: EmpleadoActivo[];
  onCrearSeguimiento: (payload: NuevoSeguimientoPayload) => Promise<{ error: string | null }>;
  onActualizarEstadoSeguimiento: (
    id: string,
    estado: "pendiente" | "en_curso" | "cerrada"
  ) => Promise<{ error: string | null }>;
  onCerrarEvento: (id: string) => Promise<{ error: string | null }>;
  onReabrirEvento: (id: string) => Promise<{ error: string | null }>;
  onSubirInforme: (eventoId: string, formData: FormData) => Promise<{ error: string | null }>;
  onObtenerUrlInforme: (path: string) => Promise<{ url: string | null; error: string | null }>;
}

export function EventoDetalle({
  evento,
  acciones,
  empleados,
  onCrearSeguimiento,
  onActualizarEstadoSeguimiento,
  onCerrarEvento,
  onReabrirEvento,
  onSubirInforme,
  onObtenerUrlInforme,
}: EventoDetalleProps) {
  const router = useRouter();
  const [investigacion, setInvestigacion] = useState("");
  const [accionMejora, setAccionMejora] = useState("");
  const [responsableId, setResponsableId] = useState("");
  const [fechaCompromiso, setFechaCompromiso] = useState("");
  const [informe, setInforme] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const hayAccionesAbiertas = acciones.some((a) => a.estado !== "cerrada");

  function handleAgregarAccion(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const resultado = await onCrearSeguimiento({
        evento_id: evento.id,
        investigacion_causa: investigacion || null,
        accion_mejora: accionMejora,
        responsable_id: responsableId || null,
        fecha_compromiso: fechaCompromiso || null,
      });

      if (resultado.error) {
        setError(resultado.error);
        return;
      }

      setInvestigacion("");
      setAccionMejora("");
      setResponsableId("");
      setFechaCompromiso("");
      router.refresh();
    });
  }

  function handleCambiarEstadoAccion(id: string, estado: "pendiente" | "en_curso" | "cerrada") {
    startTransition(async () => {
      await onActualizarEstadoSeguimiento(id, estado);
      router.refresh();
    });
  }

  function handleCerrarEvento() {
    if (hayAccionesAbiertas) {
      const confirmar = window.confirm(
        "Todavía hay acciones de mejora sin cerrar. ¿Cerrar igual el evento?"
      );
      if (!confirmar) return;
    }
    startTransition(async () => {
      const resultado = await onCerrarEvento(evento.id);
      if (resultado.error) setError(resultado.error);
      router.refresh();
    });
  }

  function handleReabrirEvento() {
    startTransition(async () => {
      const resultado = await onReabrirEvento(evento.id);
      if (resultado.error) setError(resultado.error);
      router.refresh();
    });
  }

  function handleSubirInforme(e: React.FormEvent) {
    e.preventDefault();
    if (!informe) return;
    const formData = new FormData();
    formData.set("informe", informe);
    startTransition(async () => {
      const resultado = await onSubirInforme(evento.id, formData);
      if (resultado.error) setError(resultado.error);
      setInforme(null);
      router.refresh();
    });
  }

  async function handleVerInforme() {
    if (!evento.informe_path) return;
    const resultado = await onObtenerUrlInforme(evento.informe_path);
    if (resultado.url) window.open(resultado.url, "_blank");
    else setError(resultado.error);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Badge variant={evento.tipo === "accidente" ? "danger" : "warning"}>
                {evento.tipo === "accidente" ? "Accidente" : "Incidente"}
              </Badge>
              <Badge variant={evento.estado === "cerrado" ? "success" : "default"}>
                {evento.estado === "cerrado" ? "Cerrado" : "Pendiente"}
              </Badge>
            </div>
            <p className="text-sm text-slate-500">{evento.fecha}</p>
          </div>

          {evento.estado === "pendiente" ? (
            <button
              type="button"
              disabled={isPending}
              onClick={handleCerrarEvento}
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              Cerrar evento
            </button>
          ) : (
            <button
              type="button"
              disabled={isPending}
              onClick={handleReabrirEvento}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:border-brand-accent disabled:opacity-50"
            >
              Reabrir
            </button>
          )}
        </div>

        <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-slate-400">Empleado</dt>
            <dd className="text-slate-700">{evento.empleado?.apellido_y_nombre ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Sector</dt>
            <dd className="text-slate-700">{evento.empleado?.desc_puesto ?? "—"}</dd>
          </div>
          {evento.tipo === "accidente" ? (
            <>
              <div>
                <dt className="text-slate-400">Clasificación</dt>
                <dd className="text-slate-700">
                  {evento.clasificacion === "particular" ? "ASTRO laboral" : evento.clasificacion}
                  {evento.in_itinere ? " · in itinere" : ""}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">Días perdidos</dt>
                <dd className="text-slate-700">{evento.dias_perdidos}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Factor</dt>
                <dd className="text-slate-700">{evento.factor?.nombre ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Derivado a Astrolaboral</dt>
                <dd className="text-slate-700">{evento.derivado_astrolaboral ? "Sí" : "No"}</dd>
              </div>
            </>
          ) : null}
        </dl>

        <p className="mt-4 text-sm text-slate-600">{evento.descripcion}</p>

        <div className="mt-4 border-t border-slate-100 pt-4">
          {evento.informe_path ? (
            <button
              type="button"
              onClick={handleVerInforme}
              className="text-sm text-brand-accent hover:underline"
            >
              Ver informe adjunto →
            </button>
          ) : (
            <form onSubmit={handleSubirInforme} className="flex items-center gap-2">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.png"
                onChange={(e) => setInforme(e.target.files?.[0] ?? null)}
                className="text-sm"
              />
              <button
                type="submit"
                disabled={!informe || isPending}
                className="whitespace-nowrap rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-600 hover:border-brand-accent disabled:opacity-50"
              >
                Adjuntar informe
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Seguimiento</h2>

        <form onSubmit={handleAgregarAccion} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Investigación / causa
            </label>
            <textarea
              value={investigacion}
              onChange={(e) => setInvestigacion(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-slate-300 p-2 text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Acción de mejora
            </label>
            <textarea
              value={accionMejora}
              onChange={(e) => setAccionMejora(e.target.value)}
              required
              rows={2}
              className="w-full rounded-md border border-slate-300 p-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Responsable</label>
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
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Fecha compromiso
            </label>
            <input
              type="date"
              value={fechaCompromiso}
              onChange={(e) => setFechaCompromiso(e.target.value)}
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
              {isPending ? "Guardando…" : "Agregar acción"}
            </button>
          </div>
        </form>

        <table className="mt-5 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="pb-2">Acción</th>
              <th className="pb-2">Responsable</th>
              <th className="pb-2">Compromiso</th>
              <th className="pb-2">Estado</th>
            </tr>
          </thead>
          <tbody>
            {acciones.map((a) => (
              <tr key={a.id} className="border-b border-slate-100 last:border-0">
                <td className="py-2 max-w-sm text-slate-700">{a.accion_mejora}</td>
                <td className="py-2 text-slate-600">
                  {a.responsable?.apellido_y_nombre ?? "—"}
                </td>
                <td className="py-2 text-slate-600">{a.fecha_compromiso ?? "—"}</td>
                <td className="py-2">
                  <select
                    value={a.estado}
                    disabled={isPending}
                    onChange={(e) =>
                      handleCambiarEstadoAccion(
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
                <td colSpan={4} className="py-6 text-center text-slate-400">
                  Todavía no hay acciones cargadas para este evento.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

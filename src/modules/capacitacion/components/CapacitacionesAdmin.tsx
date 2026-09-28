"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@core/ui/Badge";
import { Card } from "@core/ui/Card";
import type {
  CapacitacionNexo,
  EmpleadoNexo,
  NuevaCapacitacionPayload,
  SectorNexo,
  SeguimientoCapacitacionRow,
} from "../types";
import { CapacitacionForm } from "./CapacitacionForm";
import { SeguimientoCapacitacion } from "./SeguimientoCapacitacion";

interface CapacitacionesAdminProps {
  capacitaciones: CapacitacionNexo[];
  sectores: SectorNexo[];
  empleados: EmpleadoNexo[];
  esAdmin: boolean;
  onCrear: (payload: NuevaCapacitacionPayload) => Promise<{ error: string | null }>;
  onToggleActivo: (id: string, activoActual: boolean) => Promise<{ error: string | null }>;
  onArchivar: (id: string, archivado: boolean) => Promise<{ error: string | null }>;
  onEliminar: (id: string) => Promise<{ error: string | null }>;
  onObtenerSeguimiento: (
    capId: string
  ) => Promise<{ data: SeguimientoCapacitacionRow[] | null; error: string | null }>;
}

function periodicidadLabel(meses: number): string {
  if (meses === 1) return "Mensual";
  if (meses === 3) return "Trimestral";
  if (meses === 6) return "Semestral";
  return "Anual";
}

export function CapacitacionesAdmin({
  capacitaciones,
  sectores,
  empleados,
  esAdmin,
  onCrear,
  onToggleActivo,
  onArchivar,
  onEliminar,
  onObtenerSeguimiento,
}: CapacitacionesAdminProps) {
  const router = useRouter();
  const [chip, setChip] = useState<"activas" | "archivadas">("activas");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [abiertaId, setAbiertaId] = useState<string | null>(null);
  const [seguimientoPorCap, setSeguimientoPorCap] = useState<
    Record<string, SeguimientoCapacitacionRow[] | "cargando" | "error">
  >({});
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtradas = capacitaciones.filter((c) => (chip === "archivadas" ? c.archivado : !c.archivado));
  const cantArchivadas = capacitaciones.filter((c) => c.archivado).length;

  function handleCrear(payload: NuevaCapacitacionPayload) {
    startTransition(async () => {
      const resultado = await onCrear(payload);
      if (resultado.error) {
        setError(resultado.error);
        return;
      }
      setError(null);
      setMostrarForm(false);
      router.refresh();
    });
  }

  function handleToggleActivo(cap: CapacitacionNexo) {
    startTransition(async () => {
      const resultado = await onToggleActivo(cap.id, cap.activo);
      if (resultado.error) setError(resultado.error);
      router.refresh();
    });
  }

  function handleArchivar(cap: CapacitacionNexo) {
    startTransition(async () => {
      const resultado = await onArchivar(cap.id, !cap.archivado);
      if (resultado.error) setError(resultado.error);
      router.refresh();
    });
  }

  function handleEliminar(cap: CapacitacionNexo) {
    if (!confirm(`¿Eliminar "${cap.titulo}"? Se borran también sus asignaciones y progreso. No se puede deshacer.`))
      return;
    startTransition(async () => {
      const resultado = await onEliminar(cap.id);
      if (resultado.error) setError(resultado.error);
      router.refresh();
    });
  }

  function toggleSeguimiento(capId: string) {
    if (abiertaId === capId) {
      setAbiertaId(null);
      return;
    }
    setAbiertaId(capId);
    if (seguimientoPorCap[capId]) return;
    setSeguimientoPorCap((prev) => ({ ...prev, [capId]: "cargando" }));
    onObtenerSeguimiento(capId).then((resultado) => {
      setSeguimientoPorCap((prev) => ({
        ...prev,
        [capId]: resultado.data ?? "error",
      }));
    });
  }

  return (
    <div className="space-y-4">
      {!esAdmin ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Solo un admin puede crear, archivar o eliminar capacitaciones. Vos podés ver el listado y
          el seguimiento.
        </div>
      ) : null}

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2">
          {(["activas", "archivadas"] as const).map((c) => (
            <button
              key={c}
              onClick={() => setChip(c)}
              className={[
                "rounded-full px-4 py-1.5 text-xs font-semibold transition",
                chip === c
                  ? "bg-brand-accent text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200",
              ].join(" ")}
            >
              {c === "activas" ? "Activas" : `Archivadas${cantArchivadas > 0 ? ` (${cantArchivadas})` : ""}`}
            </button>
          ))}
        </div>

        {esAdmin && !mostrarForm ? (
          <button
            onClick={() => setMostrarForm(true)}
            className="rounded-md bg-brand-accent px-4 py-2 text-sm font-medium text-white hover:bg-brand-accent/90"
          >
            + Nueva capacitación
          </button>
        ) : null}
      </div>

      {mostrarForm ? (
        <CapacitacionForm
          sectores={sectores}
          empleados={empleados}
          onCrear={handleCrear}
          onCancelar={() => setMostrarForm(false)}
        />
      ) : null}

      {isPending ? <p className="text-sm text-slate-400">Guardando…</p> : null}

      {filtradas.length === 0 ? (
        <Card>
          <p className="py-10 text-center text-sm text-slate-400">
            {chip === "archivadas" ? "No hay capacitaciones archivadas." : "No hay capacitaciones creadas."}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtradas.map((cap) => {
            const seguimiento = seguimientoPorCap[cap.id];
            return (
              <Card key={cap.id}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="mb-2 text-[15px] font-semibold text-slate-800">{cap.titulo}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge>{cap.tipo}</Badge>
                      {cap.origen === "hys" ? <Badge variant="warning">H&S</Badge> : null}
                      {cap.tiene_quiz ? (
                        <Badge>Cuestionario {cap.puntaje_minimo}%</Badge>
                      ) : (
                        <Badge>Sin cuestionario</Badge>
                      )}
                      <Badge variant="warning">{cap.obligatoria_todos ? "Todos" : "Asignada"}</Badge>
                      {cap.periodicidad_meses ? (
                        <Badge>↺ {periodicidadLabel(cap.periodicidad_meses)}</Badge>
                      ) : null}
                      <Badge variant={cap.activo ? "success" : "danger"}>
                        {cap.activo ? "Activa" : "Inactiva"}
                      </Badge>
                    </div>
                    {cap.descripcion ? (
                      <p className="mt-1.5 text-xs text-slate-500">{cap.descripcion}</p>
                    ) : null}
                    {cap.codigo || cap.lugar ? (
                      <p className="mt-1 text-xs text-slate-400">
                        {cap.codigo ? `Código: ${cap.codigo}` : null}
                        {cap.codigo && cap.lugar ? " · " : null}
                        {cap.lugar ? `Lugar: ${cap.lugar}` : null}
                      </p>
                    ) : null}
                    {cap.fecha_limite ? (
                      <p className="mt-1 text-xs text-slate-400">
                        Fecha límite: {new Date(cap.fecha_limite).toLocaleDateString("es-AR")}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-shrink-0 flex-wrap items-center justify-end gap-2">
                    <button
                      onClick={() => toggleSeguimiento(cap.id)}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                    >
                      {abiertaId === cap.id ? "Ocultar seguimiento" : "Ver seguimiento"}
                    </button>
                    {esAdmin ? (
                      <>
                        {!cap.archivado ? (
                          <button
                            onClick={() => handleToggleActivo(cap)}
                            disabled={isPending}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                          >
                            {cap.activo ? "Desactivar" : "Activar"}
                          </button>
                        ) : null}
                        <button
                          onClick={() => handleArchivar(cap)}
                          disabled={isPending}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                        >
                          {cap.archivado ? "Restaurar" : "Archivar"}
                        </button>
                        <button
                          onClick={() => handleEliminar(cap)}
                          disabled={isPending}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 disabled:opacity-50"
                        >
                          Eliminar
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>

                {abiertaId === cap.id ? (
                  seguimiento === "cargando" ? (
                    <p className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-400">
                      Cargando seguimiento…
                    </p>
                  ) : seguimiento === "error" ? (
                    <p className="mt-4 border-t border-slate-100 pt-4 text-sm text-red-600">
                      No se pudo cargar el seguimiento.
                    </p>
                  ) : seguimiento ? (
                    <SeguimientoCapacitacion capacitacion={cap} filas={seguimiento} />
                  ) : null
                ) : null}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

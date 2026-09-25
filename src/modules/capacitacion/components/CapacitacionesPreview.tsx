"use client";

import { useState } from "react";
import { Badge } from "@core/ui/Badge";
import { Card } from "@core/ui/Card";
import { PROGRESO_EJEMPLO } from "../mockData";
import type {
  CapacitacionNexo,
  EmpleadoNexo,
  NuevaCapacitacionPayload,
  SectorNexo,
  SeguimientoCapacitacionRow,
} from "../types";
import { CapacitacionForm } from "./CapacitacionForm";
import { SeguimientoCapacitacion } from "./SeguimientoCapacitacion";

interface CapacitacionesPreviewProps {
  capacitacionesIniciales: CapacitacionNexo[];
  sectores: SectorNexo[];
  empleados: EmpleadoNexo[];
}

function periodicidadLabel(meses: number): string {
  if (meses === 1) return "Mensual";
  if (meses === 3) return "Trimestral";
  if (meses === 6) return "Semestral";
  return "Anual";
}

export function CapacitacionesPreview({
  capacitacionesIniciales,
  sectores,
  empleados,
}: CapacitacionesPreviewProps) {
  const [capacitaciones, setCapacitaciones] = useState(capacitacionesIniciales);
  const [chip, setChip] = useState<"activas" | "archivadas">("activas");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [abiertaId, setAbiertaId] = useState<string | null>(null);

  const filtradas = capacitaciones.filter((c) => (chip === "archivadas" ? c.archivado : !c.archivado));
  const cantArchivadas = capacitaciones.filter((c) => c.archivado).length;

  function handleCrear(payload: NuevaCapacitacionPayload) {
    const nueva: CapacitacionNexo = {
      id: `preview-${Date.now()}`,
      titulo: payload.titulo,
      descripcion: payload.descripcion || null,
      tipo: payload.tipo,
      contenido_url: payload.contenidoUrl,
      contenido_texto: payload.contenidoTexto,
      activo: true,
      archivado: false,
      obligatoria_todos: payload.asignacion === "todos",
      fecha_limite: payload.fechaLimite,
      periodicidad_meses: payload.periodicidadMeses,
      tiene_quiz: payload.tieneQuiz,
      puntaje_minimo: payload.tieneQuiz ? payload.puntajeMinimo : null,
      created_at: new Date().toISOString(),
      origen: "hys",
      codigo: payload.codigo,
      lugar: payload.lugar,
      duracion: payload.duracion,
      hora_inicio: payload.horaInicio,
      instructor_nombre: payload.instructorNombre,
      instructor_matricula: payload.instructorMatricula,
    };
    setCapacitaciones((prev) => [nueva, ...prev]);
    setMostrarForm(false);
  }

  function handleToggleActivo(id: string) {
    setCapacitaciones((prev) =>
      prev.map((c) => (c.id === id ? { ...c, activo: !c.activo } : c))
    );
  }

  function handleArchivar(id: string) {
    setCapacitaciones((prev) =>
      prev.map((c) => (c.id === id ? { ...c, archivado: !c.archivado } : c))
    );
  }

  function handleEliminar(id: string) {
    if (!confirm("¿Eliminar esta capacitación de la vista previa?")) return;
    setCapacitaciones((prev) => prev.filter((c) => c.id !== id));
    if (abiertaId === id) setAbiertaId(null);
  }

  function filasSeguimiento(capId: string): SeguimientoCapacitacionRow[] {
    const progresos = PROGRESO_EJEMPLO[capId] ?? [];
    const progMap = new Map(progresos.map((p) => [p.empleado_id, p]));
    return empleados.map((empleado) => ({ empleado, progreso: progMap.get(empleado.id) ?? null }));
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <strong>Vista previa.</strong> Los sectores de la lista son los reales de Nexo RRHH; los
        empleados, las capacitaciones y el seguimiento son de ejemplo. Nada de esto se guarda
        todavía — falta conectar la escritura real a Nexo RRHH (
        <code>NEXO_RRHH_CIMOMET_SERVICE_ROLE_KEY</code>). Las constancias en PDF sí son reales:
        probalas desde &ldquo;Ver seguimiento&rdquo; en la capacitación con cuestionario.
      </div>

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

        {!mostrarForm ? (
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

      {filtradas.length === 0 ? (
        <Card>
          <p className="py-10 text-center text-sm text-slate-400">
            {chip === "archivadas" ? "No hay capacitaciones archivadas." : "No hay capacitaciones creadas."}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtradas.map((cap) => (
            <Card key={cap.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="mb-2 text-[15px] font-semibold text-slate-800">{cap.titulo}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>{cap.tipo}</Badge>
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
                    onClick={() => setAbiertaId((prev) => (prev === cap.id ? null : cap.id))}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                  >
                    {abiertaId === cap.id ? "Ocultar seguimiento" : "Ver seguimiento"}
                  </button>
                  {!cap.archivado ? (
                    <button
                      onClick={() => handleToggleActivo(cap.id)}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                    >
                      {cap.activo ? "Desactivar" : "Activar"}
                    </button>
                  ) : null}
                  <button
                    onClick={() => handleArchivar(cap.id)}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                  >
                    {cap.archivado ? "Restaurar" : "Archivar"}
                  </button>
                  <button
                    onClick={() => handleEliminar(cap.id)}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50"
                  >
                    Eliminar
                  </button>
                </div>
              </div>

              {abiertaId === cap.id ? (
                <SeguimientoCapacitacion capacitacion={cap} filas={filasSeguimiento(cap.id)} />
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

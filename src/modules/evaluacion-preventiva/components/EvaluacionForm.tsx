"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { EmpleadoActivo } from "@core/rrhh/types";
import { ASPECTOS_EVALUACION } from "../constants";
import { formatearPeriodo, periodoAClave } from "../periodo";
import type { PeriodoDisponible } from "../types";
import {
  AspectoRatingInput,
  type AspectoRatingValue,
} from "./AspectoRatingInput";

interface EvaluacionFormProps {
  periodos: PeriodoDisponible[];
  empleadosIniciales: EmpleadoActivo[];
  onObtenerPendientes: (mes: number, anio: number) => Promise<EmpleadoActivo[]>;
  onSubmit: (payload: {
    empleado_id: string;
    fecha_evaluacion: string;
    mes: number;
    anio: number;
    detalles: Array<{
      aspecto_id: number;
      puntaje: number | null;
      no_aplica: boolean;
      desvio_gestion: boolean;
      observaciones: string | null;
    }>;
  }) => Promise<{ error: string | null }>;
}

function valorInicial(): Record<number, AspectoRatingValue> {
  return Object.fromEntries(
    ASPECTOS_EVALUACION.map((aspecto) => [
      aspecto.id,
      {
        puntaje: null,
        no_aplica: false,
        desvio_gestion: false,
        observaciones: "",
      } satisfies AspectoRatingValue,
    ])
  );
}

export function EvaluacionForm({
  periodos,
  empleadosIniciales,
  onObtenerPendientes,
  onSubmit,
}: EvaluacionFormProps) {
  const router = useRouter();
  const [periodoClave, setPeriodoClave] = useState(() =>
    periodos[0] ? periodoAClave(periodos[0]) : ""
  );
  const [empleados, setEmpleados] = useState(empleadosIniciales);
  const [empleadoId, setEmpleadoId] = useState("");
  const [valores, setValores] = useState(valorInicial);
  const [isPending, startTransition] = useTransition();
  const [cargandoEmpleados, setCargandoEmpleados] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const periodoSeleccionado = periodos.find((p) => periodoAClave(p) === periodoClave);

  function handleCambiarPeriodo(clave: string) {
    setPeriodoClave(clave);
    setEmpleadoId("");
    const periodo = periodos.find((p) => periodoAClave(p) === clave);
    if (!periodo) {
      setEmpleados([]);
      return;
    }

    setCargandoEmpleados(true);
    startTransition(async () => {
      const pendientes = await onObtenerPendientes(periodo.mes, periodo.anio);
      setEmpleados(pendientes);
      setCargandoEmpleados(false);
    });
  }

  const puedeGuardar =
    empleadoId !== "" &&
    periodoSeleccionado !== undefined &&
    ASPECTOS_EVALUACION.every((aspecto) => {
      const v = valores[aspecto.id]!;
      return v.no_aplica || v.puntaje !== null;
    });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!periodoSeleccionado) return;

    startTransition(async () => {
      const resultado = await onSubmit({
        empleado_id: empleadoId,
        fecha_evaluacion: new Date().toISOString().slice(0, 10),
        mes: periodoSeleccionado.mes,
        anio: periodoSeleccionado.anio,
        detalles: ASPECTOS_EVALUACION.map((aspecto) => {
          const v = valores[aspecto.id]!;
          return {
            aspecto_id: aspecto.id,
            puntaje: v.puntaje,
            no_aplica: v.no_aplica,
            desvio_gestion: v.desvio_gestion,
            observaciones: v.observaciones || null,
          };
        }),
      });

      if (resultado.error) {
        setError(resultado.error);
        return;
      }

      router.push("/evaluacion-preventiva/evaluaciones");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Período (mes evaluado)
          </label>
          <select
            value={periodoClave}
            onChange={(e) => handleCambiarPeriodo(e.target.value)}
            required
            className="w-full rounded-md border border-slate-300 p-2 text-sm"
          >
            {periodos.map((periodo) => {
              const clave = periodoAClave(periodo);
              return (
                <option key={clave} value={clave}>
                  {formatearPeriodo(periodo)} ({periodo.pendientes} pendientes)
                </option>
              );
            })}
          </select>
          <p className="mt-1 text-xs text-slate-400">
            Solo se pueden elegir meses ya vencidos con empleados sin evaluar. Un
            período desaparece de esta lista en cuanto se evalúa a todo el personal activo.
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Empleado
          </label>
          <select
            value={empleadoId}
            onChange={(e) => setEmpleadoId(e.target.value)}
            required
            disabled={cargandoEmpleados || empleados.length === 0}
            className="w-full rounded-md border border-slate-300 p-2 text-sm disabled:bg-slate-50 disabled:text-slate-400"
          >
            <option value="" disabled>
              {cargandoEmpleados
                ? "Cargando pendientes…"
                : empleados.length === 0
                  ? "Nadie pendiente en este período"
                  : "Seleccionar empleado…"}
            </option>
            {empleados.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.apellido_y_nombre} — {emp.desc_puesto}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {ASPECTOS_EVALUACION.map((aspecto) => (
          <AspectoRatingInput
            key={aspecto.id}
            aspecto={aspecto}
            value={valores[aspecto.id]!}
            onChange={(value) =>
              setValores((prev) => ({ ...prev, [aspecto.id]: value }))
            }
          />
        ))}
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={!puedeGuardar || isPending}
        className="rounded-md bg-brand-accent px-4 py-2 text-sm font-medium text-white hover:bg-brand-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Guardando…" : "Guardar evaluación"}
      </button>
    </form>
  );
}

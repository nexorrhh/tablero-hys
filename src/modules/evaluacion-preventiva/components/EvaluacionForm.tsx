"use client";

import { useState, useTransition } from "react";
import type { EmpleadoActivo } from "@core/rrhh/types";
import { ASPECTOS_EVALUACION } from "../constants";
import {
  AspectoRatingInput,
  type AspectoRatingValue,
} from "./AspectoRatingInput";

interface EvaluacionFormProps {
  empleados: EmpleadoActivo[];
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
  }) => Promise<void>;
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

export function EvaluacionForm({ empleados, onSubmit }: EvaluacionFormProps) {
  const [empleadoId, setEmpleadoId] = useState("");
  const [fecha, setFecha] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [valores, setValores] = useState(valorInicial);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const puedeGuardar =
    empleadoId !== "" &&
    ASPECTOS_EVALUACION.every((aspecto) => {
      const v = valores[aspecto.id]!;
      return v.no_aplica || v.puntaje !== null;
    });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const fechaEvaluacion = new Date(fecha);

    startTransition(async () => {
      try {
        await onSubmit({
          empleado_id: empleadoId,
          fecha_evaluacion: fecha,
          mes: fechaEvaluacion.getMonth() + 1,
          anio: fechaEvaluacion.getFullYear(),
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
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al guardar la evaluación.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Empleado
          </label>
          <select
            value={empleadoId}
            onChange={(e) => setEmpleadoId(e.target.value)}
            required
            className="w-full rounded-md border border-slate-300 p-2 text-sm"
          >
            <option value="" disabled>
              Seleccionar empleado…
            </option>
            {empleados.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.apellido_y_nombre} — {emp.desc_puesto}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Fecha de evaluación
          </label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            required
            className="w-full rounded-md border border-slate-300 p-2 text-sm"
          />
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

"use client";

import { ESCALA_PUNTAJE, type AspectoEvaluacion } from "../constants";

export interface AspectoRatingValue {
  puntaje: number | null;
  no_aplica: boolean;
  desvio_gestion: boolean;
  observaciones: string;
}

interface AspectoRatingInputProps {
  aspecto: AspectoEvaluacion;
  value: AspectoRatingValue;
  onChange: (value: AspectoRatingValue) => void;
}

export function AspectoRatingInput({
  aspecto,
  value,
  onChange,
}: AspectoRatingInputProps) {
  const disabled = value.no_aplica;

  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-medium text-slate-800">
            {aspecto.id}. {aspecto.titulo}
          </p>
          <p className="text-sm text-slate-500">{aspecto.descripcion}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {ESCALA_PUNTAJE.map((opcion) => (
          <button
            key={opcion.valor}
            type="button"
            disabled={disabled}
            onClick={() => onChange({ ...value, puntaje: opcion.valor })}
            className={[
              "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
              value.puntaje === opcion.valor
                ? "border-brand-accent bg-brand-accent text-white"
                : "border-slate-300 text-slate-600 hover:border-brand-accent",
              disabled ? "cursor-not-allowed opacity-40" : "",
            ].join(" ")}
          >
            {opcion.valor} · {opcion.etiqueta}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={value.no_aplica}
            onChange={(e) =>
              onChange({
                ...value,
                no_aplica: e.target.checked,
                puntaje: e.target.checked ? null : value.puntaje,
                desvio_gestion: e.target.checked ? false : value.desvio_gestion,
              })
            }
          />
          No aplica
        </label>

        <label className="flex items-center gap-2 text-red-600">
          <input
            type="checkbox"
            checked={value.desvio_gestion}
            disabled={value.no_aplica}
            onChange={(e) =>
              onChange({ ...value, desvio_gestion: e.target.checked })
            }
          />
          Desvío de Gestión (no imputable al empleado)
        </label>
      </div>

      <textarea
        placeholder="Observaciones (opcional)"
        value={value.observaciones}
        onChange={(e) => onChange({ ...value, observaciones: e.target.value })}
        className="mt-3 w-full rounded-md border border-slate-300 p-2 text-sm"
        rows={2}
      />
    </div>
  );
}

"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { EmpleadoActivo } from "@core/rrhh/types";
import { CLASIFICACIONES_ACCIDENTE, TIPOS_EVENTO } from "../constants";
import type { Evento, FactorAccidente } from "../types";

interface EventoFormProps {
  empleados: EmpleadoActivo[];
  factores: FactorAccidente[];
  onSubmit: (formData: FormData) => Promise<{ error: string | null }>;
  /** Si se pasa, el formulario arranca precargado en modo edición. */
  eventoInicial?: Evento;
  /** A dónde navegar después de guardar. Por defecto, al listado. */
  destinoLuegoDeGuardar?: string;
  submitLabel?: string;
  onCancelar?: () => void;
}

export function EventoForm({
  empleados,
  factores,
  onSubmit,
  eventoInicial,
  destinoLuegoDeGuardar = "/eventos-hys/registro",
  submitLabel,
  onCancelar,
}: EventoFormProps) {
  const router = useRouter();
  const [tipo, setTipo] = useState<"accidente" | "incidente">(eventoInicial?.tipo ?? "accidente");
  const [empleadoId, setEmpleadoId] = useState(eventoInicial?.empleado_id ?? "");
  const [factorId, setFactorId] = useState(
    eventoInicial?.factor_id != null ? String(eventoInicial.factor_id) : ""
  );
  const [fecha, setFecha] = useState(
    eventoInicial?.fecha ?? (() => new Date().toISOString().slice(0, 10))()
  );
  const [descripcion, setDescripcion] = useState(eventoInicial?.descripcion ?? "");
  const [ubicacionEspecifica, setUbicacionEspecifica] = useState(
    eventoInicial?.ubicacion_especifica ?? ""
  );
  const [testigos, setTestigos] = useState(eventoInicial?.testigos ?? "");
  const [clasificacion, setClasificacion] = useState<"ART" | "particular">(
    (eventoInicial?.clasificacion as "ART" | "particular") ?? "ART"
  );
  const [nroSiniestroArt, setNroSiniestroArt] = useState(eventoInicial?.nro_siniestro_art ?? "");
  const [inItinere, setInItinere] = useState(eventoInicial?.in_itinere ?? false);
  const [derivadoAstrolaboral, setDerivadoAstrolaboral] = useState(
    eventoInicial?.derivado_astrolaboral ?? false
  );
  const [diasPerdidos, setDiasPerdidos] = useState(eventoInicial?.dias_perdidos ?? 0);
  const [informe, setInforme] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const esAccidente = tipo === "accidente";
  const esEdicion = Boolean(eventoInicial);

  const sector = useMemo(
    () => empleados.find((e) => e.id === empleadoId)?.desc_puesto ?? null,
    [empleados, empleadoId]
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.set("tipo", tipo);
    formData.set("empleado_id", empleadoId ?? "");
    formData.set("factor_id", esAccidente ? factorId : "");
    formData.set("fecha", fecha);
    formData.set("descripcion", descripcion);
    formData.set("ubicacion_especifica", ubicacionEspecifica);
    formData.set("testigos", testigos);
    formData.set("clasificacion", esAccidente ? clasificacion : "");
    formData.set(
      "nro_siniestro_art",
      esAccidente && clasificacion === "ART" ? nroSiniestroArt : ""
    );
    formData.set("in_itinere", esAccidente && inItinere ? "true" : "false");
    formData.set(
      "derivado_astrolaboral",
      esAccidente && derivadoAstrolaboral ? "true" : "false"
    );
    formData.set("dias_perdidos", esAccidente ? String(diasPerdidos) : "0");
    if (informe) formData.set("informe", informe);

    startTransition(async () => {
      const resultado = await onSubmit(formData);

      if (resultado.error) {
        setError(resultado.error);
        return;
      }

      if (esEdicion) {
        router.refresh();
        onCancelar?.();
      } else {
        router.push(destinoLuegoDeGuardar);
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Tipo</label>
          <div className="flex gap-2">
            {TIPOS_EVENTO.map((t) => (
              <button
                key={t.valor}
                type="button"
                onClick={() => setTipo(t.valor)}
                className={[
                  "flex-1 rounded-md border px-3 py-2 text-sm font-medium",
                  tipo === t.valor
                    ? "border-brand-accent bg-brand-accent text-white"
                    : "border-slate-300 text-slate-600 hover:border-brand-accent",
                ].join(" ")}
              >
                {t.etiqueta}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Fecha
          </label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            required
            className="w-full rounded-md border border-slate-300 p-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Empleado {esAccidente ? "(afectado)" : "(opcional)"}
          </label>
          <select
            value={empleadoId ?? ""}
            onChange={(e) => setEmpleadoId(e.target.value)}
            required={esAccidente}
            className="w-full rounded-md border border-slate-300 p-2 text-sm"
          >
            <option value="">— Seleccionar —</option>
            {empleados.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.apellido_y_nombre} — {emp.desc_puesto}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Sector
          </label>
          <p className="rounded-md border border-slate-200 bg-slate-50 p-2 text-sm text-slate-600">
            {sector ?? "Se completa solo al elegir el empleado"}
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Ubicación específica{" "}
            <span className="font-normal text-slate-400">— opcional</span>
          </label>
          <input
            type="text"
            value={ubicacionEspecifica}
            onChange={(e) => setUbicacionEspecifica(e.target.value)}
            placeholder="Ej: cerca de la prensa 3"
            className="w-full rounded-md border border-slate-300 p-2 text-sm"
          />
        </div>

        {esAccidente ? (
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Factor (parte del cuerpo / tipo de lesión)
            </label>
            <select
              value={factorId}
              onChange={(e) => setFactorId(e.target.value)}
              className="w-full rounded-md border border-slate-300 p-2 text-sm"
            >
              <option value="">— Sin especificar —</option>
              {factores.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nombre}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Descripción
        </label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          required
          rows={3}
          className="w-full rounded-md border border-slate-300 p-2 text-sm"
          placeholder="Qué pasó, cómo, dónde..."
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Testigos{" "}
          <span className="font-normal text-slate-400">— opcional</span>
        </label>
        <input
          type="text"
          value={testigos}
          onChange={(e) => setTestigos(e.target.value)}
          placeholder="Nombres de quienes presenciaron el evento"
          className="w-full rounded-md border border-slate-300 p-2 text-sm"
        />
      </div>

      {esAccidente ? (
        <div className="rounded-lg border border-slate-200 p-4">
          <p className="mb-3 text-sm font-medium text-slate-700">Datos del accidente</p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm text-slate-600">Clasificación</label>
              <select
                value={clasificacion}
                onChange={(e) => setClasificacion(e.target.value as "ART" | "particular")}
                className="w-full rounded-md border border-slate-300 p-2 text-sm"
              >
                {CLASIFICACIONES_ACCIDENTE.map((c) => (
                  <option key={c.valor} value={c.valor}>
                    {c.etiqueta}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm text-slate-600">Días perdidos</label>
              <input
                type="number"
                min={0}
                value={diasPerdidos}
                onChange={(e) => setDiasPerdidos(Number(e.target.value))}
                className="w-full rounded-md border border-slate-300 p-2 text-sm"
              />
            </div>

            {clasificacion === "ART" ? (
              <div>
                <label className="mb-1 block text-sm text-slate-600">
                  N° de siniestro ART
                </label>
                <input
                  type="text"
                  value={nroSiniestroArt}
                  onChange={(e) => setNroSiniestroArt(e.target.value)}
                  className="w-full rounded-md border border-slate-300 p-2 text-sm"
                />
              </div>
            ) : null}

            <div className="flex flex-col justify-end gap-2">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={inItinere}
                  onChange={(e) => setInItinere(e.target.checked)}
                />
                In itinere
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={derivadoAstrolaboral}
                  onChange={(e) => setDerivadoAstrolaboral(e.target.checked)}
                />
                Derivado a Astrolaboral
              </label>
            </div>
          </div>
        </div>
      ) : null}

      {!esEdicion ? (
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Informe / investigación adjunta{" "}
            <span className="font-normal text-slate-400">— opcional</span>
          </label>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.png"
            onChange={(e) => setInforme(e.target.files?.[0] ?? null)}
            className="w-full text-sm"
          />
        </div>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-brand-accent px-4 py-2 text-sm font-medium text-white hover:bg-brand-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Guardando…" : submitLabel ?? (esEdicion ? "Guardar cambios" : "Guardar evento")}
        </button>
        {onCancelar ? (
          <button
            type="button"
            onClick={onCancelar}
            className="text-sm text-slate-400 hover:text-slate-600"
          >
            Cancelar
          </button>
        ) : null}
      </div>
    </form>
  );
}

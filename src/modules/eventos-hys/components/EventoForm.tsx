"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { EmpleadoActivo } from "@core/rrhh/types";
import { CLASIFICACIONES_ACCIDENTE, TIPOS_EVENTO } from "../constants";
import type { FactorAccidente, Sector } from "../types";

interface EventoFormProps {
  empleados: EmpleadoActivo[];
  sectores: Sector[];
  factores: FactorAccidente[];
  onSubmit: (formData: FormData) => Promise<{ error: string | null }>;
  onCrearSector: (nombre: string) => Promise<{ error: string | null; sector?: Sector }>;
}

export function EventoForm({
  empleados,
  sectores: sectoresIniciales,
  factores,
  onSubmit,
  onCrearSector,
}: EventoFormProps) {
  const router = useRouter();
  const [tipo, setTipo] = useState<"accidente" | "incidente">("accidente");
  const [empleadoId, setEmpleadoId] = useState("");
  const [sectores, setSectores] = useState(sectoresIniciales);
  const [sectorId, setSectorId] = useState("");
  const [factorId, setFactorId] = useState("");
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [descripcion, setDescripcion] = useState("");
  const [clasificacion, setClasificacion] = useState<"ART" | "particular">("ART");
  const [inItinere, setInItinere] = useState(false);
  const [derivadoAstrolaboral, setDerivadoAstrolaboral] = useState(false);
  const [diasPerdidos, setDiasPerdidos] = useState(0);
  const [informe, setInforme] = useState<File | null>(null);
  const [nuevoSector, setNuevoSector] = useState("");
  const [mostrarNuevoSector, setMostrarNuevoSector] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const esAccidente = tipo === "accidente";

  function handleAgregarSector() {
    if (!nuevoSector.trim()) return;
    startTransition(async () => {
      const resultado = await onCrearSector(nuevoSector.trim());
      if (resultado.error || !resultado.sector) {
        setError(resultado.error ?? "No se pudo crear el sector.");
        return;
      }
      setSectores((prev) => [...prev, resultado.sector!].sort((a, b) => a.nombre.localeCompare(b.nombre)));
      setSectorId(String(resultado.sector.id));
      setNuevoSector("");
      setMostrarNuevoSector(false);
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.set("tipo", tipo);
    formData.set("empleado_id", empleadoId);
    formData.set("sector_id", sectorId);
    formData.set("factor_id", esAccidente ? factorId : "");
    formData.set("fecha", fecha);
    formData.set("descripcion", descripcion);
    formData.set("clasificacion", esAccidente ? clasificacion : "");
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

      router.push("/eventos-hys/registro");
      router.refresh();
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
            value={empleadoId}
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
          <label className="mb-1 block text-sm font-medium text-slate-700">Sector</label>
          <div className="flex gap-2">
            <select
              value={sectorId}
              onChange={(e) => setSectorId(e.target.value)}
              className="w-full rounded-md border border-slate-300 p-2 text-sm"
            >
              <option value="">— Sin especificar —</option>
              {sectores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setMostrarNuevoSector((v) => !v)}
              className="whitespace-nowrap rounded-md border border-slate-300 px-3 text-sm text-slate-600 hover:border-brand-accent"
            >
              + Nuevo
            </button>
          </div>
          {mostrarNuevoSector ? (
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={nuevoSector}
                onChange={(e) => setNuevoSector(e.target.value)}
                placeholder="Nombre del sector"
                className="w-full rounded-md border border-slate-300 p-2 text-sm"
              />
              <button
                type="button"
                onClick={handleAgregarSector}
                disabled={isPending}
                className="whitespace-nowrap rounded-md bg-brand-accent px-3 text-sm font-medium text-white"
              >
                Agregar
              </button>
            </div>
          ) : null}
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

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-brand-accent px-4 py-2 text-sm font-medium text-white hover:bg-brand-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Guardando…" : "Guardar evento"}
      </button>
    </form>
  );
}

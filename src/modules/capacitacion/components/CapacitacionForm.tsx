"use client";

import { useState } from "react";
import { PERIODICIDADES, TIPOS_ASIGNACION, TIPOS_CONTENIDO } from "../constants";
import type {
  EmpleadoNexo,
  NuevaCapacitacionPayload,
  SectorNexo,
  TipoAsignacion,
  TipoContenido,
} from "../types";
import { PreguntaBuilder, type PreguntaState } from "./PreguntaBuilder";

interface CapacitacionFormProps {
  sectores: SectorNexo[];
  empleados: EmpleadoNexo[];
  onCrear: (payload: NuevaCapacitacionPayload) => void;
  onCancelar: () => void;
}

function preguntaVacia(): PreguntaState {
  return { texto: "", opciones: ["", ""], correctaIdx: 0 };
}

export function CapacitacionForm({ sectores, empleados, onCrear, onCancelar }: CapacitacionFormProps) {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipo, setTipo] = useState<TipoContenido>("texto");
  const [videoUrl, setVideoUrl] = useState("");
  const [texto, setTexto] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [asignacion, setAsignacion] = useState<TipoAsignacion>("todos");
  const [sectorIds, setSectorIds] = useState<string[]>([]);
  const [empleadoIds, setEmpleadoIds] = useState<string[]>([]);
  const [esReiterativa, setEsReiterativa] = useState(false);
  const [periodicidad, setPeriodicidad] = useState(12);
  const [fechaLimite, setFechaLimite] = useState("");
  const [tieneQuiz, setTieneQuiz] = useState(false);
  const [puntaje, setPuntaje] = useState(70);
  const [preguntas, setPreguntas] = useState<PreguntaState[]>([preguntaVacia()]);
  const [codigo, setCodigo] = useState("");
  const [lugar, setLugar] = useState("");
  const [duracion, setDuracion] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [instructorNombre, setInstructorNombre] = useState("");
  const [instructorMatricula, setInstructorMatricula] = useState("");
  const [error, setError] = useState<string | null>(null);

  function toggleId(lista: string[], id: string): string[] {
    return lista.includes(id) ? lista.filter((x) => x !== id) : [...lista, id];
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo.trim()) {
      setError("El título es obligatorio.");
      return;
    }
    setError(null);

    onCrear({
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      tipo,
      contenidoUrl: tipo === "video" ? videoUrl.trim() || null : tipo === "pdf" && pdfFile ? pdfFile.name : null,
      contenidoTexto: tipo === "texto" ? texto.trim() || null : null,
      tieneQuiz,
      puntajeMinimo: puntaje,
      asignacion,
      periodicidadMeses: esReiterativa ? periodicidad : null,
      fechaLimite: fechaLimite || null,
      sectorIds: asignacion === "sector" ? sectorIds : [],
      empleadoIds: asignacion === "individual" ? empleadoIds : [],
      codigo: codigo.trim() || null,
      lugar: lugar.trim() || null,
      duracion: duracion.trim() || null,
      horaInicio: horaInicio || null,
      instructorNombre: instructorNombre.trim() || null,
      instructorMatricula: instructorMatricula.trim() || null,
      preguntas: tieneQuiz
        ? preguntas
            .filter((p) => p.texto.trim())
            .map((p) => ({
              texto: p.texto.trim(),
              opciones: p.opciones
                .filter((o) => o.trim())
                .map((o, i) => ({ texto: o.trim(), esCorrecta: i === p.correctaIdx })),
            }))
        : [],
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-lg border border-slate-200 bg-white p-5">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Título *</label>
        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Ej: Inducción de seguridad e higiene"
          className="w-full rounded-md border border-slate-300 p-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Descripción</label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={2}
          placeholder="Descripción breve (opcional)"
          className="w-full rounded-md border border-slate-300 p-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Tipo de contenido</label>
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value as TipoContenido)}
          className="w-full rounded-md border border-slate-300 p-2 text-sm"
        >
          {TIPOS_CONTENIDO.map((t) => (
            <option key={t.valor} value={t.valor}>
              {t.etiqueta}
            </option>
          ))}
        </select>
      </div>

      {tipo === "pdf" ? (
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Archivo PDF</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm"
          />
        </div>
      ) : tipo === "video" ? (
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">URL del video</label>
          <input
            type="text"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full rounded-md border border-slate-300 p-2 text-sm"
          />
        </div>
      ) : (
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Contenido</label>
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            rows={5}
            placeholder="Escribí el contenido de la capacitación acá..."
            className="w-full rounded-md border border-slate-300 p-2 text-sm"
          />
        </div>
      )}

      <div className="rounded-lg border border-slate-200 p-4">
        <p className="mb-3 text-sm font-medium text-slate-700">
          Datos de la actividad{" "}
          <span className="font-normal text-slate-400">— para la constancia individual</span>
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-slate-600">Código</label>
            <input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Ej: S035"
              className="w-full rounded-md border border-slate-300 p-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-600">Lugar</label>
            <input
              type="text"
              value={lugar}
              onChange={(e) => setLugar(e.target.value)}
              placeholder="Ej: Planta Mosconi"
              className="w-full rounded-md border border-slate-300 p-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-600">Duración</label>
            <input
              type="text"
              value={duracion}
              onChange={(e) => setDuracion(e.target.value)}
              placeholder="Ej: 2 hs"
              className="w-full rounded-md border border-slate-300 p-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-600">Hora de inicio</label>
            <input
              type="time"
              value={horaInicio}
              onChange={(e) => setHoraInicio(e.target.value)}
              className="w-full rounded-md border border-slate-300 p-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-600">Instructor</label>
            <input
              type="text"
              value={instructorNombre}
              onChange={(e) => setInstructorNombre(e.target.value)}
              placeholder="Nombre del instructor"
              className="w-full rounded-md border border-slate-300 p-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-600">Matrícula del instructor</label>
            <input
              type="text"
              value={instructorMatricula}
              onChange={(e) => setInstructorMatricula(e.target.value)}
              placeholder="Ej: CPHSSO L2-10954-1"
              className="w-full rounded-md border border-slate-300 p-2 text-sm"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Asignación</label>
        <select
          value={asignacion}
          onChange={(e) => {
            setAsignacion(e.target.value as TipoAsignacion);
            setSectorIds([]);
            setEmpleadoIds([]);
          }}
          className="w-full rounded-md border border-slate-300 p-2 text-sm"
        >
          {TIPOS_ASIGNACION.map((a) => (
            <option key={a.valor} value={a.valor}>
              {a.etiqueta}
            </option>
          ))}
        </select>
      </div>

      {asignacion === "sector" ? (
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Sectores</label>
          <div className="max-h-36 overflow-y-auto rounded-md border border-slate-200">
            {sectores.map((s) => (
              <label key={s.id} className="flex items-center gap-3 border-b border-slate-50 px-3 py-2 last:border-0 hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={sectorIds.includes(s.id)}
                  onChange={() => setSectorIds((prev) => toggleId(prev, s.id))}
                />
                <span className="text-sm text-slate-700">{s.nombre}</span>
              </label>
            ))}
            {sectores.length === 0 ? (
              <p className="px-3 py-3 text-sm text-slate-400">No hay sectores.</p>
            ) : null}
          </div>
        </div>
      ) : null}

      {asignacion === "individual" ? (
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Empleados</label>
          <div className="max-h-40 overflow-y-auto rounded-md border border-slate-200">
            {empleados.map((e) => (
              <label key={e.id} className="flex items-center gap-3 border-b border-slate-50 px-3 py-2 last:border-0 hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={empleadoIds.includes(e.id)}
                  onChange={() => setEmpleadoIds((prev) => toggleId(prev, e.id))}
                />
                <span className="flex-1 text-sm text-slate-700">
                  {e.apellido}, {e.nombre}
                </span>
                <span className="font-mono text-xs text-slate-400">{e.legajo}</span>
              </label>
            ))}
          </div>
        </div>
      ) : null}

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" checked={esReiterativa} onChange={(e) => setEsReiterativa(e.target.checked)} />
        Capacitación reiterativa (se vence y debe renovarse)
      </label>

      {esReiterativa ? (
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Periodicidad</label>
          <select
            value={periodicidad}
            onChange={(e) => setPeriodicidad(Number(e.target.value))}
            className="w-full rounded-md border border-slate-300 p-2 text-sm"
          >
            {PERIODICIDADES.map((p) => (
              <option key={p.valor} value={p.valor}>
                {p.etiqueta}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Fecha límite (opcional)</label>
        <input
          type="date"
          value={fechaLimite}
          onChange={(e) => setFechaLimite(e.target.value)}
          className="w-full rounded-md border border-slate-300 p-2 text-sm"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" checked={tieneQuiz} onChange={(e) => setTieneQuiz(e.target.checked)} />
        Incluir cuestionario
      </label>

      {tieneQuiz ? (
        <>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Puntaje mínimo aprobatorio (%)
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={puntaje}
              onChange={(e) => setPuntaje(Number(e.target.value))}
              className="w-full rounded-md border border-slate-300 p-2 text-sm"
            />
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-700">Preguntas</p>
            {preguntas.map((p, i) => (
              <PreguntaBuilder
                key={i}
                index={i}
                pregunta={p}
                onChange={(actualizada) =>
                  setPreguntas((prev) => prev.map((x, j) => (j === i ? actualizada : x)))
                }
                onRemove={() => setPreguntas((prev) => prev.filter((_, j) => j !== i))}
              />
            ))}
            <button
              type="button"
              onClick={() => setPreguntas((prev) => [...prev, preguntaVacia()])}
              className="rounded-md border border-brand-accent/30 px-4 py-2 text-sm font-medium text-brand-accent hover:bg-brand-accent/5"
            >
              + Agregar pregunta
            </button>
          </div>
        </>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="rounded-md bg-brand-accent px-4 py-2 text-sm font-medium text-white hover:bg-brand-accent/90"
        >
          Crear capacitación
        </button>
        <button type="button" onClick={onCancelar} className="text-sm text-slate-400 hover:text-slate-600">
          Cancelar
        </button>
      </div>
    </form>
  );
}

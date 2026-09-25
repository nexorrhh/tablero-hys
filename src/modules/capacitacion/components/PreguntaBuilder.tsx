"use client";

export interface PreguntaState {
  texto: string;
  opciones: string[];
  correctaIdx: number;
}

interface PreguntaBuilderProps {
  index: number;
  pregunta: PreguntaState;
  onChange: (pregunta: PreguntaState) => void;
  onRemove: () => void;
}

/** Constructor de una pregunta del cuestionario, con radio para marcar la opción correcta. */
export function PreguntaBuilder({ index, pregunta, onChange, onRemove }: PreguntaBuilderProps) {
  function setTexto(texto: string) {
    onChange({ ...pregunta, texto });
  }

  function setOpcionTexto(i: number, texto: string) {
    const opciones = pregunta.opciones.map((o, j) => (j === i ? texto : o));
    onChange({ ...pregunta, opciones });
  }

  function setCorrecta(i: number) {
    onChange({ ...pregunta, correctaIdx: i });
  }

  function addOpcion() {
    onChange({ ...pregunta, opciones: [...pregunta.opciones, ""] });
  }

  function removeOpcion(i: number) {
    const opciones = pregunta.opciones.filter((_, j) => j !== i);
    const correctaIdx = pregunta.correctaIdx >= opciones.length ? opciones.length - 1 : pregunta.correctaIdx;
    onChange({ ...pregunta, opciones, correctaIdx: Math.max(0, correctaIdx) });
  }

  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <div className="mb-2 flex items-start justify-between">
        <span className="text-xs font-semibold text-slate-500">Pregunta {index + 1}</span>
        <button type="button" onClick={onRemove} className="text-xs text-red-500 hover:text-red-700">
          Eliminar
        </button>
      </div>

      <input
        type="text"
        placeholder="Texto de la pregunta"
        value={pregunta.texto}
        onChange={(e) => setTexto(e.target.value)}
        className="mb-3 w-full rounded-md border border-slate-300 p-2 text-sm"
      />

      <p className="mb-1.5 text-xs text-slate-500">Opciones — marcá la correcta con el radio</p>
      <div className="space-y-1.5">
        {pregunta.opciones.map((texto, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="radio"
              name={`correcta-pregunta-${index}`}
              checked={pregunta.correctaIdx === i}
              onChange={() => setCorrecta(i)}
            />
            <input
              type="text"
              placeholder={`Opción ${i + 1}`}
              value={texto}
              onChange={(e) => setOpcionTexto(i, e.target.value)}
              className="flex-1 rounded-md border border-slate-300 p-1.5 text-sm"
            />
            {pregunta.opciones.length > 2 ? (
              <button
                type="button"
                onClick={() => removeOpcion(i)}
                className="text-xs text-slate-400 hover:text-red-500"
              >
                ✕
              </button>
            ) : null}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addOpcion}
        className="mt-2 text-xs font-medium text-brand-accent hover:underline"
      >
        + Agregar opción
      </button>
    </div>
  );
}

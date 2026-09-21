"use client";

interface PinPadProps {
  value: string;
  maxLength: number;
  disabled?: boolean;
  onChange: (value: string) => void;
}

const TECLAS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];

export function PinPad({ value, maxLength, disabled, onChange }: PinPadProps) {
  function handleTecla(tecla: string) {
    if (disabled) return;

    if (tecla === "⌫") {
      onChange(value.slice(0, -1));
      return;
    }
    if (tecla === "" || value.length >= maxLength) return;
    onChange(value + tecla);
  }

  return (
    <div>
      <div className="mb-6 flex justify-center gap-3">
        {Array.from({ length: maxLength }).map((_, i) => (
          <span
            key={i}
            className={[
              "h-4 w-4 rounded-full border-2 border-brand-accent",
              i < value.length ? "bg-brand-accent" : "bg-transparent",
            ].join(" ")}
          />
        ))}
      </div>

      <div className="mx-auto grid max-w-xs grid-cols-3 gap-3">
        {TECLAS.map((tecla, i) =>
          tecla === "" ? (
            <span key={i} />
          ) : (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => handleTecla(tecla)}
              className="rounded-lg border border-slate-200 bg-white py-4 text-xl font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              {tecla}
            </button>
          )
        )}
      </div>
    </div>
  );
}

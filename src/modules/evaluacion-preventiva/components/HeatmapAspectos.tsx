import type { MapaCalorAspecto } from "../services/reportes.service";

/**
 * Rampa secuencial de un solo tono (azul), pasos 100→700, de la paleta
 * validada del proyecto (ver skill de dataviz). Claro = baja necesidad de
 * atención, oscuro = alta necesidad de atención (capacitación prioritaria).
 */
const RAMPA_SECUENCIAL = [
  "#cde2fb", // 100
  "#9ec5f4", // 200
  "#6da7ec", // 300
  "#3987e5", // 400
  "#256abf", // 500
  "#184f95", // 600
  "#0d366b", // 700
];

function colorParaPromedio(promedio: number | null): {
  bg: string;
  fg: string;
} {
  if (promedio === null) {
    return { bg: "#f3f2ef", fg: "#898781" };
  }

  // Magnitud graficada = necesidad de atención = inverso del promedio (1..5 -> 0..1).
  const necesidad = Math.min(1, Math.max(0, (5 - promedio) / 4));
  const index = Math.round(necesidad * (RAMPA_SECUENCIAL.length - 1));
  const bg = RAMPA_SECUENCIAL[index]!;
  const fg = index >= 3 ? "#ffffff" : "#0b0b0b";
  return { bg, fg };
}

interface HeatmapAspectosProps {
  data: MapaCalorAspecto[];
}

export function HeatmapAspectos({ data }: HeatmapAspectosProps) {
  return (
    <div>
      <ul className="space-y-2" role="table" aria-label="Mapa de calor por aspecto evaluado">
        {data.map((fila) => {
          const { bg, fg } = colorParaPromedio(fila.promedio);
          return (
            <li
              key={fila.aspecto_id}
              role="row"
              className="flex items-center gap-3"
            >
              <span className="w-72 shrink-0 text-sm text-slate-700" role="cell">
                {fila.aspecto_id}. {fila.titulo}
              </span>
              <div
                role="cell"
                className="flex h-9 flex-1 items-center justify-between rounded-md px-3 text-sm font-semibold"
                style={{ backgroundColor: bg, color: fg }}
                title={
                  fila.promedio === null
                    ? "Sin evaluaciones en el período"
                    : `Promedio ${fila.promedio} (${fila.cantidad_evaluaciones} evaluaciones)`
                }
              >
                <span>{fila.promedio ?? "Sin datos"}</span>
                <span className="text-xs font-normal opacity-90">
                  {fila.cantidad_evaluaciones} eval.
                </span>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
        <span>Buen desempeño</span>
        <div className="flex h-3 flex-1 overflow-hidden rounded-full">
          {RAMPA_SECUENCIAL.map((hex) => (
            <span key={hex} className="flex-1" style={{ backgroundColor: hex }} />
          ))}
        </div>
        <span>Requiere capacitación</span>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import type { EvolucionAnual } from "../services/reportes-eventos.service";

/** Paleta categórica validada del proyecto (ver skill de dataviz): orden fijo, nunca ciclado. */
const COLOR_ART = "#2a78d6"; // slot 1 · azul
const COLOR_ASTRO = "#eb6834"; // slot 2 · naranja
const COLOR_DIAS = "#1baf7a"; // slot 3 · aqua
const COLOR_GRID = "#e1e0d9";
const COLOR_MUTED = "#898781";
const COLOR_INK = "#0b0b0b";
const COLOR_SECONDARY = "#52514e";

interface EvolucionAnualChartProps {
  data: EvolucionAnual[];
}

const W = 640;
const PAD_L = 34;
const PAD_R = 8;
const H_ACC = 200;
const H_DIAS = 90;
const LABEL_H = 22;
const GAP_ENTRE_CHARTS = 20;
const LEGEND_H = 24;

export function EvolucionAnualChart({ data }: EvolucionAnualChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (data.length === 0) {
    return <p className="text-sm text-slate-400">Todavía no hay datos cargados.</p>;
  }

  const n = data.length;
  const plotW = W - PAD_L - PAD_R;
  const slot = plotW / n;
  const barW = Math.min(44, slot * 0.55);

  const maxAcc = Math.max(1, ...data.map((d) => d.accidentes_art + d.accidentes_particular));
  const niceMaxAcc = Math.max(5, Math.ceil(maxAcc / 5) * 5);

  const maxDias = Math.max(1, ...data.map((d) => d.dias_perdidos));
  const niceMaxDias = Math.max(10, Math.ceil(maxDias / 10) * 10);

  const accChartTop = LEGEND_H;
  const accChartBottom = accChartTop + H_ACC;
  const xLabelsY = accChartBottom + LABEL_H;
  const diasChartTop = xLabelsY + GAP_ENTRE_CHARTS;
  const diasChartBottom = diasChartTop + H_DIAS;
  const totalHeight = diasChartBottom + LABEL_H + 8;

  const gridStepsAcc = [0, 0.25, 0.5, 0.75, 1];
  const gridStepsDias = [0, 0.5, 1];

  return (
    <div>
      <div className="mb-2 flex items-center gap-4 text-xs text-slate-600">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: COLOR_ART }} />
          ART
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: COLOR_ASTRO }} />
          ASTRO laboral (fuera de ART)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: COLOR_DIAS }} />
          Días caídos
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${totalHeight}`} className="w-full" role="img" aria-label="Evolución anual de accidentes y días caídos">
        <text x={0} y={accChartTop - 8} fontSize={11} fill={COLOR_SECONDARY}>
          Cantidad de accidentes
        </text>

        {gridStepsAcc.map((f) => {
          const y = accChartTop + H_ACC - f * H_ACC;
          return (
            <g key={f}>
              <line x1={PAD_L} x2={W - PAD_R} y1={y} y2={y} stroke={COLOR_GRID} strokeWidth={1} />
              <text x={0} y={y + 3} fontSize={9} fill={COLOR_MUTED}>
                {Math.round(f * niceMaxAcc)}
              </text>
            </g>
          );
        })}

        {data.map((d, i) => {
          const x = PAD_L + i * slot + (slot - barW) / 2;
          const hArt = (d.accidentes_art / niceMaxAcc) * H_ACC;
          const hAstro = (d.accidentes_particular / niceMaxAcc) * H_ACC;
          const total = d.accidentes_art + d.accidentes_particular;
          const isHover = hoverIndex === i;

          return (
            <g
              key={d.anio}
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
              style={{ cursor: "pointer" }}
            >
              {/* Hit target más grande que la barra, para el hover. */}
              <rect
                x={PAD_L + i * slot}
                y={accChartTop}
                width={slot}
                height={H_ACC}
                fill="transparent"
              />

              <rect
                x={x}
                y={accChartTop + H_ACC - hArt}
                width={barW}
                height={hArt}
                fill={COLOR_ART}
                opacity={isHover ? 1 : 0.92}
                rx={2}
              />
              <rect
                x={x}
                y={accChartTop + H_ACC - hArt - hAstro - (hAstro > 0 ? 2 : 0)}
                width={barW}
                height={hAstro}
                fill={COLOR_ASTRO}
                opacity={isHover ? 1 : 0.92}
                rx={2}
              />

              <text
                x={x + barW / 2}
                y={accChartTop + H_ACC - hArt - hAstro - 6}
                fontSize={10}
                fontWeight={600}
                textAnchor="middle"
                fill={COLOR_INK}
              >
                {total}
              </text>

              <text
                x={x + barW / 2}
                y={xLabelsY}
                fontSize={11}
                textAnchor="middle"
                fill={COLOR_SECONDARY}
              >
                {d.anio}
                {d.esAnioActual ? "*" : ""}
              </text>

              {isHover ? (
                <g>
                  <rect
                    x={Math.min(Math.max(x - 30, PAD_L), W - PAD_R - 150)}
                    y={accChartTop + 2}
                    width={150}
                    height={54}
                    rx={4}
                    fill="#fcfcfb"
                    stroke={COLOR_GRID}
                  />
                  <text
                    x={Math.min(Math.max(x - 30, PAD_L), W - PAD_R - 150) + 8}
                    y={accChartTop + 16}
                    fontSize={10}
                    fontWeight={700}
                    fill={COLOR_INK}
                  >
                    {d.anio}
                  </text>
                  <text
                    x={Math.min(Math.max(x - 30, PAD_L), W - PAD_R - 150) + 8}
                    y={accChartTop + 29}
                    fontSize={9}
                    fill={COLOR_SECONDARY}
                  >
                    ART: {d.accidentes_art} · ASTRO laboral: {d.accidentes_particular}
                  </text>
                  <text
                    x={Math.min(Math.max(x - 30, PAD_L), W - PAD_R - 150) + 8}
                    y={accChartTop + 41}
                    fontSize={9}
                    fill={COLOR_SECONDARY}
                  >
                    Total: {total} · Días caídos: {d.dias_perdidos}
                  </text>
                </g>
              ) : null}
            </g>
          );
        })}

        <text x={0} y={diasChartTop - 6} fontSize={11} fill={COLOR_SECONDARY}>
          Días caídos
        </text>

        {gridStepsDias.map((f) => {
          const y = diasChartTop + H_DIAS - f * H_DIAS;
          return (
            <g key={f}>
              <line x1={PAD_L} x2={W - PAD_R} y1={y} y2={y} stroke={COLOR_GRID} strokeWidth={1} />
              <text x={0} y={y + 3} fontSize={9} fill={COLOR_MUTED}>
                {Math.round(f * niceMaxDias)}
              </text>
            </g>
          );
        })}

        {data.map((d, i) => {
          const x = PAD_L + i * slot + (slot - barW) / 2;
          const h = (d.dias_perdidos / niceMaxDias) * H_DIAS;
          const isHover = hoverIndex === i;
          return (
            <rect
              key={d.anio}
              x={x}
              y={diasChartTop + H_DIAS - h}
              width={barW}
              height={h}
              fill={COLOR_DIAS}
              opacity={isHover ? 1 : 0.92}
              rx={2}
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
              style={{ cursor: "pointer" }}
            />
          );
        })}
      </svg>

      <p className="mt-1 text-xs text-slate-400">
        * Año en curso: acumulado hasta la fecha.
      </p>

      <table className="mt-4 w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-slate-500">
            <th className="pb-2">Año</th>
            <th className="pb-2">ART</th>
            <th className="pb-2">ASTRO laboral</th>
            <th className="pb-2">Total accidentes</th>
            <th className="pb-2">Días caídos</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.anio} className="border-b border-slate-100 last:border-0">
              <td className="py-2 text-slate-700">
                {d.anio}
                {d.esAnioActual ? " (a la fecha)" : ""}
              </td>
              <td className="py-2 text-slate-600">{d.accidentes_art}</td>
              <td className="py-2 text-slate-600">{d.accidentes_particular}</td>
              <td className="py-2 font-medium text-slate-800">
                {d.accidentes_art + d.accidentes_particular}
              </td>
              <td className="py-2 text-slate-600">{d.dias_perdidos}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

"use client";

import type { EventoCompleto } from "../types";

function escaparCsv(valor: string): string {
  if (/[",\n]/.test(valor)) return `"${valor.replace(/"/g, '""')}"`;
  return valor;
}

interface ExportarCsvButtonProps {
  eventos: EventoCompleto[];
}

export function ExportarCsvButton({ eventos }: ExportarCsvButtonProps) {
  function handleExportar() {
    const encabezados = [
      "Fecha",
      "Tipo",
      "Empleado",
      "Sector",
      "Clasificación",
      "In itinere",
      "Días perdidos",
      "N° siniestro ART",
      "Factor",
      "Estado",
      "Descripción",
    ];

    const filas = eventos.map((ev) => [
      ev.fecha,
      ev.tipo,
      ev.empleado?.apellido_y_nombre ?? "",
      ev.empleado?.desc_puesto ?? "",
      ev.clasificacion === "particular" ? "ASTRO laboral" : ev.clasificacion ?? "",
      ev.in_itinere ? "Sí" : "No",
      String(ev.dias_perdidos),
      ev.nro_siniestro_art ?? "",
      ev.factor?.nombre ?? "",
      ev.estado === "cerrado" ? "Cerrado" : "Pendiente",
      ev.descripcion,
    ]);

    const csv = [encabezados, ...filas]
      .map((fila) => fila.map(escaparCsv).join(","))
      .join("\n");

    const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `eventos-hys-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={handleExportar}
      disabled={eventos.length === 0}
      className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:border-brand-accent disabled:cursor-not-allowed disabled:opacity-50"
    >
      Exportar CSV
    </button>
  );
}

import type { CapacitacionNexo, SeguimientoCapacitacionRow } from "../types";

function fmtFechaHora(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  const fecha = d.toLocaleDateString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" });
  const hora = d.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires",
  });
  return `${fecha} ${hora}`;
}

function fmtFecha(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" });
}

/**
 * Constancia individual de una capacitación (una por participante), estilo
 * "Registro de Capacitación". La firma es un ESTAMPADO de texto (nombre +
 * fecha y hora de `firmado_at`), no una imagen de firma manuscrita — mismo
 * criterio que usa Nexo RRHH para la constancia de recepción del recibo de
 * sueldo (ver `buildReciboHTML.ts` en ese repo).
 */
export function buildConstanciaHTML(
  cap: CapacitacionNexo,
  fila: SeguimientoCapacitacionRow,
  empresaNombre = "CIMOMET S.A."
): string {
  const { empleado, progreso } = fila;
  const completado = progreso?.completado ?? false;
  const firmadoAt = progreso?.firmado_at ?? null;

  return `<div style="background:#fff;border:1px solid #ddd;border-radius:6px;padding:22px 26px;font-family:Arial,sans-serif;font-size:11px;color:#1c1c1c;line-height:1.5" id="constancia-printable">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #333;padding-bottom:10px;margin-bottom:14px">
      <div>
        <div style="font-size:16px;font-weight:700;letter-spacing:.02em">${empresaNombre}</div>
        <div style="font-size:9px;color:#777;margin-top:2px">Registro de Capacitación</div>
      </div>
      <div style="text-align:right">
        ${cap.codigo ? `<div style="font-size:10px;color:#555">Código: <strong>${cap.codigo}</strong></div>` : ""}
      </div>
    </div>

    <div style="text-align:center;font-size:14px;font-weight:700;margin-bottom:14px;padding:8px;background:#f5f5f0;border:1px solid #ddd">
      ${cap.titulo}
    </div>

    <table style="width:100%;border-collapse:collapse;margin-bottom:12px;font-size:9.5px">
      <tr style="background:#f0eeea">
        <td style="padding:4px 6px;border:1px solid #ccc;font-weight:700;width:20%">Lugar</td>
        <td style="padding:4px 6px;border:1px solid #ccc;width:30%">${cap.lugar ?? "—"}</td>
        <td style="padding:4px 6px;border:1px solid #ccc;font-weight:700;width:20%">Hora de inicio</td>
        <td style="padding:4px 6px;border:1px solid #ccc;width:30%">${cap.hora_inicio ?? "—"}</td>
      </tr>
      <tr>
        <td style="padding:4px 6px;border:1px solid #ccc;font-weight:700">Duración</td>
        <td style="padding:4px 6px;border:1px solid #ccc">${cap.duracion ?? "—"}</td>
        <td style="padding:4px 6px;border:1px solid #ccc;font-weight:700">Fecha</td>
        <td style="padding:4px 6px;border:1px solid #ccc">${fmtFecha(progreso?.completado_at ?? null)}</td>
      </tr>
      <tr>
        <td style="padding:4px 6px;border:1px solid #ccc;font-weight:700">Instructor</td>
        <td style="padding:4px 6px;border:1px solid #ccc">${cap.instructor_nombre ?? "—"}</td>
        <td style="padding:4px 6px;border:1px solid #ccc;font-weight:700">Matrícula</td>
        <td style="padding:4px 6px;border:1px solid #ccc">${cap.instructor_matricula ?? "—"}</td>
      </tr>
    </table>

    <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#777;margin-bottom:4px">
      Datos del participante
    </div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:14px;font-size:9.5px">
      <tr style="background:#f0eeea">
        <td style="padding:4px 6px;border:1px solid #ccc;font-weight:700;width:20%">Apellido y nombre</td>
        <td style="padding:4px 6px;border:1px solid #ccc;width:40%">${empleado.apellido}, ${empleado.nombre}</td>
        <td style="padding:4px 6px;border:1px solid #ccc;font-weight:700;width:15%">Legajo</td>
        <td style="padding:4px 6px;border:1px solid #ccc;width:25%;font-family:monospace">${empleado.legajo}</td>
      </tr>
      <tr>
        <td style="padding:4px 6px;border:1px solid #ccc;font-weight:700">CUIL</td>
        <td style="padding:4px 6px;border:1px solid #ccc;font-family:monospace">${empleado.cuil ?? "—"}</td>
        <td style="padding:4px 6px;border:1px solid #ccc;font-weight:700">Empresa</td>
        <td style="padding:4px 6px;border:1px solid #ccc">${empresaNombre}</td>
      </tr>
      ${
        cap.tiene_quiz
          ? `<tr>
        <td style="padding:4px 6px;border:1px solid #ccc;font-weight:700">Puntaje obtenido</td>
        <td style="padding:4px 6px;border:1px solid #ccc;font-family:monospace">${progreso?.puntaje_obtenido != null ? `${progreso.puntaje_obtenido}%` : "—"}</td>
        <td style="padding:4px 6px;border:1px solid #ccc;font-weight:700">Puntaje mínimo</td>
        <td style="padding:4px 6px;border:1px solid #ccc;font-family:monospace">${cap.puntaje_minimo != null ? `${cap.puntaje_minimo}%` : "—"}</td>
      </tr>`
          : ""
      }
    </table>

    <div style="border-top:2px solid #555;padding-top:14px">
      ${
        completado && firmadoAt
          ? `<div style="text-align:center">
          <div style="font-family:Georgia,serif;font-style:italic;font-size:15px;padding-bottom:4px;border-bottom:1px solid #1a1a22;display:inline-block;min-width:220px">
            ${empleado.apellido}, ${empleado.nombre}
          </div>
          <div style="font-size:8px;color:#555;margin-top:4px">
            Firmado digitalmente el ${fmtFechaHora(firmadoAt)}
          </div>
          <div style="margin-top:6px">
            <span style="font-size:8px;text-transform:uppercase;letter-spacing:.08em;color:#0ca30c;border:1px dashed #0ca30c;padding:3px 10px;border-radius:999px;font-weight:600">✓ Completado y firmado</span>
          </div>
        </div>`
          : `<div style="text-align:center;color:#999;font-size:10px">Sin firmar — el participante todavía no completó la capacitación.</div>`
      }
    </div>

    <div style="margin-top:14px;padding-top:6px;border-top:1px solid #eee;font-size:7px;color:#999;text-align:center;font-style:italic">
      Constancia individual generada desde el Tablero H&S — ${empresaNombre}
    </div>
  </div>`;
}

export function imprimirConstancia(
  cap: CapacitacionNexo,
  fila: SeguimientoCapacitacionRow,
  empresaNombre = "CIMOMET S.A."
): void {
  const html = buildConstanciaHTML(cap, fila, empresaNombre);
  const ventana = window.open("", "_blank", "width=800,height=1000");
  if (!ventana) return;

  const titulo = `Constancia ${fila.empleado.apellido} ${fila.empleado.nombre} - ${cap.titulo}`;
  ventana.document.write(`<!doctype html><html><head><meta charset="utf-8">
  <title>${titulo}</title>
  <style>
    @page { size: A4 portrait; margin: 12mm 10mm; }
    html, body { background:#fff; margin:0; padding:0; font-family:Arial,sans-serif }
    body { padding:24px }
    .print-wrap { max-width: 190mm; margin: 0 auto }
    @media print {
      body { padding:0; -webkit-print-color-adjust: exact; print-color-adjust: exact }
      .no-print { display:none !important }
      .print-wrap { max-width: none; width: 100% }
      .print-wrap > div { border-radius: 0 !important }
    }
  </style></head><body>
  <div class="no-print" style="margin-bottom:16px;display:flex;gap:8px">
    <button onclick="window.print()" style="background:#2a78d6;color:#fff;border:none;padding:10px 20px;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer">Guardar como PDF</button>
    <button onclick="window.close()" style="background:#eee;border:none;padding:10px 20px;border-radius:6px;font-size:13px;cursor:pointer">Cerrar</button>
  </div>
  <div class="print-wrap">${html}</div></body></html>`);
  ventana.document.close();
}

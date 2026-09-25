import Link from "next/link";
import { Card } from "@core/ui/Card";
import { Badge } from "@core/ui/Badge";
import { Topbar } from "@core/layout/Topbar";
import { createSupabaseServerClient } from "@core/supabase/server";
import { ReportesEventosService } from "@modules/eventos-hys/services/reportes-eventos.service";
import { SeguimientoService } from "@modules/eventos-hys/services/seguimiento.service";

export default async function VistaHySEventosPage() {
  const supabase = createSupabaseServerClient();
  const reportesService = new ReportesEventosService(supabase);
  const seguimientoService = new SeguimientoService(supabase);

  const anioActual = new Date().getFullYear();

  const [porSector, porFactor, resumenAcciones, acciones] = await Promise.all([
    reportesService.obtenerPorSector(anioActual),
    reportesService.obtenerPorFactor(anioActual),
    reportesService.obtenerResumenAcciones(),
    seguimientoService.listarTodos(),
  ]);

  const pendientes = acciones.filter((a) => a.estado !== "cerrada");

  return (
    <>
      <Topbar title="Vista H&S — Detalle operativo" />

      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card title="Acciones pendientes">
            <p className="text-2xl font-semibold text-amber-600">
              {resumenAcciones.pendientes}
            </p>
          </Card>
          <Card title="Acciones en curso">
            <p className="text-2xl font-semibold text-slate-800">
              {resumenAcciones.en_curso}
            </p>
          </Card>
          <Card title="Acciones cerradas">
            <p className="text-2xl font-semibold text-emerald-600">
              {resumenAcciones.cerradas}
            </p>
          </Card>
        </div>

        <Card title="Qué es lo que más falla (por factor / parte del cuerpo)">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-2">Factor</th>
                <th className="pb-2">Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {porFactor.map((f) => (
                <tr key={f.factor_id} className="border-b border-slate-100 last:border-0">
                  <td className="py-2 text-slate-700">{f.factor_nombre}</td>
                  <td className="py-2 text-slate-600">{f.cantidad}</td>
                </tr>
              ))}
              {porFactor.length === 0 ? (
                <tr>
                  <td colSpan={2} className="py-6 text-center text-slate-400">
                    Sin accidentes con factor cargado todavía.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </Card>

        <Card title="Accidentes e incidentes por sector">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-2">Sector</th>
                <th className="pb-2">Accidentes</th>
                <th className="pb-2">Incidentes</th>
              </tr>
            </thead>
            <tbody>
              {porSector.map((s) => (
                <tr key={s.sector_nombre} className="border-b border-slate-100 last:border-0">
                  <td className="py-2 text-slate-700">{s.sector_nombre}</td>
                  <td className="py-2 text-slate-600">{s.accidentes}</td>
                  <td className="py-2 text-slate-600">{s.incidentes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card
          title={`Acciones de mejora pendientes / en curso (${pendientes.length})`}
        >
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-2">Acción</th>
                <th className="pb-2">Responsable</th>
                <th className="pb-2">Compromiso</th>
                <th className="pb-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {pendientes.map((a) => (
                <tr key={a.id} className="border-b border-slate-100 last:border-0">
                  <td className="py-2 max-w-sm text-slate-700">
                    <Link
                      href={
                        a.evento_id
                          ? `/eventos-hys/registro/${a.evento_id}`
                          : "/eventos-hys/seguimiento"
                      }
                      className="hover:text-brand-accent hover:underline"
                    >
                      {a.accion_mejora}
                    </Link>
                  </td>
                  <td className="py-2 text-slate-600">
                    {a.responsable?.apellido_y_nombre ?? "—"}
                  </td>
                  <td className="py-2 text-slate-600">{a.fecha_compromiso ?? "—"}</td>
                  <td className="py-2">
                    <Badge variant={a.estado === "en_curso" ? "warning" : "default"}>
                      {a.estado === "en_curso" ? "En curso" : "Pendiente"}
                    </Badge>
                  </td>
                </tr>
              ))}
              {pendientes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-400">
                    No hay acciones pendientes.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
          <Link
            href="/eventos-hys/seguimiento"
            className="mt-3 inline-block text-sm text-brand-accent hover:underline"
          >
            Ver propuestas de mejora sueltas →
          </Link>
        </Card>
      </div>
    </>
  );
}

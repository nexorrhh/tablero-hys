import Link from "next/link";
import { Topbar } from "@core/layout/Topbar";
import { Card } from "@core/ui/Card";
import { createSupabaseServerClient } from "@core/supabase/server";
import { EvaluacionesService } from "@modules/evaluacion-preventiva/services/evaluaciones.service";
import { formatearPeriodo } from "@modules/evaluacion-preventiva/periodo";

export default async function EvaluacionesPage() {
  const supabase = createSupabaseServerClient();
  const evaluacionesService = new EvaluacionesService(supabase);

  const hoy = new Date();
  const [evaluacionesDelMes, pendientesMesVencido] = await Promise.all([
    evaluacionesService.listarPorMes(hoy.getMonth() + 1, hoy.getFullYear()),
    evaluacionesService.listarPendientesMesVencido(),
  ]);

  return (
    <>
      <Topbar
        title="Evaluaciones"
        actions={
          <Link
            href="/evaluacion-preventiva/evaluaciones/nueva"
            className="rounded-md bg-brand-accent px-4 py-2 text-sm font-medium text-white hover:bg-brand-accent/90"
          >
            + Nueva evaluación
          </Link>
        }
      />

      <div className="space-y-6 p-6">
        <Card
          title={`Pendientes de evaluación — ${formatearPeriodo(pendientesMesVencido.periodo)} (mes vencido)`}
        >
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-2">Empleado</th>
                <th className="pb-2">Puesto</th>
              </tr>
            </thead>
            <tbody>
              {pendientesMesVencido.empleados.map((emp) => (
                <tr key={emp.id} className="border-b border-slate-100 last:border-0">
                  <td className="py-2 font-medium text-slate-800">{emp.apellido_y_nombre}</td>
                  <td className="py-2 text-slate-600">{emp.desc_puesto}</td>
                </tr>
              ))}
              {pendientesMesVencido.empleados.length === 0 ? (
                <tr>
                  <td colSpan={2} className="py-6 text-center text-slate-400">
                    Ya está evaluado todo el personal activo de este período.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </Card>

        <Card title={`Evaluaciones cargadas este mes (${hoy.getMonth() + 1}/${hoy.getFullYear()})`}>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-2">Empleado</th>
                <th className="pb-2">Fecha</th>
                <th className="pb-2">Promedio</th>
              </tr>
            </thead>
            <tbody>
              {evaluacionesDelMes.map((ev) => (
                <tr key={ev.id} className="border-b border-slate-100 last:border-0">
                  <td className="py-2 font-medium text-slate-800">
                    {ev.empleado.apellido_y_nombre}
                  </td>
                  <td className="py-2 text-slate-600">{ev.fecha_evaluacion}</td>
                  <td className="py-2 text-slate-600">
                    {ev.promedio_general ?? "—"}
                  </td>
                </tr>
              ))}
              {evaluacionesDelMes.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-slate-400">
                    Todavía no hay evaluaciones cargadas este mes.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </Card>
      </div>
    </>
  );
}

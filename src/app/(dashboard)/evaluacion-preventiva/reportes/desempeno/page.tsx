import { Topbar } from "@core/layout/Topbar";
import { Card } from "@core/ui/Card";
import { createSupabaseServerClient } from "@core/supabase/server";
import { ReportesService } from "@modules/evaluacion-preventiva/services/reportes.service";

export default async function VistaDesempenoPage({
  searchParams,
}: {
  searchParams: { anio?: string };
}) {
  const supabase = createSupabaseServerClient();
  const reportesService = new ReportesService(supabase);

  const anio = searchParams.anio
    ? Number(searchParams.anio)
    : new Date().getFullYear();

  const promedios = await reportesService.obtenerPromedioAnualPorEmpleado(anio);
  const ordenados = [...promedios].sort(
    (a, b) => (b.promedio_anual ?? 0) - (a.promedio_anual ?? 0)
  );

  return (
    <>
      <Topbar title={`Vista Dirección / RRHH — Desempeño ${anio}`} />

      <div className="p-6">
        <Card title={`Promedio ponderado anual por empleado (${anio})`}>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-2">Empleado</th>
                <th className="pb-2">Puesto</th>
                <th className="pb-2">Evaluaciones</th>
                <th className="pb-2">Promedio anual</th>
              </tr>
            </thead>
            <tbody>
              {ordenados.map((fila) => (
                <tr
                  key={fila.empleado.id}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="py-2 font-medium text-slate-800">
                    {fila.empleado.apellido_y_nombre}
                  </td>
                  <td className="py-2 text-slate-600">{fila.empleado.desc_puesto}</td>
                  <td className="py-2 text-slate-600">
                    {fila.cantidad_evaluaciones}
                  </td>
                  <td className="py-2 font-semibold text-slate-800">
                    {fila.promedio_anual ?? "—"}
                  </td>
                </tr>
              ))}
              {ordenados.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-400">
                    No hay evaluaciones cargadas para {anio}.
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

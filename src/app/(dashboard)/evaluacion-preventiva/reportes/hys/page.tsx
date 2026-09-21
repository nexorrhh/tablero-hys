import { Topbar } from "@core/layout/Topbar";
import { Badge } from "@core/ui/Badge";
import { Card } from "@core/ui/Card";
import { createSupabaseServerClient } from "@core/supabase/server";
import { ReportesService } from "@modules/evaluacion-preventiva/services/reportes.service";
import { HeatmapAspectos } from "@modules/evaluacion-preventiva/components/HeatmapAspectos";

export default async function VistaHySPage() {
  const supabase = createSupabaseServerClient();
  const reportesService = new ReportesService(supabase);

  const [mapaCalor, desvios] = await Promise.all([
    reportesService.obtenerMapaCalorAspectos(),
    reportesService.listarDesviosGestion(),
  ]);

  return (
    <>
      <Topbar title="Vista H&S — Operativa / Preventiva" />

      <div className="space-y-6 p-6">
        <Card title="Mapa de calor por aspecto (histórico)">
          <HeatmapAspectos data={mapaCalor} />
        </Card>

        <Card title="Desvíos de gestión pendientes de solucionar">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-2">Empleado</th>
                <th className="pb-2">Aspecto</th>
                <th className="pb-2">Fecha</th>
                <th className="pb-2">Observaciones</th>
              </tr>
            </thead>
            <tbody>
              {desvios.map((d) => (
                <tr
                  key={d.detalle.id}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="py-2 font-medium text-slate-800">
                    {d.empleado.apellido_y_nombre}
                  </td>
                  <td className="py-2">
                    <Badge variant="danger">{d.aspecto_titulo}</Badge>
                  </td>
                  <td className="py-2 text-slate-600">{d.fecha_evaluacion}</td>
                  <td className="py-2 text-slate-600">
                    {d.detalle.observaciones ?? "—"}
                  </td>
                </tr>
              ))}
              {desvios.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-400">
                    No hay desvíos de gestión registrados.
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

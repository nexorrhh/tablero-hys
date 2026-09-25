import { Card } from "@core/ui/Card";
import { Topbar } from "@core/layout/Topbar";
import { createSupabaseServerClient } from "@core/supabase/server";
import { ReportesEventosService } from "@modules/eventos-hys/services/reportes-eventos.service";
import { EvolucionAnualChart } from "@modules/eventos-hys/components/EvolucionAnualChart";

export default async function VistaDireccionEventosPage() {
  const supabase = createSupabaseServerClient();
  const reportesService = new ReportesEventosService(supabase);

  const anioActual = new Date().getFullYear();

  const [evolucionAnual, totalesActual, porSector, resumenAcciones] = await Promise.all([
    reportesService.obtenerEvolucionAnual(),
    reportesService.obtenerTotalesMensuales(anioActual),
    reportesService.obtenerPorSector(anioActual),
    reportesService.obtenerResumenAcciones(),
  ]);

  const totalArt = totalesActual.reduce((acc, m) => acc + m.accidentes_art, 0);
  const totalAstro = totalesActual.reduce((acc, m) => acc + m.accidentes_particular, 0);
  const totalInItinere = totalesActual.reduce((acc, m) => acc + m.accidentes_in_itinere, 0);
  const totalIncidentes = totalesActual.reduce((acc, m) => acc + m.incidentes, 0);
  const totalDiasPerdidos = totalesActual.reduce((acc, m) => acc + m.dias_perdidos, 0);

  return (
    <>
      <Topbar title={`Vista Dirección — Seguridad e Higiene ${anioActual}`} />

      <div className="space-y-6 p-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <Card title="Accidentes ART">
            <p className="text-2xl font-semibold text-slate-800">{totalArt}</p>
          </Card>
          <Card title="ASTRO laboral">
            <p className="text-2xl font-semibold text-slate-800">{totalAstro}</p>
          </Card>
          <Card title="In itinere">
            <p className="text-2xl font-semibold text-slate-800">{totalInItinere}</p>
          </Card>
          <Card title="Incidentes">
            <p className="text-2xl font-semibold text-slate-800">{totalIncidentes}</p>
          </Card>
          <Card title="Días perdidos">
            <p className="text-2xl font-semibold text-slate-800">{totalDiasPerdidos}</p>
          </Card>
          <Card title="% Acciones cerradas">
            <p className="text-2xl font-semibold text-slate-800">
              {resumenAcciones.porcentaje_cumplimiento}%
            </p>
          </Card>
        </div>

        <Card title="Evolución anual de accidentes laborales">
          <EvolucionAnualChart data={evolucionAnual} />
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
              {porSector.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-slate-400">
                    Sin datos todavía.
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

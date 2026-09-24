import { Card } from "@core/ui/Card";
import { Topbar } from "@core/layout/Topbar";
import { createSupabaseServerClient } from "@core/supabase/server";
import { ReportesEventosService } from "@modules/eventos-hys/services/reportes-eventos.service";

export default async function VistaDireccionEventosPage({
  searchParams,
}: {
  searchParams: { anio?: string };
}) {
  const supabase = createSupabaseServerClient();
  const reportesService = new ReportesEventosService(supabase);

  const anioActual = searchParams.anio ? Number(searchParams.anio) : new Date().getFullYear();
  const anioAnterior = anioActual - 1;

  const [totalesActual, totalesAnterior, porSector, resumenAcciones] = await Promise.all([
    reportesService.obtenerTotalesMensuales(anioActual),
    reportesService.obtenerTotalesMensuales(anioAnterior),
    reportesService.obtenerPorSector(anioActual),
    reportesService.obtenerResumenAcciones(),
  ]);

  const totalArt = totalesActual.reduce((acc, m) => acc + m.accidentes_art, 0);
  const totalParticular = totalesActual.reduce((acc, m) => acc + m.accidentes_particular, 0);
  const totalInItinere = totalesActual.reduce((acc, m) => acc + m.accidentes_in_itinere, 0);
  const totalIncidentes = totalesActual.reduce((acc, m) => acc + m.incidentes, 0);
  const totalDiasPerdidos = totalesActual.reduce((acc, m) => acc + m.dias_perdidos, 0);

  const NOMBRES_MES = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
  ];

  return (
    <>
      <Topbar title={`Vista Dirección — Seguridad e Higiene ${anioActual}`} />

      <div className="space-y-6 p-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <Card title="Accidentes ART">
            <p className="text-2xl font-semibold text-slate-800">{totalArt}</p>
          </Card>
          <Card title="Particulares">
            <p className="text-2xl font-semibold text-slate-800">{totalParticular}</p>
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

        <Card title={`Accidentes por mes — ${anioAnterior} vs ${anioActual}`}>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-2">Mes</th>
                <th className="pb-2">{anioAnterior}</th>
                <th className="pb-2">{anioActual}</th>
              </tr>
            </thead>
            <tbody>
              {NOMBRES_MES.map((nombre, i) => {
                const mes = i + 1;
                const anterior = totalesAnterior.find((m) => m.mes === mes);
                const actual = totalesActual.find((m) => m.mes === mes);
                const totalAnterior = (anterior?.accidentes_art ?? 0) + (anterior?.accidentes_particular ?? 0);
                const totalActualMes = (actual?.accidentes_art ?? 0) + (actual?.accidentes_particular ?? 0);
                return (
                  <tr key={mes} className="border-b border-slate-100 last:border-0">
                    <td className="py-2 text-slate-600">{nombre}</td>
                    <td className="py-2 text-slate-500">{totalAnterior}</td>
                    <td className="py-2 font-medium text-slate-800">{totalActualMes}</td>
                  </tr>
                );
              })}
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
                <tr key={s.sector_id ?? "sin-sector"} className="border-b border-slate-100 last:border-0">
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

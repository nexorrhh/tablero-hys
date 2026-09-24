import Link from "next/link";
import { Topbar } from "@core/layout/Topbar";
import { Card } from "@core/ui/Card";
import { createSupabaseServerClient } from "@core/supabase/server";
import { ReportesEventosService } from "@modules/eventos-hys/services/reportes-eventos.service";

export default async function ResumenEventosPage() {
  const supabase = createSupabaseServerClient();
  const reportesService = new ReportesEventosService(supabase);

  const anioActual = new Date().getFullYear();
  const [totales, resumenAcciones] = await Promise.all([
    reportesService.obtenerTotalesMensuales(anioActual),
    reportesService.obtenerResumenAcciones(),
  ]);

  const totalAccidentes = totales.reduce(
    (acc, m) => acc + m.accidentes_art + m.accidentes_particular,
    0
  );
  const totalIncidentes = totales.reduce((acc, m) => acc + m.incidentes, 0);

  return (
    <>
      <Topbar title="Eventos de Seguridad e Higiene" />

      <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card title={`Accidentes ${anioActual}`}>
          <p className="text-3xl font-semibold text-slate-800">{totalAccidentes}</p>
        </Card>

        <Card title={`Incidentes ${anioActual}`}>
          <p className="text-3xl font-semibold text-slate-800">{totalIncidentes}</p>
        </Card>

        <Card title="Acciones pendientes">
          <p className="text-3xl font-semibold text-amber-600">
            {resumenAcciones.pendientes + resumenAcciones.en_curso}
          </p>
          <Link
            href="/eventos-hys/seguimiento"
            className="mt-2 inline-block text-sm text-brand-accent hover:underline"
          >
            Ver seguimiento
          </Link>
        </Card>

        <Card title="Nuevo evento">
          <p className="text-sm text-slate-500">Cargar un accidente o incidente.</p>
          <Link
            href="/eventos-hys/registro/nuevo"
            className="mt-2 inline-block text-sm font-medium text-brand-accent hover:underline"
          >
            Comenzar →
          </Link>
        </Card>
      </div>
    </>
  );
}

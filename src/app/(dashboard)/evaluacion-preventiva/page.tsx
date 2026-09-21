import Link from "next/link";
import { Topbar } from "@core/layout/Topbar";
import { Card } from "@core/ui/Card";
import { createSupabaseServerClient } from "@core/supabase/server";
import { EmpleadosService } from "@core/rrhh/empleados.service";
import { ReportesService } from "@modules/evaluacion-preventiva/services/reportes.service";

export default async function ResumenModuloPage() {
  const supabase = createSupabaseServerClient();
  const empleadosService = new EmpleadosService(supabase);
  const reportesService = new ReportesService(supabase);

  const hoy = new Date();
  const [personalActivo, desviosPendientes] = await Promise.all([
    empleadosService.listarActivos(),
    reportesService.listarDesviosGestion({
      mes: hoy.getMonth() + 1,
      anio: hoy.getFullYear(),
    }),
  ]);

  return (
    <>
      <Topbar title="Evaluación Preventiva de Personal" />

      <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card title="Personal activo">
          <p className="text-3xl font-semibold text-slate-800">
            {personalActivo.length}
          </p>
          <Link
            href="/evaluacion-preventiva/personal"
            className="mt-2 inline-block text-sm text-brand-accent hover:underline"
          >
            Gestionar personal
          </Link>
        </Card>

        <Card title="Desvíos de gestión (mes actual)">
          <p className="text-3xl font-semibold text-red-600">
            {desviosPendientes.length}
          </p>
          <Link
            href="/evaluacion-preventiva/reportes/hys"
            className="mt-2 inline-block text-sm text-brand-accent hover:underline"
          >
            Ver vista H&S
          </Link>
        </Card>

        <Card title="Nueva evaluación">
          <p className="text-sm text-slate-500">
            Cargar la evaluación mensual de un empleado.
          </p>
          <Link
            href="/evaluacion-preventiva/evaluaciones/nueva"
            className="mt-2 inline-block text-sm font-medium text-brand-accent hover:underline"
          >
            Comenzar →
          </Link>
        </Card>
      </div>
    </>
  );
}

import { Topbar } from "@core/layout/Topbar";
import { Card } from "@core/ui/Card";
import { createSupabaseServerClient } from "@core/supabase/server";
import { EvaluacionesService } from "@modules/evaluacion-preventiva/services/evaluaciones.service";
import { EvaluacionForm } from "@modules/evaluacion-preventiva/components/EvaluacionForm";
import { crearEvaluacionAction, obtenerPendientesPeriodoAction } from "./actions";

export default async function NuevaEvaluacionPage() {
  const supabase = createSupabaseServerClient();
  const evaluacionesService = new EvaluacionesService(supabase);

  const periodos = await evaluacionesService.listarPeriodosDisponibles();
  const periodoInicial = periodos[0];
  const empleadosIniciales = periodoInicial
    ? await evaluacionesService.listarEmpleadosPendientes(periodoInicial.mes, periodoInicial.anio)
    : [];

  return (
    <>
      <Topbar title="Nueva evaluación mensual" />

      <div className="p-6">
        <Card>
          {periodos.length === 0 ? (
            <p className="text-sm text-slate-500">
              No hay períodos pendientes: todo el personal activo ya tiene su evaluación
              cargada en los últimos meses.
            </p>
          ) : (
            <EvaluacionForm
              periodos={periodos}
              empleadosIniciales={empleadosIniciales}
              onObtenerPendientes={obtenerPendientesPeriodoAction}
              onSubmit={crearEvaluacionAction}
            />
          )}
        </Card>
      </div>
    </>
  );
}

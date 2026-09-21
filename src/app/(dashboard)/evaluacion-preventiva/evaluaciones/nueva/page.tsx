import { Topbar } from "@core/layout/Topbar";
import { Card } from "@core/ui/Card";
import { createSupabaseServerClient } from "@core/supabase/server";
import { EmpleadosService } from "@core/rrhh/empleados.service";
import { EvaluacionForm } from "@modules/evaluacion-preventiva/components/EvaluacionForm";
import { crearEvaluacionAction } from "./actions";

export default async function NuevaEvaluacionPage() {
  const supabase = createSupabaseServerClient();
  const empleadosService = new EmpleadosService(supabase);
  const empleados = await empleadosService.listarActivos();

  return (
    <>
      <Topbar title="Nueva evaluación mensual" />

      <div className="p-6">
        <Card>
          <EvaluacionForm empleados={empleados} onSubmit={crearEvaluacionAction} />
        </Card>
      </div>
    </>
  );
}

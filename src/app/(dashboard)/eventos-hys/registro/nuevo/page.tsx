import { Topbar } from "@core/layout/Topbar";
import { Card } from "@core/ui/Card";
import { createSupabaseServerClient } from "@core/supabase/server";
import { EmpleadosService } from "@core/rrhh/empleados.service";
import { SectoresService } from "@modules/eventos-hys/services/sectores.service";
import { FactoresService } from "@modules/eventos-hys/services/factores.service";
import { EventoForm } from "@modules/eventos-hys/components/EventoForm";
import { crearEventoAction, crearSectorAction } from "./actions";

export default async function NuevoEventoPage() {
  const supabase = createSupabaseServerClient();
  const empleadosService = new EmpleadosService(supabase);
  const sectoresService = new SectoresService(supabase);
  const factoresService = new FactoresService(supabase);

  const [empleados, sectores, factores] = await Promise.all([
    empleadosService.listarActivos(),
    sectoresService.listarActivos(),
    factoresService.listarActivos(),
  ]);

  return (
    <>
      <Topbar title="Nuevo accidente / incidente" />

      <div className="p-6">
        <Card>
          <EventoForm
            empleados={empleados}
            sectores={sectores}
            factores={factores}
            onSubmit={crearEventoAction}
            onCrearSector={crearSectorAction}
          />
        </Card>
      </div>
    </>
  );
}

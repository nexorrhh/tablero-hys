import { Topbar } from "@core/layout/Topbar";
import { createSupabaseServerClient } from "@core/supabase/server";
import { EmpleadosService } from "@core/rrhh/empleados.service";
import { EventosService } from "@modules/eventos-hys/services/eventos.service";
import { SeguimientoService } from "@modules/eventos-hys/services/seguimiento.service";
import { SeguimientoPanel } from "@modules/eventos-hys/components/SeguimientoPanel";
import { actualizarEstadoSeguimientoAction, crearSeguimientoAction } from "./actions";

export default async function SeguimientoPage() {
  const supabase = createSupabaseServerClient();
  const empleadosService = new EmpleadosService(supabase);
  const eventosService = new EventosService(supabase);
  const seguimientoService = new SeguimientoService(supabase);

  const [empleados, eventos, acciones] = await Promise.all([
    empleadosService.listarActivos(),
    eventosService.listar(),
    seguimientoService.listarTodos(),
  ]);

  return (
    <>
      <Topbar title="Seguimiento de acciones de mejora" />

      <div className="p-6">
        <SeguimientoPanel
          acciones={acciones}
          eventos={eventos}
          empleados={empleados}
          onCrear={crearSeguimientoAction}
          onActualizarEstado={actualizarEstadoSeguimientoAction}
        />
      </div>
    </>
  );
}

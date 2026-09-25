import { Topbar } from "@core/layout/Topbar";
import { createSupabaseServerClient } from "@core/supabase/server";
import { EmpleadosService } from "@core/rrhh/empleados.service";
import { SeguimientoService } from "@modules/eventos-hys/services/seguimiento.service";
import { SeguimientoPanel } from "@modules/eventos-hys/components/SeguimientoPanel";
import { actualizarEstadoSeguimientoAction, crearSeguimientoAction } from "./actions";

export default async function SeguimientoPage() {
  const supabase = createSupabaseServerClient();
  const empleadosService = new EmpleadosService(supabase);
  const seguimientoService = new SeguimientoService(supabase);

  const [empleados, acciones] = await Promise.all([
    empleadosService.listarActivos(),
    seguimientoService.listarSueltas(),
  ]);

  return (
    <>
      <Topbar title="Propuestas de mejora (sin evento)" />

      <div className="p-6">
        <p className="mb-4 text-sm text-slate-500">
          El seguimiento de un accidente o incidente puntual se carga desde el
          detalle de ese evento, en Registro. Acá van las propuestas de mejora
          que no nacen de un evento específico.
        </p>

        <SeguimientoPanel
          acciones={acciones}
          empleados={empleados}
          onCrear={crearSeguimientoAction}
          onActualizarEstado={actualizarEstadoSeguimientoAction}
        />
      </div>
    </>
  );
}

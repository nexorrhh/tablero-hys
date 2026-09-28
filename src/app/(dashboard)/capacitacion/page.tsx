import { Topbar } from "@core/layout/Topbar";
import { obtenerUsuarioActual } from "@core/auth/session";
import { listarSectoresNexo } from "@modules/capacitacion/services/sectores-nexo.service";
import { CapacitacionesNexoService } from "@modules/capacitacion/services/capacitaciones-nexo.service";
import { CapacitacionesAdmin } from "@modules/capacitacion/components/CapacitacionesAdmin";
import {
  archivarCapacitacionAction,
  crearCapacitacionAction,
  eliminarCapacitacionAction,
  obtenerSeguimientoAction,
  toggleActivoAction,
} from "./actions";

export default async function CapacitacionPage() {
  const [usuario, sectores, capacitaciones, empleados] = await Promise.all([
    obtenerUsuarioActual(),
    listarSectoresNexo(),
    new CapacitacionesNexoService().listar(),
    new CapacitacionesNexoService().listarEmpleadosActivos(),
  ]);

  return (
    <>
      <Topbar title="Capacitación" />

      <div className="p-6">
        <CapacitacionesAdmin
          capacitaciones={capacitaciones}
          sectores={sectores}
          empleados={empleados}
          esAdmin={usuario?.rol === "admin"}
          onCrear={crearCapacitacionAction}
          onToggleActivo={toggleActivoAction}
          onArchivar={archivarCapacitacionAction}
          onEliminar={eliminarCapacitacionAction}
          onObtenerSeguimiento={obtenerSeguimientoAction}
        />
      </div>
    </>
  );
}

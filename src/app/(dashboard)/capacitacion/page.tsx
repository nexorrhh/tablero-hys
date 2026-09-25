import { Topbar } from "@core/layout/Topbar";
import { listarSectoresNexo } from "@modules/capacitacion/services/sectores-nexo.service";
import { CapacitacionesPreview } from "@modules/capacitacion/components/CapacitacionesPreview";
import { CAPACITACIONES_EJEMPLO, EMPLEADOS_EJEMPLO } from "@modules/capacitacion/mockData";

export default async function CapacitacionPage() {
  let sectores: Awaited<ReturnType<typeof listarSectoresNexo>> = [];
  try {
    sectores = await listarSectoresNexo();
  } catch {
    // Si Nexo RRHH no responde, la vista previa sigue funcionando sin sectores reales.
    sectores = [];
  }

  return (
    <>
      <Topbar title="Capacitación" />

      <div className="p-6">
        <CapacitacionesPreview
          capacitacionesIniciales={CAPACITACIONES_EJEMPLO}
          sectores={sectores}
          empleados={EMPLEADOS_EJEMPLO}
        />
      </div>
    </>
  );
}

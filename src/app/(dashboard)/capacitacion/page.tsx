import Link from "next/link";
import { Topbar } from "@core/layout/Topbar";
import { Card } from "@core/ui/Card";
import { obtenerUsuarioActual } from "@core/auth/session";
import {
  EMPRESAS_CAPACITACION,
  EMPRESA_CAPACITACION_DEFAULT,
  esEmpresaCapacitacion,
  type EmpresaCapacitacion,
} from "@modules/capacitacion/empresas";
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

function SelectorEmpresa({ actual }: { actual: EmpresaCapacitacion }) {
  return (
    <div className="flex gap-2">
      {(Object.keys(EMPRESAS_CAPACITACION) as EmpresaCapacitacion[]).map((key) => (
        <Link
          key={key}
          href={`/capacitacion?empresa=${key}`}
          className={[
            "rounded-full px-4 py-1.5 text-xs font-semibold transition",
            actual === key ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200",
          ].join(" ")}
        >
          {EMPRESAS_CAPACITACION[key].label}
        </Link>
      ))}
    </div>
  );
}

export default async function CapacitacionPage({
  searchParams,
}: {
  searchParams: { empresa?: string };
}) {
  const empresa = esEmpresaCapacitacion(searchParams.empresa)
    ? searchParams.empresa
    : EMPRESA_CAPACITACION_DEFAULT;

  const usuario = await obtenerUsuarioActual();
  const capacitacionesService = new CapacitacionesNexoService(empresa);

  let datos;
  try {
    const [sectores, capacitaciones, empleados] = await Promise.all([
      listarSectoresNexo(empresa),
      capacitacionesService.listar(),
      capacitacionesService.listarEmpleadosActivos(),
    ]);
    datos = { sectores, capacitaciones, empleados };
  } catch (err) {
    return (
      <>
        <Topbar title="Capacitación" />
        <div className="space-y-4 p-6">
          <SelectorEmpresa actual={empresa} />
          <Card>
            <p className="py-6 text-center text-sm text-red-600">
              No se pudo conectar con Nexo RRHH de {EMPRESAS_CAPACITACION[empresa].label}:{" "}
              {err instanceof Error ? err.message : "error desconocido"}.
            </p>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Topbar title="Capacitación" />

      <div className="p-6">
        <CapacitacionesAdmin
          empresa={empresa}
          capacitaciones={datos.capacitaciones}
          sectores={datos.sectores}
          empleados={datos.empleados}
          esAdmin={usuario?.rol === "admin"}
          onCrear={crearCapacitacionAction.bind(null, empresa)}
          onToggleActivo={toggleActivoAction.bind(null, empresa)}
          onArchivar={archivarCapacitacionAction.bind(null, empresa)}
          onEliminar={eliminarCapacitacionAction.bind(null, empresa)}
          onObtenerSeguimiento={obtenerSeguimientoAction.bind(null, empresa)}
        />
      </div>
    </>
  );
}

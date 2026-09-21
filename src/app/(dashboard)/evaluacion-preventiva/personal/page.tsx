import { Topbar } from "@core/layout/Topbar";
import { Card } from "@core/ui/Card";
import { createSupabaseServerClient } from "@core/supabase/server";
import { EmpleadosService } from "@core/rrhh/empleados.service";

export default async function PersonalPage() {
  const supabase = createSupabaseServerClient();
  const empleadosService = new EmpleadosService(supabase);
  const empleados = await empleadosService.listarActivos();

  return (
    <>
      <Topbar title="Personal" />

      <div className="p-6">
        <p className="mb-4 text-sm text-slate-500">
          Este listado se lee en vivo desde el legajo de RRHH (tabla{" "}
          <code>empleados</code>). Para dar de alta, baja o corregir un
          empleado, hacerlo en el sistema de RRHH — no se edita desde acá.
        </p>

        <Card>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-2">Legajo</th>
                <th className="pb-2">Nombre</th>
                <th className="pb-2">Puesto</th>
                <th className="pb-2">Empresa</th>
              </tr>
            </thead>
            <tbody>
              {empleados.map((emp) => (
                <tr key={emp.id} className="border-b border-slate-100 last:border-0">
                  <td className="py-2 text-slate-500">{emp.legajo}</td>
                  <td className="py-2 font-medium text-slate-800">
                    {emp.apellido_y_nombre}
                  </td>
                  <td className="py-2 text-slate-600">{emp.desc_puesto}</td>
                  <td className="py-2 text-slate-600">{emp.empresa}</td>
                </tr>
              ))}
              {empleados.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-400">
                    No hay empleados activos en RRHH.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </Card>
      </div>
    </>
  );
}

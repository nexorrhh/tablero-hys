import { redirect } from "next/navigation";
import { Topbar } from "@core/layout/Topbar";
import { createSupabaseServerClient } from "@core/supabase/server";
import { obtenerUsuarioActual } from "@core/auth/session";
import { UsuariosService } from "@core/auth/usuarios.service";
import { UsuariosAdmin } from "@core/auth/components/UsuariosAdmin";
import {
  actualizarRolUsuarioAction,
  crearUsuarioAction,
  desactivarUsuarioAction,
} from "@core/auth/actions";
import { EmpleadosService } from "@core/rrhh/empleados.service";

export default async function UsuariosAdminPage() {
  const usuarioActual = await obtenerUsuarioActual();
  if (!usuarioActual || usuarioActual.rol !== "admin") {
    redirect("/evaluacion-preventiva");
  }

  const supabase = createSupabaseServerClient();
  const usuariosService = new UsuariosService(supabase);
  const empleadosService = new EmpleadosService(supabase);

  const [usuarios, empleados] = await Promise.all([
    usuariosService.listarTodos(),
    empleadosService.listarActivos(),
  ]);

  return (
    <>
      <Topbar title="Administración de usuarios" />

      <div className="p-6">
        <UsuariosAdmin
          usuarios={usuarios}
          empleados={empleados}
          usuarioActualId={usuarioActual.id}
          onCrear={crearUsuarioAction}
          onDesactivar={desactivarUsuarioAction}
          onCambiarRol={actualizarRolUsuarioAction}
        />
      </div>
    </>
  );
}

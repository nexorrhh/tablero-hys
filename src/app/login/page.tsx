import { createSupabaseServerClient } from "@core/supabase/server";
import { UsuariosService } from "@core/auth/usuarios.service";
import { LoginScreen } from "@core/auth/components/LoginScreen";
import { crearPinInicialAction, iniciarSesionConPinAction } from "@core/auth/actions";

export default async function LoginPage() {
  const supabase = createSupabaseServerClient();
  const usuariosService = new UsuariosService(supabase);
  const usuarios = await usuariosService.listarActivosParaLogin();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <LoginScreen
        usuarios={usuarios}
        onSubmit={iniciarSesionConPinAction}
        onCrearPin={crearPinInicialAction}
        destinoLuegoDeLogin="/evaluacion-preventiva"
      />
    </div>
  );
}

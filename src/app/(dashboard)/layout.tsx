import { redirect } from "next/navigation";
import { AppShell } from "@core/layout/AppShell";
import { obtenerUsuarioActual } from "@core/auth/session";

/**
 * Layout compartido por TODOS los módulos de la app autenticada.
 * Un Módulo 2 nuevo solo necesita agregar sus rutas dentro de este
 * grupo `(dashboard)` y una entrada en `navigation.config.ts`;
 * no requiere tocar este archivo.
 *
 * También hace de segunda barrera de autenticación (además del
 * `middleware.ts`): si no hay usuario válido, redirige a `/login`.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const usuario = await obtenerUsuarioActual();

  if (!usuario) {
    redirect("/login");
  }

  return <AppShell usuario={usuario}>{children}</AppShell>;
}

import type { UsuarioHys } from "@core/auth/types";
import { Sidebar } from "./Sidebar";

interface AppShellProps {
  usuario: UsuarioHys | null;
  children: React.ReactNode;
}

/**
 * Layout raíz de la aplicación autenticada.
 * Cualquier módulo nuevo se renderiza dentro de <main> sin tocar este shell.
 */
export function AppShell({ usuario, children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar usuario={usuario} />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

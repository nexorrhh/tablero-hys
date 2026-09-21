"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cerrarSesionAction } from "@core/auth/actions";
import type { UsuarioHys } from "@core/auth/types";
import { APP_MODULES } from "./navigation.config";

interface SidebarProps {
  usuario: UsuarioHys | null;
}

export function Sidebar({ usuario }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
      <div className="flex h-16 items-center border-b border-slate-200 px-6">
        <span className="text-lg font-semibold text-brand">Tablero H&S</span>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {APP_MODULES.map((mod) => {
          const isModuleActive = pathname?.startsWith(mod.basePath);
          return (
            <div key={mod.id}>
              <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {mod.label}
              </p>
              <ul className="mt-2 space-y-1">
                {mod.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={[
                          "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-brand-accent/10 text-brand-accent"
                            : "text-slate-600 hover:bg-slate-100",
                          isModuleActive ? "" : "opacity-90",
                        ].join(" ")}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}

        {usuario?.rol === "admin" ? (
          <div>
            <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Administración
            </p>
            <ul className="mt-2 space-y-1">
              <li>
                <Link
                  href="/admin/usuarios"
                  className={[
                    "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    pathname === "/admin/usuarios"
                      ? "bg-brand-accent/10 text-brand-accent"
                      : "text-slate-600 hover:bg-slate-100",
                  ].join(" ")}
                >
                  Usuarios
                </Link>
              </li>
            </ul>
          </div>
        ) : null}
      </nav>

      {usuario ? (
        <div className="border-t border-slate-200 p-4">
          <p className="text-sm font-medium text-slate-700">
            {usuario.nombre_visible}
          </p>
          <p className="text-xs capitalize text-slate-400">{usuario.rol}</p>
          <form action={cerrarSesionAction}>
            <button
              type="submit"
              className="mt-2 text-xs font-medium text-slate-400 hover:text-red-600"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      ) : null}
    </aside>
  );
}

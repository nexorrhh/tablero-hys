"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { EmpleadoActivo } from "@core/rrhh/types";
import type { UsuarioHys } from "../types";
import type { CrearUsuarioPayload } from "../actions";

interface UsuariosAdminProps {
  usuarios: UsuarioHys[];
  empleados: EmpleadoActivo[];
  usuarioActualId: string;
  onCrear: (payload: CrearUsuarioPayload) => Promise<{ error: string | null }>;
  onDesactivar: (usuarioId: string) => Promise<{ error: string | null }>;
  onCambiarRol: (
    usuarioId: string,
    rol: "evaluador" | "admin"
  ) => Promise<{ error: string | null }>;
}

export function UsuariosAdmin({
  usuarios,
  empleados,
  usuarioActualId,
  onCrear,
  onDesactivar,
  onCambiarRol,
}: UsuariosAdminProps) {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [empleadoId, setEmpleadoId] = useState("");
  const [rol, setRol] = useState<"evaluador" | "admin">("evaluador");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCrear(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const resultado = await onCrear({
        nombre_visible: nombre,
        empleado_id: empleadoId || null,
        rol,
      });
      if (resultado.error) {
        setError(resultado.error);
        return;
      }
      setNombre("");
      setEmpleadoId("");
      setRol("evaluador");
      router.refresh();
    });
  }

  function handleDesactivar(usuarioId: string) {
    startTransition(async () => {
      await onDesactivar(usuarioId);
      router.refresh();
    });
  }

  function handleCambiarRol(usuarioId: string, nuevoRol: "evaluador" | "admin") {
    startTransition(async () => {
      const resultado = await onCambiarRol(usuarioId, nuevoRol);
      if (resultado.error) {
        setError(resultado.error);
        return;
      }
      router.refresh();
    });
  }

  function handleElegirEmpleado(id: string) {
    setEmpleadoId(id);
    if (!nombre) {
      const empleado = empleados.find((e) => e.id === id);
      if (empleado) setNombre(empleado.apellido_y_nombre);
    }
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleCrear}
        className="grid grid-cols-1 gap-4 rounded-lg border border-slate-200 bg-white p-5 sm:grid-cols-4"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Empleado (RRHH){" "}
            <span className="font-normal text-slate-400">— opcional</span>
          </label>
          <select
            value={empleadoId}
            onChange={(e) => handleElegirEmpleado(e.target.value)}
            className="w-full rounded-md border border-slate-300 p-2 text-sm"
          >
            <option value="">— Sin vincular —</option>
            {empleados.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.apellido_y_nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Nombre visible
          </label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            className="w-full rounded-md border border-slate-300 p-2 text-sm"
            placeholder="Ej: Javier Hernández"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Rol
          </label>
          <select
            value={rol}
            onChange={(e) => setRol(e.target.value as "evaluador" | "admin")}
            className="w-full rounded-md border border-slate-300 p-2 text-sm"
          >
            <option value="evaluador">Evaluador</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="sm:col-span-4">
          <p className="mb-2 text-xs text-slate-500">
            No se pide PIN acá: la persona crea el suyo la primera vez que
            entra a la app.
          </p>
          {error ? <p className="mb-2 text-sm text-red-600">{error}</p> : null}
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-brand-accent px-4 py-2 text-sm font-medium text-white hover:bg-brand-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Guardando…" : "Crear usuario"}
          </button>
        </div>
      </form>

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="pb-2">Nombre</th>
              <th className="pb-2">Rol</th>
              <th className="pb-2">PIN</th>
              <th className="pb-2">Estado</th>
              <th className="pb-2" />
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className="border-b border-slate-100 last:border-0">
                <td className="py-2 font-medium text-slate-800">
                  {u.nombre_visible}
                </td>
                <td className="py-2">
                  <select
                    value={u.rol}
                    disabled={isPending || u.id === usuarioActualId}
                    onChange={(e) =>
                      handleCambiarRol(u.id, e.target.value as "evaluador" | "admin")
                    }
                    className="rounded-md border border-slate-300 p-1 text-sm capitalize disabled:opacity-50"
                  >
                    <option value="evaluador">Evaluador</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="py-2 text-slate-600">
                  {u.debe_crear_pin ? "Sin configurar" : "Configurado"}
                </td>
                <td className="py-2 text-slate-600">
                  {u.activo ? "Activo" : "Inactivo"}
                </td>
                <td className="py-2 text-right">
                  {u.activo ? (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleDesactivar(u.id)}
                      className="text-xs font-medium text-slate-400 hover:text-red-600"
                    >
                      Desactivar
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

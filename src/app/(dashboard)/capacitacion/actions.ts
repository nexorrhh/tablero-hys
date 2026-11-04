"use server";

import { obtenerUsuarioActual } from "@core/auth/session";
import type { EmpresaCapacitacion } from "@modules/capacitacion/empresas";
import { CapacitacionesNexoService } from "@modules/capacitacion/services/capacitaciones-nexo.service";
import type { NuevaCapacitacionPayload, SeguimientoCapacitacionRow } from "@modules/capacitacion/types";

/**
 * Estas acciones escriben directo en la base de producción de Nexo RRHH
 * (empleados reales usándola), de la empresa indicada. Crear/archivar/
 * eliminar quedan reservadas a admin, igual que la administración de
 * usuarios de este mismo tablero. `empresa` siempre va primero: desde la
 * página (Server Component) se pasa con `.bind(null, empresa)` al componente
 * de cliente, que no la conoce ni la puede manipular.
 */
async function exigirAdmin() {
  const usuario = await obtenerUsuarioActual();
  if (!usuario || usuario.rol !== "admin") {
    throw new Error("Solo un administrador puede gestionar capacitaciones.");
  }
}

export async function crearCapacitacionAction(
  empresa: EmpresaCapacitacion,
  payload: NuevaCapacitacionPayload
): Promise<{ error: string | null }> {
  try {
    await exigirAdmin();
    const service = new CapacitacionesNexoService(empresa);
    await service.crear(payload);
    return { error: null };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Error al crear la capacitación.",
    };
  }
}

export async function toggleActivoAction(
  empresa: EmpresaCapacitacion,
  id: string,
  activoActual: boolean
): Promise<{ error: string | null }> {
  try {
    await exigirAdmin();
    await new CapacitacionesNexoService(empresa).toggleActivo(id, activoActual);
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error al actualizar." };
  }
}

export async function archivarCapacitacionAction(
  empresa: EmpresaCapacitacion,
  id: string,
  archivado: boolean
): Promise<{ error: string | null }> {
  try {
    await exigirAdmin();
    await new CapacitacionesNexoService(empresa).archivar(id, archivado);
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error al archivar." };
  }
}

export async function eliminarCapacitacionAction(
  empresa: EmpresaCapacitacion,
  id: string
): Promise<{ error: string | null }> {
  try {
    await exigirAdmin();
    await new CapacitacionesNexoService(empresa).eliminar(id);
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error al eliminar." };
  }
}

export async function obtenerSeguimientoAction(
  empresa: EmpresaCapacitacion,
  capId: string
): Promise<{ data: SeguimientoCapacitacionRow[] | null; error: string | null }> {
  try {
    const data = await new CapacitacionesNexoService(empresa).obtenerSeguimiento(capId);
    return { data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Error al obtener el seguimiento.",
    };
  }
}

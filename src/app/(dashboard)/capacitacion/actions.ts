"use server";

import { obtenerUsuarioActual } from "@core/auth/session";
import { CapacitacionesNexoService } from "@modules/capacitacion/services/capacitaciones-nexo.service";
import type { NuevaCapacitacionPayload, SeguimientoCapacitacionRow } from "@modules/capacitacion/types";

/**
 * Estas acciones escriben directo en la base de producción de Nexo RRHH
 * (empleados reales usándola). Crear/archivar/eliminar quedan reservadas a
 * admin, igual que la administración de usuarios de este mismo tablero.
 */
async function exigirAdmin() {
  const usuario = await obtenerUsuarioActual();
  if (!usuario || usuario.rol !== "admin") {
    throw new Error("Solo un administrador puede gestionar capacitaciones.");
  }
}

export async function crearCapacitacionAction(
  payload: NuevaCapacitacionPayload
): Promise<{ error: string | null }> {
  try {
    await exigirAdmin();
    const service = new CapacitacionesNexoService();
    await service.crear(payload);
    return { error: null };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Error al crear la capacitación.",
    };
  }
}

export async function toggleActivoAction(
  id: string,
  activoActual: boolean
): Promise<{ error: string | null }> {
  try {
    await exigirAdmin();
    await new CapacitacionesNexoService().toggleActivo(id, activoActual);
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error al actualizar." };
  }
}

export async function archivarCapacitacionAction(
  id: string,
  archivado: boolean
): Promise<{ error: string | null }> {
  try {
    await exigirAdmin();
    await new CapacitacionesNexoService().archivar(id, archivado);
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error al archivar." };
  }
}

export async function eliminarCapacitacionAction(id: string): Promise<{ error: string | null }> {
  try {
    await exigirAdmin();
    await new CapacitacionesNexoService().eliminar(id);
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error al eliminar." };
  }
}

export async function obtenerSeguimientoAction(
  capId: string
): Promise<{ data: SeguimientoCapacitacionRow[] | null; error: string | null }> {
  try {
    const data = await new CapacitacionesNexoService().obtenerSeguimiento(capId);
    return { data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : "Error al obtener el seguimiento.",
    };
  }
}

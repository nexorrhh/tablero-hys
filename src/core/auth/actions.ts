"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@core/supabase/server";
import { createSupabaseAdminClient } from "@core/supabase/admin";
import { obtenerUsuarioActual } from "./session";

const AUTH_EMAIL_DOMAIN = "hys.cimomet.internal";

function pinAContrasena(pin: string): string {
  // Supabase Auth exige contraseñas de al menos 6 caracteres; el PIN visible
  // para el usuario sigue siendo de 4 dígitos, el prefijo es un detalle interno.
  return `hys-${pin}`;
}

function generarEmailSintetico(nombre: string): string {
  const slug =
    nombre
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "usuario";

  const sufijo = crypto.randomUUID().slice(0, 8);
  return `${slug}-${sufijo}@${AUTH_EMAIL_DOMAIN}`;
}

function esPinValido(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}

export interface LoginResult {
  error: string | null;
}

/** Login normal: el usuario ya eligió su nombre y ya tiene PIN configurado. */
export async function iniciarSesionConPinAction(
  usuarioId: string,
  pin: string
): Promise<LoginResult> {
  if (!esPinValido(pin)) {
    return { error: "El PIN debe tener 4 dígitos." };
  }

  const admin = createSupabaseAdminClient();
  const { data: authUser, error: errorAuthUser } =
    await admin.auth.admin.getUserById(usuarioId);

  if (errorAuthUser || !authUser.user?.email) {
    return { error: "Usuario no encontrado." };
  }

  const { data: perfil, error: errorPerfil } = await admin
    .from("hys_usuarios")
    .select("activo, debe_crear_pin")
    .eq("id", usuarioId)
    .maybeSingle();

  if (errorPerfil || !perfil?.activo) {
    return { error: "Usuario inactivo. Contactá a un administrador." };
  }

  if (perfil.debe_crear_pin) {
    return { error: "Todavía no creaste tu PIN." };
  }

  const supabase = createSupabaseServerClient();
  const { error: errorSignIn } = await supabase.auth.signInWithPassword({
    email: authUser.user.email,
    password: pinAContrasena(pin),
  });

  if (errorSignIn) {
    return { error: "PIN incorrecto." };
  }

  return { error: null };
}

/**
 * Primer ingreso: el usuario fue dado de alta por un admin (solo con
 * nombre, sin PIN) y ahora elige su propio PIN. Es la única vía por la que
 * se fija la contraseña real en `auth.users`; hasta este momento la cuenta
 * tiene una contraseña aleatoria que nadie conoce.
 */
export async function crearPinInicialAction(
  usuarioId: string,
  pin: string
): Promise<LoginResult> {
  if (!esPinValido(pin)) {
    return { error: "El PIN debe tener 4 dígitos." };
  }

  const admin = createSupabaseAdminClient();

  const { data: perfil, error: errorPerfil } = await admin
    .from("hys_usuarios")
    .select("activo, debe_crear_pin")
    .eq("id", usuarioId)
    .maybeSingle();

  if (errorPerfil || !perfil?.activo) {
    return { error: "Usuario inactivo. Contactá a un administrador." };
  }

  if (!perfil.debe_crear_pin) {
    return { error: "Ya configuraste tu PIN. Iniciá sesión normalmente." };
  }

  const { data: authUser, error: errorAuthUser } =
    await admin.auth.admin.getUserById(usuarioId);

  if (errorAuthUser || !authUser.user?.email) {
    return { error: "Usuario no encontrado." };
  }

  const { error: errorUpdate } = await admin.auth.admin.updateUserById(
    usuarioId,
    { password: pinAContrasena(pin) }
  );

  if (errorUpdate) {
    return { error: "No se pudo guardar el PIN. Probá de nuevo." };
  }

  await admin
    .from("hys_usuarios")
    .update({ debe_crear_pin: false })
    .eq("id", usuarioId);

  const supabase = createSupabaseServerClient();
  const { error: errorSignIn } = await supabase.auth.signInWithPassword({
    email: authUser.user.email,
    password: pinAContrasena(pin),
  });

  if (errorSignIn) {
    return { error: "PIN guardado, pero no se pudo iniciar sesión. Probá ingresar de nuevo." };
  }

  return { error: null };
}

export async function cerrarSesionAction(): Promise<void> {
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}

async function exigirAdmin() {
  const usuario = await obtenerUsuarioActual();
  if (!usuario || usuario.rol !== "admin") {
    throw new Error("Solo un administrador puede realizar esta acción.");
  }
  return usuario;
}

export interface CrearUsuarioPayload {
  nombre_visible: string;
  empleado_id?: string | null;
  rol: "evaluador" | "admin";
}

/**
 * Alta de un evaluador/admin nuevo. Solo puede ejecutarlo otro admin logueado.
 * No pide PIN: la cuenta arranca con una contraseña aleatoria que nadie
 * conoce y queda marcada `debe_crear_pin = true`; la persona crea su propio
 * PIN la primera vez que entra a `/login`.
 */
export async function crearUsuarioAction(
  payload: CrearUsuarioPayload
): Promise<{ error: string | null }> {
  try {
    await exigirAdmin();

    if (!payload.nombre_visible.trim()) {
      throw new Error("El nombre es obligatorio.");
    }

    const admin = createSupabaseAdminClient();
    const email = generarEmailSintetico(payload.nombre_visible);
    const contrasenaTemporal = crypto.randomUUID();

    const { data: nuevoAuthUser, error: errorCrearAuth } =
      await admin.auth.admin.createUser({
        email,
        password: contrasenaTemporal,
        email_confirm: true,
      });

    if (errorCrearAuth || !nuevoAuthUser.user) {
      throw new Error(
        errorCrearAuth?.message ?? "No se pudo crear el usuario."
      );
    }

    const { error: errorPerfil } = await admin.from("hys_usuarios").insert({
      id: nuevoAuthUser.user.id,
      nombre_visible: payload.nombre_visible.trim(),
      empleado_id: payload.empleado_id ?? null,
      rol: payload.rol,
      debe_crear_pin: true,
    });

    if (errorPerfil) {
      // Revertir el usuario de Auth si no se pudo guardar el perfil, para no dejar huérfanos.
      await admin.auth.admin.deleteUser(nuevoAuthUser.user.id);
      throw new Error(errorPerfil.message);
    }

    return { error: null };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Error al crear el usuario.",
    };
  }
}

/** Baja lógica: desactiva el usuario sin borrar su historial de evaluaciones cargadas. */
export async function desactivarUsuarioAction(
  usuarioId: string
): Promise<{ error: string | null }> {
  try {
    await exigirAdmin();

    const admin = createSupabaseAdminClient();
    const { error } = await admin
      .from("hys_usuarios")
      .update({ activo: false })
      .eq("id", usuarioId);

    if (error) throw new Error(error.message);

    return { error: null };
  } catch (err) {
    return {
      error:
        err instanceof Error ? err.message : "Error al desactivar el usuario.",
    };
  }
}

/** Cambia el rol de un usuario. Solo puede ejecutarlo otro admin logueado. */
export async function actualizarRolUsuarioAction(
  usuarioId: string,
  rol: "evaluador" | "admin"
): Promise<{ error: string | null }> {
  try {
    const admin_actual = await exigirAdmin();

    if (usuarioId === admin_actual.id && rol !== "admin") {
      throw new Error("No podés quitarte tu propio rol de admin.");
    }

    const admin = createSupabaseAdminClient();
    const { error } = await admin
      .from("hys_usuarios")
      .update({ rol })
      .eq("id", usuarioId);

    if (error) throw new Error(error.message);

    return { error: null };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Error al cambiar el rol.",
    };
  }
}

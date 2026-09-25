import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Nexo RRHH (portal de recibos de sueldo) es OTRO sistema, con su propio
 * proyecto Supabase por empresa — no tiene nada que ver con el proyecto de
 * este tablero. El Módulo de Capacitación no duplica esos datos: lee y
 * escribe directamente en la base de Nexo RRHH, para que lo que se cargue
 * acá aparezca tal cual en el portal que ya usan los empleados.
 *
 * `NEXO_RRHH_CIMOMET_URL` / `_ANON_KEY` son públicas por diseño (así están
 * en el propio repo de Nexo RRHH). `_SERVICE_ROLE_KEY` NO lo es: solo se usa
 * server-side acá, nunca se expone al cliente.
 */
const NEXO_RRHH_CIMOMET_URL = "https://qnqikspihpljzvojlpak.supabase.co";
const NEXO_RRHH_CIMOMET_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFucWlrc3BpaHBsanp2b2pscGFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NzA0OTUsImV4cCI6MjA5NTU0NjQ5NX0.I8C7huQtXoYc4Mhm8oCX-E7XKXRx4xDSNVNhKz2d6uo";

/** ID fijo de la fila de `empresas` de Cimomet en el proyecto de Nexo RRHH. */
export const NEXO_RRHH_EMPRESA_ID = "c4dcd642-16fc-40b0-acef-1306d57690be";

/**
 * Cliente con la anon key: alcanza para lo poco que Nexo RRHH deja leer sin
 * sesión de admin (hoy, `sectores`).
 */
export function createNexoRrhhPublicClient() {
  return createClient(NEXO_RRHH_CIMOMET_URL, NEXO_RRHH_CIMOMET_ANON_KEY);
}

/**
 * Cliente con la service_role de Nexo RRHH: bypassea su RLS (que exige
 * `is_admin()` de SU propio sistema de auth, al que este tablero no
 * pertenece). Placeholder hasta tener la key — cuando se agregue
 * `NEXO_RRHH_CIMOMET_SERVICE_ROLE_KEY` a las variables de entorno, el resto
 * del módulo (servicios que ya están escritos contra esta función) empieza
 * a escribir de verdad sin tocar nada más.
 */
export function createNexoRrhhAdminClient() {
  const serviceRoleKey = process.env.NEXO_RRHH_CIMOMET_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error(
      "Falta NEXO_RRHH_CIMOMET_SERVICE_ROLE_KEY: todavía no está conectada la escritura a Nexo RRHH."
    );
  }
  return createClient(NEXO_RRHH_CIMOMET_URL, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

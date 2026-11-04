import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { EmpresaCapacitacion } from "@modules/capacitacion/empresas";

/**
 * Nexo RRHH (portal de recibos de sueldo) es OTRO sistema, con su propio
 * proyecto Supabase POR EMPRESA — no tiene nada que ver con el proyecto de
 * este tablero, y Cimomet/Comoing NO comparten base: son dos proyectos
 * Supabase distintos, cada uno con su propia `service_role` key. El Módulo
 * de Capacitación no duplica esos datos: lee y escribe directamente en la
 * base de Nexo RRHH que corresponda, para que lo que se cargue acá aparezca
 * tal cual en el portal que ya usan los empleados de esa empresa.
 *
 * Las `url`/`anonKey` de cada proyecto son públicas por diseño (así están en
 * el propio repo de Nexo RRHH). La `service_role` key NO lo es: vive en una
 * variable de entorno por empresa, solo se usa server-side, nunca se expone
 * al cliente.
 */
interface NexoRrhhProyecto {
  url: string;
  anonKey: string;
  empresaId: string;
  portalUrl: string;
  serviceRoleEnvVar: string;
}

const NEXO_RRHH_PROYECTOS: Record<EmpresaCapacitacion, NexoRrhhProyecto> = {
  cimomet: {
    url: "https://qnqikspihpljzvojlpak.supabase.co",
    anonKey:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFucWlrc3BpaHBsanp2b2pscGFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NzA0OTUsImV4cCI6MjA5NTU0NjQ5NX0.I8C7huQtXoYc4Mhm8oCX-E7XKXRx4xDSNVNhKz2d6uo",
    empresaId: "c4dcd642-16fc-40b0-acef-1306d57690be",
    portalUrl: "https://portal.cimomet.com.ar",
    serviceRoleEnvVar: "NEXO_RRHH_CIMOMET_SERVICE_ROLE_KEY",
  },
  comoing: {
    url: "https://dbcfbhblwezcvtqtrxkm.supabase.co",
    anonKey:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRiY2ZiaGJsd2V6Y3Z0cXRyeGttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NjkxNjIsImV4cCI6MjA5NTU0NTE2Mn0.N3-sNZ4uxesXhnY0ig-pZuPj-gEr1AGjfSC6Dhg8D7w",
    empresaId: "c7df7701-58b3-4fdf-b37c-cf5c853bfac8",
    portalUrl: "https://portal.comoing.com.ar",
    serviceRoleEnvVar: "NEXO_RRHH_COMOING_SERVICE_ROLE_KEY",
  },
};

export function obtenerNexoRrhhProyecto(empresa: EmpresaCapacitacion): NexoRrhhProyecto {
  return NEXO_RRHH_PROYECTOS[empresa];
}

/**
 * Cliente con la anon key: alcanza para lo poco que Nexo RRHH deja leer sin
 * sesión de admin (hoy, `sectores`).
 */
export function createNexoRrhhPublicClient(empresa: EmpresaCapacitacion) {
  const proyecto = NEXO_RRHH_PROYECTOS[empresa];
  return createClient(proyecto.url, proyecto.anonKey);
}

/**
 * Cliente con la service_role de Nexo RRHH: bypassea su RLS (que exige
 * `is_admin()` de SU propio sistema de auth, al que este tablero no
 * pertenece). Tira un error explicativo si todavía no se cargó la
 * `service_role` key de esa empresa en las variables de entorno.
 */
export function createNexoRrhhAdminClient(empresa: EmpresaCapacitacion) {
  const proyecto = NEXO_RRHH_PROYECTOS[empresa];
  const serviceRoleKey = process.env[proyecto.serviceRoleEnvVar];
  if (!serviceRoleKey) {
    throw new Error(
      `Falta ${proyecto.serviceRoleEnvVar}: todavía no está conectada la escritura a Nexo RRHH (${empresa}).`
    );
  }
  return createClient(proyecto.url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Empresas que este módulo puede capacitar. Cada una vive en SU PROPIO
 * proyecto Supabase de Nexo RRHH (ver `@core/supabase/nexoRrhh`), no en una
 * columna compartida. Este archivo es el único lado "público" de esa
 * configuración (nombre a mostrar, logo): lo puede importar tanto código de
 * servidor como componentes de cliente (p. ej. para armar la constancia en
 * el navegador). Las claves service_role NUNCA están acá.
 */
export type EmpresaCapacitacion = "cimomet" | "comoing";

interface EmpresaCapacitacionInfo {
  label: string;
  empresaNombre: string;
  logoUrl: string;
  /** anon key del proyecto Supabase de Nexo RRHH de esta empresa — pública por diseño, segura para el navegador. */
  nexoRrhhUrl: string;
  nexoRrhhAnonKey: string;
}

export const EMPRESAS_CAPACITACION: Record<EmpresaCapacitacion, EmpresaCapacitacionInfo> = {
  cimomet: {
    label: "Cimomet",
    empresaNombre: "CIMOMET S.A.",
    logoUrl: "https://portal.cimomet.com.ar/logos/cimomet.png",
    nexoRrhhUrl: "https://qnqikspihpljzvojlpak.supabase.co",
    nexoRrhhAnonKey:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFucWlrc3BpaHBsanp2b2pscGFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NzA0OTUsImV4cCI6MjA5NTU0NjQ5NX0.I8C7huQtXoYc4Mhm8oCX-E7XKXRx4xDSNVNhKz2d6uo",
  },
  comoing: {
    label: "Co.mo.ing",
    empresaNombre: "Co.mo.ing S.R.L.",
    logoUrl: "https://portal.comoing.com.ar/logos/comoing.png",
    nexoRrhhUrl: "https://dbcfbhblwezcvtqtrxkm.supabase.co",
    nexoRrhhAnonKey:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRiY2ZiaGJsd2V6Y3Z0cXRyeGttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NjkxNjIsImV4cCI6MjA5NTU0NTE2Mn0.N3-sNZ4uxesXhnY0ig-pZuPj-gEr1AGjfSC6Dhg8D7w",
  },
};

export const EMPRESA_CAPACITACION_DEFAULT: EmpresaCapacitacion = "cimomet";

export function esEmpresaCapacitacion(valor: string | undefined | null): valor is EmpresaCapacitacion {
  return valor === "cimomet" || valor === "comoing";
}

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
}

export const EMPRESAS_CAPACITACION: Record<EmpresaCapacitacion, EmpresaCapacitacionInfo> = {
  cimomet: {
    label: "Cimomet",
    empresaNombre: "CIMOMET S.A.",
    logoUrl: "https://portal.cimomet.com.ar/logos/cimomet.png",
  },
  comoing: {
    label: "Co.mo.ing",
    empresaNombre: "Co.mo.ing S.R.L.",
    logoUrl: "https://portal.comoing.com.ar/logos/comoing.png",
  },
};

export const EMPRESA_CAPACITACION_DEFAULT: EmpresaCapacitacion = "cimomet";

export function esEmpresaCapacitacion(valor: string | undefined | null): valor is EmpresaCapacitacion {
  return valor === "cimomet" || valor === "comoing";
}

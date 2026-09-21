/**
 * Registro central de módulos de la aplicación.
 *
 * Para agregar un Módulo 2, 3, etc. en el futuro:
 *  1. Crear la carpeta del módulo en `src/modules/<nombre-modulo>`.
 *  2. Crear sus rutas en `src/app/<segmento>`.
 *  3. Agregar una entrada aquí abajo.
 *
 * El Sidebar y el AppShell NO deben modificarse para soportar módulos nuevos:
 * ambos leen esta lista dinámicamente.
 */

export interface NavItem {
  label: string;
  href: string;
}

export interface ModuleNavConfig {
  id: string;
  label: string;
  /** Ruta base del módulo (usada para resaltar el item activo en el sidebar) */
  basePath: string;
  icon?: string;
  items: NavItem[];
}

export const APP_MODULES: ModuleNavConfig[] = [
  {
    id: "evaluacion-preventiva",
    label: "Evaluación Preventiva",
    basePath: "/evaluacion-preventiva",
    icon: "shield-check",
    items: [
      { label: "Resumen", href: "/evaluacion-preventiva" },
      { label: "Personal", href: "/evaluacion-preventiva/personal" },
      { label: "Evaluaciones", href: "/evaluacion-preventiva/evaluaciones" },
      { label: "Vista H&S", href: "/evaluacion-preventiva/reportes/hys" },
      {
        label: "Vista Dirección/RRHH",
        href: "/evaluacion-preventiva/reportes/desempeno",
      },
    ],
  },
  // Módulo 2: agregar su ModuleNavConfig acá cuando exista.
];

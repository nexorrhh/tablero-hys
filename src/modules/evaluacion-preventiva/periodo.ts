/**
 * Un "período" es el mes/año de desempeño que se está evaluando (no la fecha
 * en la que se carga la evaluación). Las evaluaciones siempre se cargan a
 * mes vencido: en septiembre corresponde evaluar agosto.
 */
export interface Periodo {
  mes: number;
  anio: number;
}

/**
 * El módulo empezó a exigir evaluaciones a partir de este período: no se
 * generan meses pendientes/seleccionables anteriores a este, aunque haya
 * empleados activos desde antes.
 */
export const PERIODO_MINIMO_EXIGIBLE: Periodo = { mes: 8, anio: 2026 };

function compararPeriodos(a: Periodo, b: Periodo): number {
  return a.anio !== b.anio ? a.anio - b.anio : a.mes - b.mes;
}

const NOMBRES_MES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

/** El último mes ya cerrado respecto de `referencia` (por defecto, hoy). */
export function calcularMesVencido(referencia: Date = new Date()): Periodo {
  const mesActual = referencia.getMonth() + 1;
  if (mesActual === 1) return { mes: 12, anio: referencia.getFullYear() - 1 };
  return { mes: mesActual - 1, anio: referencia.getFullYear() };
}

export function restarUnMes(periodo: Periodo): Periodo {
  if (periodo.mes === 1) return { mes: 12, anio: periodo.anio - 1 };
  return { mes: periodo.mes - 1, anio: periodo.anio };
}

/**
 * Los últimos meses vencidos, más reciente primero, sin bajar nunca de
 * `PERIODO_MINIMO_EXIGIBLE` (tope de `cantidad` como límite superior).
 */
export function generarUltimosPeriodos(
  cantidad: number,
  desde: Periodo = calcularMesVencido(),
  minimo: Periodo = PERIODO_MINIMO_EXIGIBLE
): Periodo[] {
  const resultado: Periodo[] = [];
  let cursor = desde;
  for (let i = 0; i < cantidad; i++) {
    if (compararPeriodos(cursor, minimo) < 0) break;
    resultado.push(cursor);
    cursor = restarUnMes(cursor);
  }
  return resultado;
}

export function formatearPeriodo({ mes, anio }: Periodo): string {
  const nombre = NOMBRES_MES[mes - 1] ?? String(mes);
  return `${nombre.charAt(0).toUpperCase()}${nombre.slice(1)} ${anio}`;
}

export function periodoAClave({ mes, anio }: Periodo): string {
  return `${anio}-${mes}`;
}

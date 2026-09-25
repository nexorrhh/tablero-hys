import { CLASIFICACIONES_ACCIDENTE, ESTADOS_EVENTO, TIPOS_EVENTO } from "../constants";

interface FiltrosRegistroProps {
  valores: {
    q?: string;
    tipo?: string;
    estado?: string;
    clasificacion?: string;
    desde?: string;
    hasta?: string;
  };
}

/**
 * Formulario GET simple (sin JS): al enviarlo, Next.js re-renderiza la
 * página con los query params, y `page.tsx` arma el filtro para el service.
 */
export function FiltrosRegistro({ valores }: FiltrosRegistroProps) {
  return (
    <form
      method="get"
      className="mb-4 grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-3 lg:grid-cols-6"
    >
      <div className="sm:col-span-2 lg:col-span-2">
        <label className="mb-1 block text-xs font-medium text-slate-600">Buscar</label>
        <input
          type="text"
          name="q"
          defaultValue={valores.q}
          placeholder="Descripción..."
          className="w-full rounded-md border border-slate-300 p-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Tipo</label>
        <select
          name="tipo"
          defaultValue={valores.tipo ?? ""}
          className="w-full rounded-md border border-slate-300 p-2 text-sm"
        >
          <option value="">Todos</option>
          {TIPOS_EVENTO.map((t) => (
            <option key={t.valor} value={t.valor}>
              {t.etiqueta}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Estado</label>
        <select
          name="estado"
          defaultValue={valores.estado ?? ""}
          className="w-full rounded-md border border-slate-300 p-2 text-sm"
        >
          <option value="">Todos</option>
          {ESTADOS_EVENTO.map((e) => (
            <option key={e.valor} value={e.valor}>
              {e.etiqueta}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Clasificación</label>
        <select
          name="clasificacion"
          defaultValue={valores.clasificacion ?? ""}
          className="w-full rounded-md border border-slate-300 p-2 text-sm"
        >
          <option value="">Todas</option>
          {CLASIFICACIONES_ACCIDENTE.map((c) => (
            <option key={c.valor} value={c.valor}>
              {c.valor === "particular" ? "ASTRO laboral" : c.etiqueta}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Desde</label>
        <input
          type="date"
          name="desde"
          defaultValue={valores.desde}
          className="w-full rounded-md border border-slate-300 p-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Hasta</label>
        <input
          type="date"
          name="hasta"
          defaultValue={valores.hasta}
          className="w-full rounded-md border border-slate-300 p-2 text-sm"
        />
      </div>

      <div className="flex items-end gap-2 sm:col-span-3 lg:col-span-6">
        <button
          type="submit"
          className="rounded-md bg-brand-accent px-4 py-2 text-sm font-medium text-white hover:bg-brand-accent/90"
        >
          Filtrar
        </button>
        <a
          href="/eventos-hys/registro"
          className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:border-brand-accent"
        >
          Limpiar
        </a>
      </div>
    </form>
  );
}

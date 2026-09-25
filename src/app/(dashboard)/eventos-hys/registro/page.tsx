import Link from "next/link";
import { Topbar } from "@core/layout/Topbar";
import { Badge } from "@core/ui/Badge";
import { Card } from "@core/ui/Card";
import { createSupabaseServerClient } from "@core/supabase/server";
import { EventosService } from "@modules/eventos-hys/services/eventos.service";
import { FiltrosRegistro } from "@modules/eventos-hys/components/FiltrosRegistro";
import { ExportarCsvButton } from "@modules/eventos-hys/components/ExportarCsvButton";

interface SearchParams {
  q?: string;
  tipo?: string;
  estado?: string;
  clasificacion?: string;
  desde?: string;
  hasta?: string;
}

export default async function RegistroEventosPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = createSupabaseServerClient();
  const eventosService = new EventosService(supabase);

  const eventos = await eventosService.listar({
    q: searchParams.q,
    tipo: searchParams.tipo === "accidente" || searchParams.tipo === "incidente" ? searchParams.tipo : undefined,
    estado: searchParams.estado === "pendiente" || searchParams.estado === "cerrado" ? searchParams.estado : undefined,
    clasificacion:
      searchParams.clasificacion === "ART" || searchParams.clasificacion === "particular"
        ? searchParams.clasificacion
        : undefined,
    desde: searchParams.desde,
    hasta: searchParams.hasta,
  });

  return (
    <>
      <Topbar
        title="Registro de eventos"
        actions={
          <Link
            href="/eventos-hys/registro/nuevo"
            className="rounded-md bg-brand-accent px-4 py-2 text-sm font-medium text-white hover:bg-brand-accent/90"
          >
            + Nuevo evento
          </Link>
        }
      />

      <div className="p-6">
        <FiltrosRegistro valores={searchParams} />

        <p className="mb-3 text-sm text-slate-500">
          Tocá un evento para ver el detalle y cargarle el seguimiento hasta cerrarlo.
        </p>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              {eventos.length} evento{eventos.length === 1 ? "" : "s"}
            </p>
            <ExportarCsvButton eventos={eventos} />
          </div>

          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-2">Fecha</th>
                <th className="pb-2">Tipo</th>
                <th className="pb-2">Empleado</th>
                <th className="pb-2">Sector</th>
                <th className="pb-2">Clasificación</th>
                <th className="pb-2">Descripción</th>
                <th className="pb-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {eventos.map((ev) => (
                <tr key={ev.id} className="border-b border-slate-100 last:border-0">
                  <td className="p-0">
                    <Link
                      href={`/eventos-hys/registro/${ev.id}`}
                      className="block px-0 py-2 text-slate-600 hover:text-brand-accent"
                    >
                      {ev.fecha}
                    </Link>
                  </td>
                  <td className="py-2">
                    <Badge variant={ev.tipo === "accidente" ? "danger" : "warning"}>
                      {ev.tipo === "accidente" ? "Accidente" : "Incidente"}
                    </Badge>
                  </td>
                  <td className="py-2 text-slate-700">
                    {ev.empleado?.apellido_y_nombre ?? "—"}
                  </td>
                  <td className="py-2 text-slate-600">{ev.empleado?.desc_puesto ?? "—"}</td>
                  <td className="py-2 text-slate-600">
                    {ev.clasificacion === "particular" ? "ASTRO laboral" : ev.clasificacion ?? "—"}
                    {ev.in_itinere ? " · in itinere" : ""}
                  </td>
                  <td className="py-2 max-w-xs truncate text-slate-600" title={ev.descripcion}>
                    {ev.descripcion}
                  </td>
                  <td className="py-2">
                    <Link href={`/eventos-hys/registro/${ev.id}`}>
                      <Badge variant={ev.estado === "cerrado" ? "success" : "default"}>
                        {ev.estado === "cerrado" ? "Cerrado" : "Pendiente"}
                      </Badge>
                    </Link>
                  </td>
                </tr>
              ))}
              {eventos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400">
                    No hay eventos que coincidan con el filtro.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </Card>
      </div>
    </>
  );
}

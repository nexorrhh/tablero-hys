import Link from "next/link";
import { Topbar } from "@core/layout/Topbar";
import { Badge } from "@core/ui/Badge";
import { Card } from "@core/ui/Card";
import { createSupabaseServerClient } from "@core/supabase/server";
import { EventosService } from "@modules/eventos-hys/services/eventos.service";

export default async function RegistroEventosPage() {
  const supabase = createSupabaseServerClient();
  const eventosService = new EventosService(supabase);
  const eventos = await eventosService.listar();

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
        <Card>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-2">Fecha</th>
                <th className="pb-2">Tipo</th>
                <th className="pb-2">Empleado</th>
                <th className="pb-2">Sector</th>
                <th className="pb-2">Clasificación</th>
                <th className="pb-2">Descripción</th>
              </tr>
            </thead>
            <tbody>
              {eventos.map((ev) => (
                <tr key={ev.id} className="border-b border-slate-100 last:border-0">
                  <td className="py-2 text-slate-600">{ev.fecha}</td>
                  <td className="py-2">
                    <Badge variant={ev.tipo === "accidente" ? "danger" : "warning"}>
                      {ev.tipo === "accidente" ? "Accidente" : "Incidente"}
                    </Badge>
                  </td>
                  <td className="py-2 text-slate-700">
                    {ev.empleado?.apellido_y_nombre ?? "—"}
                  </td>
                  <td className="py-2 text-slate-600">{ev.sector?.nombre ?? "—"}</td>
                  <td className="py-2 text-slate-600">
                    {ev.clasificacion ?? "—"}
                    {ev.in_itinere ? " · in itinere" : ""}
                  </td>
                  <td className="py-2 max-w-xs truncate text-slate-600" title={ev.descripcion}>
                    {ev.descripcion}
                  </td>
                </tr>
              ))}
              {eventos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    Todavía no hay eventos cargados.
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

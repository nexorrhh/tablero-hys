import { notFound } from "next/navigation";
import { Topbar } from "@core/layout/Topbar";
import { createSupabaseServerClient } from "@core/supabase/server";
import { EmpleadosService } from "@core/rrhh/empleados.service";
import { EventosService } from "@modules/eventos-hys/services/eventos.service";
import { SeguimientoService } from "@modules/eventos-hys/services/seguimiento.service";
import { EventoDetalle } from "@modules/eventos-hys/components/EventoDetalle";
import { crearSeguimientoAction, actualizarEstadoSeguimientoAction } from "../../seguimiento/actions";
import {
  cerrarEventoAction,
  obtenerUrlInformeAction,
  reabrirEventoAction,
  subirInformeAction,
} from "./actions";

export default async function DetalleEventoPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createSupabaseServerClient();
  const eventosService = new EventosService(supabase);
  const seguimientoService = new SeguimientoService(supabase);
  const empleadosService = new EmpleadosService(supabase);

  const [evento, acciones, empleados] = await Promise.all([
    eventosService.obtenerCompleto(params.id),
    seguimientoService.listarPorEvento(params.id),
    empleadosService.listarActivos(),
  ]);

  if (!evento) notFound();

  return (
    <>
      <Topbar title={`Evento del ${evento.fecha}`} />

      <div className="p-6">
        <EventoDetalle
          evento={evento}
          acciones={acciones}
          empleados={empleados}
          onCrearSeguimiento={crearSeguimientoAction}
          onActualizarEstadoSeguimiento={actualizarEstadoSeguimientoAction}
          onCerrarEvento={cerrarEventoAction}
          onReabrirEvento={reabrirEventoAction}
          onSubirInforme={subirInformeAction}
          onObtenerUrlInforme={obtenerUrlInformeAction}
        />
      </div>
    </>
  );
}

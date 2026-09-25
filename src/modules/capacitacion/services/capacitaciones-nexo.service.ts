import { createNexoRrhhAdminClient, NEXO_RRHH_EMPRESA_ID } from "@core/supabase/nexoRrhh";
import type {
  CapacitacionNexo,
  CapacitacionProgresoNexo,
  EmpleadoNexo,
  NuevaCapacitacionPayload,
  SeguimientoCapacitacionRow,
} from "../types";

const NEXO_RRHH_URL = "https://qnqikspihpljzvojlpak.supabase.co";
const NEXO_RRHH_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFucWlrc3BpaHBsanp2b2pscGFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NzA0OTUsImV4cCI6MjA5NTU0NjQ5NX0.I8C7huQtXoYc4Mhm8oCX-E7XKXRx4xDSNVNhKz2d6uo";

/**
 * Notifica por mail al empleado de una capacitación nueva/asignada (Edge
 * Function propia de Nexo RRHH). Best-effort: si falla, no rompe el alta.
 */
async function notificarCapacitacion(params: {
  empleado_id: string;
  capacitacion_id: string;
  titulo: string;
  descripcion: string | null;
  fecha_limite: string | null;
}): Promise<void> {
  try {
    await fetch(`${NEXO_RRHH_URL}/functions/v1/rapid-function?action=notificar_capacitacion`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: NEXO_RRHH_ANON_KEY,
        Authorization: `Bearer ${NEXO_RRHH_ANON_KEY}`,
      },
      body: JSON.stringify({ ...params, portal_url: "https://portal.cimomet.com.ar" }),
    });
  } catch {
    // Best-effort, igual que en Nexo RRHH.
  }
}

/**
 * Capa de acceso a `capacitaciones` (y tablas relacionadas) en el proyecto
 * de Nexo RRHH — Cimomet. Requiere `NEXO_RRHH_CIMOMET_SERVICE_ROLE_KEY`
 * configurada (ver `createNexoRrhhAdminClient`); hasta entonces, cualquier
 * llamada de esta clase tira el error explicativo de esa función.
 */
export class CapacitacionesNexoService {
  private get admin() {
    return createNexoRrhhAdminClient();
  }

  async listar(): Promise<CapacitacionNexo[]> {
    const { data, error } = await this.admin
      .from("capacitaciones")
      .select("*")
      .eq("empresa_id", NEXO_RRHH_EMPRESA_ID)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []) as CapacitacionNexo[];
  }

  async crear(payload: NuevaCapacitacionPayload): Promise<CapacitacionNexo> {
    const admin = this.admin;

    const { data: cap, error: errorCap } = await admin
      .from("capacitaciones")
      .insert({
        empresa_id: NEXO_RRHH_EMPRESA_ID,
        origen: "hys",
        titulo: payload.titulo,
        descripcion: payload.descripcion || null,
        tipo: payload.tipo,
        contenido_url: payload.contenidoUrl,
        contenido_texto: payload.contenidoTexto,
        tiene_quiz: payload.tieneQuiz,
        puntaje_minimo: payload.tieneQuiz ? payload.puntajeMinimo : null,
        obligatoria_todos: payload.asignacion === "todos",
        periodicidad_meses: payload.periodicidadMeses,
        fecha_limite: payload.fechaLimite,
        codigo: payload.codigo,
        lugar: payload.lugar,
        duracion: payload.duracion,
        hora_inicio: payload.horaInicio,
        instructor_nombre: payload.instructorNombre,
        instructor_matricula: payload.instructorMatricula,
      })
      .select("*")
      .single();

    if (errorCap) throw errorCap;
    const capacitacion = cap as CapacitacionNexo;

    let empIdsParaMail: string[] = [];

    if (payload.asignacion === "todos") {
      const { data: todos } = await admin
        .from("empleados")
        .select("id")
        .eq("empresa_id", NEXO_RRHH_EMPRESA_ID)
        .eq("activo", true);
      empIdsParaMail = ((todos ?? []) as { id: string }[]).map((e) => e.id);
    } else if (payload.asignacion === "sector" && payload.sectorIds.length) {
      await admin
        .from("capacitacion_sectores")
        .insert(payload.sectorIds.map((sectorId) => ({ capacitacion_id: capacitacion.id, sector_id: sectorId })));
      const { data: empsXsec } = await admin
        .from("empleados")
        .select("id")
        .eq("activo", true)
        .in("sector_id", payload.sectorIds);
      empIdsParaMail = ((empsXsec ?? []) as { id: string }[]).map((e) => e.id);
    } else if (payload.asignacion === "individual" && payload.empleadoIds.length) {
      await admin
        .from("capacitacion_empleados")
        .insert(payload.empleadoIds.map((empleadoId) => ({ capacitacion_id: capacitacion.id, empleado_id: empleadoId })));
      empIdsParaMail = payload.empleadoIds;
    }

    if (payload.tieneQuiz) {
      let orden = 0;
      for (const pregunta of payload.preguntas) {
        if (!pregunta.texto.trim()) continue;
        orden++;
        const { data: preguntaCreada } = await admin
          .from("preguntas_quiz")
          .insert({ capacitacion_id: capacitacion.id, pregunta: pregunta.texto.trim(), orden })
          .select("id")
          .single();
        if (!preguntaCreada) continue;
        const opciones = pregunta.opciones
          .filter((o) => o.texto.trim())
          .map((o, idx) => ({
            pregunta_id: (preguntaCreada as { id: string }).id,
            texto: o.texto.trim(),
            es_correcta: o.esCorrecta,
            orden: idx + 1,
          }));
        if (opciones.length) await admin.from("opciones_quiz").insert(opciones);
      }
    }

    for (const empleadoId of empIdsParaMail) {
      void notificarCapacitacion({
        empleado_id: empleadoId,
        capacitacion_id: capacitacion.id,
        titulo: payload.titulo,
        descripcion: payload.descripcion || null,
        fecha_limite: payload.fechaLimite,
      });
    }

    return capacitacion;
  }

  async toggleActivo(id: string, activoActual: boolean): Promise<void> {
    const { error } = await this.admin.from("capacitaciones").update({ activo: !activoActual }).eq("id", id);
    if (error) throw error;
  }

  async archivar(id: string, archivado: boolean): Promise<void> {
    const { error } = await this.admin.from("capacitaciones").update({ archivado }).eq("id", id);
    if (error) throw error;
  }

  async eliminar(id: string): Promise<void> {
    const admin = this.admin;
    await admin.from("capacitacion_progreso").delete().eq("capacitacion_id", id);
    await admin.from("capacitacion_empleados").delete().eq("capacitacion_id", id);
    await admin.from("capacitacion_sectores").delete().eq("capacitacion_id", id);
    const { data: preguntas } = await admin.from("preguntas_quiz").select("id").eq("capacitacion_id", id);
    if (preguntas && preguntas.length) {
      const ids = (preguntas as { id: string }[]).map((p) => p.id);
      await admin.from("opciones_quiz").delete().in("pregunta_id", ids);
      await admin.from("preguntas_quiz").delete().eq("capacitacion_id", id);
    }
    const { error } = await admin.from("capacitaciones").delete().eq("id", id);
    if (error) throw error;
  }

  /** Empleados asignados a la capacitación + su progreso (para la pantalla de seguimiento). */
  async obtenerSeguimiento(capId: string): Promise<SeguimientoCapacitacionRow[]> {
    const admin = this.admin;
    const [{ data: cap }, { data: asigInd }, { data: asigSec }, { data: progreso }, { data: empleados }] =
      await Promise.all([
        admin.from("capacitaciones").select("obligatoria_todos").eq("id", capId).single(),
        admin.from("capacitacion_empleados").select("empleado_id").eq("capacitacion_id", capId),
        admin.from("capacitacion_sectores").select("sector_id").eq("capacitacion_id", capId),
        admin.from("capacitacion_progreso").select("*").eq("capacitacion_id", capId),
        admin
          .from("empleados")
          .select("id, nombre, apellido, legajo, cuil, sector_id")
          .eq("empresa_id", NEXO_RRHH_EMPRESA_ID)
          .eq("activo", true)
          .order("apellido"),
      ]);

    const obligatoriaTodos = (cap as { obligatoria_todos?: boolean } | null)?.obligatoria_todos ?? false;
    const idsIndividual = new Set(((asigInd ?? []) as { empleado_id: string }[]).map((a) => a.empleado_id));
    const sectorIds = new Set(((asigSec ?? []) as { sector_id: string }[]).map((a) => a.sector_id));
    const todosLosEmpleados = (empleados ?? []) as EmpleadoNexo[];

    const scope = todosLosEmpleados.filter(
      (e) => obligatoriaTodos || idsIndividual.has(e.id) || (e.sector_id && sectorIds.has(e.sector_id))
    );

    const progMap: Record<string, CapacitacionProgresoNexo> = {};
    ((progreso ?? []) as CapacitacionProgresoNexo[]).forEach((p) => {
      progMap[p.empleado_id] = p;
    });

    return scope.map((empleado) => ({ empleado, progreso: progMap[empleado.id] ?? null }));
  }

  async subirPdfContenido(file: File): Promise<string | null> {
    const admin = this.admin;
    const fileName = `${Date.now()}_${file.name}`;
    const { error } = await admin.storage
      .from("capacitaciones")
      .upload(fileName, file, { contentType: "application/pdf", upsert: true });
    if (error) return null;
    const {
      data: { publicUrl },
    } = admin.storage.from("capacitaciones").getPublicUrl(fileName);
    return publicUrl;
  }
}

import { createNexoRrhhAdminClient, obtenerNexoRrhhProyecto } from "@core/supabase/nexoRrhh";
import { INSTRUCTOR_DEFAULT } from "../constants";
import type { EmpresaCapacitacion } from "../empresas";
import type {
  CapacitacionNexo,
  CapacitacionProgresoNexo,
  EmpleadoNexo,
  NuevaCapacitacionPayload,
  SeguimientoCapacitacionRow,
} from "../types";

/**
 * Notifica por mail al empleado de una capacitación nueva/asignada (Edge
 * Function propia de Nexo RRHH, desplegada en el proyecto de cada empresa).
 * Best-effort: si falla, no rompe el alta.
 */
async function notificarCapacitacion(
  empresa: EmpresaCapacitacion,
  params: {
    empleado_id: string;
    capacitacion_id: string;
    titulo: string;
    descripcion: string | null;
    fecha_limite: string | null;
  }
): Promise<void> {
  const proyecto = obtenerNexoRrhhProyecto(empresa);
  try {
    await fetch(`${proyecto.url}/functions/v1/rapid-function?action=notificar_capacitacion`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: proyecto.anonKey,
        Authorization: `Bearer ${proyecto.anonKey}`,
      },
      body: JSON.stringify({ ...params, portal_url: proyecto.portalUrl }),
    });
  } catch {
    // Best-effort, igual que en Nexo RRHH.
  }
}

/**
 * Capa de acceso a `capacitaciones` (y tablas relacionadas) en el proyecto
 * de Nexo RRHH de la empresa indicada. Requiere la `service_role` key de esa
 * empresa configurada (ver `createNexoRrhhAdminClient`); hasta entonces,
 * cualquier llamada de esta clase tira el error explicativo de esa función.
 */
export class CapacitacionesNexoService {
  constructor(private readonly empresa: EmpresaCapacitacion) {}

  private get admin() {
    return createNexoRrhhAdminClient(this.empresa);
  }

  private get empresaId() {
    return obtenerNexoRrhhProyecto(this.empresa).empresaId;
  }

  async listarEmpleadosActivos(): Promise<EmpleadoNexo[]> {
    const { data, error } = await this.admin
      .from("empleados")
      .select("id, nombre, apellido, legajo, cuil, sector_id")
      .eq("empresa_id", this.empresaId)
      .eq("activo", true)
      .order("apellido");

    if (error) throw error;
    return (data ?? []) as EmpleadoNexo[];
  }

  async listar(): Promise<CapacitacionNexo[]> {
    const { data, error } = await this.admin
      .from("capacitaciones")
      .select("*")
      .eq("empresa_id", this.empresaId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []) as CapacitacionNexo[];
  }

  /**
   * URL firmada para que el PDF se suba DIRECTO desde el navegador a Storage
   * (nunca pasa por una Server Action/función de Vercel): evita el límite de
   * tamaño de body de los Server Actions, que con un PDF real se supera fácil
   * en base64. El cliente sube con `uploadToSignedUrl(path, token, file)`.
   */
  async crearUrlSubidaPdf(nombreArchivo: string): Promise<{ path: string; token: string }> {
    const nombreSanitizado = nombreArchivo.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const path = `materiales/${Date.now()}_${nombreSanitizado}`;
    const { data, error } = await this.admin.storage.from("capacitaciones").createSignedUploadUrl(path);
    if (error) throw error;
    return { path: data.path, token: data.token };
  }

  async crear(payload: NuevaCapacitacionPayload): Promise<CapacitacionNexo> {
    const admin = this.admin;

    const { data: cap, error: errorCap } = await admin
      .from("capacitaciones")
      .insert({
        empresa_id: this.empresaId,
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
        // Por defecto se estampa la firma fija del técnico de H&S; si se
        // dibujó una firma puntual para esta capacitación, se reemplaza abajo.
        instructor_firma_url: payload.instructorFirma ? null : INSTRUCTOR_DEFAULT.firmaUrl,
      })
      .select("*")
      .single();

    if (errorCap) throw errorCap;
    const capacitacion = cap as CapacitacionNexo;

    if (payload.instructorFirma) {
      const path = `firmas/${capacitacion.id}-instructor.png`;
      const base64 = payload.instructorFirma.split(",")[1] ?? "";
      const buffer = Buffer.from(base64, "base64");
      const { error: errorSubida } = await admin.storage
        .from("capacitaciones")
        .upload(path, buffer, { contentType: "image/png", upsert: true });

      if (!errorSubida) {
        const {
          data: { publicUrl },
        } = admin.storage.from("capacitaciones").getPublicUrl(path);
        await admin.from("capacitaciones").update({ instructor_firma_url: publicUrl }).eq("id", capacitacion.id);
        capacitacion.instructor_firma_url = publicUrl;
      }
    }

    let empIdsParaMail: string[] = [];

    if (payload.asignacion === "todos") {
      const { data: todos } = await admin
        .from("empleados")
        .select("id")
        .eq("empresa_id", this.empresaId)
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
      void notificarCapacitacion(this.empresa, {
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
          .eq("empresa_id", this.empresaId)
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

  /** Ids de los empleados asignados individualmente (no por sector ni "todos"). */
  async obtenerAsignacionesIndividuales(capId: string): Promise<string[]> {
    const { data, error } = await this.admin
      .from("capacitacion_empleados")
      .select("empleado_id")
      .eq("capacitacion_id", capId);

    if (error) throw error;
    return ((data ?? []) as { empleado_id: string }[]).map((a) => a.empleado_id);
  }

  /**
   * Reemplaza la asignación individual completa de la capacitación por
   * `empleadoIds` (borra y vuelve a cargar, igual que en Nexo RRHH). Solo
   * notifica por mail a los que se agregan de nuevo, no a los que ya estaban.
   */
  async guardarAsignaciones(capId: string, empleadoIds: string[]): Promise<void> {
    const admin = this.admin;
    const previos = await this.obtenerAsignacionesIndividuales(capId);
    const prevSet = new Set(previos);
    const nuevos = empleadoIds.filter((id) => !prevSet.has(id));

    const { error: errorDelete } = await admin
      .from("capacitacion_empleados")
      .delete()
      .eq("capacitacion_id", capId);
    if (errorDelete) throw errorDelete;

    if (empleadoIds.length) {
      const { error: errorInsert } = await admin
        .from("capacitacion_empleados")
        .insert(empleadoIds.map((empleado_id) => ({ capacitacion_id: capId, empleado_id })));
      if (errorInsert) throw errorInsert;
    }

    if (nuevos.length) {
      const { data: cap } = await admin
        .from("capacitaciones")
        .select("titulo, descripcion, fecha_limite")
        .eq("id", capId)
        .single();

      for (const empleadoId of nuevos) {
        void notificarCapacitacion(this.empresa, {
          empleado_id: empleadoId,
          capacitacion_id: capId,
          titulo: cap?.titulo ?? "",
          descripcion: cap?.descripcion ?? null,
          fecha_limite: cap?.fecha_limite ?? null,
        });
      }
    }
  }
}

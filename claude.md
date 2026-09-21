# Contexto del Proyecto: Aplicación H&S (Health & Safety)

## Rol del Asistente (Claude)
Actuarás como un Arquitecto de Software Senior y Desarrollador Full-Stack. Tu objetivo principal es desarrollar esta aplicación con una **arquitectura altamente modular, escalable y desacoplada**. 
Se prefiere "gastar más tokens/código" ahora construyendo cimientos sólidos (componentes reutilizables, separación de responsabilidades, servicios centralizados) para que las futuras iteraciones y adiciones de módulos requieran cambios mínimos y no rompan el código existente.

## Stack Tecnológico
- **Base de Datos / Backend:** Supabase.
- **Despliegue:** Preparado para hacer push y despliegue mediante la app de **Antigravity**.
- **Frontend:** (A definir por el entorno actual, ej. React/Next.js o React Native, pero aplicando principios SOLID y Feature-Sliced Design).

## Reglas Estrictas de Arquitectura
1. **Modularidad:** El código debe dividirse en módulos. Cada módulo debe tener sus propias rutas, componentes, servicios de base de datos y utilidades.
2. **Servicios de Supabase:** NINGÚN componente de UI debe hacer llamadas directas a Supabase. Todas las llamadas deben pasar por una capa de abstracción/servicios (ej. `services/supabase/hys_evaluations.ts`).
3. **Escalabilidad:** Diseñar el estado y la UI asumiendo que hoy hay 1 módulo, pero en el futuro habrá 20. Usa layouts dinámicos y menús de navegación extensibles.

---

## Esquema de Base de Datos (Supabase)
**REGLA CRÍTICA:** TODAS las tablas creadas para este proyecto DEBEN llevar el prefijo `hys_` para aislar los datos del sector de H&S del resto de la base de datos de la empresa.

### Tablas Iniciales Propuestas:
1. **`hys_personal`** (Empleados a evaluar)
   - `id` (UUID, PK)
   - `nombre_completo` (String)
   - `puesto` (String)
   - `sector` (String)
   - `activo` (Boolean)

2. **`hys_evaluaciones_mensuales`** (Cabecera de la evaluación)
   - `id` (UUID, PK)
   - `personal_id` (UUID, FK a hys_personal)
   - `fecha_evaluacion` (Date)
   - `mes` (Integer)
   - `anio` (Integer)
   - `promedio_general` (Float) - *Calculado dinámicamente o guardado*
   - `ciclo_6_meses_id` (String/UUID opcional para agrupar semestres)

3. **`hys_evaluacion_detalles`** (Las notas de los 6 aspectos)
   - `id` (UUID, PK)
   - `evaluacion_id` (UUID, FK a hys_evaluaciones_mensuales)
   - `aspecto_id` (Integer, 1 al 6)
   - `puntaje` (Integer, 1 al 5)
   - `no_aplica` (Boolean) - *Si es true, el puntaje se ignora.*
   - `desvio_gestion` (Boolean) - *Si es true, se ignora para el promedio del empleado, pero suma para alertas de H&S.*
   - `observaciones` (Text)

---

## Módulo 1: Evaluación Preventiva de Personal

### 1. Objetivo del Módulo
Herramienta mensual para medir el cumplimiento de pautas de seguridad con enfoque preventivo y constructivo. El sistema debe permitir evaluar a los empleados activos del mes, generar reportes para capacitación (H&S) y calcular promedios anuales de desempeño (RRHH/Dirección).

### 2. Aspectos a Evaluar (6 puntos clave)
Para cada empleado, el evaluador deberá calificar los siguientes puntos:
1. **Uso de EPP básicos:** Elementos generales requeridos en planta.
2. **Uso de EPP específicos:** Elementos según puesto (ej. protección facial, mangas, polainas).
3. **Orden y limpieza:** Puesto, herramientas, cables, residuos.
4. **Maniobras de izaje:** Zona de exclusión, señalero, sogas, prohibición bajo carga.
5. **Recepción de indicaciones:** Comprensión y predisposición ante órdenes de seguridad.
6. **Conducta preventiva general:** Reporte de condiciones inseguras, cuidado de terceros.

### 3. Sistema de Puntuación y Lógica de Negocio
- **Escala:** 1 (Malo), 2 (Regular), 3 (Bueno), 4 (Muy bueno), 5 (Excelente).
- **Opción N/A:** Si un aspecto no se observó, se marca como `N/A`. **No afecta el promedio matemático**.
- **Desvío de Gestión (CRÍTICO):** Si un incumplimiento ocurre por falta de recursos (ej. la empresa no le dio el EPP), se debe poder marcar un checkbox de "Desvío de Gestión". 
  - *Lógica Backend:* Para el promedio individual del trabajador, este punto actúa como un `N/A` (no le baja la nota). 
  - *Lógica H&S:* Debe aparecer en rojo en el dashboard del sector como una alerta de infraestructura/compras.

### 4. Flujo de Evolución (6 Meses)
El sistema debe agrupar visualmente los resultados en bloques de 6 meses.
- Mes 1: Se toma como "Línea de base".
- Mes 2 al 6: Evaluaciones de seguimiento.
- Al final del Mes 6: El sistema debe mostrar un reporte de "Evolución", comparando gráficamente el Mes 1 vs Mes 6.

### 5. Salidas / Dashboards Requeridos (Dualidad de objetivos)
El desarrollo debe contemplar dos vistas o reportes principales para este módulo:
1. **Vista H&S (Operativa/Preventiva):** 
   - Mapa de calor de los aspectos con puntajes más bajos (para armar capacitaciones).
   - Listado de "Desvíos de Gestión" pendientes de solucionar.
2. **Vista Dirección/RRHH (Desempeño):**
   - Promedio ponderado anual por empleado (para utilizar a fin de año en la evaluación de desempeño global).

---

## Módulo 2: [Reservado para futura expansión]
*(El sistema base debe quedar preparado con un sidebar/navegación que permita incorporar un Módulo 2 fácilmente sin modificar el layout base ni la lógica de autenticación).*

---

## Instrucciones para el primer Output de Claude
Para empezar, por favor provéeme:
1. La inicialización y estructura de carpetas del proyecto recomendada para esta escalabilidad.
2. El script SQL para crear las tablas en Supabase con los permisos correspondientes (RLS si aplica).
3. El cascarón del Layout Principal y la navegación modular.
-- =============================================================================
-- Login interno: selección de nombre + PIN de 4 dígitos.
-- Mismo patrón que ya usan otras apps de Cimomet (compras_usuarios,
-- produccion_usuarios), adaptado para apoyarse en Supabase Auth en vez de
-- guardar el PIN nosotros mismos.
--
-- El PIN NUNCA se guarda en esta tabla: se delega en `auth.users` (Supabase
-- Auth), que ya lo hashea de forma segura como contraseña. `hys_usuarios` es
-- solo el mapeo público "nombre visible -> id de auth.users" que alimenta el
-- selector de la pantalla de login, más metadata propia de H&S (rol, activo).
--
-- Alta sin PIN: un admin crea el usuario solo con nombre (y, si corresponde,
-- el legajo de RRHH al que representa). Queda marcado `debe_crear_pin = true`
-- y la primera vez que esa persona entra a la app, en vez de pedirle el PIN
-- se le pide que cree uno (misma idea que `comercial_perfiles.debe_crear_password`
-- en la app de comercial).
-- =============================================================================

create table if not exists public.hys_usuarios (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre_visible text not null,
  empleado_id uuid references public.empleados (id),
  rol text not null default 'evaluador' check (rol in ('evaluador', 'admin')),
  activo boolean not null default true,
  debe_crear_pin boolean not null default true,
  created_at timestamptz not null default now()
);

comment on table public.hys_usuarios is 'Mapeo nombre visible -> auth.users para el login por nombre + PIN. El PIN vive hasheado en auth.users, no acá. empleado_id vincula (opcionalmente) con el legajo real de RRHH.';

create index if not exists idx_hys_usuarios_empleado on public.hys_usuarios (empleado_id);

-- Trazabilidad: quién cargó cada evaluación mensual.
alter table public.hys_evaluaciones_mensuales
  add column if not exists creado_por uuid references public.hys_usuarios (id) default auth.uid();

alter table public.hys_usuarios enable row level security;

-- La pantalla de login necesita listar los nombres ANTES de autenticarse
-- (para el selector), por eso esta tabla se puede leer sin sesión. No tiene
-- datos sensibles: el PIN vive fuera del schema público, en auth.users.
create policy "hys_usuarios_select_public"
  on public.hys_usuarios for select
  to anon, authenticated
  using (true);

-- No hay policies de insert/update/delete para anon/authenticated: el alta,
-- baja y edición de usuarios (y la creación del PIN inicial) se hacen
-- exclusivamente desde server actions que usan la service_role key (nunca
-- desde el cliente); el alta además valida ahí que quien la ejecuta tenga
-- rol = 'admin'.

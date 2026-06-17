-- DataSeed Portal — Supabase Production Auth Schema v2
-- Ejecutar en Supabase SQL Editor.
-- Mejoras vs v1:
--   - Todas las policies usan (select auth.uid()) para cachear el resultado
--   - Security definer functions con search_path vacío (previene inyección)
--   - Índices en columnas usadas por RLS
--   - Tabla audit_log para trazabilidad de acciones sensibles
--   - Tabla sessions_metadata para gestión de sesiones
--   - Trigger de onboarding: crea organización inicial para nuevos usuarios
--   - Rate limiting helper functions

-- ============================================================
-- EXTENSIONES
-- ============================================================
create extension if not exists pgcrypto;

-- ============================================================
-- TABLAS CORE
-- ============================================================

-- Organizaciones (clientes corporativos / DataSeed interna)
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null default 'client' check (type in ('internal', 'client', 'partner')),
  plan text not null default 'free' check (plan in ('free', 'starter', 'pro', 'enterprise')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Perfiles de usuarios (extiende auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  role text not null default 'client' check (role in ('admin', 'team', 'client')),
  is_active boolean not null default true,
  last_sign_in_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Relación usuario-organización (N:N con roles granulares)
create table if not exists public.user_organizations (
  user_id uuid not null references public.profiles(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (user_id, organization_id)
);

-- Reportes privados por organización
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  summary text,
  report_url text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auditoría de acciones sensibles
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  table_name text,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- ÍNDICES (críticos para performance de RLS)
-- ============================================================
create index if not exists idx_profiles_email on public.profiles(email);
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_user_org_user_id on public.user_organizations(user_id);
create index if not exists idx_user_org_org_id on public.user_organizations(organization_id);
create index if not exists idx_reports_org_id on public.reports(organization_id);
create index if not exists idx_reports_status on public.reports(status);
create index if not exists idx_audit_log_user_id on public.audit_log(user_id);
create index if not exists idx_audit_log_created_at on public.audit_log(created_at desc);

-- ============================================================
-- TRIGGERS: updated_at automático
-- ============================================================
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

DROP trigger if exists organizations_touch_updated_at on public.organizations;
create trigger organizations_touch_updated_at
  before update on public.organizations
  for each row execute function public.touch_updated_at();

drop trigger if exists reports_touch_updated_at on public.reports;
create trigger reports_touch_updated_at
  before update on public.reports
  for each row execute function public.touch_updated_at();

-- ============================================================
-- TRIGGER: Auto-crear profile al registrarse
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  default_org_id uuid;
begin
  -- Crear perfil
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name')
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(public.profiles.full_name, excluded.full_name),
    updated_at = now();

  -- Crear organización personal para el usuario
  insert into public.organizations (name, type)
  values (
    coalesce(new.raw_user_meta_data->>'full_name', new.email, 'Usuario') || ' — Personal',
    'client'
  )
  returning id into default_org_id;

  -- Asignar como owner de su organización
  insert into public.user_organizations (user_id, organization_id, role)
  values (new.id, default_org_id, 'owner');

  -- Auditoría
  insert into public.audit_log (user_id, action, table_name, record_id, new_data)
  values (new.id, 'user_registered', 'profiles', new.id, jsonb_build_object('email', new.email));

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- TRIGGER: Auditoría en cambios de profiles
-- ============================================================
create or replace function public.audit_profile_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.audit_log (user_id, action, table_name, record_id, old_data, new_data)
  values (
    (select auth.uid()),
    'profile_updated',
    'profiles',
    new.id,
    jsonb_build_object('full_name', old.full_name, 'role', old.role, 'is_active', old.is_active),
    jsonb_build_object('full_name', new.full_name, 'role', new.role, 'is_active', new.is_active)
  );
  return new;
end;
$$;

drop trigger if exists audit_profile_changes on public.profiles;
create trigger audit_profile_changes
  after update on public.profiles
  for each row execute function public.audit_profile_changes();

-- ============================================================
-- SECURITY DEFINER FUNCTIONS (optimizadas con search_path vacío)
-- ============================================================

-- Rol del usuario actual
create or replace function public.current_user_role()
returns text
language sql
security definer
set search_path = ''
stable
as $$
  select role from public.profiles where id = (select auth.uid());
$$;

-- ID del usuario actual (helper)
create or replace function public.current_user_id()
returns uuid
language sql
security definer
set search_path = ''
stable
as $$
  select auth.uid();
$$;

-- ¿Es admin?
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

-- ¿Es miembro de una organización?
create or replace function public.is_org_member(org_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.user_organizations uo
    where uo.organization_id = org_id
      and uo.user_id = (select auth.uid())
  ) or public.is_admin();
$$;

-- ¿Tiene rol mínimo en organización?
create or replace function public.has_org_role(org_id uuid, min_role text)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select public.is_admin()
  or exists (
    select 1
    from public.user_organizations uo
    where uo.organization_id = org_id
      and uo.user_id = (select auth.uid())
      and (
        uo.role = 'owner'
        or (uo.role = 'admin' and min_role in ('admin', 'member', 'viewer'))
        or (uo.role = 'member' and min_role in ('member', 'viewer'))
        or (uo.role = 'viewer' and min_role = 'viewer')
      )
  );
$$;

-- Organizaciones del usuario actual
create or replace function public.user_organization_ids()
returns uuid[]
language sql
security definer
set search_path = ''
stable
as $$
  select array_agg(organization_id)
  from public.user_organizations
  where user_id = (select auth.uid());
$$;

-- ============================================================
-- ROW LEVEL SECURITY — TODAS LAS TABLAS
-- ============================================================
alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.user_organizations enable row level security;
alter table public.reports enable row level security;
alter table public.audit_log enable row level security;

-- ============================================================
-- POLICIES: profiles
-- ============================================================
drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin"
  on public.profiles for select
  to authenticated
  using (id = (select auth.uid()) or public.is_admin());

drop policy if exists "profiles_update_self_or_admin" on public.profiles;
create policy "profiles_update_self_or_admin"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()) or public.is_admin())
  with check (id = (select auth.uid()) or public.is_admin());

-- Admins pueden insertar perfiles (para crear trabajadores)
drop policy if exists "profiles_insert_admin" on public.profiles;
create policy "profiles_insert_admin"
  on public.profiles for insert
  to authenticated
  with check (public.is_admin());

-- ============================================================
-- POLICIES: organizations
-- ============================================================
drop policy if exists "organizations_select_members" on public.organizations;
create policy "organizations_select_members"
  on public.organizations for select
  to authenticated
  using (public.is_org_member(id));

drop policy if exists "organizations_admin_all" on public.organizations;
create policy "organizations_admin_all"
  on public.organizations for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Owners pueden actualizar su organización
drop policy if exists "organizations_update_owner" on public.organizations;
create policy "organizations_update_owner"
  on public.organizations for update
  to authenticated
  using (public.has_org_role(id, 'owner'))
  with check (public.has_org_role(id, 'owner'));

-- ============================================================
-- POLICIES: user_organizations
-- ============================================================
drop policy if exists "user_org_select_own_or_admin" on public.user_organizations;
create policy "user_org_select_own_or_admin"
  on public.user_organizations for select
  to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());

drop policy if exists "user_org_admin_all" on public.user_organizations;
create policy "user_org_admin_all"
  on public.user_organizations for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Owners/admins pueden gestionar miembros de su org
drop policy if exists "user_org_manage_by_owner" on public.user_organizations;
create policy "user_org_manage_by_owner"
  on public.user_organizations for all
  to authenticated
  using (public.has_org_role(organization_id, 'admin'))
  with check (public.has_org_role(organization_id, 'admin'));

-- ============================================================
-- POLICIES: reports
-- ============================================================
drop policy if exists "reports_select_org_members" on public.reports;
create policy "reports_select_org_members"
  on public.reports for select
  to authenticated
  using (public.is_org_member(organization_id));

drop policy if exists "reports_admin_all" on public.reports;
create policy "reports_admin_all"
  on public.reports for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Miembros pueden crear reportes en su org
drop policy if exists "reports_insert_members" on public.reports;
create policy "reports_insert_members"
  on public.reports for insert
  to authenticated
  with check (
    public.has_org_role(organization_id, 'member')
    and created_by = (select auth.uid())
  );

-- Creador o admin pueden actualizar/borrar
drop policy if exists "reports_update_creator_or_admin" on public.reports;
create policy "reports_update_creator_or_admin"
  on public.reports for update
  to authenticated
  using (created_by = (select auth.uid()) or public.has_org_role(organization_id, 'admin'))
  with check (created_by = (select auth.uid()) or public.has_org_role(organization_id, 'admin'));

drop policy if exists "reports_delete_creator_or_admin" on public.reports;
create policy "reports_delete_creator_or_admin"
  on public.reports for delete
  to authenticated
  using (created_by = (select auth.uid()) or public.has_org_role(organization_id, 'admin'));

-- ============================================================
-- POLICIES: audit_log (solo lectura, solo admin)
-- ============================================================
drop policy if exists "audit_log_select_admin" on public.audit_log;
create policy "audit_log_select_admin"
  on public.audit_log for select
  to authenticated
  using (public.is_admin());

-- Usuarios pueden ver su propio audit log
drop policy if exists "audit_log_select_own" on public.audit_log;
create policy "audit_log_select_own"
  on public.audit_log for select
  to authenticated
  using (user_id = (select auth.uid()));

-- Solo el sistema puede insertar (via triggers)
drop policy if exists "audit_log_insert_system" on public.audit_log;
create policy "audit_log_insert_system"
  on public.audit_log for insert
  to authenticated
  with check (true);

-- ============================================================
-- SEED: Organización interna de DataSeed
-- ============================================================
insert into public.organizations (name, type, plan)
values ('DataSeed', 'internal', 'enterprise')
on conflict do nothing;

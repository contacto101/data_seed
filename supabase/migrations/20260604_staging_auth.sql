-- DataSeed Portal — Supabase staging schema
-- Ejecutar en Supabase SQL Editor del proyecto de prueba.
-- Objetivo: auth.users crea profiles automáticamente y RLS limita acceso por usuario/organización.

create extension if not exists pgcrypto;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text default 'client',
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'client' check (role in ('admin', 'team', 'client')),
  company_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_organizations (
  user_id uuid not null references public.profiles(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (user_id, organization_id)
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  summary text,
  report_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

drop trigger if exists reports_touch_updated_at on public.reports;
create trigger reports_touch_updated_at
before update on public.reports
for each row execute function public.touch_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
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
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.current_user_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_org_member(org_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.user_organizations uo
    where uo.organization_id = org_id
      and uo.user_id = auth.uid()
  ) or public.current_user_role() = 'admin';
$$;

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.user_organizations enable row level security;
alter table public.reports enable row level security;

-- profiles
create policy "profiles_select_self_or_admin"
on public.profiles for select
to authenticated
using (id = auth.uid() or public.current_user_role() = 'admin');

create policy "profiles_update_self_or_admin"
on public.profiles for update
to authenticated
using (id = auth.uid() or public.current_user_role() = 'admin')
with check (id = auth.uid() or public.current_user_role() = 'admin');

-- organizations
create policy "organizations_select_members"
on public.organizations for select
to authenticated
using (public.is_org_member(id));

create policy "organizations_admin_all"
on public.organizations for all
to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

-- user_organizations
create policy "user_org_select_own_or_admin"
on public.user_organizations for select
to authenticated
using (user_id = auth.uid() or public.current_user_role() = 'admin');

create policy "user_org_admin_all"
on public.user_organizations for all
to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

-- reports
create policy "reports_select_org_members"
on public.reports for select
to authenticated
using (public.is_org_member(organization_id));

create policy "reports_admin_all"
on public.reports for all
to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

-- Seed opcional para staging: crea organización inicial.
insert into public.organizations (name, type)
values ('DataSeed Staging', 'internal')
on conflict do nothing;

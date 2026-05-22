create extension if not exists "pgcrypto";

create table if not exists public.audits (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  team_size integer not null,
  use_case text not null,
  total_monthly_savings numeric(12, 2) not null,
  total_annual_savings numeric(12, 2) not null,
  tools jsonb not null,
  recommendations jsonb not null,
  summary text,
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid references public.audits(id) on delete set null,
  email text not null,
  company text,
  role text,
  team_size integer,
  total_monthly_savings numeric(12, 2),
  created_at timestamptz not null default now()
);

create table if not exists public.rate_limits (
  id uuid primary key default gen_random_uuid(),
  ip_hash text not null,
  action text not null,
  window_start timestamptz not null,
  request_count integer not null default 1,
  created_at timestamptz not null default now(),
  unique (ip_hash, action, window_start)
);

alter table public.audits enable row level security;
alter table public.leads enable row level security;
alter table public.rate_limits enable row level security;

create policy "Public audits are readable"
on public.audits
for select
using (true);

create index if not exists audits_slug_idx
on public.audits(slug);

create index if not exists leads_audit_id_idx
on public.leads(audit_id);

create index if not exists rate_limits_lookup_idx
on public.rate_limits(ip_hash, action, window_start);
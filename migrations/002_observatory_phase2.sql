create table if not exists public.observatory_participants (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  display_name text not null,
  participant_type text not null default 'owned',
  organization_id uuid references public.organizations(id) on delete set null,
  contact_email text,
  consent_status text not null default 'internal',
  data_visibility text not null default 'private',
  publication_consent boolean not null default false,
  consented_at timestamptz,
  consent_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint observatory_participants_type_check check (participant_type in ('owned','volunteer','client','partner')),
  constraint observatory_participants_consent_check check (consent_status in ('internal','pending','granted','withdrawn')),
  constraint observatory_participants_visibility_check check (data_visibility in ('private','aggregate','public'))
);

create table if not exists public.observatory_sites (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid not null references public.observatory_participants(id) on delete cascade,
  slug text not null unique,
  domain text not null,
  canonical_url text,
  brand_name text,
  industry text,
  country_code text,
  language_code text not null default 'en',
  active boolean not null default true,
  data_visibility text not null default 'private',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint observatory_sites_visibility_check check (data_visibility in ('private','aggregate','public'))
);

create table if not exists public.prompt_sets (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.observatory_sites(id) on delete cascade,
  experiment_id uuid references public.experiments(id) on delete set null,
  slug text not null unique,
  name text not null,
  description text,
  version integer not null default 1,
  status text not null default 'draft',
  frozen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint prompt_sets_status_check check (status in ('draft','frozen','active','retired'))
);

create table if not exists public.prompts (
  id uuid primary key default gen_random_uuid(),
  prompt_set_id uuid not null references public.prompt_sets(id) on delete cascade,
  prompt_key text not null,
  prompt_text text not null,
  intent_class text,
  locale text,
  sequence integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(prompt_set_id,prompt_key)
);

create table if not exists public.measurement_runs (
  id uuid primary key default gen_random_uuid(),
  prompt_set_id uuid not null references public.prompt_sets(id) on delete cascade,
  platform_id uuid not null references public.platforms(id) on delete restrict,
  experiment_id uuid references public.experiments(id) on delete set null,
  run_type text not null default 'baseline',
  status text not null default 'queued',
  model_system_version text,
  geography text,
  language_code text,
  scheduled_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  total_prompts integer not null default 0,
  succeeded_prompts integer not null default 0,
  failed_prompts integer not null default 0,
  run_metadata jsonb not null default '{}'::jsonb,
  error_summary text,
  created_at timestamptz not null default now(),
  constraint measurement_runs_type_check check (run_type in ('baseline','control','treatment','remeasurement')),
  constraint measurement_runs_status_check check (status in ('queued','running','completed','partial','failed','cancelled'))
);

alter table public.observations add column if not exists measurement_run_id uuid references public.measurement_runs(id) on delete set null;
alter table public.observations add column if not exists prompt_id uuid references public.prompts(id) on delete set null;
alter table public.observations add column if not exists visibility text not null default 'private';
alter table public.observations add column if not exists mention_detected boolean;
alter table public.observations add column if not exists recommendation_detected boolean;
alter table public.observations add column if not exists mention_position integer;
alter table public.observations add column if not exists response_hash text;

alter table public.observations drop constraint if exists observations_visibility_check;
alter table public.observations add constraint observations_visibility_check check (visibility in ('private','aggregate','public'));

create table if not exists public.observation_citations (
  id uuid primary key default gen_random_uuid(),
  observation_id uuid not null references public.observations(id) on delete cascade,
  citation_order integer,
  cited_url text,
  cited_domain text,
  cited_title text,
  source_type text,
  is_target_domain boolean,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_observatory_sites_participant on public.observatory_sites(participant_id);
create index if not exists idx_prompt_sets_site on public.prompt_sets(site_id);
create index if not exists idx_prompts_prompt_set on public.prompts(prompt_set_id,sequence);
create index if not exists idx_measurement_runs_prompt_set on public.measurement_runs(prompt_set_id,created_at desc);
create index if not exists idx_measurement_runs_experiment on public.measurement_runs(experiment_id,created_at desc);
create index if not exists idx_observations_measurement_run on public.observations(measurement_run_id,observed_at desc);
create index if not exists idx_observations_prompt on public.observations(prompt_id,observed_at desc);
create index if not exists idx_observation_citations_observation on public.observation_citations(observation_id,citation_order);
create index if not exists idx_observation_citations_domain on public.observation_citations(cited_domain);

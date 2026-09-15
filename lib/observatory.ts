import { neon } from '@neondatabase/serverless';

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

export type ObservatoryStats = {
  experiments: number;
  observations: number;
  platforms: number;
  unique_queries: number;
  active_experiments: number;
  last_observed_at: string | null;
};

const emptyStats: ObservatoryStats = {
  experiments: 0,
  observations: 0,
  platforms: 0,
  unique_queries: 0,
  active_experiments: 0,
  last_observed_at: null
};

function iso(value: any){
  if(!value) return null;
  return value?.toISOString?.() ?? String(value);
}

export async function getObservatoryStats(): Promise<ObservatoryStats> {
  if(!sql) return emptyStats;
  const rows = await sql`
    select
      (select count(*)::int from public.experiments) as experiments,
      (select count(*)::int from public.observations) as observations,
      (select count(*)::int from public.platforms) as platforms,
      (select count(distinct query_text)::int from public.observations) as unique_queries,
      (select count(*)::int from public.experiments where status in ('active','running')) as active_experiments,
      (select max(observed_at) from public.observations) as last_observed_at
  `;
  const r:any = rows[0] || emptyStats;
  return {...r,last_observed_at:iso(r.last_observed_at)};
}

export async function getExperiments(limit=100){
  if(!sql) return [];
  return await sql`
    select
      e.id,e.slug,e.title,e.description,e.methodology,e.hypothesis,e.cadence,e.status,
      e.started_at,e.ended_at,e.created_at,e.updated_at,
      count(o.id)::int as observation_count,
      count(distinct o.query_text)::int as unique_queries,
      max(o.observed_at) as last_observed_at
    from public.experiments e
    left join public.observations o on o.experiment_id=e.id
    group by e.id
    order by
      case e.status when 'active' then 0 when 'running' then 0 when 'planned' then 1 when 'draft' then 2 else 3 end,
      e.updated_at desc
    limit ${limit}
  `;
}

export async function getExperiment(slug:string){
  if(!sql) return null;
  const exp = await sql`
    select
      e.*,
      count(o.id)::int as observation_count,
      count(distinct o.query_text)::int as unique_queries,
      max(o.observed_at) as last_observed_at
    from public.experiments e
    left join public.observations o on o.experiment_id=e.id
    where e.slug=${slug}
    group by e.id
    limit 1
  `;
  if(!exp[0]) return null;
  const observations = await sql`
    select
      o.id,o.observed_at,o.query_text,o.query_variant,o.model_system_version,o.answer_text,
      o.fan_out,o.retrieved_domains,o.cited_domains,o.citations,o.representation,o.run_metadata,o.notes,
      p.slug as platform_slug,p.name as platform_name,
      es.slug as evidence_status,es.name as evidence_status_name
    from public.observations o
    left join public.platforms p on p.id=o.platform_id
    left join public.evidence_statuses es on es.id=o.evidence_status_id
    where o.experiment_id=${exp[0].id}
    order by o.observed_at desc
    limit 100
  `;
  return {...exp[0],observations};
}

export async function getRecentObservations(limit=30){
  if(!sql) return [];
  return await sql`
    select
      o.id,o.observed_at,o.query_text,o.query_variant,o.model_system_version,
      o.cited_domains,o.citations,o.representation,o.run_metadata,o.notes,
      e.slug as experiment_slug,e.title as experiment_title,
      p.slug as platform_slug,p.name as platform_name,
      es.slug as evidence_status,es.name as evidence_status_name
    from public.observations o
    join public.experiments e on e.id=o.experiment_id
    left join public.platforms p on p.id=o.platform_id
    left join public.evidence_statuses es on es.id=o.evidence_status_id
    order by o.observed_at desc
    limit ${limit}
  `;
}

export async function getMeasurementPlatforms(){
  if(!sql) return [];
  return await sql`
    select slug,name,platform_type,description
    from public.platforms
    where platform_type in ('assistant','generative-search','answer-engine','search-engine')
    order by name
  `;
}

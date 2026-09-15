import { createHash, timingSafeEqual } from 'node:crypto';
import { neon } from '@neondatabase/serverless';

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

export type CitationInput = {
  order?: number;
  url?: string;
  domain?: string;
  title?: string;
  sourceType?: string;
  isTargetDomain?: boolean;
  metadata?: Record<string, unknown>;
};

export type ObservationInput = {
  measurementRunId: string;
  promptId: string;
  experimentId: string;
  platformId: string;
  queryText: string;
  queryVariant?: string;
  modelSystemVersion?: string;
  answerText?: string;
  fanOut?: unknown[];
  retrievedDomains?: unknown[];
  citedDomains?: unknown[];
  citations?: CitationInput[];
  representation?: Record<string, unknown>;
  runMetadata?: Record<string, unknown>;
  notes?: string;
  mentionDetected?: boolean;
  recommendationDetected?: boolean;
  mentionPosition?: number;
};

function requireDb(){
  if(!sql) throw new Error('DATABASE_URL is not configured');
  return sql;
}

export function responseHash(answerText?: string){
  if(!answerText) return null;
  return createHash('sha256').update(answerText).digest('hex');
}

export function authorizedIngestRequest(authorization: string | null){
  const configured = process.env.OBSERVATORY_INGEST_KEY;
  if(!configured || !authorization?.startsWith('Bearer ')) return false;
  const supplied = authorization.slice(7);
  const a = Buffer.from(configured);
  const b = Buffer.from(supplied);
  return a.length === b.length && timingSafeEqual(a,b);
}

export async function createMeasurementRun(input:{
  promptSetId:string;
  platformId:string;
  experimentId?:string;
  runType?:'baseline'|'control'|'treatment'|'remeasurement';
  modelSystemVersion?:string;
  geography?:string;
  languageCode?:string;
  runMetadata?:Record<string,unknown>;
}){
  const db=requireDb();
  const rows=await db`
    insert into public.measurement_runs (
      prompt_set_id,platform_id,experiment_id,run_type,status,model_system_version,geography,language_code,started_at,run_metadata
    ) values (
      ${input.promptSetId},${input.platformId},${input.experimentId||null},${input.runType||'baseline'},'running',
      ${input.modelSystemVersion||null},${input.geography||null},${input.languageCode||null},now(),${JSON.stringify(input.runMetadata||{})}::jsonb
    ) returning *
  `;
  return rows[0];
}

export async function completeMeasurementRun(input:{
  measurementRunId:string;
  status?:'completed'|'partial'|'failed'|'cancelled';
  errorSummary?:string;
}){
  const db=requireDb();
  const rows=await db`
    update public.measurement_runs mr set
      status=${input.status||'completed'},
      completed_at=now(),
      total_prompts=(select count(*)::int from public.observations o where o.measurement_run_id=mr.id),
      succeeded_prompts=(select count(*)::int from public.observations o where o.measurement_run_id=mr.id and o.answer_text is not null),
      failed_prompts=(select count(*)::int from public.observations o where o.measurement_run_id=mr.id and o.answer_text is null),
      error_summary=${input.errorSummary||null}
    where mr.id=${input.measurementRunId}
    returning *
  `;
  return rows[0]||null;
}

export async function recordObservation(input:ObservationInput){
  const db=requireDb();
  const citationPayload=input.citations||[];
  const rows=await db`
    insert into public.observations (
      experiment_id,measurement_run_id,prompt_id,platform_id,query_text,query_variant,model_system_version,answer_text,
      fan_out,retrieved_domains,cited_domains,citations,representation,run_metadata,notes,visibility,
      mention_detected,recommendation_detected,mention_position,response_hash
    ) values (
      ${input.experimentId},${input.measurementRunId},${input.promptId},${input.platformId},${input.queryText},${input.queryVariant||null},
      ${input.modelSystemVersion||null},${input.answerText||null},${JSON.stringify(input.fanOut||[])}::jsonb,
      ${JSON.stringify(input.retrievedDomains||[])}::jsonb,${JSON.stringify(input.citedDomains||[])}::jsonb,
      ${JSON.stringify(citationPayload)}::jsonb,${JSON.stringify(input.representation||{})}::jsonb,
      ${JSON.stringify(input.runMetadata||{})}::jsonb,${input.notes||null},'private',${input.mentionDetected??null},
      ${input.recommendationDetected??null},${input.mentionPosition??null},${responseHash(input.answerText)}
    ) returning id,observed_at
  `;
  const observation=rows[0];
  for(const [index,c] of citationPayload.entries()){
    let domain=c.domain||null;
    if(!domain && c.url){
      try{ domain=new URL(c.url).hostname.replace(/^www\./,''); }catch{}
    }
    await db`
      insert into public.observation_citations (
        observation_id,citation_order,cited_url,cited_domain,cited_title,source_type,is_target_domain,metadata
      ) values (
        ${observation.id},${c.order??index+1},${c.url||null},${domain},${c.title||null},${c.sourceType||null},
        ${c.isTargetDomain??null},${JSON.stringify(c.metadata||{})}::jsonb
      )
    `;
  }
  return observation;
}

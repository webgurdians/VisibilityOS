import { neon } from '@neondatabase/serverless';

export async function GET(){
  if(!process.env.DATABASE_URL) return Response.json({ok:false,database:false},{status:503});
  const sql=neon(process.env.DATABASE_URL);
  const rows=await sql`
    select e.slug,e.event_date,e.status,
      (select count(*) from public.event_sources es where es.event_id=e.id)::int as source_count,
      (select count(*) from public.event_topics et where et.event_id=e.id)::int as topic_count,
      (select count(*) from public.event_platforms ep where ep.event_id=e.id)::int as platform_count,
      (select count(*) from public.event_claims ec where ec.event_id=e.id)::int as claim_count
    from public.events e
    where e.slug='perplexity-q2d-web-retrieval-benchmark'
    limit 1
  `;
  return Response.json({ok:Boolean(rows[0]),record:rows[0]??null});
}

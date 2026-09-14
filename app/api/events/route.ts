import { getLatestEvents } from '@/lib/data';

export const revalidate = 300;

export async function GET(){
  const events=await getLatestEvents(500);
  const data=events.map((e:any)=>({
    slug:e.slug,
    title:e.title,
    event_date:e.date||e.event_date,
    historical_significance:e.historical_significance||e.significance,
    summary:e.summary,
    what_changed:e.what_changed,
    why_it_matters:e.why_it_matters,
    interpretation:e.interpretation,
    open_questions:e.open_questions,
    first_published_at:e.first_published_at,
    last_reviewed_at:e.last_reviewed_at,
    updated_at:e.updated_at
  }));
  return Response.json({data,meta:{representation:'public-event-records',count:data.length}});
}

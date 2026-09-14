import { getLatestEvents } from '@/lib/data';

export async function GET(){
  return Response.json({data:await getLatestEvents(500),meta:{representation:'public-event-records'}});
}

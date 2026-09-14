import { getTopics } from '@/lib/data';

export async function GET(){
  return Response.json({data:await getTopics(),meta:{representation:'controlled-topic-vocabulary'}});
}

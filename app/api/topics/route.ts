import { getTopics } from '@/lib/data';

export const revalidate = 300;

export async function GET(){
  const topics=await getTopics();
  const data=topics.map((t:any)=>({
    slug:t.slug,
    name:t.name,
    description:t.description,
    definition_status:t.definition_status,
    parent_topic_id:t.parent_topic_id,
    updated_at:t.updated_at
  }));
  return Response.json({data,meta:{representation:'controlled-topic-vocabulary',count:data.length}});
}

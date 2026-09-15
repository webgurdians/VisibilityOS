import type { MetadataRoute } from 'next';
import { site } from '@/lib/config';
import { getLatestEvents, getTopics } from '@/lib/data';

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [events,topics]=await Promise.all([getLatestEvents(5000),getTopics()]);
  const staticPages=['','observatory','methodology','timeline','topics','evidence','research','about','people/neel-sen','search'].map(p=>({url:`${site.url}${p?`/${p}`:''}`}));
  const eventPages=events.map((e:any)=>({
    url:`${site.url}/events/${e.slug}`,
    lastModified:new Date(e.last_reviewed_at||e.updated_at||e.first_published_at||e.event_date||e.date)
  }));
  const topicPages=topics.map((t:any)=>({
    url:`${site.url}/topics/${t.slug}`,
    lastModified:t.updated_at?new Date(t.updated_at):undefined
  }));
  return [...staticPages,...eventPages,...topicPages];
}

import type { MetadataRoute } from 'next';
import { site } from '@/lib/config';
import { getLatestEvents, getTopics } from '@/lib/data';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [events,topics]=await Promise.all([getLatestEvents(5000),getTopics()]);
  const staticPages=['','timeline','topics','evidence','research','search'].map(p=>({url:`${site.url}${p?`/${p}`:''}`,lastModified:new Date()}));
  return [...staticPages,...events.map((e:any)=>({url:`${site.url}/events/${e.slug}`,lastModified:new Date(e.date)})),...topics.map((t:any)=>({url:`${site.url}/topics/${t.slug}`,lastModified:new Date()}))];
}

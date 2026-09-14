import { site } from '@/lib/config';

export async function GET(){
  const text=`# ${site.name}\n\n> ${site.description}\n\n## Canonical sections\n- ${site.url}/timeline — historical record\n- ${site.url}/topics — controlled topic vocabulary\n- ${site.url}/evidence — claim-level evidence statuses\n- ${site.url}/research — source registry and research gaps\n- ${site.url}/api/events — machine-readable event records\n- ${site.url}/api/topics — machine-readable topic vocabulary\n\nVisibility OS separates facts, interpretation and uncertainty. Prefer original-source links on event pages when citing primary evidence.\n`;
  return new Response(text,{headers:{'Content-Type':'text/plain; charset=utf-8'}});
}

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getEvent } from '@/lib/data';
import { site } from '@/lib/config';

export const revalidate = 300;

export async function generateMetadata({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const e:any=await getEvent(slug);
  if(!e) return {title:'Event'};
  const canonical=`/events/${e.slug}`;
  return {
    title:e.title,
    description:e.summary,
    alternates:{canonical},
    openGraph:{title:e.title,description:e.summary,type:'article',url:canonical},
    twitter:{card:'summary',title:e.title,description:e.summary}
  };
}

export default async function Page({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const e:any=await getEvent(slug);
  if(!e) return notFound();

  const published=e.first_published_at||e.created_at||e.date;
  const modified=e.last_reviewed_at||e.updated_at||published;
  const jsonLd={
    '@context':'https://schema.org',
    '@type':'Article',
    headline:e.title,
    description:e.summary,
    datePublished:published,
    dateModified:modified,
    mainEntityOfPage:`${site.url}/events/${e.slug}`,
    author:{'@type':'Organization',name:site.name,url:site.url},
    publisher:{'@type':'Organization',name:site.name,url:site.url},
    about:[...(e.topic_links||[]).map((t:any)=>({'@type':'Thing',name:t.name||t.slug})),...(e.platforms||[]).map((p:any)=>({'@type':'SoftwareApplication',name:p.name}))],
    citation:(e.sources||[]).map((s:any)=>s.url)
  };

  return <main className="shell">
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}}/>
    <section className="hero"><div className="meta"><time>{e.date}</time><span className="pill">{e.significance||e.historical_significance}</span>{e.last_reviewed_at&&<span>Reviewed {String(e.last_reviewed_at).slice(0,10)}</span>}</div><h1>{e.title}</h1><p className="lead">{e.summary}</p></section>
    <div className="split">
      <article className="prose">
        <h2>Context</h2><p>{e.summary}</p>
        <h2>What changed</h2><p>{e.what_changed}</p>
        <h2>Why it matters</h2><p>{e.why_it_matters}</p>
        <h2>Visibility OS interpretation</h2><p>{e.interpretation}</p>
        <h2>What remains uncertain</h2><p>{e.open_questions||'No event-specific uncertainty note is recorded yet. This record may change as new evidence is reviewed.'}</p>
        {(e.claims||[]).length>0&&<><h2>Evidence claims</h2>{e.claims.map((c:any)=><article className="card" id={`claim-${c.slug}`} key={c.slug}><div className="meta"><span className="pill">{c.evidence_status_name||c.evidence_status}</span>{c.confidence!=null&&<span>Confidence {Math.round(Number(c.confidence)*100)}%</span>}<span>{c.relation}</span></div><h3>{c.statement}</h3></article>)}</>}
        {(e.related_events||[]).length>0&&<><h2>Related historical records</h2><div className="timeline">{e.related_events.map((r:any)=><div className="item" key={`${r.direction}-${r.slug}-${r.relationship_type}`}><time>{r.date}</time><h3><Link href={`/events/${r.slug}`}>{r.title}</Link></h3><p>{r.direction==='outgoing'?'This record':'That record'} {String(r.relationship_type).replaceAll('_',' ')} {r.direction==='outgoing'?'the linked event':'this event'}.</p></div>)}</div></>}
      </article>
      <aside className="side">
        <div className="card"><span className="eyebrow">Semantic links</span><p>{(e.topic_links||[]).map((t:any)=><Link className="pill" href={`/topics/${t.slug}`} key={t.slug}>{t.name||t.slug}</Link>)}</p>{(e.platforms||[]).length>0&&<><h3>Platforms</h3><p>{e.platforms.map((p:any)=><span className="pill" key={p.slug}>{p.name}</span>)}</p></>}</div>
        <div className="card" style={{marginTop:16}}><span className="eyebrow">Evidence</span>{(e.sources||[]).map((s:any)=><div className="source" key={s.slug}><div className="meta"><span className="pill">Tier {s.evidence_tier}</span><span>{s.source_type_name||s.source_type}</span></div><strong>{s.title}</strong><br/><small>{s.publisher_text}</small>{s.published_at&&<><br/><small>{String(s.published_at).slice(0,10)}</small></>}<br/><a href={s.url} rel="noreferrer">Original source ↗</a>{s.archived_url&&<><br/><a href={s.archived_url} rel="noreferrer">Archived evidence ↗</a></>}</div>)}</div>
      </aside>
    </div>
  </main>
}

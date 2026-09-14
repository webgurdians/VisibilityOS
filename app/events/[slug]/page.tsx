import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getEvent, getSources } from '@/lib/data';

export async function generateMetadata({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params; const e:any=await getEvent(slug); return {title:e?.title||'Event',description:e?.summary};
}

export default async function Page({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params; const e:any=await getEvent(slug); if(!e) return notFound();
  const allSources:any[]=await getSources(); const primary=allSources.find((s:any)=>s.slug===e.source); const sourceList=e.sources||(primary?[primary]:[]);
  const jsonLd={"@context":"https://schema.org","@type":"Article",headline:e.title,datePublished:e.date,dateModified:e.last_reviewed_at||e.updated_at||e.date,description:e.summary,mainEntityOfPage:`https://visibilityos.in/events/${e.slug}`};
  return <main className="shell"><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}}/><section className="hero"><div className="meta"><time>{e.date}</time><span className="pill">{e.significance||e.historical_significance}</span></div><h1>{e.title}</h1><p className="lead">{e.summary}</p></section><div className="split"><article className="prose"><h2>Context</h2><p>{e.summary}</p><h2>What changed</h2><p>{e.what_changed}</p><h2>Why it matters</h2><p>{e.why_it_matters}</p><h2>Visibility OS interpretation</h2><p>{e.interpretation}</p><h2>What remains uncertain</h2><p>{e.open_questions||'No event-specific uncertainty note is recorded yet. This record may change as new evidence is reviewed.'}</p></article><aside className="side"><div className="card"><span className="eyebrow">Semantic links</span><p>{(e.topics||[]).map((t:string)=><Link className="pill" href={`/topics/${t}`} key={t}>{t}</Link>)}</p></div><div className="card" style={{marginTop:16}}><span className="eyebrow">Evidence</span>{sourceList.map((s:any)=><div className="source" key={s.slug}><strong>{s.title}</strong><br/><small>{s.publisher||s.publisher_text}</small><br/><a href={s.url} rel="noreferrer">Original source ↗</a></div>)}</div></aside></div></main>
}

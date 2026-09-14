import Link from 'next/link';
import { getLatestEvents, getTopics, getSources, getClaims } from '@/lib/data';
import { site } from '@/lib/config';

export default async function Home(){
  const [events,topics,sources,claims]=await Promise.all([getLatestEvents(6),getTopics(),getSources(),getClaims()]);
  return <main><div className="shell">
    <section className="hero"><span className="eyebrow">Open AI discovery intelligence</span><h1>How machines find, trust, cite and recommend the web.</h1><p className="lead">{site.description}</p><div className="actions"><Link className="btn primary" href="/timeline">Explore the timeline</Link><Link className="btn" href="/evidence">Browse evidence</Link><Link className="btn" href="/research">See sources</Link></div></section>
    <div className="stats"><div className="stat"><strong>{events.length}</strong><small>latest loaded events</small></div><div className="stat"><strong>{topics.length}</strong><small>controlled topics</small></div><div className="stat"><strong>{sources.length}</strong><small>registered sources</small></div><div className="stat"><strong>{claims.length}</strong><small>evidence claims</small></div></div>
    <section><div className="sectionhead"><div><span className="eyebrow">Living record</span><h2>Latest material changes</h2></div><p>Not another AI-news feed. Each change is placed inside a persistent historical and evidentiary structure.</p></div><div className="grid">{events.map((e:any)=><Link className="card" href={`/events/${e.slug}`} key={e.slug}><div className="meta"><time>{e.date}</time><span className="pill">{e.significance||e.historical_significance}</span></div><h3>{e.title}</h3><p>{e.summary}</p></Link>)}</div></section>
    <section><div className="sectionhead"><div><span className="eyebrow">Semantic architecture</span><h2>Topics are living reference pages</h2></div><p>AEO, GEO and LLMO sit inside a broader map of retrieval, citation, machine understanding and discovery.</p></div><div className="grid">{topics.slice(0,9).map((t:any)=><Link className="card" href={`/topics/${t.slug}`} key={t.slug}><span className="pill">Topic</span><h3>{t.name}</h3><p>{t.description}</p></Link>)}</div></section>
  </div></main>
}

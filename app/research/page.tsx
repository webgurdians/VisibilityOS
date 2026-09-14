import { getSources, getResearchGaps } from '@/lib/data';

export const revalidate = 300;
export const metadata={title:'Research & Sources',description:'Primary sources, original research and open research gaps behind Visibility OS.',alternates:{canonical:'/research'},openGraph:{url:'/research'}};

export default async function Page(){
  const [sources,gaps]=await Promise.all([getSources(),getResearchGaps()]);
  return <main className="shell"><section className="hero"><span className="eyebrow">Primary-source discipline</span><h1>Research & sources</h1><p className="lead">Official documentation, original papers and clearly labeled secondary evidence — with unresolved questions preserved as research gaps.</p></section><div className="split"><div><h2>Source registry</h2>{sources.map((s:any)=><div className="source" id={`source-${s.slug}`} key={s.slug}><div className="meta"><span>{s.published_at?String(s.published_at).slice(0,10):''}</span><span className="pill">{s.source_type_name||s.source_type}</span><span>Tier {s.evidence_tier}</span></div><h3>{s.title}</h3><p>{s.publisher||s.publisher_text}</p><a href={s.url} rel="noreferrer">Original source ↗</a>{s.archived_url&&<><br/><a href={s.archived_url} rel="noreferrer">Archived evidence ↗</a></>}</div>)}</div><aside className="side card"><h2>Open research gaps</h2>{gaps.map((g:any,i:number)=><div id={`gap-${g.id??i}`} key={g.id??i}><h3>{g.question}</h3><p>{g.reason}</p></div>)}</aside></div></main>
}

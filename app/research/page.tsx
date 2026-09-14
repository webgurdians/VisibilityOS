import { getSources, getResearchGaps } from '@/lib/data';

export const metadata={title:'Research & Sources'};

export default async function Page(){
  const [sources,gaps]=await Promise.all([getSources(),getResearchGaps()]);
  return <main className="shell"><section className="hero"><span className="eyebrow">Primary-source discipline</span><h1>Research & sources</h1><p className="lead">Official documentation, original papers and clearly labeled secondary evidence — with unresolved questions preserved as research gaps.</p></section><div className="split"><div><h2>Source registry</h2>{sources.map((s:any)=><div className="source" key={s.slug}><div className="meta"><span>{String(s.published_at||'')}</span><span className="pill">{s.source_type}</span></div><h3>{s.title}</h3><p>{s.publisher||s.publisher_text}</p><a href={s.url} rel="noreferrer">Original source ↗</a></div>)}</div><aside className="side card"><h2>Open research gaps</h2>{gaps.map((g:any,i:number)=><div key={i}><h3>{g.question}</h3><p>{g.reason}</p></div>)}</aside></div></main>
}

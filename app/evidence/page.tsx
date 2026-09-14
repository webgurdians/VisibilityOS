import { getClaims } from '@/lib/data';

export const metadata={title:'Evidence'};

export default async function Page(){
  const claims=await getClaims();
  return <main className="shell"><section className="hero"><span className="eyebrow">Evidence before advice</span><h1>What do we actually know?</h1><p className="lead">Claims are separated from interpretation and assigned an explicit evidence status instead of being repeated as industry folklore.</p></section><div className="grid">{claims.map((c:any)=><article className="card" key={c.slug}><div className="meta"><span className="pill">{c.evidence_status||c.status}</span><span>Confidence {Math.round((c.confidence||0)*100)}%</span></div><h3>{c.statement}</h3><p>Evidence status lives at claim level so contradictory sources can change the conclusion without rewriting the historical record.</p></article>)}</div></main>
}

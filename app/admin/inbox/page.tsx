import { neon } from '@neondatabase/serverless';
import AdminNav from '../_components/AdminNav';

export const dynamic = 'force-dynamic';
export const metadata = { title:'Research Inbox | Visibility OS', robots:{index:false,follow:false} };

export default async function InboxPage(){
  const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;
  const rows = sql ? await sql`select id, source_url, discovered_at, discovered_by, discovery_query, status, source_quality_score, relevance_score, raw_metadata, reviewer_notes from public.ingestion_queue order by discovered_at desc limit 100` : [];
  return <main className="shell"><section className="hero"><span className="eyebrow">Research operations</span><h1>Research Inbox</h1><p className="lead">Candidate sources waiting for triage, evidence review and conversion into structured records.</p></section><AdminNav/>
    <section><div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',gap:'1rem'}}><h2>Queue</h2><span className="pill">{rows.length} candidates</span></div>
    {rows.length===0 ? <div className="card"><h3>Inbox is clear</h3><p>No candidates are currently waiting in the ingestion queue. Automated discovery and manual URL intake will feed this screen.</p></div> : <div style={{display:'grid',gap:'1rem'}}>{rows.map((r:any)=><article className="card" key={r.id}><div style={{display:'flex',justifyContent:'space-between',gap:'1rem',flexWrap:'wrap'}}><span className="pill">{r.status}</span><span className="meta">{new Date(r.discovered_at).toLocaleString('en-IN')}</span></div><h3 style={{overflowWrap:'anywhere'}}>{r.raw_metadata?.title || r.source_url}</h3>{r.raw_metadata?.title && <p className="meta" style={{overflowWrap:'anywhere'}}>{r.source_url}</p>}<p>{r.raw_metadata?.summary || r.reviewer_notes || 'Awaiting research review.'}</p><div style={{display:'flex',gap:'.5rem',flexWrap:'wrap'}}><span className="pill">via {r.discovered_by}</span>{r.source_quality_score!=null&&<span className="pill">quality {String(r.source_quality_score)}</span>}{r.relevance_score!=null&&<span className="pill">relevance {String(r.relevance_score)}</span>}</div></article>)}</div>}
    </section></main>;
}

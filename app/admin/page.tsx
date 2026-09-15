import { neon } from '@neondatabase/serverless';
import Link from 'next/link';
import AdminNav from './_components/AdminNav';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Research Console', robots: { index: false, follow: false } };

async function counts() {
  if (!process.env.DATABASE_URL) return null;
  const sql = neon(process.env.DATABASE_URL);
  const [events, sources, claims, gaps, experiments, observations, inbox] = await Promise.all([
    sql`select count(*)::int as count from public.events`, sql`select count(*)::int as count from public.sources`,
    sql`select count(*)::int as count from public.claims`, sql`select count(*)::int as count from public.research_gaps`,
    sql`select count(*)::int as count from public.experiments`, sql`select count(*)::int as count from public.observations`,
    sql`select count(*)::int as count from public.ingestion_queue where status in ('new','triage')`,
  ]);
  return {events:events[0].count,sources:sources[0].count,claims:claims[0].count,gaps:gaps[0].count,experiments:experiments[0].count,observations:observations[0].count,inbox:inbox[0].count};
}

export default async function AdminPage() {
  const data=await counts();
  const cards=[['Events',data?.events??'—'],['Sources',data?.sources??'—'],['Claims',data?.claims??'—'],['Research gaps',data?.gaps??'—'],['Experiments',data?.experiments??'—'],['Observations',data?.observations??'—']];
  return <main className="shell"><section className="hero"><span className="eyebrow">Private research operations</span><h1>Research Console</h1><p className="lead">Review evidence, structure research, manage experiments and publish to the Visibility OS evidence system.</p></section><AdminNav/>
    <section><div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',gap:'1rem',flexWrap:'wrap'}}><h2>System overview</h2><Link href="/admin/inbox" className="pill">{data?.inbox??'—'} awaiting review →</Link></div><div className="grid">{cards.map(([label,value])=><div className="card" key={String(label)}><div className="meta">{label}</div><h2>{value}</h2></div>)}</div></section>
    <section style={{marginTop:'3rem'}}><h2>Research workflow</h2><div className="grid">
      <Link href="/admin/inbox" className="card"><h3>Research inbox</h3><p>Candidate papers, official changes and industry findings awaiting review.</p><span className="pill">Open inbox →</span></Link>
      <Link href="/admin/events" className="card"><h3>Evidence editor</h3><p>Inspect canonical events, sources and claim-level evidence.</p><span className="pill">Open records →</span></Link>
      <Link href="/admin/experiments" className="card"><h3>Experiment Lab</h3><p>Manage repeatable experiments and timestamped observations.</p><span className="pill">Open lab →</span></Link>
    </div></section></main>;
}

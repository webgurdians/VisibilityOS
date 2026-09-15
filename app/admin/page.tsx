import { neon } from '@neondatabase/serverless';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Research Console', robots: { index: false, follow: false } };

async function counts() {
  if (!process.env.DATABASE_URL) return null;
  const sql = neon(process.env.DATABASE_URL);
  const [events, sources, claims, gaps, experiments, observations] = await Promise.all([
    sql`select count(*)::int as count from public.events`,
    sql`select count(*)::int as count from public.sources`,
    sql`select count(*)::int as count from public.claims`,
    sql`select count(*)::int as count from public.research_gaps`,
    sql`select count(*)::int as count from public.experiments`,
    sql`select count(*)::int as count from public.observations`,
  ]);
  return {
    events: events[0].count,
    sources: sources[0].count,
    claims: claims[0].count,
    gaps: gaps[0].count,
    experiments: experiments[0].count,
    observations: observations[0].count,
  };
}

export default async function AdminPage() {
  const data = await counts();
  const cards = [
    ['Events', data?.events ?? '—'], ['Sources', data?.sources ?? '—'], ['Claims', data?.claims ?? '—'],
    ['Research gaps', data?.gaps ?? '—'], ['Experiments', data?.experiments ?? '—'], ['Observations', data?.observations ?? '—'],
  ];

  return <main className="shell">
    <section className="hero">
      <span className="eyebrow">Private research operations</span>
      <h1>Research Console</h1>
      <p className="lead">Review evidence, structure research, manage experiments and publish to the Visibility OS evidence system.</p>
    </section>
    <section>
      <h2>System overview</h2>
      <div className="grid">{cards.map(([label,value]) => <div className="card" key={String(label)}><div className="meta">{label}</div><h2>{value}</h2></div>)}</div>
    </section>
    <section style={{marginTop:'3rem'}}>
      <h2>Research workflow</h2>
      <div className="grid">
        <div className="card"><h3>Research inbox</h3><p>Candidate papers, official changes and industry findings awaiting review.</p><span className="pill">Next</span></div>
        <div className="card"><h3>Evidence editor</h3><p>Structure events, sources and claims before publication.</p><span className="pill">Next</span></div>
        <div className="card"><h3>Experiment Lab</h3><p>Manage repeatable experiments and timestamped observations.</p><span className="pill">Schema live</span></div>
      </div>
    </section>
    <p style={{marginTop:'3rem'}}><Link href="/research">View public research →</Link></p>
  </main>;
}

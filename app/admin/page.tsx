import { neon } from '@neondatabase/serverless';
import Link from 'next/link';
import styles from './workspace.module.css';

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
  const data=await counts().catch(()=>null);
  const cards=[['Events',data?.events??'—'],['Sources',data?.sources??'—'],['Claims',data?.claims??'—'],['Research gaps',data?.gaps??'—'],['Experiments',data?.experiments??'—'],['Observations',data?.observations??'—']];
  return <main><header className={styles.heading}><span className="eyebrow">Private research operations</span><h1>Workspace overview</h1><p>Research and discoverability intelligence</p></header>
  <section><div className={styles.row}><h2 className={styles.sectionTitle}>System overview</h2><Link href="/admin/inbox" className="pill">{data?.inbox??'—'} awaiting review →</Link></div><div className={styles.kpis}>{cards.map(([label,value])=><div className={styles.kpi} key={String(label)}><span>{label}</span><strong>{value}</strong></div>)}</div>{!data&&<p role="status">Research statistics are temporarily unavailable.</p>}</section>
  <section><h2 className={styles.sectionTitle}>AI visibility tools</h2><div className={styles.audit}><div><span className="eyebrow">Private pilot</span><h2>AI readiness audit</h2><p>Inspect crawler policies, metadata and sitemap evidence. Actual AI search visibility is not measured.</p></div><Link className={styles.action} href="/admin/audit-preview">Run website audit →</Link></div></section>
  <section><h2 className={styles.sectionTitle}>Research workflow</h2><div className={styles.workflow}><Link href="/admin/inbox" className={styles.panel}><h3>Research inbox</h3><div className={styles.count}>{data?.inbox??'—'}</div><p>Awaiting review</p></Link><Link href="/admin/events" className={styles.panel}><h3>Evidence editor</h3><p>Inspect events, sources and claim-level evidence.</p></Link><Link href="/admin/experiments" className={styles.panel}><h3>Experiment Lab</h3><p>Manage repeatable experiments and observations.</p></Link></div></section></main>;
}

'use client';
import {useState} from 'react';
import Link from 'next/link';
import type {runAudit} from '@/lib/audit/run';
import styles from './pilot.module.css';
type Report=Awaited<ReturnType<typeof runAudit>>;
const category=(agent:string)=>['GPTBot','ClaudeBot','Google-Extended'].includes(agent)?'Training / model use controls':['ChatGPT-User','Claude-User'].includes(agent)?'User-triggered retrieval':'Search / discovery';
export default function Pilot(){
 const [url,setUrl]=useState('https://www.greenfieldfinancials.in');
 const [report,setReport]=useState<Report|null>(null);const [error,setError]=useState('');const [busy,setBusy]=useState(false);
 return <main className={styles.workspace}><header><Link href="/admin" className="pill">← Research Console</Link><p><small>VISIBILITY OS / PRIVATE PILOT</small></p><h1>Discoverability overview</h1><p>Evidence-backed technical readiness. Actual AI search visibility is not measured.</p></header>
 <form className={styles.panel} onSubmit={async e=>{e.preventDefault();setBusy(true);setError('');setReport(null);try{const r=await fetch('/admin/audit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url})});const data=await r.json();if(!r.ok)throw Error(data.error||'Audit failed');setReport(data);}catch(e){setError(e instanceof Error?e.message:'Audit failed');}finally{setBusy(false);}}}><label htmlFor="website">Approved website homepage</label><div className={styles.controls}><input id="website" type="url" required maxLength={512} value={url} onChange={e=>setUrl(e.target.value)}/><button disabled={busy}>{busy?'Checking…':'Run audit'}</button></div><p role="status">{busy?'Retrieving permitted website resources. Please wait.':error}</p></form>
 {report&&<><header><h2>{report.website}</h2><p>{new Date(report.checkedAt).toLocaleString()} · {report.homepageNote}</p></header><div className={styles.metrics}>{[['Homepage',report.homepageStatus?'HTTP '+report.homepageStatus:'Unknown'],['Declared permissions',report.robots.agents.every(a=>a.status==='unknown')?'Unknown':report.robots.agents.filter(a=>a.status==='allowed').length+' allowed · '+report.robots.agents.filter(a=>a.status==='disallowed').length+' disallowed · '+report.robots.agents.filter(a=>a.status==='unknown').length+' unknown'],['Sitemap',report.sitemap.status==='detected'?report.sitemap.locations+' location tags':'Unknown'],['AI search visibility','Not measured']].map(([k,v])=><div className={styles.panel} key={k}><small>{k}</small><h3>{v}</h3></div>)}</div>
 <section className={styles.panel}><h2>Technical findings</h2>{!report.findings.length&&<p>No HTML checks completed. See retrieval diagnostics.</p>}{report.findings.map(f=><article className={styles.finding} key={f.check}><div><strong>{f.check}</strong><p>{f.evidence}</p></div><span data-status={f.status}>{f.status}</span></article>)}</section>
 <section className={styles.panel}><h2>Crawler policies</h2><p>{report.robots.note}</p><div className={styles.metrics}>{report.robots.agents.map(a=><article className={styles.agent} key={a.agent}><small>{category(a.agent)}</small><h3>{a.agent}</h3><span data-status={a.status}>{a.status}</span><p>{a.rule?'Matched rule: '+a.rule:'No matched rule reported'}</p></article>)}</div></section>
 <section className={styles.panel}><h2>Recommended next steps</h2>{report.recommendations.length?<ol>{report.recommendations.map(r=><li key={r}>{r}</li>)}</ol>:<p>No warnings from completed checks. This is not a comprehensive assessment.</p>}</section>
 <section className={styles.panel}><h2>Retrieval diagnostics</h2>{report.diagnostics.map((d,i)=><article className={styles.finding} key={i}><strong>{d.resource}</strong><span>{d.status?'HTTP '+d.status:'Not retrieved'} · {d.detail}</span></article>)}</section>
 <details className={styles.panel}><summary>Scope and limitations</summary><ul>{report.limitations.map(l=><li key={l}>{l}</li>)}</ul></details></>}
 </main>;
}

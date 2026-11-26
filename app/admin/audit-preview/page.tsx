'use client';
import {useState} from 'react';
import type {runAudit} from '@/lib/audit/run';
type Report=Awaited<ReturnType<typeof runAudit>>;
export default function Pilot(){
 const [url,setUrl]=useState('https://www.greenfieldfinancials.in');
 const [report,setReport]=useState<Report|null>(null);const [error,setError]=useState('');const [busy,setBusy]=useState(false);
 return <main className="shell"><h1>Technical readiness audit</h1><p>Private pilot. AI recommendations are not measured.</p><form onSubmit={async e=>{e.preventDefault();setBusy(true);setError('');setReport(null);try{const r=await fetch('/admin/audit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url})});const data=await r.json();if(!r.ok)throw Error(data.error||'Audit failed');setReport(data);}catch(e){setError(e instanceof Error?e.message:'Audit failed');}finally{setBusy(false);}}}><label htmlFor="website">Website homepage</label><input id="website" type="url" required maxLength={512} value={url} onChange={e=>setUrl(e.target.value)}/><button disabled={busy}>{busy?'Checking website…':'Run pilot audit'}</button></form><p role="status">{error}</p>{report&&<section><h2>{report.website}</h2><p>{report.checkedAt} · {report.homepageNote} · HTTP {report.homepageStatus??'unknown'}</p><h3>Technical findings</h3>{report.findings.map(f=><article key={f.check}><h4>{f.check} — {f.status}</h4><p>{f.evidence}</p></article>)}<h3>Crawler policies</h3>{report.robots.agents.map(a=><p key={a.agent}>{a.agent}: {a.status} {a.rule}</p>)}<p>{report.robots.note}</p><h3>Sitemap</h3><p>{report.sitemap.status} · {report.sitemap.locations} location tags</p><h3>Limitations</h3><ul>{report.limitations.map(l=><li key={l}>{l}</li>)}</ul></section>}</main>;
}

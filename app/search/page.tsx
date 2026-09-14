import Link from 'next/link';
import { searchCorpus } from '@/lib/data';

export const revalidate = 300;
export const metadata={title:'Search',description:'Search the Visibility OS corpus across events, topics, evidence claims, sources and open research gaps.',alternates:{canonical:'/search'},openGraph:{url:'/search'}};

export default async function Page({searchParams}:{searchParams:Promise<{q?:string,days?:string}>}){
  const {q='',days}=await searchParams;
  const parsedDays=days?Math.max(1,Math.min(3650,Number(days)||0)):undefined;
  const results=await searchCorpus(q,50,parsedDays);
  return <main className="shell"><section className="hero"><span className="eyebrow">Corpus search</span><h1>Search Visibility OS</h1><form><input type="search" name="q" defaultValue={q} placeholder="Try: query fan out, citations, GEO…"/>{parsedDays&&<input type="hidden" name="days" value={parsedDays}/>}</form></section>{q&&<><p className="meta">{results.length} matching records for “{q}”{parsedDays?` in the last ${parsedDays} days`:''}</p><div className="grid">{results.map((r:any)=><Link className="card" href={r.href} key={`${r.kind}-${r.slug}`}><div className="meta"><span className="pill">{String(r.kind).replaceAll('-',' ')}</span>{r.date&&<time>{r.date}</time>}</div><h3>{r.title}</h3><p>{r.summary}</p></Link>)}</div></>}</main>
}

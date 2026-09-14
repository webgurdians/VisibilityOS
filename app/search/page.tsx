import Link from 'next/link';
import { searchEvents } from '@/lib/data';

export const metadata={title:'Search'};

export default async function Page({searchParams}:{searchParams:Promise<{q?:string}>}){
  const {q=''}=await searchParams; const results=await searchEvents(q,50);
  return <main className="shell"><section className="hero"><span className="eyebrow">Corpus search</span><h1>Search Visibility OS</h1><form><input type="search" name="q" defaultValue={q} placeholder="Try: query fan out, citations, GEO…"/></form></section>{q&&<><p className="meta">{results.length} matching records for “{q}”</p><div className="grid">{results.map((e:any)=><Link className="card" href={`/events/${e.slug}`} key={e.slug}><time>{e.date}</time><h3>{e.title}</h3><p>{e.summary}</p></Link>)}</div></>}</main>
}

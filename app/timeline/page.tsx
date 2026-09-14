import Link from 'next/link';
import { getLatestEvents } from '@/lib/data';

export const metadata={title:'AI Discovery Timeline'};

export default async function Page(){
  const events=(await getLatestEvents(200)).reverse();
  return <main className="shell"><section className="hero"><span className="eyebrow">Historical narrative</span><h1>From structured web to agentic discovery.</h1><p className="lead">A chronological record of the infrastructure, products and research that changed how machines understand and surface information.</p></section><div className="timeline">{events.map((e:any)=><div className="item" key={e.slug}><time>{e.date}</time><h2><Link href={`/events/${e.slug}`}>{e.title}</Link></h2><p>{e.why_it_matters}</p></div>)}</div></main>
}

import Link from 'next/link';
import { getTopics } from '@/lib/data';

export const metadata={title:'Topics'};

export default async function Page(){
  const topics=await getTopics();
  return <main className="shell"><section className="hero"><span className="eyebrow">Controlled vocabulary</span><h1>Topics</h1><p className="lead">A semantic map of AI visibility — broader than whichever acronym the industry is using this year.</p></section><div className="grid">{topics.map((t:any)=><Link className="card" href={`/topics/${t.slug}`} key={t.slug}><h3>{t.name}</h3><p>{t.description}</p></Link>)}</div></main>
}

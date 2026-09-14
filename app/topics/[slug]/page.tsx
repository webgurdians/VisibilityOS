import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTopic } from '@/lib/data';

export const revalidate = 300;

export async function generateMetadata({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const t:any=await getTopic(slug);
  if(!t) return {title:'Topic'};
  const canonical=`/topics/${t.slug}`;
  return {
    title:t.name,
    description:t.description,
    alternates:{canonical},
    openGraph:{title:t.name,description:t.description,url:canonical,type:'website'},
    twitter:{card:'summary',title:t.name,description:t.description}
  };
}

export default async function Page({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const t:any=await getTopic(slug);
  if(!t) return notFound();
  return <main className="shell"><section className="hero"><span className="eyebrow">Living topic</span><h1>{t.name}</h1><p className="lead">{t.description}</p></section><div className="split"><article className="prose"><h2>What this means</h2><p>{t.description}</p><h2>Historical record</h2><div className="timeline">{(t.events||[]).map((e:any)=><div className="item" key={e.slug}><time>{e.date}</time><h3><Link href={`/events/${e.slug}`}>{e.title}</Link></h3><p>{e.why_it_matters}</p></div>)}</div></article><aside className="side card"><span className="eyebrow">Semantic note</span><p>This page is canonical for <code>{t.slug}</code>. Its definition and evidence should evolve without fragmenting into disposable blog posts.</p>{t.updated_at&&<p><small>Last updated {String(t.updated_at).slice(0,10)}</small></p>}</aside></div></main>
}

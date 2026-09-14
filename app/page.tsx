import Link from 'next/link';
import { getLatestEvents, getTopics, getSources, getClaims, getResearchGaps } from '@/lib/data';
import { site } from '@/lib/config';

export const revalidate = 300;
export const metadata={
  alternates:{canonical:'/'},
  openGraph:{url:'/'},
};

const promptLinks = [
  {q:'What changed in AI search this week?',href:'/search?q=AI+search&days=7'},
  {q:'How did GEO begin?',href:'/topics/geo'},
  {q:'What is query fan-out?',href:'/topics/query-fan-out'},
  {q:'Show me verified AI citation research',href:'/search?q=citations'},
  {q:'How does ChatGPT discover sources?',href:'/search?q=ChatGPT+sources'},
  {q:'What do we actually know about AI visibility?',href:'/evidence'}
];

const evolution = [
  ['1','Semantic web','Structured data made meaning more explicit to machines.'],
  ['2','Entity understanding','Search moved from strings toward entities and relationships.'],
  ['3','Answer extraction','Featured answers made being selected different from simply ranking.'],
  ['4','Retrieval-grounded generation','RAG connected generative models to external information.'],
  ['5','Generative search','AI systems began synthesizing answers across multiple sources.'],
  ['6','Query fan-out & agents','A single prompt can trigger many machine-generated searches and actions.']
];

export default async function Home(){
  const [events,topics,sources,claims,gaps]=await Promise.all([getLatestEvents(6),getTopics(),getSources(),getClaims(),getResearchGaps()]);
  const featuredTopics = ['geo','aeo','llmo','query-fan-out','citations','retrieval','ai-discoverability','measurement'];
  const topicMap = new Map(topics.map((t:any)=>[t.slug,t]));
  const visibleTopics = featuredTopics.map(slug=>topicMap.get(slug)).filter(Boolean);

  return <main>
    <section className="homeHero"><div className="shell heroGrid">
      <div><span className="eyebrow">Open AI discovery intelligence</span><h1>Understand how machines discover the web.</h1><p className="lead">{site.description}</p></div>
      <div className="heroPanel"><span className="panelLabel">Start with a question</span><div className="promptList">{promptLinks.slice(0,4).map(p=><Link className="promptBtn" href={p.href} key={p.q}>{p.q}<span>↗</span></Link>)}</div></div>
    </div></section>

    <section className="shell compactStats"><div><strong>{events.length}</strong><span>latest material changes</span></div><div><strong>{topics.length}</strong><span>controlled topics</span></div><div><strong>{sources.length}</strong><span>registered sources</span></div><div><strong>{claims.length}</strong><span>evidence claims</span></div></section>

    <section className="shell homeSection"><div className="sectionKicker"><span className="eyebrow">Latest intelligence</span><Link href="/timeline">View full timeline →</Link></div><div className="sectionhead homeHead"><div><h2>What changed, and why it matters.</h2></div><p>Every update is placed inside a persistent historical, semantic and evidentiary record instead of disappearing into a news archive.</p></div>
      <div className="grid featureGrid">
        {events.map((e:any,i:number)=><Link className={`card featureCard ${i===0?'accentCard':''}`} href={`/events/${e.slug}`} key={e.slug}><div className="meta"><time>{e.date}</time><span className="pill">{e.significance||e.historical_significance}</span></div><h3>{e.title}</h3><p>{e.summary}</p><div className="cardFoot"><span>Event record</span><span>Open →</span></div></Link>)}
      </div>
    </section>

    <section className="narrativeBand"><div className="shell homeSection"><div className="sectionKicker"><span className="eyebrow">Narrative architecture</span><Link href="/timeline">Explore history →</Link></div><div className="sectionhead homeHead"><div><h2>AI visibility did not begin with GEO.</h2></div><p>Visibility OS follows the longer story: how documents became machine-readable, how search learned entities, how answers replaced result lists, and how agents now fan out queries across the web.</p></div><div className="evolutionGrid">{evolution.map(([n,t,d])=><div className="evolutionStep" key={n}><span>{n}</span><h3>{t}</h3><p>{d}</p></div>)}</div></div></section>

    <section className="shell homeSection"><div className="sectionKicker"><span className="eyebrow">Ask the corpus</span><Link href="/search">Search everything →</Link></div><div className="sectionhead homeHead"><div><h2>Explore by question, not just category.</h2></div><p>The interface should match how people actually investigate AI discovery: by asking what changed, what is proven, and what remains uncertain.</p></div><div className="promptGrid">{promptLinks.map(p=><Link className="promptCard" href={p.href} key={p.q}><span>Prompt</span><strong>{p.q}</strong><em>Ask Visibility OS →</em></Link>)}</div></section>

    <section className="shell homeSection"><div className="sectionKicker"><span className="eyebrow">Semantic architecture</span><Link href="/topics">Browse all topics →</Link></div><div className="sectionhead homeHead"><div><h2>Living reference pages, not disposable posts.</h2></div><p>AEO, GEO and LLMO sit inside a broader graph of retrieval, source selection, citations, discoverability, measurement and agentic behavior.</p></div><div className="topicRail">{visibleTopics.map((t:any)=><Link className="topicChipCard" href={`/topics/${t.slug}`} key={t.slug}><span>Topic</span><h3>{t.name}</h3><p>{t.description}</p></Link>)}</div></section>

    <section className="evidenceBand"><div className="shell homeSection"><div className="sectionKicker"><span className="eyebrow">Evidence discipline</span><Link href="/evidence">Browse claims →</Link></div><div className="sectionhead homeHead"><div><h2>Facts, interpretation and uncertainty stay separate.</h2></div><p>Each claim is attached to source quality and evidence status. Visibility OS is designed to preserve the evidence trail, not flatten every industry claim into advice.</p></div><div className="evidenceStrip"><div><strong>Established</strong><span>Authoritative or directly verifiable</span></div><div><strong>Strong</strong><span>Substantial support with limited uncertainty</span></div><div><strong>Emerging</strong><span>Supported, but still developing</span></div><div><strong>Mixed / Open</strong><span>Conflicting evidence or unanswered questions</span></div></div></div></section>

    <section className="shell homeSection"><div className="sectionKicker"><span className="eyebrow">Open questions</span><Link href="/research">Research library →</Link></div><div className="sectionhead homeHead"><div><h2>What the industry still does not know.</h2></div><p>Uncertainty is part of the dataset. We track unresolved terminology, causal claims and measurement problems instead of pretending consensus exists.</p></div><div className="gapGrid">{gaps.slice(0,3).map((g:any,i:number)=><div className="gapCard" key={i}><span>Research gap {String(i+1).padStart(2,'0')}</span><h3>{g.question}</h3><p>{g.reason}</p></div>)}</div></section>

    <section className="shell methodology"><div><span className="eyebrow">About the dataset</span><h2>Built to be read by people and machines.</h2></div><div className="methodGrid"><p>Semantic HTML, explicit dates, controlled vocabulary, source attribution and stable canonical pages make each record understandable even when the visual layer is stripped away.</p><p>Discovery can be automated, but publication is reviewed. Important records retain primary sources, evidence notes, relationships and revision history.</p><p>Original sources and research records are also archived separately so the intelligence corpus is not dependent on one database or hosting provider.</p></div></section>
  </main>
}

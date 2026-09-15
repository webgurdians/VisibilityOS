import Link from 'next/link';
import { site } from '@/lib/config';

export const metadata = {
  title: 'About Visibility OS',
  description: 'Why Visibility OS exists, who created it, and the evidence discipline behind the project.',
  alternates: { canonical: `${site.url}/about` },
};

export default function AboutPage(){
  const jsonLd={
    '@context':'https://schema.org','@type':'AboutPage',name:'About Visibility OS',url:`${site.url}/about`,
    mainEntity:{'@type':'Organization',name:'Visibility OS',url:site.url,founder:{'@type':'Person','@id':`${site.url}/people/neel-sen#person`,name:'Neel Sen'}}
  };
  return <main className="shell">
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}} />
    <section className="hero aboutHero"><span className="eyebrow">Why Visibility OS exists</span><h1>Document the system before claiming to understand it.</h1><p className="lead">Visibility OS is a living evidence record for AI discovery, retrieval, citation and representation.</p></section>
    <section style={{maxWidth:'820px'}}>
      <h2>An unexpected starting point</h2>
      <p>Visibility OS was created by <Link href="/people/neel-sen">Neel Sen</Link>, founder of DearStory, after an unexpected pattern emerged while building the cinematic memoir studio. Some early customers reported discovering DearStory through AI-mediated recommendations and search experiences despite little or no paid acquisition.</p>
      <p>Trying to understand why exposed a larger problem. Evidence about AI discovery was scattered across official documentation, research papers, product changes, experiments, industry reporting and practitioner observations.</p>
      <p>Visibility OS began as an attempt to build the evidence record Neel was looking for: a continuously updated system that separates documented facts, emerging evidence, interpretation and unanswered questions.</p>
      <h2>Evidence before certainty</h2>
      <p>Visibility OS does not claim that one case proves how AI visibility works. Events, claims, sources, research gaps and experiments are kept distinct so that observed facts are not silently turned into causal explanations.</p>
      <p>The project is being developed as an evidence system first: provenance, corrections, confidence, uncertainty and reproducibility matter more than publishing volume.</p>
      <h2>From practitioner experience to research</h2>
      <p>DearStory is the origin question, not the answer. Its AI-mediated discovery will be documented as a field case study, with observed evidence separated from correlation, inference and unknowns. Visibility OS will also maintain external evidence and repeatable first-party experiments.</p>
    </section>
  </main>;
}

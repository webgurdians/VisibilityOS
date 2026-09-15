import Link from 'next/link';
import { site } from '@/lib/config';

export const metadata={
  title:'Neel Sen — Founder, Visibility OS',
  description:'Neel Sen is the founder and practitioner-researcher behind Visibility OS and founder of DearStory.',
  alternates:{canonical:`${site.url}/people/neel-sen`},
};

export default function NeelSenPage(){
  const jsonLd={
    '@context':'https://schema.org','@type':'Person','@id':`${site.url}/people/neel-sen#person`,
    name:'Neel Sen',alternateName:'Bijoy Sen',url:`${site.url}/people/neel-sen`,
    jobTitle:'Founder & Practitioner-Researcher',
    founder:[{'@type':'Organization',name:'Visibility OS',url:site.url},{'@type':'Organization',name:'DearStory'}],
    knowsAbout:['AI discovery','AI search visibility','retrieval','citations','generative engine optimization','answer engine optimization']
  };
  return <main className="shell">
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}} />
    <section className="hero"><span className="eyebrow">Founder & Practitioner-Researcher</span><h1>Neel Sen</h1><p className="lead">Building Visibility OS to document what can actually be established about AI discovery.</p></section>
    <section style={{maxWidth:'820px'}}>
      <p><strong>Neel Sen</strong>, also known as Bijoy Sen, is the founder of Visibility OS and DearStory.</p>
      <p>His work on Visibility OS began with a practical question. After early DearStory customers reported discovering the business through AI-mediated recommendations and search experiences, he wanted to understand what could actually explain that visibility.</p>
      <p>Rather than treating the outcome as proof of a ranking formula, Neel began assembling official documentation, research, product changes, claims, evidence grades and unresolved questions into a structured historical record.</p>
      <p>He describes his role as a practitioner-researcher rather than an SEO or AI-search expert. Visibility OS is designed so its evidence, methodology, revisions and experiments can carry the argument instead of relying on credentials.</p>
      <p><Link href="/about">Read why Visibility OS exists →</Link></p>
    </section>
  </main>;
}

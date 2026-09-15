import Link from 'next/link';
import { getExperiments, getMeasurementPlatforms, getObservatoryStats, getRecentObservations } from '@/lib/observatory';

export const revalidate = 300;
export const metadata = {
  title: 'Observatory',
  description: 'Visibility OS Observatory measures how brands, entities, citations and recommendations change across AI discovery systems.',
  alternates: { canonical: '/observatory' },
  openGraph: { url: '/observatory' }
};

function formatDate(value:any){
  if(!value) return 'Not measured yet';
  return new Intl.DateTimeFormat('en',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value));
}

export default async function ObservatoryPage(){
  const [stats,experiments,observations,platforms] = await Promise.all([
    getObservatoryStats(),
    getExperiments(24),
    getRecentObservations(12),
    getMeasurementPlatforms()
  ]);

  return <main>
    <section className="recordHero"><div className="shell">
      <span className="eyebrow">Measurement layer</span>
      <h1>The Visibility OS Observatory</h1>
      <p className="recordDek">A longitudinal measurement system for studying when brands are mentioned, cited, recommended or omitted across AI discovery systems, and what changes appear to influence those outcomes.</p>
      <div className="recordBand"><span className="pill">Longitudinal measurement</span><span className="pill">Controlled experiments</span><span className="pill">Citation tracking</span><span className="pill">Entity representation</span></div>
    </div></section>

    <section className="shell compactStats observatoryStats">
      <div><strong>{stats.observations}</strong><span>observations</span></div>
      <div><strong>{stats.experiments}</strong><span>experiments</span></div>
      <div><strong>{stats.unique_queries}</strong><span>unique prompts</span></div>
      <div><strong>{platforms.length}</strong><span>measurable platforms</span></div>
    </section>

    <section className="shell homeSection"><div className="sectionKicker"><span className="eyebrow">Why this exists</span><Link href="/research">Research library →</Link></div>
      <div className="sectionhead homeHead"><div><h2>From documenting AI visibility to measuring it.</h2></div><p>Public events tell us what changed in the ecosystem. The Observatory records what changed in actual outputs, citations and representation over time.</p></div>
      <div className="measurementFlow">
        <div><span>01</span><h3>Prompt set</h3><p>Define repeatable commercial and informational queries around a brand, category or entity.</p></div>
        <div><span>02</span><h3>Observation</h3><p>Capture the answer, platform, model context, citations, retrieved domains and representation signals.</p></div>
        <div><span>03</span><h3>Intervention</h3><p>Change one meaningful variable such as entity markup, page structure, source coverage or crawler policy.</p></div>
        <div><span>04</span><h3>Remeasure</h3><p>Track whether visibility, citation persistence, recommendation status or ambiguity changes.</p></div>
      </div>
    </section>

    <section className="evidenceBand"><div className="shell homeSection"><div className="sectionKicker"><span className="eyebrow">Experiment registry</span><span className="mutedText">Public methods, cautious conclusions</span></div>
      <div className="sectionhead homeHead"><div><h2>Every test gets a hypothesis and evidence trail.</h2></div><p>Experiments are designed to distinguish correlation from stronger causal evidence. Results remain classified as established, strong, emerging, mixed or open where appropriate.</p></div>
      {experiments.length ? <div className="experimentGrid">{experiments.map((e:any)=><article className="card experimentCard" key={e.slug}>
        <div className="meta"><span className="pill">{e.status}</span><span>{e.observation_count} observations</span></div>
        <h3>{e.title}</h3><p>{e.description}</p>
        {e.hypothesis && <div className="hypothesis"><strong>Hypothesis</strong><span>{e.hypothesis}</span></div>}
        <div className="cardFoot"><span>{e.cadence || 'Cadence not set'}</span><span>{formatDate(e.last_observed_at)}</span></div>
      </article>)}</div> : <div className="emptyState"><span>Registry initialized</span><h3>No public experiments have been started yet.</h3><p>The schema is live. The next step is to register the first controlled Visibility OS experiments and begin collecting observations.</p></div>}
    </div></section>

    <section className="shell homeSection"><div className="sectionKicker"><span className="eyebrow">Observation stream</span><span className="mutedText">Latest measurements</span></div>
      <div className="sectionhead homeHead"><div><h2>The raw layer stays inspectable.</h2></div><p>Visibility OS separates raw observation data from interpretation. This preserves the evidence trail and makes later analysis auditable.</p></div>
      {observations.length ? <div className="observationList">{observations.map((o:any)=><article key={o.id}>
        <div className="meta"><span>{o.platform_name || 'Unknown platform'}</span><time>{formatDate(o.observed_at)}</time></div>
        <h3>{o.query_text}</h3>
        <p>{o.experiment_title}</p>
        <div className="observationSignals"><span>Citations: {Array.isArray(o.citations)?o.citations.length:0}</span><span>Evidence: {o.evidence_status || 'unclassified'}</span></div>
      </article>)}</div> : <div className="emptyState subtle"><span>Awaiting first run</span><h3>No measurements have been recorded yet.</h3><p>Once automated or manual runs begin, this section will show the most recent observation records.</p></div>}
    </section>

    <section className="shell methodology"><div><span className="eyebrow">Measurement principles</span><h2>Measure first. Interpret second.</h2></div><div className="methodGrid"><p>Repeated observations matter more than isolated screenshots. Probabilistic systems require longitudinal samples.</p><p>Prompt wording, platform, model context, geography, language and timing are treated as experimental variables rather than noise.</p><p>Public research can remain open while company-specific diagnosis, monitoring and intervention strategy become the premium layer.</p></div></section>
  </main>
}

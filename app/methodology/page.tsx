export const metadata = {
  title: 'Methodology',
  description: 'How Visibility OS designs prompts, samples AI systems, records observations, runs interventions, classifies evidence, and protects contributed data.',
  alternates: { canonical: '/methodology' },
  openGraph: { url: '/methodology' }
};

const framework = [
  ['1','Define the question','Every study begins with a falsifiable or measurable question, not a dashboard metric looking for a story.'],
  ['2','Freeze the prompt set','Prompt wording, language, intent class and inclusion criteria are recorded before the intervention.'],
  ['3','Record the environment','Platform, model/version when observable, geography, language, timestamp and run metadata are captured for each observation.'],
  ['4','Establish a baseline','Repeated pre-intervention runs are used to estimate normal volatility before any conclusion is drawn.'],
  ['5','Change one meaningful variable','Experiments document the intervention, control condition and confounders. Multi-variable changes are labelled accordingly.'],
  ['6','Remeasure on the same protocol','Post-intervention runs use the same prompt set and sampling rules so deltas are comparable.'],
  ['7','Classify the evidence','Results are labelled established, strong, emerging, mixed/open or disconfirmed according to the strength and reproducibility of the evidence.'],
  ['8','Publish limitations','Every public finding should include sample size, timeframe, platforms, exclusions, known confounders and what the study cannot prove.']
];

export default function MethodologyPage(){
  return <main>
    <section className="recordHero"><div className="shell">
      <span className="eyebrow">Research protocol</span>
      <h1>How Visibility OS measures AI visibility.</h1>
      <p className="recordDek">Visibility OS treats AI visibility as a probabilistic measurement problem. Repeated observations, explicit controls and transparent limitations matter more than isolated screenshots or single-run rankings.</p>
      <div className="recordBand"><span className="pill">Reproducible sampling</span><span className="pill">Longitudinal measurement</span><span className="pill">Controlled interventions</span><span className="pill">Public limitations</span></div>
    </div></section>

    <section className="shell homeSection">
      <div className="sectionhead homeHead"><div><h2>The measurement protocol.</h2></div><p>The protocol is intentionally conservative. It is designed to make results inspectable and harder to overclaim.</p></div>
      <div className="evolutionGrid">{framework.map(([n,t,d])=><div className="evolutionStep" key={n}><span>{n}</span><h3>{t}</h3><p>{d}</p></div>)}</div>
    </section>

    <section className="evidenceBand"><div className="shell homeSection">
      <div className="sectionhead homeHead"><div><h2>What an observation can contain.</h2></div><p>The schema separates raw response data from interpretation so the same evidence can support later re-analysis.</p></div>
      <div className="methodGrid">
        <p><strong>Query context.</strong><br/>Prompt text or an approved public identifier, prompt variant, language, intent class and sampling cohort.</p>
        <p><strong>System context.</strong><br/>AI platform, observable model/version, timestamp, region where known, and run metadata.</p>
        <p><strong>Outcome signals.</strong><br/>Brand/entity mention, recommendation state, citations, citation order, domains, representation and ambiguity signals.</p>
      </div>
    </div></section>

    <section className="shell homeSection">
      <div className="sectionhead homeHead"><div><h2>Public research and private audits are different datasets.</h2></div><p>Visibility OS will not assume that customer or contributor prompts, response text, URLs or commercial findings are public simply because they are measured by the Observatory.</p></div>
      <div className="gapGrid">
        <div className="gapCard"><span>Public research</span><h3>Opted-in and publishable</h3><p>Only data explicitly designated for public research may appear in public observation streams, studies or downloadable datasets.</p></div>
        <div className="gapCard"><span>Private audits</span><h3>Private by default</h3><p>Brand-specific audits and contributed measurement data remain private unless the contributor explicitly opts into publication or anonymized aggregation.</p></div>
        <div className="gapCard"><span>Aggregation</span><h3>Minimum necessary disclosure</h3><p>Published findings should prefer aggregated statistics and anonymized examples when individual records are not necessary to support the conclusion.</p></div>
      </div>
    </section>

    <section className="shell methodology">
      <div><span className="eyebrow">Confidence framework</span><h2>We separate signal from certainty.</h2></div>
      <div className="methodGrid"><p><strong>Established / Strong.</strong><br/>Consistent evidence with good controls, repeatability or strong external support.</p><p><strong>Emerging / Mixed.</strong><br/>A measurable signal exists, but sample size, volatility or confounders prevent a stronger conclusion.</p><p><strong>Open / Disconfirmed.</strong><br/>Evidence is insufficient, contradictory, or fails to support the original hypothesis.</p></div>
    </section>
  </main>
}

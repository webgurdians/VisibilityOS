import { neon } from '@neondatabase/serverless';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('Q2D seed skipped: DATABASE_URL is not available.');
  process.exit(1);
}

const sql = neon(connectionString);
const eventSlug = 'perplexity-q2d-web-retrieval-benchmark';
const officialSourceSlug = 'perplexity-q2d-web-2026';
const paperSourceSlug = 'q2d-web-paper-2026';
const claimSlug = 'q2d-web-scale-and-agent-reformulation';

async function seed() {
  await sql`
    insert into public.sources (
      slug,title,source_type_id,publisher_organization_id,publisher_text,author_text,
      published_at,url,is_primary,notes
    ) values (
      ${officialSourceSlug},
      'Q2D-Web: Evaluating First-Stage Retrievers at Scale',
      (select id from public.source_types where slug='official'),
      (select id from public.organizations where slug='perplexity'),
      'Perplexity',
      'Perplexity Research',
      '2026-09-09'::date,
      'https://www.perplexity.ai/hub/blog/q2d-web',
      true,
      'Official Perplexity Research release describing Q2D-Web, its construction, relevance judgements, and benchmark methodology.'
    )
    on conflict (slug) do update set
      title=excluded.title,
      source_type_id=excluded.source_type_id,
      publisher_organization_id=excluded.publisher_organization_id,
      publisher_text=excluded.publisher_text,
      author_text=excluded.author_text,
      published_at=excluded.published_at,
      url=excluded.url,
      is_primary=excluded.is_primary,
      notes=excluded.notes
  `;

  await sql`
    insert into public.sources (
      slug,title,source_type_id,publisher_text,author_text,published_at,url,arxiv_id,is_primary,notes
    ) values (
      ${paperSourceSlug},
      'Q2D-Web: A Large-Scale Benchmark for Retrieval in Agentic RAG Systems',
      (select id from public.source_types where slug='research'),
      'arXiv',
      'Maximilian Schall; Sedigheh Eslami; Markus Krimmel; Antoine Chaffin; Louis Milliken; Bo Wang; Denis Bykov',
      '2026-09-08'::date,
      'https://arxiv.org/abs/2609.08887',
      '2609.08887',
      true,
      'Original research paper for Q2D-Web.'
    )
    on conflict (slug) do update set
      title=excluded.title,
      source_type_id=excluded.source_type_id,
      publisher_text=excluded.publisher_text,
      author_text=excluded.author_text,
      published_at=excluded.published_at,
      url=excluded.url,
      arxiv_id=excluded.arxiv_id,
      is_primary=excluded.is_primary,
      notes=excluded.notes
  `;

  await sql`
    insert into public.events (
      slug,title,event_date,date_precision,narrative_stage_id,historical_significance,
      summary,what_changed,why_it_matters,interpretation,open_questions,status,
      first_published_at,last_reviewed_at
    ) values (
      ${eventSlug},
      'Perplexity introduces Q2D-Web for large-scale retrieval evaluation in agentic RAG',
      '2026-09-09'::date,
      'day',
      (select id from public.narrative_stages where slug='multi-query-agentic-discovery'),
      'major',
      'Perplexity released Q2D-Web, a production-shaped retrieval benchmark built around 190 million web documents and 69,721 agent-reformulated queries across 10 languages.',
      'Q2D-Web evaluates machine-written search reformulations produced inside agentic RAG workflows rather than only human-written queries. It also provides separate relevance signals from agent citations, production rankings, and expanded LLM judgements.',
      'The visible user prompt is not necessarily the query a source competes for. AI visibility therefore depends on several distinct stages: query reformulation, first-stage retrieval, ranking, evidence selection, and eventual citation.',
      'Visibility OS treats Q2D-Web as strong evidence for a multi-stage visibility model. Retrievable does not mean selected; selected does not mean cited; cited does not necessarily mean prominently represented in the final answer.',
      'How stable are agent reformulations across repeated runs? Which retrieval signals best predict later citation? How transferable are the findings to Google AI Mode, ChatGPT Search, Gemini, Claude, and Copilot?',
      'published',
      now(),
      now()
    )
    on conflict (slug) do update set
      title=excluded.title,
      event_date=excluded.event_date,
      date_precision=excluded.date_precision,
      narrative_stage_id=excluded.narrative_stage_id,
      historical_significance=excluded.historical_significance,
      summary=excluded.summary,
      what_changed=excluded.what_changed,
      why_it_matters=excluded.why_it_matters,
      interpretation=excluded.interpretation,
      open_questions=excluded.open_questions,
      status=excluded.status,
      last_reviewed_at=now()
  `;

  const [event] = await sql`select id from public.events where slug=${eventSlug} limit 1`;
  const [officialSource] = await sql`select id from public.sources where slug=${officialSourceSlug} limit 1`;
  const [paperSource] = await sql`select id from public.sources where slug=${paperSourceSlug} limit 1`;

  await sql`
    insert into public.event_sources(event_id,source_id,source_role,source_order,notes)
    values (${event.id},${officialSource.id},'primary',1,'Official product/research release.')
    on conflict (event_id,source_id) do update set source_role=excluded.source_role,source_order=excluded.source_order,notes=excluded.notes
  `;
  await sql`
    insert into public.event_sources(event_id,source_id,source_role,source_order,notes)
    values (${event.id},${paperSource.id},'primary',2,'Original research paper.')
    on conflict (event_id,source_id) do update set source_role=excluded.source_role,source_order=excluded.source_order,notes=excluded.notes
  `;

  const topicLinks = [
    ['retrieval','primary'],
    ['agentic-discovery','primary'],
    ['query-fan-out','secondary'],
    ['citations','secondary'],
    ['source-selection','secondary'],
    ['perplexity','secondary'],
    ['rag','secondary'],
    ['ai-discoverability','secondary'],
    ['measurement','secondary'],
    ['geo','secondary'],
    ['llmo','secondary']
  ];

  for (const [topicSlug,relevance] of topicLinks) {
    const [topic] = await sql`select id from public.topics where slug=${topicSlug} limit 1`;
    if (!topic) continue;
    await sql`
      insert into public.event_topics(event_id,topic_id,relevance)
      values (${event.id},${topic.id},${relevance})
      on conflict (event_id,topic_id) do update set relevance=excluded.relevance
    `;
  }

  const [platform] = await sql`select id from public.platforms where slug='perplexity' limit 1`;
  if (platform) {
    await sql`
      insert into public.event_platforms(event_id,platform_id)
      values (${event.id},${platform.id})
      on conflict do nothing
    `;
  }

  await sql`
    insert into public.claims (
      slug,statement,claim_type,evidence_status_id,confidence,scope,status,last_reviewed_at
    ) values (
      ${claimSlug},
      'Q2D-Web contains 190 million web documents and 69,721 agent-reformulated queries in 10 languages, sampled from nine months of PII-free production search traffic.',
      'factual',
      (select id from public.evidence_statuses where slug='established'),
      0.99,
      'Q2D-Web benchmark construction and scale',
      'published',
      now()
    )
    on conflict (slug) do update set
      statement=excluded.statement,
      claim_type=excluded.claim_type,
      evidence_status_id=excluded.evidence_status_id,
      confidence=excluded.confidence,
      scope=excluded.scope,
      status=excluded.status,
      last_reviewed_at=now()
  `;

  const [claim] = await sql`select id from public.claims where slug=${claimSlug} limit 1`;
  for (const sourceId of [officialSource.id,paperSource.id]) {
    await sql`
      insert into public.claim_sources(claim_id,source_id,stance,weight,notes)
      values (${claim.id},${sourceId},'supports',1.0,'Primary source for benchmark construction and scale.')
      on conflict (claim_id,source_id,stance) do update set weight=excluded.weight,notes=excluded.notes
    `;
  }

  for (const topicSlug of ['retrieval','agentic-discovery','perplexity','measurement']) {
    const [topic] = await sql`select id from public.topics where slug=${topicSlug} limit 1`;
    if (!topic) continue;
    await sql`
      insert into public.claim_topics(claim_id,topic_id)
      values (${claim.id},${topic.id})
      on conflict do nothing
    `;
  }

  await sql`
    insert into public.event_claims(event_id,claim_id,relation)
    values (${event.id},${claim.id},'introduces')
    on conflict (event_id,claim_id) do update set relation=excluded.relation
  `;

  const relatedSlugs = [
    ['perplexity-launches-answer-engine','builds_on'],
    ['google-expands-query-fan-out-and-deep-search','related_to']
  ];
  for (const [toSlug,relationshipType] of relatedSlugs) {
    const [toEvent] = await sql`select id from public.events where slug=${toSlug} limit 1`;
    if (!toEvent) continue;
    await sql`
      insert into public.event_relationships(from_event_id,to_event_id,relationship_type,notes)
      values (${event.id},${toEvent.id},${relationshipType},'Related Visibility OS historical context for multi-stage AI retrieval and answer generation.')
      on conflict (from_event_id,to_event_id,relationship_type) do update set notes=excluded.notes
    `;
  }

  await sql`
    insert into public.revisions(entity_type,entity_id,change_summary,changed_fields)
    values ('event',${event.id},'Canonical Q2D-Web record added to Neon',jsonb_build_object('sources',2,'topics',${topicLinks.length},'platform','perplexity','claim',${claimSlug}))
  `;

  const [check] = await sql`
    select e.slug,e.event_date,e.status,
      (select count(*) from public.event_sources es where es.event_id=e.id)::int as source_count,
      (select count(*) from public.event_topics et where et.event_id=e.id)::int as topic_count,
      (select count(*) from public.event_platforms ep where ep.event_id=e.id)::int as platform_count,
      (select count(*) from public.event_claims ec where ec.event_id=e.id)::int as claim_count
    from public.events e where e.id=${event.id}
  `;

  console.log('Q2D seed complete:', JSON.stringify(check));
}

seed().catch((error) => {
  console.error('Q2D seed failed:', error);
  process.exit(1);
});

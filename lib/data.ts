import { neon } from '@neondatabase/serverless';

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

const fallbackTopics = [
  {slug:'ai-visibility',name:'AI Visibility',description:'Visibility of entities, brands, pages, products, or information in AI-mediated discovery.'},
  {slug:'aeo',name:'Answer Engine Optimization (AEO)',description:'Optimization for systems that return direct answers rather than only ranked links.'},
  {slug:'geo',name:'Generative Engine Optimization (GEO)',description:'Optimization for visibility, citation, or inclusion in generative search and answer engines.'},
  {slug:'llmo',name:'Large Language Model Optimization (LLMO)',description:'Optimization aimed at how LLM-based systems understand, retrieve, cite, or recommend entities and content.'},
  {slug:'query-fan-out',name:'Query Fan-Out',description:'Decomposing a user question into multiple related searches or subqueries.'},
  {slug:'citations',name:'AI Citations',description:'Attribution, linking, and source selection in AI-generated answers.'},
  {slug:'retrieval',name:'Retrieval',description:'Finding candidate information or documents for an AI response.'},
  {slug:'measurement',name:'AI Visibility Measurement',description:'Methods and metrics for measuring mentions, citations, share of voice, and discoverability.'},
  {slug:'chatgpt-search',name:'ChatGPT Search',description:'Web search and source-linked answers inside ChatGPT.'}
];

const q2dEvent = {
  slug:'perplexity-q2d-web-retrieval-benchmark',
  date:'2026-09-09',
  title:'Perplexity introduces Q2D-Web for large-scale retrieval evaluation in agentic RAG',
  summary:'Perplexity released Q2D-Web, a production-shaped retrieval benchmark built around 190 million web documents and 69,721 agent-reformulated queries across 10 languages.',
  what_changed:'Q2D-Web evaluates machine-written search reformulations produced inside agentic RAG workflows rather than only human-written queries. It also provides separate relevance signals from agent citations, production rankings, and expanded LLM judgements.',
  why_it_matters:'The visible user prompt is not necessarily the query a source competes for. AI visibility therefore depends on several distinct stages: query reformulation, first-stage retrieval, ranking, evidence selection, and eventual citation.',
  interpretation:'Visibility OS treats Q2D-Web as strong evidence for a multi-stage visibility model. Retrievable does not mean selected; selected does not mean cited; cited does not necessarily mean prominently represented in the final answer.',
  open_questions:'How stable are agent reformulations across repeated runs? Which retrieval signals best predict later citation? How transferable are the findings to Google AI Mode, ChatGPT Search, Gemini, Claude, and Copilot?',
  significance:'major',
  topics:['retrieval','agentic-discovery','query-fan-out','citations','source-selection','perplexity','rag','ai-discoverability','measurement','geo','llmo'],
  source:'perplexity-q2d-web-2026',
  sources:[
    {slug:'perplexity-q2d-web-2026',title:'Q2D-Web: Evaluating First-Stage Retrievers at Scale',publisher:'Perplexity',publisher_text:'Perplexity',source_type:'official',published_at:'2026-09-09',url:'https://www.perplexity.ai/hub/blog/q2d-web'},
    {slug:'q2d-web-paper-2026',title:'Q2D-Web: A Large-Scale Benchmark for Retrieval in Agentic RAG Systems',publisher:'arXiv',publisher_text:'arXiv',source_type:'research',published_at:'2026-09-08',url:'https://arxiv.org/abs/2609.08887'}
  ]
};

const fallbackEvents = [
  q2dEvent,
  {slug:'geo-paper-introduces-generative-engine-optimization',date:'2023-11-16',title:'Research paper formally introduces Generative Engine Optimization (GEO)',summary:'The paper “GEO: Generative Engine Optimization” introduced GEO as a framework for improving visibility in generative-engine responses.',what_changed:'A formal research vocabulary and benchmark were proposed for optimization inside generative engines.',why_it_matters:'GEO became a named research problem with explicit visibility metrics.',interpretation:'Visibility OS treats this as the strongest verifiable origin milestone for the formal term GEO.',significance:'foundational',topics:['geo','citations'],source:'geo-paper-2023'},
  {slug:'google-introduces-ai-mode-query-fan-out',date:'2025-03-05',title:'Google introduces AI Mode and describes query fan-out',summary:'Google described a query fan-out approach that runs multiple related searches across subtopics and data sources.',what_changed:'A single user question could trigger a broader multi-query retrieval process before answer generation.',why_it_matters:'Visibility is no longer tied only to the user’s literal query; sources can be discovered through hidden subqueries.',interpretation:'Query fan-out changes how practitioners should think about topical coverage and retrieval opportunity.',significance:'foundational',topics:['query-fan-out','geo'],source:'google-ai-mode-2025'},
  {slug:'cloudflare-new-ai-crawler-defaults-take-effect',date:'2026-09-15',title:'Cloudflare’s new Search / Agent / Training crawler defaults take effect',summary:'Cloudflare’s new crawler-purpose defaults separate Search, Agent and Training access.',what_changed:'Blocking training can also affect multi-purpose crawlers whose declared purposes overlap.',why_it_matters:'Crawler governance is now part of AI discoverability and technical GEO.',interpretation:'AI crawler policy should be audited as part of visibility strategy.',significance:'major',topics:['ai-visibility','geo'],source:'cloudflare-ai-traffic-options-2026'}
];

const fallbackSources = [
  ...q2dEvent.sources,
  {slug:'geo-paper-2023',title:'GEO: Generative Engine Optimization',publisher:'arXiv',source_type:'research',published_at:'2023-11-16',url:'https://arxiv.org/abs/2311.09735'},
  {slug:'google-ai-mode-2025',title:'Expanding AI Overviews and introducing AI Mode',publisher:'Google',source_type:'official',published_at:'2025-03-05',url:'https://blog.google/products/search/ai-mode-search/'},
  {slug:'cloudflare-ai-traffic-options-2026',title:'Your site, your rules: new AI traffic options for all customers',publisher:'Cloudflare',source_type:'official',published_at:'2026-07-01',url:'https://blog.cloudflare.com/content-independence-day-ai-options/'}
];

function dateString(value:any){ return value?.toISOString?.().slice(0,10) ?? String(value); }

export async function getLatestEvents(limit=24){
  if(!sql) return [...fallbackEvents].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,limit);
  const rows=await sql`select e.* from public.events e where e.status='published' order by e.event_date desc,e.updated_at desc limit ${limit}`;
  return rows.map((r:any)=>({...r,date:dateString(r.event_date)}));
}

export async function getEvent(slug:string){
  if(!sql) return fallbackEvents.find(e=>e.slug===slug)??null;
  const rows=await sql`select * from public.events where slug=${slug} and status='published' limit 1`;
  if(!rows[0]) return null;
  const r:any=rows[0];
  const topics=await sql`select t.slug from public.event_topics et join public.topics t on t.id=et.topic_id where et.event_id=${r.id} order by et.relevance,t.name`;
  const sources=await sql`select s.slug,s.title,s.url,s.publisher_text,s.published_at,es.source_role from public.event_sources es join public.sources s on s.id=es.source_id where es.event_id=${r.id} order by es.source_order`;
  return {...r,date:dateString(r.event_date),topics:topics.map((x:any)=>x.slug),sources};
}

export async function getTopics(){ if(!sql) return fallbackTopics; return await sql`select * from public.topics order by name`; }

export async function getTopic(slug:string){
  if(!sql){const t=fallbackTopics.find(x=>x.slug===slug); return t?{...t,events:fallbackEvents.filter(e=>e.topics.includes(slug)).sort((a,b)=>b.date.localeCompare(a.date))}:null;}
  const r=await sql`select * from public.topics where slug=${slug} limit 1`; if(!r[0]) return null;
  const ev=await sql`select e.* from public.event_topics et join public.events e on e.id=et.event_id where et.topic_id=${r[0].id} and e.status='published' order by e.event_date desc`;
  return {...r[0],events:ev.map((e:any)=>({...e,date:dateString(e.event_date)}))};
}

export async function getClaims(){
  if(!sql) return [
    {slug:'google-ai-features-use-query-fan-out',statement:'Google AI features may use query fan-out to issue multiple related searches across subtopics and data sources.',status:'established',confidence:.98},
    {slug:'geo-paper-reports-up-to-40-percent-visibility-lift',statement:'The original GEO paper reported that tested optimization strategies could improve measured visibility by up to 40% in its benchmark setting.',status:'strong',confidence:.88},
    {slug:'q2d-web-scale-and-agent-reformulation',statement:'Q2D-Web contains 190 million web documents and 69,721 agent-reformulated queries in 10 languages, sampled from nine months of PII-free production search traffic.',status:'established',confidence:.99}
  ];
  return await sql`select c.*,es.slug as evidence_status from public.claims c left join public.evidence_statuses es on es.id=c.evidence_status_id where c.status='published' order by c.confidence desc nulls last`;
}

export async function getSources(){ if(!sql) return fallbackSources; return await sql`select * from public.sources order by published_at desc nulls last`; }

export async function getResearchGaps(){
  if(!sql) return [
    {question:'What is the earliest verifiable published use of the term “Answer Engine Optimization” (AEO)?',reason:'The practice predates the terminology and origin claims are often repeated without primary evidence.'},
    {question:'What is the earliest verifiable use of “Large Language Model Optimization” / LLMO for web visibility?',reason:'The acronym is used inconsistently and overlaps with unrelated technical meanings.'},
    {question:'How stable are AI-search query reformulations and citations across repeated runs?',reason:'Probabilistic agent behavior makes retrieval and citation visibility difficult to measure reliably.'}
  ];
  return await sql`select * from public.research_gaps order by created_at desc`;
}

export async function searchEvents(q:string,limit=20){
  if(!q) return [];
  if(!sql){const n=q.toLowerCase(); return fallbackEvents.filter(e=>Object.values(e).flat().join(' ').toLowerCase().includes(n)).slice(0,limit);}
  const rows=await sql`select * from public.search_published_events(${q},${limit})`;
  return rows.map((r:any)=>({...r,date:dateString(r.event_date)}));
}

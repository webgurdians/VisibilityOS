export type Rule={allow:boolean;pattern:string};
type Group={agents:string[];rules:Rule[]};
export function parseRobots(body:string){
 const groups:Group[]=[];const sitemaps:string[]=[];let group:Group|undefined;let hasRules=false;
 for(const raw of body.replace(/^\uFEFF/,'').split(/\r?\n/)){
  const line=raw.split('#')[0].trim();const i=line.indexOf(':');if(i<0)continue;
  const key=line.slice(0,i).trim().toLowerCase(),value=line.slice(i+1).trim();
  if(key==='sitemap'){try{const u=new URL(value);if(['http:','https:'].includes(u.protocol)&&!u.username&&!u.password)sitemaps.push(u.href);}catch{}continue;}
  if(key==='user-agent'&&value){if(!group||hasRules){group={agents:[],rules:[]};groups.push(group);hasRules=false;}group.agents.push(value.toLowerCase());}
  else if(group&&(key==='allow'||key==='disallow')){hasRules=true;if(value)group.rules.push({allow:key==='allow',pattern:value});}
 }
 return {groups,sitemaps:[...new Set(sitemaps)]};
}
export function evaluateRobots(body:string,agent:string,path:string){
 const {groups}=parseRobots(body);const name=agent.toLowerCase();
 const exact=groups.filter(g=>g.agents.includes(name));const selected=exact.length?exact:groups.filter(g=>g.agents.includes('*'));
 // Conservative subset: percent-encoded or non-ASCII paths require a full RFC 9309 implementation.
 if(/[^\x20-\x7e]|%/.test(path)||selected.some(g=>g.rules.some(r=>/[^\x20-\x7e]|%/.test(r.pattern))))return {status:'unknown' as const,rule:null};
 if(selected.reduce((n,g)=>n+g.rules.reduce((m,r)=>m+r.pattern.length*(path.length+1),0),0)>2000000)return {status:'unknown' as const,rule:null};
 let best:Rule|undefined;let length=-1;
 for(const g of selected)for(const r of g.rules){
  const anchored=r.pattern.endsWith('$');const p=anchored?r.pattern.slice(0,-1):r.pattern;
  // Linear wildcard matching via bounded dynamic programming, avoiding regex backtracking.
  if(p.length>1024||path.length>2048)return {status:'unknown' as const,rule:null};
  let prev=new Uint8Array(path.length+1);prev[0]=1;
  for(const ch of p){const next=new Uint8Array(path.length+1);if(ch==='*'){next[0]=prev[0];for(let j=1;j<=path.length;j++)next[j]=prev[j]||next[j-1]?1:0;}else for(let j=1;j<=path.length;j++)next[j]=prev[j-1]&&path[j-1]===ch?1:0;prev=next;}
  const match=anchored?prev[path.length]===1:prev.includes(1);
  const specificity=p.replace(/\*/g,'').length;
  if(match&&(specificity>length||(specificity===length&&r.allow))){best=r;length=specificity;}
 }
 return {status:best&&!best.allow?'disallowed' as const:'allowed' as const,rule:best?.pattern??null};
}
export const auditAgents=['GPTBot','OAI-SearchBot','ChatGPT-User','Googlebot','Google-Extended','PerplexityBot','ClaudeBot','Claude-SearchBot','Claude-User','Bingbot'] as const;
export function inspectRobots(status:number,body:string,path='/'){
 if(status!==200)return {sitemaps:[],agents:auditAgents.map(agent=>({agent,status:'unknown',rule:null})),note:'robots.txt not successfully retrieved; no access conclusion'};
 const parsed=parseRobots(body);
 return {sitemaps:parsed.sitemaps,agents:auditAgents.map(agent=>({agent,...evaluateRobots(body,agent,path)})),note:'Sampled path only; declared policy, not observed crawling or indexing'};
}
export function inspectSitemap(status:number,body:string){
 if(status!==200)return {status:'unknown',kind:null,locations:0};
 const clean=body.replace(/^\uFEFF/,'').replace(/^\s*<\?xml[^?]*\?>/i,'').trim();
 const kind=/^<urlset(?:\s|>)/i.test(clean)?'urlset':/^<sitemapindex(?:\s|>)/i.test(clean)?'sitemapindex':null;
 return {status:kind?'detected':'unknown',kind,locations:kind?(clean.match(/<loc\s*>/gi)||[]).length:0,note:'Structural indicators only; XML validity and index coverage not verified'};
}

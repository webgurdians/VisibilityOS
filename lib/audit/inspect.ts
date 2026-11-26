export type Finding = { check: string; status: 'pass'|'warning'|'unknown'; evidence: string };
const entities:Record<string,string>={amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:'\u00a0',ndash:'–',mdash:'—',rsquo:'’',lsquo:'‘',rdquo:'”',ldquo:'“',copy:'©',reg:'®'};
export function decodeEvidence(value:string):string {
 return value.replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+);/gi,(match,key:string)=>{
  if(key.startsWith('#')){const hex=key[1]?.toLowerCase()==='x';const n=Number.parseInt(key.slice(hex?2:1),hex?16:10);return n>0&&n<=0x10ffff&&!(n>=0xd800&&n<=0xdfff)?String.fromCodePoint(n):'\ufffd';}
  return Object.hasOwn(entities,key)?entities[key]:match;
 });
}
export function inspectHtml(html:string): Finding[] {
 const clean=html.replace(/<!--[\s\S]*?-->/g,'');
 const title=clean.match(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/i)?.[1]?.trim();
 const tags=clean.match(/<(?:meta|link|script)\b[^>]*>/gi)||[];
 const attr=(tag:string,key:string)=>tag.match(new RegExp('(?:^|\\s)'+key+'\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+))','i'))?.slice(1).find(v=>v!==undefined);
 const description=tags.find(t=>/^<meta\b/i.test(t)&&attr(t,'name')?.toLowerCase()==='description');
 const canonical=tags.find(t=>/^<link\b/i.test(t)&&attr(t,'rel')?.toLowerCase().split(/\s+/).includes('canonical'));
 const robots=tags.filter(t=>/^<meta\b/i.test(t)&&attr(t,'name')?.toLowerCase()==='robots').map(t=>attr(t,'content')||'');
 const schema=tags.filter(t=>/^<script\b/i.test(t)&&attr(t,'type')?.toLowerCase()==='application/ld+json');
 const result=(check:string,value:string|undefined):Finding=>({check,status:value?'pass':'warning',evidence:value?decodeEvidence(value):'Not detected in sampled HTML'});
 return [result('Page title',title),result('Meta description',description&&attr(description,'content')),result('Canonical declaration',canonical&&attr(canonical,'href')),
 {check:'Robots meta',status:robots.some(x=>/\b(noindex|none)\b/i.test(x))?'warning':robots.some(x=>/\bindex\b/i.test(x))?'pass':'unknown',evidence:robots.join('; ')||'No robots meta detected; HTTP and robots.txt directives not assessed'},
 {check:'JSON-LD declaration',status:schema.length?'pass':'warning',evidence:schema.length?schema.length+' declaration(s); validity not assessed':'Not detected in sampled HTML'}];
}

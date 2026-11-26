export type Finding = { check: string; status: 'pass'|'warning'|'unknown'; evidence: string };
export function inspectHtml(html:string): Finding[] {
 const clean=html.replace(/<!--[\s\S]*?-->/g,'');
 const title=clean.match(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/i)?.[1]?.trim();
 const tags=clean.match(/<(?:meta|link|script)\b[^>]*>/gi)||[];
 const attr=(tag:string,key:string)=>tag.match(new RegExp('(?:^|\\s)'+key+'\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+))','i'))?.slice(1).find(v=>v!==undefined);
 const description=tags.find(t=>/^<meta\b/i.test(t)&&attr(t,'name')?.toLowerCase()==='description');
 const canonical=tags.find(t=>/^<link\b/i.test(t)&&attr(t,'rel')?.toLowerCase().split(/\s+/).includes('canonical'));
 const robots=tags.filter(t=>/^<meta\b/i.test(t)&&attr(t,'name')?.toLowerCase()==='robots').map(t=>attr(t,'content')||'');
 const schema=tags.filter(t=>/^<script\b/i.test(t)&&attr(t,'type')?.toLowerCase()==='application/ld+json');
 const result=(check:string,value:string|undefined):Finding=>({check,status:value?'pass':'warning',evidence:value||'Not detected in sampled HTML'});
 return [result('Page title',title),result('Meta description',description&&attr(description,'content')),result('Canonical declaration',canonical&&attr(canonical,'href')),
 {check:'Robots meta',status:robots.some(x=>/\b(noindex|none)\b/i.test(x))?'warning':'unknown',evidence:robots.join('; ')||'No robots meta detected; HTTP and robots.txt directives not assessed'},
 {check:'JSON-LD declaration',status:schema.length?'pass':'warning',evidence:schema.length?schema.length+' declaration(s); validity not assessed':'Not detected in sampled HTML'}];
}

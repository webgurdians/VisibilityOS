import {fetchPublicDocument,validateUrl,type FetchResult} from './fetch-public';
import {inspectHtml} from './inspect';
import {evaluateRobots,inspectRobots,inspectSitemap} from './robots';
export async function runAudit(raw:string,fetcher=fetchPublicDocument){
 const url=validateUrl(raw);
 if(url.pathname!=='/'||url.search)throw new Error('Enter a website homepage URL');
 const checkedAt=new Date().toISOString();
 const diagnostics:{resource:string;status:number|null;detail:string}[]=[];
 async function get(target:URL,resource:string,permit:(p:string)=>boolean):Promise<FetchResult|null>{
  for(let i=0;i<2;i++){
   if(target.origin!==url.origin||!permit(target.pathname+target.search)){diagnostics.push({resource,status:null,detail:'Skipped: origin or crawler policy restriction'});return null;}
   try{
    const r=await fetcher(target.href,false);
    diagnostics.push({resource,status:r.status,detail:r.issue|| (r.status>=300&&r.status<400?'Redirect received':r.contentType||'No content type')});
    if(r.status>=300&&r.status<400&&r.location&&i===0){target=validateUrl(new URL(r.location,target).href);continue;}
    return r;
   }catch(e){const code=(e as NodeJS.ErrnoException)?.code;const msg=e instanceof Error?e.message:'';diagnostics.push({resource,status:null,detail:code==='ENOTFOUND'||code==='EAI_AGAIN'?'DNS resolution failed':/timeout|deadline/i.test(msg)?'Request timed out':/Non-public/i.test(msg)?'Address rejected by safety policy':/limit/i.test(msg)?'Response limit exceeded':'Network or transport failure'});return null;}
  }return null;
 }
 const robots=await get(new URL('/robots.txt',url),'robots.txt',p=>p==='/robots.txt');
 const valid=!!robots&&robots.status===200&&!robots.issue&&/^text\/plain(?:;|$)/i.test(robots.contentType)&&!/^\s*</.test(robots.body);
 const absent=robots?.status===404||robots?.status===410;
 const policy=inspectRobots(valid?200:0,valid?robots!.body:'');
 const allowed=(path:string)=>!!absent||(valid&&evaluateRobots(robots!.body,'VisibilityOSAudit',path).status==='allowed');
 const page=await get(url,'Homepage',allowed);
 const declared=policy.sitemaps.map(s=>new URL(s)).find(s=>s.origin===url.origin&&!s.search);
 const sitemap=await get(declared||new URL('/sitemap.xml',url),'Sitemap',allowed);
 const findings=page?.status===200&&!page.issue&&/^text\/html(?:;|$)/i.test(page.contentType)?inspectHtml(page.body):[];
 const recommendations:string[]=[];
 if(!valid&&!absent)recommendations.push('Investigate robots.txt retrieval using the diagnostics below before drawing crawler conclusions.');
 if(!findings.length)recommendations.push('Resolve homepage retrieval or policy uncertainty before assessing metadata.');
 for(const f of findings)if(f.status==='warning')recommendations.push('Review '+f.check+' against the sampled evidence.');
 if(sitemap?.status!==200)recommendations.push('Verify sitemap availability and its robots.txt declaration.');
 return {website:url.origin,checkedAt,homepageStatus:page?.status??null,homepageNote:findings.length?'Sampled HTML response':'Homepage analysis incomplete',findings,robots:policy,sitemap:inspectSitemap(sitemap?.issue?0:sitemap?.status??0,sitemap?.body??''),diagnostics,recommendations,aiVisibility:'not measured',limitations:['Homepage only','At most one same-origin redirect per resource; robots redirects restricted to /robots.txt','One same-origin sitemap sampled','No JavaScript rendering','No search index verification']};
}

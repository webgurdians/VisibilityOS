import {fetchPublicDocument,validateUrl} from './fetch-public';
import {inspectHtml} from './inspect';
import {evaluateRobots,inspectRobots,inspectSitemap} from './robots';
export async function runAudit(raw:string, fetcher=fetchPublicDocument){
 const url=validateUrl(raw);
 if(url.pathname!=='/'||url.search)throw new Error('Enter a website homepage URL');
 const checkedAt=new Date().toISOString();
 const robots=await fetcher(new URL('/robots.txt',url).href,false).catch(()=>null);
 const valid=robots?.status===200&&/^text\/plain(?:;|$)/i.test(robots.contentType);
 const absent=robots?.status===404||robots?.status===410;
 const policy=inspectRobots(valid?200:0,valid?robots.body:'');
 const allowed=(path:string)=>absent||(valid&&evaluateRobots(robots.body,'VisibilityOSAudit',path).status==='allowed');
 const page=allowed('/')?await fetcher(url.href,false).catch(()=>null):null;
 const sitemapPath='/sitemap.xml';
 const sitemap=allowed(sitemapPath)?await fetcher(new URL(sitemapPath,url).href,false).catch(()=>null):null;
 const findings=page?.status===200&&/^text\/html(?:;|$)/i.test(page.contentType)?inspectHtml(page.body):[];
 return {website:url.origin,checkedAt,homepageStatus:page?.status??null,homepageNote:!allowed('/')?'Skipped: crawler policy blocked or uncertain':!page?'Fetch unsuccessful':page.status>=300&&page.status<400?'Redirect not followed; submit canonical homepage':'Sampled response',findings,robots:policy,sitemap:inspectSitemap(sitemap?.status??0,sitemap?.body??''),aiVisibility:'not measured',limitations:['Homepage only','No redirects followed','Sitemap declarations not fetched','No JavaScript rendering','No search index verification']};
}

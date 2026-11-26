import { lookup } from 'node:dns/promises';
import { request as http } from 'node:http';
import { request as https } from 'node:https';
import { isIP } from 'node:net';

export function publicIPv4(ip:string):boolean {
 if(isIP(ip)!==4) return false;
 const [a,b,c]=ip.split('.').map(Number);
 return !(a===0||a===10||a===127||a>=224||(a===100&&b>=64&&b<=127)||(a===169&&b===254)||(a===172&&b>=16&&b<=31)||(a===192&&(b===168||b===0||b===88))||(a===198&&(b===18||b===19||(b===51&&c===100)))||(a===203&&b===0&&c===113));
}
export function validateUrl(raw:string):URL {
 const u=new URL(raw);
 if(!['http:','https:'].includes(u.protocol)||u.username||u.password||u.port||isIP(u.hostname)||u.hostname.includes(':')||!u.hostname.includes('.')||u.hostname.endsWith('.')||/\.(localhost|local|internal|test|invalid|example|onion)$/i.test(u.hostname)) throw new Error('Unsupported public website URL');
 u.hash=''; return u;
}
export type FetchResult={url:string;status:number;body:string;contentType:string;location?:string;issue?:string};
async function once(u:URL,deadline:number):Promise<FetchResult>{
 const remaining=()=>Math.max(0,deadline-Date.now());
 const addresses=await new Promise<Awaited<ReturnType<typeof resolve4>>>((resolve,reject)=>{
  const timer=setTimeout(()=>reject(new Error('DNS timeout')),remaining());
  resolve4(u.hostname).then(v=>{clearTimeout(timer);resolve(v)},e=>{clearTimeout(timer);reject(e)});
 });
 if(!addresses.length||addresses.some(a=>!publicIPv4(a.address))) throw new Error('Non-public or unsupported address');
 const address=addresses[0].address;
 if(!remaining()) throw new Error('Fetch deadline exceeded');
 return new Promise((resolve,reject)=>{
  const req=(u.protocol==='https:'?https:http)(u,{agent:false,family:4,lookup:(_host,_opts,cb)=>cb(null,address,4),headers:{'User-Agent':'VisibilityOSAudit/0.1','Accept':'text/html,text/plain,application/xml,text/xml','Accept-Encoding':'identity'}},res=>{
   const status=res.statusCode||0; const contentType=String(res.headers['content-type']||'');
   const location=res.headers.location;
   if(status>=300&&status<400){res.destroy();resolve({url:u.href,status,body:'',contentType,location});return;}
   if(status!==200){res.destroy();resolve({url:u.href,status,body:'',contentType});return;}
   if(res.headers['content-encoding']&&res.headers['content-encoding']!=='identity'){res.destroy();resolve({url:u.href,status,body:'',contentType,issue:'Unsupported encoding'});return;}
   if(!/^(text\/(html|plain|xml)|application\/(xml|xhtml\+xml))(;|$)/i.test(contentType)){res.destroy();resolve({url:u.href,status,body:'',contentType,issue:'Unsupported content type'});return;}
   let bytes=0;const chunks:Buffer[]=[];
   res.on('data',(chunk:Buffer)=>{bytes+=chunk.length;if(bytes>512*1024){res.destroy(new Error('Response exceeds limit'));return;}chunks.push(chunk);});
   res.on('error',reject);res.on('aborted',()=>reject(new Error('Response aborted')));
   res.on('end',()=>resolve({url:u.href,status,body:Buffer.concat(chunks).toString('utf8'),contentType}));
  });
  const timer=setTimeout(()=>req.destroy(new Error('Fetch deadline exceeded')),remaining());
  req.on('error',reject);req.on('close',()=>clearTimeout(timer));req.end();
 });
}
function resolve4(host:string){return lookup(host,{all:true,family:4});}
// Internal transport only. Callers must implement robots policy and durable quotas before use.
export async function fetchPublicDocument(raw:string, followRedirects=true):Promise<FetchResult>{
 let u=validateUrl(raw);const deadline=Date.now()+10000;
 for(let i=0;i<=3;i++){
  const r=await once(u,deadline);
  if(followRedirects&&r.status>=300&&r.status<400&&r.location){u=validateUrl(new URL(r.location,u).href);continue;}
  return r;
 }
 throw new Error('Redirect limit exceeded');
}

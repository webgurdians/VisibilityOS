import {runAudit} from '@/lib/audit/run';
import {validateUrl} from '@/lib/audit/fetch-public';
export const runtime='nodejs';
export const maxDuration=60;
let busy=false;let last=0;
export async function POST(req:Request){
 if(process.env.AUDIT_PILOT_ENABLED!=='true')return Response.json({error:'Pilot disabled'},{status:503});
 if(req.headers.get('origin')!==new URL(req.url).origin||req.headers.get('content-type')!=='application/json')return Response.json({error:'Invalid request'},{status:403});
 const reader=req.body?.getReader();if(!reader)return Response.json({error:'Missing body'},{status:400});
 let size=0;const chunks:Uint8Array[]=[];
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>2048){await reader.cancel();return Response.json({error:'Body too large'},{status:413});}chunks.push(value);}}catch{return Response.json({error:'Invalid body'},{status:400});}
 let url:URL;try{const data=JSON.parse(Buffer.concat(chunks).toString());if(typeof data.url!=='string')throw Error();url=validateUrl(data.url);if(url.pathname!=='/'||url.search)throw Error();}catch{return Response.json({error:'Enter a valid homepage URL'},{status:400});}
 const allowed=(process.env.AUDIT_PILOT_ORIGINS||'').split(',').map(x=>x.trim());
 if(!allowed.includes(url.origin))return Response.json({error:'Website not approved for pilot'},{status:403});
 if(busy||Date.now()-last<60000)return Response.json({error:'Wait one minute between pilot audits'},{status:429});
 busy=true;last=Date.now();
 try{return Response.json(await runAudit(url.href),{headers:{'Cache-Control':'no-store'}});}catch{return Response.json({error:'Audit unsuccessful'},{status:502});}finally{busy=false;}
}

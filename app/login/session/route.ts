import {NextRequest,NextResponse} from 'next/server';
import {configured,equal,issue,cookieName,ttl} from '@/lib/admin-session';
export const runtime='nodejs';
let failures=0,windowStart=0;
export async function POST(req:NextRequest){
 if(req.headers.get('origin')!==req.nextUrl.origin)return new Response('Forbidden',{status:403});
 const fail=()=>NextResponse.redirect(new URL('/login?error=1',req.url),303);
 if(!configured())return new Response('Admin unavailable',{status:503});
 if(Date.now()-windowStart>60000){windowStart=Date.now();failures=0;}
 if(failures>=10)return new Response('Try again later',{status:429});
 if(!req.headers.get('content-type')?.startsWith('application/x-www-form-urlencoded'))return new Response('Invalid request',{status:415});
 const reader=req.body?.getReader();if(!reader)return fail();let size=0;const chunks:Uint8Array[]=[];
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>4096){await reader.cancel();return new Response('Too large',{status:413});}chunks.push(value);}}catch{return fail();}
 const data=new URLSearchParams(Buffer.concat(chunks).toString());const user=data.get('username')||'',pass=data.get('password')||'';
 const userOk=equal(user,process.env.ADMIN_USERNAME!),passOk=equal(pass,process.env.ADMIN_PASSWORD!);
 if(!userOk||!passOk){failures++;return fail();}
 const res=NextResponse.redirect(new URL('/admin',req.url),303);res.cookies.set(cookieName,issue(),{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/',maxAge:ttl});res.headers.set('Cache-Control','no-store');return res;
}

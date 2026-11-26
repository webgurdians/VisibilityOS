import {NextRequest,NextResponse} from 'next/server';
import {configured,valid,cookieName} from './lib/admin-session';
export function proxy(req:NextRequest){
 if(!configured())return new NextResponse('Research Console is not configured.',{status:503});
 if(valid(req.cookies.get(cookieName)?.value)){
  if(!['GET','HEAD','OPTIONS'].includes(req.method)&&req.headers.get('origin')!==req.nextUrl.origin)return new NextResponse('Forbidden',{status:403});
  const res=NextResponse.next();res.headers.set('Cache-Control','private, no-store');res.headers.set('X-Robots-Tag','noindex, nofollow');return res;
 }
 if(req.method!=='GET'&&req.method!=='HEAD')return NextResponse.json({error:'Authentication required'},{status:401});
 return NextResponse.redirect(new URL('/login',req.url));
}
export const config={matcher:['/admin/:path*']};

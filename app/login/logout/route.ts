import {NextRequest,NextResponse} from 'next/server';
import {cookieName} from '@/lib/admin-session';
export async function POST(req:NextRequest){if(req.headers.get('origin')!==req.nextUrl.origin)return new Response('Forbidden',{status:403});const res=NextResponse.redirect(new URL('/login',req.url),303);res.cookies.set(cookieName,'',{path:'/',maxAge:0,httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict'});return res;}

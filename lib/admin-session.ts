import {createHmac,timingSafeEqual,randomBytes} from 'node:crypto';
export const cookieName='visibility_admin';
export const ttl=8*60*60;
export function configured(){return !!(process.env.ADMIN_USERNAME&&process.env.ADMIN_PASSWORD);}
function mac(value:string){return createHmac('sha256',process.env.ADMIN_SESSION_SECRET||process.env.ADMIN_PASSWORD||'').update(JSON.stringify([process.env.ADMIN_USERNAME,process.env.ADMIN_PASSWORD,value])).digest('hex');}
export function equal(a:string,b:string){const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y);}
export function issue(){const payload=String(Math.floor(Date.now()/1000)+ttl)+'.'+randomBytes(24).toString('hex');return payload+'.'+mac(payload);}
export function valid(token:string|undefined){if(!configured()||!token||!/^\d{10}\.[a-f0-9]{48}\.[a-f0-9]{64}$/.test(token))return false;const [exp,nonce,sig]=token.split('.');return Number(exp)>Date.now()/1000&&equal(sig,mac(exp+'.'+nonce));}

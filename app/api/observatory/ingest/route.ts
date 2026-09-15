import { NextRequest, NextResponse } from 'next/server';
import { authorizedIngestRequest, completeMeasurementRun, createMeasurementRun, recordObservation } from '@/lib/measurement';

export const runtime = 'nodejs';

function bad(message:string,status=400){
  return NextResponse.json({ok:false,error:message},{status});
}

export async function POST(req:NextRequest){
  if(!authorizedIngestRequest(req.headers.get('authorization'))) return bad('Unauthorized',401);
  let body:any;
  try{ body=await req.json(); }catch{ return bad('Invalid JSON'); }

  try{
    if(body.action==='start-run'){
      if(!body.promptSetId||!body.platformId) return bad('promptSetId and platformId are required');
      const run=await createMeasurementRun(body);
      return NextResponse.json({ok:true,run});
    }

    if(body.action==='record-observation'){
      const required=['measurementRunId','promptId','experimentId','platformId','queryText'];
      const missing=required.filter(k=>!body[k]);
      if(missing.length) return bad(`Missing required fields: ${missing.join(', ')}`);
      const observation=await recordObservation(body);
      return NextResponse.json({ok:true,observation});
    }

    if(body.action==='complete-run'){
      if(!body.measurementRunId) return bad('measurementRunId is required');
      const run=await completeMeasurementRun(body);
      if(!run) return bad('Measurement run not found',404);
      return NextResponse.json({ok:true,run});
    }

    return bad('Unknown action');
  }catch(error:any){
    console.error('Observatory ingest error',error);
    return bad('Measurement ingestion failed',500);
  }
}

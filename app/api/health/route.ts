import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  let dbStatus = 'ok';
  let dbLatency = 0;

  try {
    const start = Date.now();
    const supabase = await createServiceClient();
    const { error } = await supabase.from('profiles').select('id').limit(1);
    dbLatency = Date.now() - start;
    if (error) dbStatus = 'error';
  } catch {
    dbStatus = 'error';
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    status: dbStatus === 'ok' ? 'healthy' : 'degraded',
    services: {
      database: { status: dbStatus, latency: dbLatency },
    },
  }, {
    status: dbStatus === 'ok' ? 200 : 503,
    headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
  });
}

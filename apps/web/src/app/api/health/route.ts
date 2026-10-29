import { NextResponse } from 'next/server';
import { HealthCheckResponse } from '@keysmasher/shared';

const START_TIME = Date.now();

export async function GET() {
  const uptimeSeconds = Math.floor((Date.now() - START_TIME) / 1000);

  const payload: HealthCheckResponse = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'KeySmasher Web API',
    version: '0.1.0',
    uptimeSeconds,
  };

  return NextResponse.json(payload, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}

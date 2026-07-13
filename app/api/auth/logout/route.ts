import { NextResponse } from 'next/server';
import { limparCookie } from '@/lib/session';

export const runtime = 'nodejs';

export async function POST() {
  limparCookie();
  return NextResponse.json({ ok: true });
}

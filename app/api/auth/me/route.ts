import { NextResponse } from 'next/server';
import { sessaoAtual } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const s = await sessaoAtual();
  if (!s) return NextResponse.json({ autenticado: false }, { status: 401 });
  return NextResponse.json({
    autenticado: true,
    nome: s.nome,
    email: s.email,
    oab: s.oab ?? null,
    plano: s.plano ?? 'DEFESA',
    role: s.role,
  });
}

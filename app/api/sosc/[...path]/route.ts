/**
 * /api/sosc/* — a ponte para o backend SOSC.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *  ⚠️ O NAVEGADOR NUNCA FALA DIRETO COM api.soscriminalapp.com.br
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  NAVEGADOR          ESTAÇÃO (servidor)         BACKEND SOSC
 *      │                     │                        │
 *      │─ /api/sosc/... ────►│                        │
 *      │                     │─ + Bearer ────────────►│
 *      │                     │◄─ resposta ────────────│
 *      │◄─ resposta ─────────│                        │
 *
 *  Vantagens:
 *   · o token vive num cookie httpOnly — XSS não lê
 *   · zero CORS pra configurar no Fastify
 *   · o backend não precisa saber que a estação existe
 */

import type { NextRequest } from 'next/server';
import { repassar } from '@/lib/proxy';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** ⚠️ Upload de vídeo (FinaisJus) leva tempo. 10 min. */
const LONGO = 10 * 60_000;

function alvo(ctx: { params: { path: string[] } }) {
  return '/' + ctx.params.path.join('/');
}

function tempo(p: string) {
  return p.includes('/pecas') || p.includes('/upload') || p.includes('/anexos')
    ? LONGO
    : 60_000;
}

export async function GET(req: NextRequest, ctx: { params: { path: string[] } }) {
  const p = alvo(ctx);
  return repassar(req, p, { timeoutMs: tempo(p) });
}

export async function POST(req: NextRequest, ctx: { params: { path: string[] } }) {
  const p = alvo(ctx);
  return repassar(req, p, { timeoutMs: tempo(p) });
}

export async function PUT(req: NextRequest, ctx: { params: { path: string[] } }) {
  const p = alvo(ctx);
  return repassar(req, p, { timeoutMs: tempo(p) });
}

export async function PATCH(req: NextRequest, ctx: { params: { path: string[] } }) {
  return repassar(req, alvo(ctx));
}

export async function DELETE(req: NextRequest, ctx: { params: { path: string[] } }) {
  return repassar(req, alvo(ctx));
}

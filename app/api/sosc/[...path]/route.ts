/**
 * /api/sosc/**  →  api.soscriminalapp.com.br/api/v1/**
 *
 * Catch-all: qualquer endpoint do backend SOSC passa por aqui.
 * Exemplos:
 *   GET  /api/sosc/processos/meus-processos
 *   POST /api/sosc/processos/consulta
 *   GET  /api/sosc/clients
 *   POST /api/sosc/honorarios/charges
 */

import { NextRequest } from 'next/server';
import { repassar } from '@/lib/proxy';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
/** Uploads e consultas longas (Escavador) precisam de folga. */
export const maxDuration = 120;

function alvo(ctx: { params: { path: string[] } }): string {
  return '/' + (ctx.params.path ?? []).map(encodeURIComponent).join('/');
}

export async function GET(req: NextRequest, ctx: { params: { path: string[] } }) {
  return repassar(req, alvo(ctx), { timeoutMs: 90_000 });
}
export async function POST(req: NextRequest, ctx: { params: { path: string[] } }) {
  return repassar(req, alvo(ctx), { timeoutMs: 110_000 });
}
export async function PUT(req: NextRequest, ctx: { params: { path: string[] } }) {
  return repassar(req, alvo(ctx), { timeoutMs: 90_000 });
}
export async function PATCH(req: NextRequest, ctx: { params: { path: string[] } }) {
  return repassar(req, alvo(ctx), { timeoutMs: 90_000 });
}
export async function DELETE(req: NextRequest, ctx: { params: { path: string[] } }) {
  return repassar(req, alvo(ctx), { timeoutMs: 60_000 });
}

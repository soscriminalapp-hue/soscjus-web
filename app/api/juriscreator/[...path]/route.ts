/**
 * /api/juriscreator/**  →  juriscreator.soscriminal.com.br/app/**
 *
 * Mesmo JWT do SOSC JUS.
 *
 * Rotas usadas:
 *   GET  /api/juriscreator/config     → paletas, formatos
 *   GET  /api/juriscreator/topics     → tópicos sugeridos
 *   GET  /api/juriscreator/credito    → 3 criativos grátis/mês
 *   POST /api/juriscreator/generate   → jurisprudência → criativo PNG
 */

import { NextRequest } from 'next/server';
import { repassar } from '@/lib/proxy';
import { env } from '@/lib/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
/** O pipeline LLM do JurisCreator pode levar até 3 min. */
export const maxDuration = 200;

function alvo(ctx: { params: { path: string[] } }): string {
  return '/app/' + (ctx.params.path ?? []).map(encodeURIComponent).join('/');
}

const BASE = () => env.JURISCREATOR;

export async function GET(req: NextRequest, ctx: { params: { path: string[] } }) {
  return repassar(req, alvo(ctx), { base: BASE(), timeoutMs: 40_000 });
}
export async function POST(req: NextRequest, ctx: { params: { path: string[] } }) {
  return repassar(req, alvo(ctx), { base: BASE(), timeoutMs: 190_000 });
}

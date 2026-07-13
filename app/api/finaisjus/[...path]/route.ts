/**
 * /api/finaisjus/**  →  finaisjus.soscriminal.com.br/app/**
 *
 * O FinaisJus autentica com o MESMO JWT do SOSC JUS (middlewareJWT).
 * O proxy injeta o Bearer a partir do cookie da estação.
 *
 * Rotas usadas pela estação:
 *   POST /api/finaisjus/processar     → multipart (PDF + vídeo/áudio) → { jobId }
 *   GET  /api/finaisjus/status/:id    → polling a cada 3s
 *   GET  /api/finaisjus/docx/:id      → DOCX timbrado com a logomarca
 *   GET  /api/finaisjus/pecas         → Minhas Peças Premium
 *   GET  /api/finaisjus/credito       → saldo de peças
 *
 * IMPORTANTE: o upload é STREAMING. Um vídeo de audiência de 3 GB não é
 * carregado na memória do Next — o body passa direto para o VPS, que extrai
 * o áudio com ffmpeg e roda o WhisperX (transcrição + diarização).
 */

import { NextRequest } from 'next/server';
import { repassar } from '@/lib/proxy';
import { env } from '@/lib/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
/** Upload de audiência longa. O job em si é assíncrono (BullMQ). */
export const maxDuration = 300;

function alvo(ctx: { params: { path: string[] } }): string {
  return '/app/' + (ctx.params.path ?? []).map(encodeURIComponent).join('/');
}

const BASE = () => env.FINAISJUS;

export async function GET(req: NextRequest, ctx: { params: { path: string[] } }) {
  return repassar(req, alvo(ctx), { base: BASE(), timeoutMs: 60_000 });
}
export async function POST(req: NextRequest, ctx: { params: { path: string[] } }) {
  // 5 min: o multipart de um vídeo grande demora a subir.
  return repassar(req, alvo(ctx), { base: BASE(), timeoutMs: 290_000 });
}

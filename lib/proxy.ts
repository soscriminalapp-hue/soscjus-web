/**
 * proxy.ts — a ponte servidor→servidor.
 *
 * Regra de ouro: o navegador NUNCA fala com api.soscriminalapp.com.br.
 * Ele fala com /api/sosc/*, e este módulo repassa injetando o Bearer.
 *
 * Ganhos:
 *  - token imune a XSS (fica no cookie httpOnly)
 *  - zero configuração de CORS no Fastify
 *  - chaves de fornecedor nunca chegam ao cliente
 *  - dá pra trocar o backend sem mexer em uma linha do front
 */

import { NextRequest, NextResponse } from 'next/server';
import { sessaoAtual } from './session';
import { env } from './env';

/** Cabeçalhos que não devem ser repassados adiante. */
const BLOQUEADOS = new Set([
  'host',
  'connection',
  'content-length',
  'accept-encoding',
  'cookie',
]);

export interface OpcoesProxy {
  /** Base do destino. Padrão: backend SOSC + /api/v1 */
  base?: string;
  /** Não exige sessão (rotas públicas). */
  publico?: boolean;
  /** Timeout em ms. Uploads longos precisam de mais. */
  timeoutMs?: number;
}

/**
 * Repassa a requisição para o destino, com o Bearer do advogado logado.
 * Suporta JSON, multipart (upload) e download binário (PDF/DOCX).
 */
export async function repassar(
  req: NextRequest,
  destino: string,
  opts: OpcoesProxy = {},
): Promise<NextResponse> {
  const { base = `${env.SOSC}${env.API}`, publico = false, timeoutMs = 60_000 } = opts;

  let bearer = '';
  if (!publico) {
    const s = await sessaoAtual();
    if (!s) {
      return NextResponse.json(
        { error: 'NaoAutenticado', message: 'Sessão expirada. Entre novamente.' },
        { status: 401 },
      );
    }
    bearer = s.token;
  }

  const url = new URL(base + destino);
  // Preserva a query string original.
  req.nextUrl.searchParams.forEach((v, k) => url.searchParams.set(k, v));

  const headers = new Headers();
  req.headers.forEach((v, k) => {
    if (!BLOQUEADOS.has(k.toLowerCase())) headers.set(k, v);
  });
  if (bearer) headers.set('authorization', `Bearer ${bearer}`);

  // Body: streaming para não carregar upload de 2 GB na memória.
  const temBody = !['GET', 'HEAD'].includes(req.method);
  const body = temBody ? req.body : undefined;

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);

  try {
    const r = await fetch(url, {
      method: req.method,
      headers,
      body,
      // @ts-expect-error — necessário no Node 18+ para body em stream
      duplex: temBody ? 'half' : undefined,
      signal: ctrl.signal,
      cache: 'no-store',
    });

    const saida = new Headers();
    r.headers.forEach((v, k) => {
      const kk = k.toLowerCase();
      // Não repassa headers de transporte nem Set-Cookie do backend.
      if (['content-encoding', 'transfer-encoding', 'connection', 'set-cookie'].includes(kk)) return;
      saida.set(k, v);
    });

    return new NextResponse(r.body, { status: r.status, headers: saida });
  } catch (e: unknown) {
    const abortado = e instanceof Error && e.name === 'AbortError';
    return NextResponse.json(
      {
        error: abortado ? 'Timeout' : 'BackendIndisponivel',
        message: abortado
          ? 'O servidor demorou demais para responder. Tente de novo.'
          : 'Não foi possível falar com o servidor. Tente de novo em instantes.',
      },
      { status: 502 },
    );
  } finally {
    clearTimeout(t);
  }
}

/** Chamada server-side direta (para Server Components). */
export async function buscarSosc<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<{ ok: boolean; status: number; data: T | null }> {
  const s = await sessaoAtual();
  if (!s) return { ok: false, status: 401, data: null };

  const headers = new Headers(init.headers);
  headers.set('authorization', `Bearer ${s.token}`);
  headers.set('accept', 'application/json');
  if (init.body) headers.set('content-type', 'application/json');

  try {
    const r = await fetch(`${env.SOSC}${env.API}${path}`, {
      ...init,
      headers,
      cache: 'no-store',
      signal: AbortSignal.timeout(20_000),
    });
    const txt = await r.text();
    let data: T | null = null;
    try {
      data = txt ? (JSON.parse(txt) as T) : null;
    } catch {
      data = null;
    }
    return { ok: r.ok, status: r.status, data };
  } catch {
    return { ok: false, status: 502, data: null };
  }
}

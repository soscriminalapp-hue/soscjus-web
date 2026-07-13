/**
 * POST /api/auth/login
 *
 * ⚠️ O NAVEGADOR NUNCA VÊ O TOKEN DO BACKEND.
 *
 * Ele fala com a estação; a estação fala com o backend NO SERVIDOR e guarda
 * o accessToken num cookie httpOnly cifrado (AES-256-GCM). Se um XSS rodar
 * na página, ele não consegue ler o token — porque JS não enxerga httpOnly.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { selarSessao, gravarCookie } from '@/lib/session';
import { env, soscUrl } from '@/lib/env';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: 'Corpo inválido.' }, { status: 400 });
  }

  if (!body.email || !body.password) {
    return NextResponse.json({ message: 'Informe e-mail e senha.' }, { status: 400 });
  }

  let r: Response;
  try {
    r = await fetch(soscUrl('/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: body.email, password: body.password }),
      cache: 'no-store',
    });
  } catch {
    return NextResponse.json(
      { message: 'O servidor SOSC não respondeu. Tente em instantes.' },
      { status: 502 },
    );
  }

  if (!r.ok) {
    return NextResponse.json(
      { message: r.status === 401 ? 'E-mail ou senha não conferem.' : 'Não foi possível entrar.' },
      { status: r.status },
    );
  }

  const d = (await r.json()) as {
    accessToken?: string;
    user?: {
      id?: string;
      fullName?: string;
      email?: string;
      lawyer?: { oabNumber?: string; oabUf?: string; plan?: string } | null;
    };
  };

  if (!d.accessToken) {
    return NextResponse.json({ message: 'Resposta inesperada do servidor.' }, { status: 502 });
  }

  /**
   * ⚠️ A ESTAÇÃO É EXCLUSIVA DO ADVOGADO.
   *
   * Se um cliente logar aqui, ele vê um menu inteiro que não é dele
   * (Plantão, honorários, FinaisJus). Melhor barrar na porta, com uma
   * mensagem clara, do que deixar entrar e confundir.
   */
  if (!d.user?.lawyer) {
    return NextResponse.json(
      { message: 'Esta conta é de cliente. A Estação é exclusiva para advogados.' },
      { status: 403 },
    );
  }

  const oab = d.user.lawyer.oabNumber
    ? `${d.user.lawyer.oabUf ?? ''} ${d.user.lawyer.oabNumber}`.trim()
    : null;

  const selo = await selarSessao({
    token: d.accessToken,
    sub: d.user.id ?? '',
    nome: d.user.fullName ?? 'Advogado',
    email: d.user.email ?? body.email,
    role: 'LAWYER',
    oab: oab ?? undefined,
    plano: d.user.lawyer.plan ?? 'DEFESA',
  });
  gravarCookie(selo);

  return NextResponse.json({ ok: true });
}

/**
 * POST /api/auth/login
 *
 * Repassa para o backend SOSC (mesmo endpoint do app), valida que é advogado,
 * e sela o token num cookie httpOnly. O navegador nunca vê o JWT.
 *
 * Aceita e-mail OU o número SOSC ADV — o backend resolve os dois.
 */

import { NextRequest, NextResponse } from 'next/server';
import { soscUrl } from '@/lib/env';
import { selarSessao, gravarCookie, type Sessao } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RespostaLogin {
  accessToken?: string;
  refreshToken?: string;
  user?: {
    id?: string;
    fullName?: string;
    email?: string;
    role?: string;
    lawyer?: { oabNumber?: string; oabUf?: string; plan?: string } | null;
    effectivePlan?: string;
  };
  message?: string;
}

export async function POST(req: NextRequest) {
  let email = '';
  let password = '';
  try {
    const b = (await req.json()) as { email?: string; password?: string };
    email = (b.email ?? '').trim();
    password = b.password ?? '';
  } catch {
    return NextResponse.json({ message: 'Requisição inválida.' }, { status: 400 });
  }

  if (!email || !password) {
    return NextResponse.json(
      { message: 'Informe o e-mail (ou seu número SOSC ADV) e a senha.' },
      { status: 400 },
    );
  }

  let r: Response;
  try {
    r = await fetch(soscUrl('/auth/login'), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password }),
      signal: AbortSignal.timeout(20_000),
      cache: 'no-store',
    });
  } catch {
    return NextResponse.json(
      { message: 'Não foi possível falar com o SOSC JUS. Tente de novo em instantes.' },
      { status: 502 },
    );
  }

  const data = (await r.json().catch(() => ({}))) as RespostaLogin;

  if (!r.ok || !data.accessToken) {
    const msg =
      r.status === 403
        ? (data.message ?? 'Conta suspensa. Fale com o suporte.')
        : (data.message ?? 'E-mail ou senha incorretos.');
    return NextResponse.json({ message: msg }, { status: r.status === 403 ? 403 : 401 });
  }

  const role = String(data.user?.role ?? '').toUpperCase();
  if (role !== 'LAWYER' && role !== 'ADMIN') {
    return NextResponse.json(
      { message: 'Esta estação é exclusiva para advogados. Use o aplicativo SOSC JUS.' },
      { status: 403 },
    );
  }

  const lw = data.user?.lawyer;
  const sessao: Sessao = {
    token: data.accessToken,
    refresh: data.refreshToken,
    sub: String(data.user?.id ?? ''),
    nome: data.user?.fullName ?? 'Advogado',
    email: data.user?.email ?? email,
    role: role as 'LAWYER' | 'ADMIN',
    oab: lw?.oabNumber ? `OAB/${lw.oabUf ?? ''} ${lw.oabNumber}`.trim() : undefined,
    plano: (lw?.plan ?? data.user?.effectivePlan ?? 'DEFESA').toUpperCase(),
  };

  gravarCookie(await selarSessao(sessao));

  return NextResponse.json({
    nome: sessao.nome,
    email: sessao.email,
    oab: sessao.oab ?? null,
    plano: sessao.plano,
  });
}

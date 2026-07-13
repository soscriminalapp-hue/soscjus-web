/**
 * POST /api/compra/confirmar
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *  🔴 ESTA ROTA CONSERTA O BUG DO 4.0.1
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  ⚠️ SEM COOKIE. QUEM CHAMA É O CELULAR.
 *
 *  Antes, a confirmação exigia `sessaoAtual()` — o cookie do navegador do PC.
 *  Mas quem confirma é o CELULAR. Ele não tem esse cookie.
 *
 *  O FLUXO NUNCA FECHAVA. A tela do computador girava pra sempre.
 *
 *  ✅ Agora: o celular manda o TOKEN que veio no QR.
 *
 *  ⚠️ ISTO NÃO DÁ CRÉDITO A NINGUÉM.
 *
 *     O crédito quem dá é o BACKEND SOSC, depois de validar o receipt da
 *     Apple/Google (POST /iap/verify).
 *
 *     Esta rota só DESTRAVA A TELA do computador. Se alguém adivinhar o
 *     token (256 bits — boa sorte), o máximo que consegue é fazer a tela
 *     de outro advogado parar de girar. Nenhum crédito é criado.
 *
 *  Corpo:
 *    { pedido: "uuid", token: "base64url" }
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { confirmarComToken } from '@/lib/compra';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  let body: { pedido?: string; token?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: 'Corpo inválido.' }, { status: 400 });
  }

  if (!body.pedido || !body.token) {
    return NextResponse.json(
      { message: 'Faltou o pedido ou o token.' },
      { status: 400 },
    );
  }

  const p = confirmarComToken(body.pedido, body.token);
  if (!p) {
    // não diz POR QUE falhou — não dá pistas pra quem está tentando adivinhar
    return NextResponse.json(
      { message: 'Pedido inválido, expirado ou já confirmado.' },
      { status: 404 },
    );
  }

  return NextResponse.json({
    ok: true,
    estado: p.estado,
    creditos: p.creditos,
  });
}

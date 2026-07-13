/**
 * POST /api/compra/criar
 *
 * A ESTAÇÃO cria o pedido. Só ela — precisa do cookie.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { sessaoAtual } from '@/lib/session';
import { criarPedido, urlDoQr, deeplink } from '@/lib/compra';
import { env } from '@/lib/env';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const s = await sessaoAtual();
  if (!s) {
    return NextResponse.json({ message: 'Sessão expirada.' }, { status: 401 });
  }

  let body: { productId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: 'Corpo inválido.' }, { status: 400 });
  }

  if (!body.productId) {
    return NextResponse.json({ message: 'Escolha um pacote.' }, { status: 400 });
  }

  // ⚠️ Só PACOTE DE CRÉDITO. As ferramentas NÃO são vendidas — elas GASTAM.
  const p = criarPedido(s.sub, body.productId);
  if (!p) {
    return NextResponse.json(
      { message: 'Este produto não é um pacote de créditos.' },
      { status: 400 },
    );
  }

  const base = env.SITE || new URL(req.url).origin;

  return NextResponse.json({
    id: p.id,
    creditos: p.creditos,
    precoBRL: p.precoBRL,
    expiraEm: p.expiraEm,
    /** ⚠️ O QR aponta pra PÁGINA (https) — com fallback pra loja. */
    qrUrl: urlDoQr(base, p),
    /** Pra quem está NO celular: abre o app direto. */
    deeplink: deeplink(p),
  });
}

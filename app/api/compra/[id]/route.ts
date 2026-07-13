/**
 * GET    /api/compra/:id   → a ESTAÇÃO pergunta "já pagou?"   (cookie)
 * DELETE /api/compra/:id   → a ESTAÇÃO cancela                (cookie)
 *
 * ⚠️ A CONFIRMAÇÃO NÃO MORA AQUI.
 *
 *    Quem confirma é o CELULAR — e ele NÃO TEM O COOKIE DO PC.
 *
 *    Era esse o bug do 4.0.1: o POST exigia sessaoAtual(), o celular não
 *    tinha, e o fluxo NUNCA FECHAVA. A tela girava pra sempre.
 *
 *    ✅ A confirmação foi pra /api/compra/confirmar — que usa TOKEN.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { sessaoAtual } from '@/lib/session';
import { lerPedido, cancelarPedido } from '@/lib/compra';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest, ctx: { params: { id: string } }) {
  const s = await sessaoAtual();
  if (!s) {
    return NextResponse.json({ message: 'Sessão expirada.' }, { status: 401 });
  }

  const p = lerPedido(ctx.params.id, s.sub);
  if (!p) {
    return NextResponse.json({ message: 'Pedido não encontrado.' }, { status: 404 });
  }

  return NextResponse.json({
    estado: p.estado,
    creditos: p.creditos,
    expiraEm: p.expiraEm,
  });
}

export async function DELETE(_req: NextRequest, ctx: { params: { id: string } }) {
  const s = await sessaoAtual();
  if (!s) {
    return NextResponse.json({ message: 'Sessão expirada.' }, { status: 401 });
  }
  cancelarPedido(ctx.params.id, s.sub);
  return NextResponse.json({ ok: true });
}

/**
 * GET  /api/compra/:id  → a estação faz polling aqui (a cada 2s)
 * POST /api/compra/:id  → o APP confirma aqui, depois que a loja aprovou
 *
 * Quando o estado vira CONFIRMADA, a tela do computador destrava sozinha
 * e executa a ação que estava pendente. O advogado não precisa voltar
 * e clicar de novo.
 */

import { NextRequest, NextResponse } from 'next/server';
import { sessaoAtual } from '@/lib/session';
import { lerPedido, confirmarPedido, cancelarPedido } from '@/lib/compra';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, ctx: { params: { id: string } }) {
  const s = await sessaoAtual();
  if (!s) return NextResponse.json({ message: 'Sessão expirada.' }, { status: 401 });

  const p = lerPedido(ctx.params.id);
  if (!p || p.advogadoId !== s.sub) {
    return NextResponse.json({ message: 'Pedido não encontrado.' }, { status: 404 });
  }

  return NextResponse.json({
    estado: p.estado,
    titulo: p.titulo,
    feature: p.feature,
    expiraEm: p.expiraEm,
  });
}

/**
 * O app chama isto depois que a Apple/Google aprovou a compra.
 * O app já validou o receipt no backend SOSC (rotas /iap/verify e
 * /iap/verify-google) — aqui só marcamos o pedido como pago para
 * destravar a tela do computador.
 */
export async function POST(_req: NextRequest, ctx: { params: { id: string } }) {
  const s = await sessaoAtual();
  if (!s) return NextResponse.json({ message: 'Sessão expirada.' }, { status: 401 });

  const p = confirmarPedido(ctx.params.id, s.sub);
  if (!p) return NextResponse.json({ message: 'Pedido não encontrado.' }, { status: 404 });

  return NextResponse.json({ estado: p.estado });
}

export async function DELETE(_req: NextRequest, ctx: { params: { id: string } }) {
  const s = await sessaoAtual();
  if (!s) return NextResponse.json({ message: 'Sessão expirada.' }, { status: 401 });
  cancelarPedido(ctx.params.id, s.sub);
  return NextResponse.json({ ok: true });
}

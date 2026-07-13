/**
 * POST /api/compra/criar
 *
 * Cria o pedido e devolve o QR Code (data URL) que o advogado aponta o celular.
 * O deep link leva o app direto para a tela de pagamento da loja.
 */

import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { sessaoAtual } from '@/lib/session';
import { criarPedido } from '@/lib/compra';
import { env } from '@/lib/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Só o que a estação pode pedir. Nada de feature arbitrária. */
const FEATURES: Record<string, string> = {
  CPF_CADASTRAL: 'Consulta de CPF — ficha cadastral',
  CPF_ANTECEDENTES: 'Consulta de CPF — antecedentes',
  MANDADO: 'Consulta de mandado de prisão',
  CONSULTA_PROCESSUAL: 'Consulta processual',
  VEICULO: 'Consulta veicular',
  PRINT: 'Análise de print',
  PECA: 'Peça completa — FinaisJus Pro',
  CRIATIVO: 'Criativo — JurisCreator',
};

export async function POST(req: NextRequest) {
  const s = await sessaoAtual();
  if (!s) {
    return NextResponse.json({ message: 'Sessão expirada.' }, { status: 401 });
  }

  let feature = '';
  try {
    const b = (await req.json()) as { feature?: string };
    feature = String(b.feature ?? '').toUpperCase();
  } catch {
    return NextResponse.json({ message: 'Requisição inválida.' }, { status: 400 });
  }

  const titulo = FEATURES[feature];
  if (!titulo) {
    return NextResponse.json({ message: 'Item não disponível para compra.' }, { status: 400 });
  }

  const p = criarPedido(s.sub, feature, titulo);

  // Deep link: abre o app já na tela de pagamento.
  // Fallback (app não instalado): o QR leva para a loja.
  const deepLink = `${env.APP_SCHEME}://compra/${p.id}`;

  const qr = await QRCode.toDataURL(deepLink, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 420,
    color: { dark: '#0a0b0d', light: '#f2ede4' },
  });

  return NextResponse.json({
    id: p.id,
    codigo: p.codigo,
    titulo: p.titulo,
    qr,
    deepLink,
    expiraEm: p.expiraEm,
    lojas: { apple: env.APP_STORE, google: env.PLAY_STORE },
  });
}

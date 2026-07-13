/**
 * compra.ts — pedido de compra avulsa via celular.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  A ESTAÇÃO NÃO VENDE. A ESTAÇÃO PEDE PRO CELULAR VENDER.
 * ═══════════════════════════════════════════════════════════════════
 *
 * Por quê: se a web vendesse conteúdo que é consumido dentro do app iOS,
 * a Apple exige IAP (§3.1.1) e pode rejeitar. Aqui não há paywall na web:
 * quando a cota acaba, a estação cria um PEDIDO e mostra um QR Code. O
 * advogado aponta o celular, o app abre já na tela de pagamento (StoreKit
 * ou Google Play Billing), confirma com biometria, e a loja avisa o backend.
 * A estação, que estava fazendo polling, detecta e destrava sozinha.
 *
 * A Apple e o Google recebem a comissão de tudo. Zero motivo para rejeição.
 *
 * Nota de produção: este store é em memória (Map). Num deploy com múltiplas
 * instâncias (Vercel serverless, PM2 cluster), TROCAR POR REDIS — o backend
 * já tem Redis para o BullMQ. Ver README, seção "Escalar".
 */

import { randomUUID } from 'node:crypto';

export type EstadoCompra = 'AGUARDANDO' | 'CONFIRMADA' | 'EXPIRADA' | 'CANCELADA';

export interface Pedido {
  id: string;
  /** Código curto que aparece embaixo do QR (o advogado confere). */
  codigo: string;
  /** userId do advogado (sub do JWT). */
  advogadoId: string;
  /** O que ele está comprando. */
  feature: string;
  /** Rótulo humano: "Consulta de CPF". */
  titulo: string;
  estado: EstadoCompra;
  criadoEm: number;
  expiraEm: number;
}

/** 15 min: tempo de sobra para pegar o celular e confirmar. */
const TTL_MS = 15 * 60 * 1000;

const pedidos = new Map<string, Pedido>();

/** Limpa pedidos vencidos. Roda a cada leitura — barato o bastante. */
function varrer() {
  const agora = Date.now();
  for (const [id, p] of pedidos) {
    if (p.estado === 'AGUARDANDO' && p.expiraEm <= agora) p.estado = 'EXPIRADA';
    // Some 1h depois de morto, para não vazar memória.
    if (agora - p.criadoEm > TTL_MS + 3_600_000) pedidos.delete(id);
  }
}

function codigoCurto(): string {
  const c = randomUUID().replace(/-/g, '').toUpperCase();
  return `SOSC-${c.slice(0, 4)}-${c.slice(4, 8)}`;
}

export function criarPedido(advogadoId: string, feature: string, titulo: string): Pedido {
  varrer();
  const agora = Date.now();
  const p: Pedido = {
    id: randomUUID(),
    codigo: codigoCurto(),
    advogadoId,
    feature,
    titulo,
    estado: 'AGUARDANDO',
    criadoEm: agora,
    expiraEm: agora + TTL_MS,
  };
  pedidos.set(p.id, p);
  return p;
}

export function lerPedido(id: string): Pedido | null {
  varrer();
  return pedidos.get(id) ?? null;
}

/** Chamado pelo webhook/confirmação do app depois que a loja aprovou. */
export function confirmarPedido(id: string, advogadoId: string): Pedido | null {
  const p = pedidos.get(id);
  if (!p) return null;
  if (p.advogadoId !== advogadoId) return null; // não é o dono
  if (p.estado !== 'AGUARDANDO') return p;
  p.estado = 'CONFIRMADA';
  return p;
}

export function cancelarPedido(id: string, advogadoId: string): boolean {
  const p = pedidos.get(id);
  if (!p || p.advogadoId !== advogadoId) return false;
  if (p.estado === 'AGUARDANDO') p.estado = 'CANCELADA';
  return true;
}

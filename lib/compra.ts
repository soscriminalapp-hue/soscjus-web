/**
 * lib/compra.ts — o pedido de recarga (a ponte PC → celular)
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *  ⚠️ POR QUE ESTA PONTE EXISTE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  A Apple EXIGE que a compra passe pelo IAP dela. Não dá pra vender crédito
 *  num site e liberar no app — é motivo de rejeição (Guideline 3.1.1).
 *
 *  Então:
 *    1. O advogado clica em "Comprar créditos" na ESTAÇÃO
 *    2. A estação cria um PEDIDO e mostra um QR
 *    3. Ele aponta o CELULAR
 *    4. O app abre na tela de créditos, com o pacote já escolhido
 *    5. Ele paga pelo StoreKit
 *    6. O app avisa o pedido → A ESTAÇÃO DESTRAVA SOZINHA
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *  🔴 O BUG QUE ISTO CORRIGE (v4.0.1 estava QUEBRADO)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  A rota de confirmação exigia `sessaoAtual()` — o COOKIE DO NAVEGADOR DO PC.
 *
 *  Mas QUEM CONFIRMA É O CELULAR. Ele não tem esse cookie.
 *
 *  ⚠️ O FLUXO NUNCA FECHAVA. A tela ficava girando pra sempre.
 *
 *  ✅ A CORREÇÃO: o pedido tem um SEGREDO (token) que vai DENTRO do QR.
 *     O celular confirma com o TOKEN, não com o cookie.
 *
 *     · O token é aleatório (32 bytes) — não dá pra adivinhar
 *     · Vale 10 minutos
 *     · Uso único: confirmou, morreu
 *     · E o backend SOSC valida o receipt de verdade. Aqui só destravamos
 *       a tela — o crédito quem dá é o backend.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *  ⚠️ EM MEMÓRIA — e por que está OK
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  O Map vive no processo do Next. Com UMA instância PM2, funciona.
 *
 *  Se escalar pra cluster, troque por Redis:
 *    criarPedido    → SETEX  pedido:{id}  600  {json}
 *    lerPedido      → GET    pedido:{id}
 *    confirmar      → GET + SET
 *    cancelar       → DEL
 *
 *  São 4 funções. Nada mais muda.
 */

import { randomBytes, randomUUID } from 'node:crypto';

/** Vale 10 minutos. Depois disso, ele refaz. */
const VIDA_MS = 10 * 60 * 1000;

export type Estado = 'AGUARDANDO' | 'PAGO' | 'EXPIRADO' | 'CANCELADO';

export interface Pedido {
  id: string;
  /**
   * ⚠️ O SEGREDO. Vai dentro do QR.
   *
   * É com ISTO que o celular confirma — não com o cookie do PC.
   * Sem ele, o fluxo não fecha (era o bug do 4.0.1).
   */
  token: string;
  /** Quem pediu. */
  advogadoId: string;
  /**
   * O QUE ele está comprando.
   *
   * ⚠️ SÓ EXISTEM PACOTES DE CRÉDITO. As ferramentas NÃO são vendidas —
   *    elas GASTAM crédito. Se veio outra coisa aqui, é bug.
   */
  productId: string;
  creditos: number;
  precoBRL: number;
  estado: Estado;
  criadoEm: number;
  expiraEm: number;
}

const PEDIDOS = new Map<string, Pedido>();

/* ─── faxina ─── */
function limpar() {
  const agora = Date.now();
  for (const [id, p] of PEDIDOS) {
    if (p.expiraEm < agora || p.estado === 'PAGO' || p.estado === 'CANCELADO') {
      // dá 60s de folga: a tela precisa LER o "PAGO" antes de sumir
      if (p.expiraEm < agora - 60_000 || p.estado === 'CANCELADO') {
        PEDIDOS.delete(id);
      }
    }
  }
}

/**
 * ⚠️ OS PACOTES — espelho do backend (entitlements.ts).
 *
 * Se divergirem, a estação mostra um preço e a loja cobra outro.
 */
export const PACOTES = [
  { productId: 'br.com.soscriminal.creditos.100', creditos: 100, precoBRL: 59.9 },
  { productId: 'br.com.soscriminal.creditos.250', creditos: 250, precoBRL: 129.9 },
  { productId: 'br.com.soscriminal.creditos.500', creditos: 500, precoBRL: 249.9 },
  { productId: 'br.com.soscriminal.creditos.1000', creditos: 800, precoBRL: 399.9 },
  { productId: 'br.com.soscriminal.creditos.1250', creditos: 1200, precoBRL: 599.9 },
] as const;

export function acharPacote(productId: string) {
  return PACOTES.find((p) => p.productId === productId) ?? null;
}

/** Cria o pedido. O token vai pro QR. */
export function criarPedido(advogadoId: string, productId: string): Pedido | null {
  limpar();

  const pac = acharPacote(productId);
  if (!pac) return null; // ⚠️ não é pacote de crédito — recusa

  const agora = Date.now();
  const p: Pedido = {
    id: randomUUID(),
    // 32 bytes = 256 bits. Não dá pra adivinhar.
    token: randomBytes(32).toString('base64url'),
    advogadoId,
    productId: pac.productId,
    creditos: pac.creditos,
    precoBRL: pac.precoBRL,
    estado: 'AGUARDANDO',
    criadoEm: agora,
    expiraEm: agora + VIDA_MS,
  };
  PEDIDOS.set(p.id, p);
  return p;
}

/** A ESTAÇÃO consulta (com o cookie dela). */
export function lerPedido(id: string, advogadoId: string): Pedido | null {
  limpar();
  const p = PEDIDOS.get(id);
  if (!p || p.advogadoId !== advogadoId) return null;
  if (p.estado === 'AGUARDANDO' && p.expiraEm < Date.now()) {
    p.estado = 'EXPIRADO';
  }
  return p;
}

/**
 * ⚠️ O CELULAR confirma — COM O TOKEN, não com o cookie.
 *
 * É esta função que consertou o bug do 4.0.1.
 *
 * @returns o pedido, ou null se o token não bate / expirou / já foi usado
 */
export function confirmarComToken(id: string, token: string): Pedido | null {
  limpar();
  const p = PEDIDOS.get(id);
  if (!p) return null;

  // ⚠️ comparação em tempo constante (evita timing attack)
  if (p.token.length !== token.length) return null;
  let dif = 0;
  for (let i = 0; i < p.token.length; i++) {
    dif |= p.token.charCodeAt(i) ^ token.charCodeAt(i);
  }
  if (dif !== 0) return null;

  if (p.estado !== 'AGUARDANDO') return null; // uso único
  if (p.expiraEm < Date.now()) {
    p.estado = 'EXPIRADO';
    return null;
  }

  p.estado = 'PAGO';
  return p;
}

export function cancelarPedido(id: string, advogadoId: string) {
  const p = PEDIDOS.get(id);
  if (p && p.advogadoId === advogadoId) {
    p.estado = 'CANCELADO';
  }
}

/**
 * O QUE VAI NO QR.
 *
 * ⚠️ TEM QUE TER FALLBACK PRA LOJA.
 *
 * No 4.0.1 o QR só tinha `soscjus://` — se o app não estivesse instalado,
 * o celular abria o navegador e dava ERRO. Ele ficava sem entender nada.
 *
 * ✅ Agora o QR aponta pra uma PÁGINA (https). Ela:
 *    · tenta abrir o app (soscjus://)
 *    · se não abrir em 1,5s → manda pra App Store / Play
 */
export function urlDoQr(base: string, p: Pedido): string {
  const u = new URL('/abrir', base);
  u.searchParams.set('p', p.id);
  u.searchParams.set('t', p.token);
  u.searchParams.set('sku', p.productId);
  return u.toString();
}

/** O deeplink que a página /abrir tenta. */
export function deeplink(p: Pedido): string {
  const u = new URL('soscjus://creditos');
  u.searchParams.set('pedido', p.id);
  u.searchParams.set('token', p.token);
  u.searchParams.set('sku', p.productId);
  return u.toString();
}

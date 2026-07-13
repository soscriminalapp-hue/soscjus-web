/**
 * Diamante.tsx — o símbolo do crédito. 💎
 *
 * ═══════════════════════════════════════════════════════════════════════
 *  POR QUE AZUL, E NÃO OURO
 * ═══════════════════════════════════════════════════════════════════════
 *
 *  O ouro já está em tudo: o brasão, os processos, os contratos, o núcleo
 *  jurídico. Se o crédito também fosse ouro, ele SUMIRIA no meio.
 *
 *  O azul é tecnologia na nossa paleta — e o crédito é exatamente isso:
 *  a moeda do ecossistema digital.
 *
 *  E a leitura simbólica fecha: ouro é o brasão, a tradição, o que você É.
 *  Diamante é o que você ACUMULA e GASTA.
 *
 *  ⚠️ NUNCA VERMELHO enquanto houver saldo. Vermelho, num número que
 *     representa dinheiro, o cérebro lê como "negativo" — mesmo com 500
 *     créditos na conta. Vermelho só quando zerou de verdade, porque aí
 *     é problema mesmo, e aí é honesto.
 * ═══════════════════════════════════════════════════════════════════════
 */

import type { SVGProps } from 'react';

export default function Diamante({ s = 16, ...rest }: { s?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={s}
      height={s}
      aria-hidden
      {...rest}
    >
      <defs>
        <linearGradient id="dmt-face" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7fe7ff" />
          <stop offset="45%" stopColor="#00c2e8" />
          <stop offset="100%" stopColor="#2b6fd6" />
        </linearGradient>
        <linearGradient id="dmt-topo" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#c9f4ff" />
          <stop offset="100%" stopColor="#5ad6f7" />
        </linearGradient>
      </defs>
      {/* coroa */}
      <path d="M5 9h14l-3.2-4.2H8.2z" fill="url(#dmt-topo)" />
      {/* pavilhão */}
      <path d="M5 9h14l-7 11z" fill="url(#dmt-face)" />
      {/* facetas — o que faz parecer lapidado, não um losango chapado */}
      <path d="M5 9h4.6L12 20z" fill="#8ce9ff" opacity=".28" />
      <path d="M14.4 9H19l-7 11z" fill="#1b4fa8" opacity=".26" />
      <path d="M8.2 4.8 9.6 9h4.8l1.4-4.2z" fill="#e8fbff" opacity=".22" />
    </svg>
  );
}

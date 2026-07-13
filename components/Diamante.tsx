/**
 * Diamante.tsx — o símbolo do token 🪙 (imagem oficial, não mais SVG).
 *
 * ═══════════════════════════════════════════════════════════════════════
 *  A IMAGEM
 * ═══════════════════════════════════════════════════════════════════════
 *
 *  public/token-diamond.png — a peça central que amarra as três cores da
 *  marca num símbolo só: face azul-Miami, face verde-lima, núcleo dourado.
 *  Fundo transparente, 256×256.
 *
 *  ⚠️ NUNCA VERMELHO enquanto houver saldo. Vermelho, num número que
 *     representa dinheiro, o cérebro lê como "negativo" — mesmo com 35.000
 *     tokens na conta. Vermelho só quando zerou de verdade, porque aí é
 *     problema mesmo, e aí é honesto. (A cor do NÚMERO ao lado — não desta
 *     imagem — é quem carrega esse sinal; ver Preco.tsx / Saldo.tsx.)
 *
 * ═══════════════════════════════════════════════════════════════════════
 *  ⚠️ MESMA API DE SEMPRE: <Diamante s={n} />
 * ═══════════════════════════════════════════════════════════════════════
 *
 *  12 arquivos usam este componente com a prop `s` (tamanho em px).
 *  Não mude a assinatura.
 */

import Image from 'next/image';

export default function Diamante({
  s = 16,
  className,
}: {
  s?: number;
  className?: string;
}) {
  return (
    <Image
      src="/token-diamond.png"
      alt=""
      width={s}
      height={s}
      className={className}
      style={{ display: 'inline-block', flexShrink: 0 }}
      unoptimized
    />
  );
}

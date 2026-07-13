/**
 * O símbolo do token — a imagem oficial.
 * Face azul-Miami + face verde-lima + núcleo dourado. Fundo transparente.
 */
import Image from 'next/image';

export default function Diamante({ s = 16, className }: { s?: number; className?: string }) {
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

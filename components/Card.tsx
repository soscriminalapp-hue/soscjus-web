'use client';

/**
 * Card.tsx — o card que EXPLICA a ferramenta.
 *
 * Duas regras, e elas mandam:
 *
 *  1. NÃO MOSTRA DADO DE CLIENTE. O advogado trabalha com a tela aberta,
 *     e passa estagiário, cliente e visita atrás dele. Aqui só entram
 *     contadores. Nome, processo e valor só depois que ele clica.
 *
 *  2. EXPLICA EM UMA FRASE, sem jargão. "Cota" ninguém sabe o que é.
 *     "Sobraram 3 de 10" todo mundo sabe.
 *
 * A cor diz o que a coisa é: ouro=jurídico, verde=dinheiro, vermelho=risco,
 * azul=tecnologia, roxo=inteligência, cinza=neutro.
 */

import Link from 'next/link';
import Icon, { type Nome } from './Icon';
import Preco, { Gratis } from './Preco';
import type { Feature } from '@/lib/creditos';
import s from './card.module.css';

export type Familia = 'jur' | 'dinheiro' | 'risco' | 'tech' | 'mente' | 'neutro';
export type Tom = 'ok' | 'warn' | 'stop' | 'free' | 'live';

export interface CardProps {
  titulo: string;
  /** A frase. Uma só. Sem jargão. */
  texto: React.ReactNode;
  icone: Nome;
  familia: Familia;
  href?: string;
  onClick?: () => void;
  /** Ex.: "Sobraram 3 de 10" */
  estado?: { texto: string; tom: Tom };
  /** Rótulo do botão. Padrão: "Abrir" */
  acao?: string;
  /** Número no canto. NUNCA conteúdo. */
  selo?: { n: number | string; tom?: 'risco' | 'tech' | 'calmo' | 'money' };
  /** Ocupa 2 colunas. */
  grande?: boolean;
  /**
   * Quanto custa, em tokens.
   *
   * ⚠️ NÃO OMITA em ferramenta paga. A variação é de 26×: o Relatório custa
   * 6 💎, o FinaisJus custa 160. Se ele clica sem saber e queima 40 de uma
   * vez, não pensa "que legal" — pensa "esse app me roubou".
   */
  custa?: Feature;
  /** 🟢 Selo verde-limão. SEM quantidade. */
  gratis?: boolean;
  /** Saldo atual — apaga o preço quando não dá pra pagar. */
  saldo?: number;
}

export default function Card({
  titulo,
  texto,
  icone,
  familia,
  href,
  onClick,
  estado,
  acao = 'Abrir',
  selo,
  grande,
  custa,
  gratis,
  saldo,
}: CardProps) {
  const conteudo = (
    <>
      {selo ? (
        <span className={`${s.selo} ${selo.tom ? s[selo.tom] : ''}`}>{selo.n}</span>
      ) : null}

      <div className={s.topo}>
        <span className={s.ic}>
          <Icon n={icone} s={grande ? 30 : 26} />
        </span>
        <div className={s.tit}>
          <strong>{titulo}</strong>
        </div>
      </div>

      <p className={s.txt}>{texto}</p>

      <div className={s.pe}>
        {gratis ? <Gratis /> : custa ? <Preco chave={custa} saldo={saldo} /> : null}
        {estado ? (
          <span className={`est ${estado.tom}`}>
            {estado.tom === 'live' ? <i /> : null}
            {estado.tom === 'ok' ? <Icon n="ok" s={14} strokeWidth={2.4} /> : null}
            {estado.tom === 'warn' ? <Icon n="alerta" s={14} strokeWidth={2.4} /> : null}
            {estado.tom === 'stop' ? <Icon n="x" s={14} strokeWidth={2.4} /> : null}
            {estado.texto}
          </span>
        ) : null}
        <span className={s.btn}>
          {acao}
          <Icon n="chev" s={17} strokeWidth={2.4} />
        </span>
      </div>
    </>
  );

  const cls = `${s.card} ${s[familia]} ${grande ? s.grande : ''}`;

  if (href) {
    return (
      <Link href={href} className={cls}>
        {conteudo}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} onClick={onClick}>
      {conteudo}
    </button>
  );
}

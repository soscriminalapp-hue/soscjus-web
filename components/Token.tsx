import Diamante from './Diamante';
import { fmt } from '@/lib/creditos';
import s from './token.module.css';

/**
 * 🪙 O PREÇO — sempre com a palavra "tokens".
 *
 * ⚠️ AS 3 REGRAS:
 *
 *  1. SEMPRE a palavra "tokens". Sem ela, o cérebro completa com R$.
 *  2. A frequência é LEGENDA, nunca sufixo: ❌ "10.000/mês"
 *  3. 🎨 A COR HERDA O FUNDO:
 *       fundo ESCURO → Miami Blue ✅
 *       fundo CLARO  → preto (azul sobre verde-limão é ilegível)
 */
export default function Token({
  n,
  /** Cobrado todo mês → legenda embaixo. */
  mensal,
  /** Saldo — apaga quando não dá. */
  saldo,
  /** 🎨 Dentro de botão claro (verde-limão, dourado)? O número vira preto. */
  claro,
  /** Miudinho, dentro de card. */
  mini,
}: {
  n: number;
  mensal?: boolean;
  saldo?: number;
  claro?: boolean;
  mini?: boolean;
}) {
  const naoDa = typeof saldo === 'number' && saldo < n;

  return (
    <span className={`${s.wrap} ${naoDa ? s.off : ''} ${claro ? s.claro : ''} ${mini ? s.mini : ''}`}>
      <span className={s.linha}>
        <Diamante s={mini ? 12 : 15} />
        <b className="num">{fmt(n)}</b>
        <em>tokens</em>
      </span>
      {mensal ? <small>Cobrado todo mês</small> : null}
    </span>
  );
}

/** 🟢 GRÁTIS — sem quantidade. */
export function Gratis({ texto = 'Grátis', mini }: { texto?: string; mini?: boolean }) {
  return <span className={`${s.gratis} ${mini ? s.gratisMini : ''}`}>{texto}</span>;
}

/**
 * ⚠️ A CONTA — mostra o que SOBRA, não o que sai.
 *
 * Ele não pensa "vou gastar 10.000". Pensa "ainda vou ter 25.000".
 * É o mesmo número. E MUDA A DECISÃO.
 */
export function Conta({ saldo, usa, mensal }: { saldo: number; usa: number; mensal?: boolean }) {
  const resta = saldo - usa;
  const da = resta >= 0;
  return (
    <div className={s.conta}>
      <div className={s.cl}>
        <span>Você tem</span>
        <b className="num">{fmt(saldo)} tokens</b>
      </div>
      <div className={s.cl}>
        <span>{mensal ? 'Usa todo mês' : 'Isto usa'}</span>
        <b className="num">−{fmt(usa)}</b>
      </div>
      <div className={s.div} />
      <div className={s.cl}>
        <span className={s.forte}>Fica com</span>
        <b className={`num ${da ? s.sobra : s.falta}`}>{da ? fmt(resta) : 0} tokens</b>
      </div>
    </div>
  );
}

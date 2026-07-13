'use client';

import Link from 'next/link';
import Diamante from './Diamante';
import { fmt } from '@/lib/creditos';
import s from './saldo.module.css';

/**
 * 🪙 O SALDO — no topo de toda tela.
 *
 * ⚠️ NUNCA VERMELHO enquanto houver saldo. Vermelho, num número que
 *    representa valor, o cérebro lê como "negativo" — mesmo com 60.000
 *    tokens na conta. Vermelho SÓ quando zerou de verdade.
 */
export default function Saldo({
  total,
  ilimitado,
  fundador,
}: {
  total: number;
  ilimitado?: boolean;
  fundador?: boolean;
}) {
  const zerado = !ilimitado && total <= 0;
  const baixo = !ilimitado && total > 0 && total < 10_000;

  return (
    <Link
      href="/tokens"
      className={`${s.saldo} ${zerado ? s.zerado : baixo ? s.baixo : ''} ${ilimitado ? s.inf : ''}`}
      title="Meus tokens"
    >
      <Diamante s={17} />
      {ilimitado ? (
        <b className={s.simbolo}>∞</b>
      ) : (
        <b className="num">{fmt(total)}</b>
      )}
      <em>tokens</em>
      {fundador ? <span className={s.selo}>FUNDADOR</span> : null}
    </Link>
  );
}

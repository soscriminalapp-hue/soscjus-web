'use client';

/**
 * Saldo.tsx — o saldo no topo. Discreto, sempre presente.
 *
 * Não pisca. Não grita. Só muda de cor quando zera — aí sim é problema.
 *
 * ⚠️ NUNCA VERMELHO enquanto houver saldo. Vermelho, num número que
 *    representa dinheiro, o cérebro lê como "negativo" — mesmo com 500
 *    créditos na conta.
 */

import Link from 'next/link';
import Diamante from './Diamante';
import { tomDoSaldo } from '@/lib/creditos';
import s from './saldo.module.css';

export default function Saldo({
  total,
  ilimitado,
  fundador,
}: {
  total: number;
  ilimitado?: boolean;
  fundador?: boolean;
}) {
  const tom = tomDoSaldo(total, ilimitado);

  return (
    <Link href="/plano" className={`${s.saldo} ${s[tom]}`} title="Meus créditos">
      <Diamante s={17} />
      {ilimitado ? (
        <b className={s.inf}>∞</b>
      ) : (
        <b>{total.toLocaleString('pt-BR')}</b>
      )}
      <span>créditos</span>
      {fundador ? <em className={s.selo}>FUNDADOR</em> : null}
    </Link>
  );
}

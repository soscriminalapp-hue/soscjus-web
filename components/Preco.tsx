import Diamante from './Diamante';
import { PRECOS, type Feature } from '@/lib/creditos';
import s from './preco.module.css';

/**
 * O preço no card. Pequeno, no canto, SEMPRE.
 *
 * ⚠️ NÃO ESCONDA ISTO.
 *
 * A variação é de 26×: o Relatório custa 6 💎, o FinaisJus custa 160. Se ele
 * clica sem saber e queima 40 de uma vez, não pensa "que legal" — pensa
 * "esse app me roubou".
 *
 * E ele é ADVOGADO. Ele cobra por hora. A vida dele é saber o preço.
 * (CDC art. 6º, III — informação clara sobre preço.)
 */
export default function Preco({
  chave,
  saldo,
}: {
  chave: Feature;
  saldo?: number;
}) {
  const f = PRECOS[chave];
  if (!f) return null;
  const naoDa = typeof saldo === 'number' && saldo < f.creditos;

  return (
    <span className={`${s.preco} ${naoDa ? s.naoDa : ''}`}>
      <Diamante s={14} />
      <b>{f.creditos}</b>
      {f.recorrente ? <small>/mês</small> : null}
    </span>
  );
}

/**
 * 🟢 O SELO DE GRÁTIS. Verde-limão, pequeno.
 *
 * ⚠️ SEM QUANTIDADE. Nada de "30 análises grátis por mês".
 *    Número em selo de cortesia vira contagem regressiva na cabeça do usuário
 *    — e ele começa a economizar em vez de usar.
 */
export function Gratis({ texto = 'Grátis' }: { texto?: string }) {
  return <span className={s.gratis}>{texto}</span>;
}

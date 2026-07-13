import Diamante from './Diamante';
import { PRECOS, fmt, type Feature } from '@/lib/creditos';
import s from './preco.module.css';

/**
 * 🪙 O PREÇO — sempre com a palavra "tokens".
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *  ⚠️ AS 3 REGRAS
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  1. SEMPRE a palavra "tokens".
 *     ❌ 10.000        → o cérebro completa com R$
 *     ✅ 10.000 tokens → a palavra ANCORA
 *
 *  2. A frequência é LEGENDA — nunca sufixo.
 *     ❌ 10.000 tokens/mês
 *     ✅ 10.000 tokens
 *        Cobrado todo mês
 *
 *  3. E o preço aparece ANTES do clique.
 *     A variação é de 26×: relatório 3.000, FinaisJus 80.000.
 *     Se ele clica sem saber e queima 20.000, não pensa "que legal" —
 *     pensa "esse app me roubou". (CDC art. 6º, III)
 */
export default function Preco({
  chave,
  saldo,
  /** Sem a legenda "cobrado todo mês" (quando não cabe). */
  semLegenda,
}: {
  chave: Feature;
  saldo?: number;
  semLegenda?: boolean;
}) {
  const f = PRECOS[chave];
  if (!f) return null;
  const naoDa = typeof saldo === 'number' && saldo < f.tokens;

  return (
    <span className={`${s.wrap} ${naoDa ? s.naoDa : ''}`}>
      <span className={s.preco}>
        <Diamante s={14} />
        <b>{fmt(f.tokens)}</b>
        {/* ⚠️ A PALAVRA. Sem ela, ele lê R$. */}
        <em>tokens</em>
      </span>

      {/* ⚠️ LEGENDA — nunca "10.000/mês" */}
      {f.recorrente && !semLegenda ? (
        <small className={s.legenda}>Cobrado todo mês</small>
      ) : null}
    </span>
  );
}

/**
 * 🟢 GRÁTIS. Verde-limão, sem quantidade.
 *
 * ⚠️ NADA de "30 análises grátis por mês". Número em selo de cortesia vira
 *    contagem regressiva na cabeça dele — e ele economiza em vez de usar.
 */
export function Gratis({ texto = 'Grátis' }: { texto?: string }) {
  return <span className={s.gratis}>{texto}</span>;
}

/**
 * 🟢 ERA PAGO, VIROU GRÁTIS — o preço RISCADO.
 *
 *     Analisar + laudo   R̶$̶ ̶9̶,̶9̶0̶   Grátis
 *
 * Mostra o VALOR e o PRESENTE ao mesmo tempo. É mais forte que só "Grátis".
 */
export function EraPago({ eraRS }: { eraRS: string }) {
  return (
    <span className={s.eraWrap}>
      <span className={s.riscado}>R$ {eraRS}</span>
      <span className={s.gratis}>Grátis</span>
    </span>
  );
}

/**
 * ⚠️ A CONTA — "o que SOBRA, não o que sai"
 *
 *     Você tem      35.000 tokens
 *     Isto usa      10.000 tokens
 *     ────────────────────────────
 *     Fica com      25.000 tokens
 *
 * Ele não pensa "vou gastar 10.000". Pensa "ainda vou ter 25.000".
 * É o mesmo número. E MUDA A DECISÃO.
 */
export function Conta({
  saldo,
  usa,
  mensal,
}: {
  saldo: number;
  usa: number;
  mensal?: boolean;
}) {
  const resta = saldo - usa;
  const da = resta >= 0;

  return (
    <div className={s.conta}>
      <div className={s.linha}>
        <span>Você tem</span>
        <b>{fmt(saldo)} tokens</b>
      </div>
      <div className={s.linha}>
        <span>{mensal ? 'Usa todo mês' : 'Isto usa'}</span>
        <b>−{fmt(usa)}</b>
      </div>
      <div className={s.div} />
      <div className={s.linha}>
        <span className={s.forte}>Fica com</span>
        <b className={da ? s.sobra : s.falta}>
          {da ? fmt(resta) : 0} tokens
        </b>
      </div>
    </div>
  );
}

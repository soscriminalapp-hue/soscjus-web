'use client';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  O FREIO — fluidez no barato, transparência no caro
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  Até 10.000 tokens → clica e usa. ZERO pergunta.
 *  Acima de 10.000   → confirma.
 *
 *  Se pedisse confirmação pra TUDO, a navegação viraria um campo minado:
 *  todo clique um modal, todo modal um cancelamento. Ele pararia de explorar
 *  as ferramentas — e ferramenta não explorada não gera receita.
 *
 *  ⚠️ E NUNCA mostre "equivale a R$ ...". É exatamente a associação que a
 *     escala de tokens existe para quebrar. Mostrar o R$ aqui desfaz o
 *     trabalho todo — ele volta a pensar em dinheiro no momento do clique.
 */

import { useEffect } from 'react';
import { PRECOS, type Feature } from '@/lib/creditos';
import { Conta } from './Token';
import Diamante from './Diamante';
import Icon from './Icon';
import s from './gastar.module.css';

export default function Gastar({
  chave,
  saldo,
  onConfirmar,
  onCancelar,
  onRecarregar,
}: {
  /** null = fechado. */
  chave: Feature | null;
  saldo: number;
  onConfirmar: () => void;
  onCancelar: () => void;
  onRecarregar: () => void;
}) {
  useEffect(() => {
    if (!chave) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancelar();
      if (e.key === 'Enter') onConfirmar();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [chave, onCancelar, onConfirmar]);

  if (!chave) return null;
  const f = PRECOS[chave];
  if (!f) return null;

  const da = saldo >= f.tokens;

  return (
    <div
      className={s.veu}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancelar();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className={s.modal}>
        <div className={s.pedra}>
          <Diamante s={44} />
        </div>

        <h2>{f.nome}</h2>
        <p className={s.entrega}>{f.entrega}</p>

        {/* ⚠️ mostra o que SOBRA, não o que sai */}
        <Conta saldo={saldo} usa={f.tokens} mensal={f.recorrente} />

        {f.recorrente ? <p className={s.mensal}>Cobrado todo mês</p> : null}

        {!da ? (
          <div className={s.sem}>
            <Icon n="alerta" s={17} />
            <p>
              Faltam <b>{(f.tokens - saldo).toLocaleString('pt-BR')} tokens</b>.
              Recarregue e a ferramenta abre na hora.
            </p>
          </div>
        ) : null}

        <div className={s.acoes}>
          <button className="btn b-ghost" onClick={onCancelar}>
            Cancelar
          </button>
          {da ? (
            <button className="btn b-tech" onClick={onConfirmar}>
              <Diamante s={17} />
              Usar {f.tokens.toLocaleString('pt-BR')} tokens
            </button>
          ) : (
            <button className="btn b-tech" onClick={onRecarregar}>
              <Icon n="mais" s={17} strokeWidth={2.2} />
              Comprar tokens
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

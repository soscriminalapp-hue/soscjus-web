'use client';

/**
 * Gastar.tsx — o freio de mão.
 *
 * ═══════════════════════════════════════════════════════════════════════
 *  FLUIDEZ NO BARATO. TRANSPARÊNCIA NO CARO.
 * ═══════════════════════════════════════════════════════════════════════
 *
 *  Até 20 créditos → clica e usa. ZERO pergunta.
 *  Acima de 20     → confirma.
 *
 *  Este modal NÃO revela o preço — ele já estava no card. Ele só impede
 *  que o advogado queime 160 créditos do FinaisJus sem querer.
 *
 *  Se pedisse confirmação pra tudo, a navegação viraria um campo minado:
 *  todo clique um modal, todo modal um cancelamento. Ele pararia de
 *  explorar as ferramentas — e ferramenta não explorada não gera receita.
 * ═══════════════════════════════════════════════════════════════════════
 */

import { useEffect } from 'react';
import { PRECOS, emReais, type Feature } from '@/lib/creditos';
import Diamante from './Diamante';
import Icon from './Icon';
import s from './gastar.module.css';

interface Props {
  /** Chave da ferramenta. null = fechado. */
  chave: Feature | null;
  saldo: number;
  onConfirmar: () => void;
  onCancelar: () => void;
  /** Sem saldo → abre a recarga em vez de confirmar. */
  onRecarregar: () => void;
}

export default function Gastar({
  chave,
  saldo,
  onConfirmar,
  onCancelar,
  onRecarregar,
}: Props) {
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

  const depois = saldo - f.creditos;
  const da = depois >= 0;

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

        <div className={s.conta}>
          <div className={s.linha}>
            <span>Você tem</span>
            <b>
              <Diamante s={15} />
              {saldo.toLocaleString('pt-BR')}
            </b>
          </div>
          <div className={s.linha}>
            <span>{f.recorrente ? 'Custa por mês' : 'Vai custar'}</span>
            <b className={s.custo}>
              −{f.creditos}
            </b>
          </div>
          <div className={s.divisor} />
          <div className={`${s.linha} ${s.resto}`}>
            <span>Fica com</span>
            <b className={da ? s.sobra : s.falta}>
              <Diamante s={15} />
              {da ? depois.toLocaleString('pt-BR') : 0}
            </b>
          </div>
        </div>

        {!da ? (
          <div className={s.semSaldo}>
            <Icon n="alerta" s={17} />
            <p>
              Faltam <b>{Math.abs(depois)} créditos</b>. Recarregue e a ferramenta
              abre na hora.
            </p>
          </div>
        ) : (
          <p className={s.equiv}>
            Equivale a R$ {emReais(f.creditos)}
            {f.recorrente ? ' por mês' : ''}
          </p>
        )}

        <div className={s.acoes}>
          <button className="btn b-ghost" onClick={onCancelar}>
            Cancelar
          </button>
          {da ? (
            <button className="btn b-tech" onClick={onConfirmar}>
              <Diamante s={17} />
              Usar {f.creditos} créditos
            </button>
          ) : (
            <button className="btn b-tech" onClick={onRecarregar}>
              <Icon n="mais" s={18} strokeWidth={2.2} />
              Comprar créditos
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  🪙 MEUS TOKENS — a carteira
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  ⚠️ A REGRA DE VALIDADE, ESCRITA NA TELA:
 *
 *    · Token do PLANO    → zera dia 1º. Não usou, perdeu.
 *    · Token COMPRADO    → NUNCA expira.
 *    · Gasta primeiro o do plano.
 *
 *  Isso não é pegadinha — está escrito, em letras grandes.
 *
 *  Se fosse escondido, seria abusivo. Sendo claro, é justo: o plano é
 *  assinatura (usa ou perde, como qualquer plano de celular); o comprado
 *  é dinheiro adiantado (é dele, e segurar seria o Procon batendo).
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *  🇧🇷 A BANDEIRINHA — ela VALORIZA
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  O advogado bate o olho e entende: "isso varre o Brasil inteiro".
 *  É o que separa o SOSC JUS de um site de consulta qualquer.
 */

import { useCallback, useEffect, useState } from 'react';
import { sosc } from '@/lib/api';
import {
  PACOTES,
  PRECOS,
  ORDEM_TABELA,
  ORDEM_CORTESIAS,
  CORTESIAS,
  tokensDoPlano,
  fmt,
  type Saldo,
} from '@/lib/creditos';
import Cabecalho from '@/components/Cabecalho';
import Diamante from '@/components/Diamante';
import Icon from '@/components/Icon';
import Compra from '@/components/Compra';
import s from './plano.module.css';

export default function Plano() {
  const [saldo, setSaldo] = useState<Saldo | null>(null);
  const [plano, setPlano] = useState('DEFESA');
  const [comprar, setComprar] = useState<string | null>(null);

  const ler = useCallback(async () => {
    try {
      const r = await sosc.get<{ saldo?: Saldo; plano?: string }>('/creditos/saldo');
      if (r.saldo) setSaldo(r.saldo);
      if (r.plano) setPlano(r.plano);
    } catch {
      /* a tela ainda serve — mostra a tabela */
    }
  }, []);

  useEffect(() => {
    void ler();
  }, [ler]);

  const ilimitado = saldo?.ilimitado ?? false;
  const fundador = saldo?.fundador ?? false;
  const doPlano = saldo?.doPlano ?? 0;
  const comprados = saldo?.comprados ?? 0;
  const total = ilimitado ? Infinity : (saldo?.total ?? 0);
  const mensal = tokensDoPlano(plano, fundador);
  const pct = mensal > 0 ? Math.min(100, (doPlano / mensal) * 100) : 0;

  return (
    <>
      <Cabecalho
        eyebrow="Uma conta só · o mesmo login do aplicativo"
        titulo="Meus"
        destaque="Tokens"
        tom="tech"
        texto="Cada ferramenta usa um número de tokens. Você vê antes de clicar, e escolhe onde gastar."
      />

      {/* ═══ 🪙 O SALDO ═══ */}
      <div className={`${s.carteira} ${ilimitado ? s.infinita : ''}`}>
        <div className={s.pedra}>
          <Diamante s={64} />
        </div>

        <div className={s.numero}>
          <span className={s.eb}>
            {ilimitado ? 'CONTA DO DONO' : fundador ? 'FUNDADOR' : 'SEU SALDO'}
          </span>
          <strong className={ilimitado ? s.inf : ''}>
            {ilimitado ? (
              // ⚠️ SVG — o caractere "∞" vira "oo" na fonte mono
              <svg viewBox="0 0 40 20" width="72" height="36" aria-label="ilimitado">
                <path
                  d="M10 10c0-3.3 2.7-6 6-6s6 2.7 6 6-2.7 6-6 6-6-2.7-6-6zm12 0c0-3.3 2.7-6 6-6s6 2.7 6 6-2.7 6-6 6-6-2.7-6-6z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.4}
                />
              </svg>
            ) : (
              fmt(total)
            )}
          </strong>
          {/* ⚠️ A PALAVRA. Sem ela, ele lê R$. */}
          <small>{ilimitado ? 'tokens · sem limite' : 'tokens'}</small>
        </div>

        {ilimitado ? (
          <div className={s.quebra}>
            <p className={s.donoTxt}>
              Você é o dono. Nada é debitado — testa, demonstra e grava vídeo à
              vontade.
            </p>
          </div>
        ) : (
          <div className={s.quebra}>
            <div className={s.parcela}>
              <div className={s.pTopo}>
                <span>{fundador ? 'Cortesia de fundador' : `Do seu plano ${plano}`}</span>
                <b>{fmt(doPlano)}</b>
              </div>
              <div className={s.barra}>
                <i style={{ width: `${pct}%` }} />
              </div>
              <small className={s.expira}>
                <Icon n="relogio" s={13} />
                Zera dia 1º · renova para {fmt(mensal)} tokens
              </small>
            </div>

            <div className={s.parcela}>
              <div className={s.pTopo}>
                <span>Que você comprou</span>
                <b className={s.eterno}>{fmt(comprados)}</b>
              </div>
              <div className={`${s.barra} ${s.barraEterna}`}>
                <i style={{ width: comprados > 0 ? '100%' : '0%' }} />
              </div>
              <small className={s.nuncaExpira}>
                <Icon n="ok" s={13} strokeWidth={2.6} />
                Não expira nunca
              </small>
            </div>
          </div>
        )}
      </div>

      {!ilimitado ? (
        <div className="nota tech">
          <Diamante s={20} />
          <p>
            <b>Gastamos primeiro o token do seu plano.</b> Assim o que você comprou
            dura mais — e o do plano zeraria dia 1º de qualquer jeito. O token
            comprado é seu para sempre.
          </p>
        </div>
      ) : null}

      {/* ═══ 🛒 COMPRAR ═══ */}
      {!ilimitado ? (
        <>
          <h2 className={s.titulo}>Comprar tokens</h2>
          <p className={s.sub}>
            Quanto mais você leva, mais barato fica. Você confirma no celular — na
            loja onde já tem cadastro.
          </p>

          <div className={s.pacotes}>
            {PACOTES.map((p) => (
              <button
                key={p.id}
                className={`${s.pacote} ${p.destaque ? s.destaque : ''}`}
                onClick={() => setComprar(p.productId)}
              >
                {p.destaque ? <span className={s.fita}>Mais escolhido</span> : null}
                {p.bonusPct > 0 ? (
                  <span className={s.bonus}>−{p.bonusPct}%</span>
                ) : null}

                <div className={s.pctPedra}>
                  <Diamante s={p.destaque ? 34 : 28} />
                </div>

                <strong>{fmt(p.tokens)}</strong>
                <span className={s.pctLabel}>tokens</span>

                {/* ⚠️ R$ SÓ AQUI — é o preço real que a Apple cobra */}
                <div className={s.pctPreco}>
                  R$ {p.precoBRL.toFixed(2).replace('.', ',')}
                </div>
              </button>
            ))}
          </div>
        </>
      ) : null}

      {/* ═══ 🟢 GRÁTIS ═══ */}
      <h2 className={s.titulo}>O que não custa nada</h2>
      <p className={s.sub}>
        Você só gasta token quando uma consulta é feita. Organizar o que já está no
        seu painel é de graça.
      </p>

      <div className={s.gratis}>
        {ORDEM_CORTESIAS.map((k) => {
          const c = CORTESIAS[k] as { nome: string; porque: string; eraRS?: string };
          return (
            <div key={k} className={s.gItem}>
              <Icon n="ok" s={17} strokeWidth={2.6} />
              <div>
                <div className={s.gTopo}>
                  <strong>{c.nome}</strong>
                  {/* 🟢 ERA PAGO — o riscado mostra o valor E o presente */}
                  {c.eraRS ? (
                    <span className={s.eraWrap}>
                      <span className={s.riscado}>R$ {c.eraRS}</span>
                      <span className={s.gratisTag}>Grátis</span>
                    </span>
                  ) : null}
                </div>
                <small>{c.porque}</small>
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══ 🪙 A TABELA ═══ */}
      <h2 className={s.titulo}>Quanto usa cada coisa</h2>
      <p className={s.sub}>
        A maioria já vem com o relatório. Um segundo relatório do mesmo item usa
        3.000 tokens.
      </p>

      {/* ⚠️ A legenda da 🇧🇷 — sem ela, a bandeirinha vira enfeite */}
      <div className={s.legendaBr}>
        <span className={s.br}>🇧🇷</span>
        <p>
          <b>Consulta nacional.</b> Varre o Brasil inteiro — todos os tribunais,
          todas as bases oficiais.
        </p>
      </div>

      <div className="card">
        <div className="card-b flush">
          {ORDEM_TABELA.map((k) => {
            const f = PRECOS[k];
            const da = ilimitado || total >= f.tokens;
            return (
              <div key={k} className={`${s.item} ${da ? '' : s.itemFora}`}>
                <div className={s.itemNome}>
                  <div className={s.itemTopo}>
                    {f.nacional ? <span className={s.br}>🇧🇷</span> : null}
                    <strong>{f.nome}</strong>
                  </div>
                  {/* ⚠️ O QUE ELA FAZ — não "relatório já vem junto" */}
                  <small>{f.entrega}</small>
                  {f.relatorioIncluso ? (
                    <em className={s.rel}>+ relatório incluído</em>
                  ) : null}
                </div>

                {/* ⚠️ SÓ TOKENS. Nunca R$. */}
                <div className={s.itemPreco}>
                  <Diamante s={16} />
                  <b>{fmt(f.tokens)}</b>
                  <span>tokens</span>
                  {/* ⚠️ LEGENDA — nunca "10.000/mês" */}
                  {f.recorrente ? <small>Cobrado todo mês</small> : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/*
        ⚠️ O ALERTA DE MANDADO DIÁRIO **NÃO** APARECE AQUI.

        A Estação é do ADVOGADO. O Alerta Diário (R$ 39,90/mês) é do USUÁRIO —
        ele consulta o PRÓPRIO CPF todo dia.

        O advogado não faz isso. Ele consulta o do CLIENTE, avulso.
      */}

      <div className="nota">
        <Icon n="lock" s={20} />
        <p>
          <b>Por que mostramos antes do clique.</b> Um relatório usa 3.000 tokens;
          o FinaisJus usa 80.000. Se você clicasse sem saber, gastaria 26 vezes
          mais do que imaginava. Aqui você bate o olho, sabe quanto é, e decide.
        </p>
      </div>

      <Compra
        feature={comprar}
        onFechar={() => setComprar(null)}
        onConfirmado={() => {
          setComprar(null);
          void ler();
        }}
      />
    </>
  );
}

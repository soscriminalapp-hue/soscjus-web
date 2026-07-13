'use client';

/**
 * MEUS CRÉDITOS — a carteira.
 *
 * ⚠️ A REGRA DE VALIDADE, ESCRITA NA TELA:
 *
 *   · Crédito do PLANO   → zera dia 1º. Não usou, perdeu.
 *   · Crédito COMPRADO   → NUNCA expira.
 *   · Gasta primeiro o do plano.
 *
 * Isso não é pegadinha — está escrito, em letras grandes. Se fosse escondido,
 * seria abusivo. Sendo claro, é justo: o plano é assinatura (usa ou perde,
 * como qualquer plano de celular); o comprado é dinheiro adiantado (é dele, e
 * segurar seria o Procon batendo).
 */

import { useCallback, useEffect, useState } from 'react';
import { sosc } from '@/lib/api';
import {
  PACOTES,
  PRECOS,
  ORDEM_TABELA,
  ORDEM_CORTESIAS,
  CORTESIAS,
  creditosDoPlano,
  emReais,
  precoDeTabela,
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
  const mensal = creditosDoPlano(plano, fundador);
  const pct = mensal > 0 ? Math.min(100, (doPlano / mensal) * 100) : 0;

  return (
    <>
      <Cabecalho
        eyebrow="Uma conta só · o mesmo login do aplicativo"
        titulo="Meus"
        destaque="Créditos"
        tom="tech"
        texto="Cada ferramenta custa um número de créditos. Você vê o preço antes de usar, e escolhe onde gastar."
      />

      {/* ═══ O SALDO ═══ */}
      <div className={`${s.carteira} ${ilimitado ? s.infinita : ''}`}>
        <div className={s.pedra}>
          <Diamante s={64} />
        </div>

        <div className={s.numero}>
          <span className={s.eb}>
            {ilimitado ? 'CONTA DO DONO' : fundador ? 'FUNDADOR' : 'SEU SALDO'}
          </span>
          <strong className={ilimitado ? s.inf : ''}>
            {ilimitado ? '∞' : total.toLocaleString('pt-BR')}
          </strong>
          <small>
            {ilimitado
              ? 'créditos · sem limite'
              : `créditos · R$ ${emReais(total)}`}
          </small>
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
                <span>
                  {fundador ? 'Cortesia de fundador' : `Do seu plano ${plano}`}
                </span>
                <b>{doPlano}</b>
              </div>
              <div className={s.barra}>
                <i style={{ width: `${pct}%` }} />
              </div>
              <small className={s.expira}>
                <Icon n="relogio" s={13} />
                Zera dia 1º · renova para {mensal}
              </small>
            </div>

            <div className={s.parcela}>
              <div className={s.pTopo}>
                <span>Que você comprou</span>
                <b className={s.eterno}>{comprados}</b>
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
            <b>Gastamos primeiro o crédito do seu plano.</b> Assim o que você comprou
            dura mais — e o do plano zeraria dia 1º de qualquer jeito. O crédito
            comprado é seu para sempre.
          </p>
        </div>
      ) : null}

      {/* ═══ RECARGA ═══ */}
      {!ilimitado ? (
        <>
          <h2 className={s.titulo}>Comprar créditos</h2>
          <p className={s.sub}>
            Quanto mais você leva, mais barato fica o crédito. Você confirma no
            celular — na loja onde já tem cadastro.
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

                <strong>{p.creditos.toLocaleString('pt-BR')}</strong>
                <span className={s.pctLabel}>créditos</span>

                <div className={s.pctPreco}>
                  R$ {p.precoBRL.toFixed(2).replace('.', ',')}
                </div>
                <small className={s.pctUnit}>
                  R$ {(p.precoBRL / p.creditos).toFixed(2).replace('.', ',')} cada
                </small>
              </button>
            ))}
          </div>
        </>
      ) : null}

      {/* ═══ GRÁTIS ═══ */}
      <h2 className={s.titulo}>O que não custa nada</h2>
      <p className={s.sub}>
        Você só gasta crédito quando uma consulta é feita. Trabalhar com o que já
        está no seu painel é de graça.
      </p>

      <div className={s.gratis}>
        {ORDEM_CORTESIAS.map((k) => {
          const c = CORTESIAS[k];
          return (
            <div key={k} className={s.gItem}>
              <Icon n="ok" s={17} strokeWidth={2.6} />
              <div>
                <strong>{c.nome}</strong>
                <small>{c.porque}</small>
              </div>
            </div>
          );
        })}
      </div>

      <div className="nota money">
        <Icon n="ok" s={20} />
        <p>
          <b>Cadastrar um processo é grátis.</b> O crédito só sai quando formos ao
          tribunal buscar a capa e as movimentações — porque aí sim existe um custo.
        </p>
      </div>

      {/* ═══ A TABELA ═══ */}
      <h2 className={s.titulo}>Quanto custa cada coisa</h2>
      <p className={s.sub}>
        A maioria já vem com o relatório incluído. Se quiser um segundo relatório do
        mesmo item, aí sim são 6 créditos.
      </p>

      <div className="card">
        <div className="card-b flush">
          {ORDEM_TABELA.map((k) => {
            const f = PRECOS[k];
            const da = ilimitado || total >= f.creditos;
            return (
              <div key={k} className={`${s.item} ${da ? '' : s.itemFora}`}>
                <div className={s.itemNome}>
                  <strong>{f.nome}</strong>
                  <small>
                    {f.recorrente ? 'Cobrado todo mês · ' : ''}
                    {f.relatorioIncluso ? 'Relatório já vem junto' : f.entrega}
                  </small>
                </div>
                <div className={s.itemPreco}>
                  <Diamante s={16} />
                  <b>{f.creditos}</b>
                  {f.recorrente ? <em>/mês</em> : null}
                </div>
                <div className={s.itemReais}>R$ {precoDeTabela(k)}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/*
        ⚠️ O ALERTA DE MANDADO DIÁRIO **NÃO** APARECE AQUI.

        A Estação é do ADVOGADO. O Alerta Diário (R$ 39,90/mês) é do USUÁRIO —
        ele consulta o PRÓPRIO CPF todo dia.

        O advogado não fica consultando o próprio mandado. Ele consulta o do
        CLIENTE, avulso (CONSULTA_MANDADO · 💎 20).

        Mostrar aqui confunde: ele tenta assinar algo que não é dele.
      */}

      <div className="nota">
        <Icon n="lock" s={20} />
        <p>
          <b>Por que mostramos o preço antes.</b> Um relatório custa 6 créditos; o
          FinaisJus custa 160. Se você clicasse sem saber, gastaria 26 vezes mais do
          que imaginava. Aqui você bate o olho, sabe quanto é, e decide.
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

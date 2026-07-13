'use client';

/**
 * 🪙 MEUS TOKENS — a carteira.
 *
 * ⚠️ A REGRA DE VALIDADE, ESCRITA NA TELA:
 *
 *   · Token do PLANO    → zera dia 1º. Não usou, perdeu.
 *   · Token COMPRADO    → NUNCA expira.
 *   · Gasta primeiro o do plano.
 *
 * Isso não é pegadinha — está escrito, em letras grandes. Se fosse escondido,
 * seria abusivo. Sendo claro, é justo: o plano é assinatura (usa ou perde,
 * como qualquer plano de celular); o comprado é dinheiro adiantado (é dele, e
 * segurar seria o Procon batendo).
 *
 * ⚠️ E A COMPRA É NO CELULAR. A Apple EXIGE que passe pelo IAP dela
 *    (Guideline 3.1.1). Vender token no site e liberar no app é REJEIÇÃO.
 */

import { PRECOS, ORDEM_TABELA, CORTESIAS, ORDEM_CORTESIAS, tokensDoPlano, fmt } from '@/lib/creditos';
import Icon from '@/components/Icon';
import Diamante from '@/components/Diamante';
import s from './tokens.module.css';

interface Saldo {
  doPlano?: number | null;
  comprados?: number | null;
  total?: number | null;
  ilimitado?: boolean;
  fundador?: boolean;
}

export default function Tokens({ saldo, plano }: { saldo: Saldo | null; plano: string }) {
  const ilimitado = saldo?.ilimitado ?? false;
  const fundador = saldo?.fundador ?? false;
  const doPlano = saldo?.doPlano ?? 0;
  const comprados = saldo?.comprados ?? 0;
  const total = ilimitado ? Number.POSITIVE_INFINITY : (saldo?.total ?? 0);
  const mensal = tokensDoPlano(plano, fundador);
  const pct = mensal > 0 ? Math.min(100, (doPlano / mensal) * 100) : 0;

  return (
    <>
      {/* ═══ O SALDO ═══ */}
      <section className={`card ${s.carteira} ${ilimitado ? s.inf : ''}`}>
        <div className={s.pedra}>
          <Diamante s={64} />
        </div>

        <div className={s.numero}>
          <span className={s.eb}>
            {ilimitado ? 'CONTA DO DONO' : fundador ? 'FUNDADOR' : 'SEU SALDO'}
          </span>
          <strong className={ilimitado ? s.simbolo : 'num'}>
            {ilimitado ? '∞' : fmt(total)}
          </strong>
          <small>tokens</small>
        </div>

        {!ilimitado ? (
          <div className={s.quebra}>
            <div className={s.parcela}>
              <div className={s.pt}>
                <span>{fundador ? 'Cortesia de fundador' : `Do plano ${plano}`}</span>
                <b className="num">{fmt(doPlano)}</b>
              </div>
              <div className={s.barra}>
                <i style={{ width: `${pct}%`, background: 'var(--gold)' }} />
              </div>
              <small className={s.zera}>
                <Icon n="relogio" s={12} />
                Zera dia 1º · renova para {fmt(mensal)}
              </small>
            </div>

            <div className={s.parcela}>
              <div className={s.pt}>
                <span>Que você comprou</span>
                <b className={`num ${s.eterno}`}>{fmt(comprados)}</b>
              </div>
              <div className={s.barra}>
                <i style={{ width: comprados > 0 ? '100%' : '0%', background: 'var(--miami)' }} />
              </div>
              <small className={s.nunca}>
                <Icon n="ok" s={12} strokeWidth={2.6} />
                Não expira nunca
              </small>
            </div>
          </div>
        ) : (
          <p className={s.dono}>
            Você é o dono. Nada é debitado — testa, demonstra e grava vídeo à vontade.
          </p>
        )}
      </section>

      {!ilimitado ? (
        <div className="nota tech">
          <Diamante s={19} />
          <p>
            <b>Gastamos primeiro o token do seu plano.</b> Assim o que você comprou
            dura mais — e o do plano zeraria dia 1º de qualquer jeito. O token
            comprado é seu para sempre.
          </p>
        </div>
      ) : null}

      {/* ═══ 📱 A COMPRA É NO CELULAR ═══ */}
      {!ilimitado ? (
        <section className={`card ${s.comprar}`}>
          <div className="card-b">
            <span className={s.cIc}>
              <Icon n="celular" s={24} />
            </span>
            <div>
              <h2>Comprar tokens</h2>
              <p>
                A compra passa pela <b>loja do seu celular</b> — é exigência da Apple e
                do Google. Abra o SOSC JUS no telefone, vá em <b>Meus Tokens</b> e
                escolha o pacote. O saldo aparece aqui na hora.
              </p>
            </div>
            <div className={s.lojas}>
              <a
                href="https://apps.apple.com/br/app/sosc-jus/id6770715490"
                target="_blank"
                rel="noopener noreferrer"
                className="btn b-ghost sm"
              >
                App Store
                <Icon n="externo" s={13} strokeWidth={2.2} />
              </a>
              <a
                href="https://play.google.com/store/apps/details?id=br.com.soscriminal.app"
                target="_blank"
                rel="noopener noreferrer"
                className="btn b-ghost sm"
              >
                Google Play
                <Icon n="externo" s={13} strokeWidth={2.2} />
              </a>
            </div>
          </div>
        </section>
      ) : null}

      {/* ═══ 🟢 O QUE NÃO CUSTA NADA ═══ */}
      <h2 className={s.h2}>O que não custa nada</h2>
      <p className={s.sub}>
        Você só gasta token quando uma <b>consulta é feita</b>. Organizar o que já
        está no seu painel é de graça.
      </p>

      <div className={`card ${s.gratis}`}>
        {ORDEM_CORTESIAS.map((k) => {
          const c = CORTESIAS[k] as { nome: string; porque: string; eraRS?: string };
          return (
            <div key={k} className={s.gi}>
              <Icon n="ok" s={17} strokeWidth={2.6} />
              <div>
                <div className={s.gt}>
                  <strong>{c.nome}</strong>
                  {/* 🟢 ERA PAGO — o riscado mostra o valor E o presente */}
                  {c.eraRS ? (
                    <span className={s.era}>
                      <s>R$ {c.eraRS}</s>
                      <em>Grátis</em>
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
      <h2 className={s.h2}>Quanto usa cada coisa</h2>
      <p className={s.sub}>
        A maioria já vem com o relatório. Um segundo relatório do mesmo item usa
        3.000 tokens.
      </p>

      {/* ⚠️ A legenda da 🇧🇷 — sem ela, a bandeirinha vira enfeite */}
      <div className={s.legBr}>
        <span>🇧🇷</span>
        <p>
          <b>Consulta nacional.</b> Varre o Brasil inteiro — todos os tribunais, todas
          as bases oficiais.
        </p>
      </div>

      <div className={`card ${s.tabela}`}>
        {ORDEM_TABELA.map((k) => {
          const f = PRECOS[k];
          const da = ilimitado || total >= f.tokens;
          return (
            <div key={k} className={`${s.ti} ${da ? '' : s.fora}`}>
              <div className={s.tn}>
                <div className={s.tt}>
                  {f.nacional ? <span className={s.br}>🇧🇷</span> : null}
                  <strong>{f.nome}</strong>
                </div>
                {/* ⚠️ O QUE ELA FAZ — não "relatório já vem junto" */}
                <small>{f.entrega}</small>
                {f.relatorioIncluso ? <em className={s.rel}>+ relatório incluído</em> : null}
              </div>

              {/* ⚠️ SÓ TOKENS. Nunca R$. */}
              <div className={s.tp}>
                <span className={s.tv}>
                  <Diamante s={15} />
                  <b className="num">{fmt(f.tokens)}</b>
                  <em>tokens</em>
                </span>
                {/* ⚠️ LEGENDA — nunca "10.000/mês" colado */}
                {f.recorrente ? <small>Cobrado todo mês</small> : null}
              </div>
            </div>
          );
        })}
      </div>

      <div className="nota">
        <Icon n="lock" s={19} />
        <p>
          <b>Por que mostramos antes do clique.</b> Um relatório usa 3.000 tokens; o
          FinaisJus usa 80.000. Se você clicasse sem saber, gastaria 26 vezes mais do
          que imaginava. Aqui você bate o olho, sabe quanto é, e decide.
        </p>
      </div>
    </>
  );
}

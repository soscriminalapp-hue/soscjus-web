'use client';

/**
 * RELATÓRIO PROCESSUAL — o principal dos cinco.
 *
 * ═══════════════════════════════════════════════════════════════════════
 *  ⚠️ A ECONOMIA — não mexa sem entender
 * ═══════════════════════════════════════════════════════════════════════
 *
 *  O relatório NÃO SINCRONIZA. Não vai no CPF, na OAB nem no nome.
 *
 *  A capa e as movimentações JÁ ESTÃO no banco — vieram nos R$ 4,50 da busca
 *  por OAB. Ler de novo custa ZERO.
 *
 *  Ele já tem o CNJ. Vai DIRETO nele buscar o INTEIRO TEOR — sentença,
 *  decisão, despacho, parecer, certidão.
 *
 *  Se sincronizasse antes, cada relatório custaria R$4,50 + R$2,90.
 *  A margem morreria.
 *
 * ═══════════════════════════════════════════════════════════════════════
 *  QUEM PAGA
 * ═══════════════════════════════════════════════════════════════════════
 *
 *  · Está no pacote de acompanhamento? → o relatório DAQUELE processo é grátis
 *  · Quer outro do mesmo processo?      → 6 💎
 *  · Cliente pede na Sala Chat?         → 6 💎, e QUEM PAGA É O ADVOGADO
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { sosc, ApiError } from '@/lib/api';
import { PRECOS ,
  fmt,
} from '@/lib/creditos';
import Icon from '@/components/Icon';
import Diamante from '@/components/Diamante';
import { Gratis } from '@/components/Preco';
import Compra from '@/components/Compra';
import s from './relatorio.module.css';

const F = 'RELATORIO' as const;

export default function GerarRelatorio({
  cnj,
  /** O relatório deste processo veio no pacote e ainda não foi usado? */
  incluso,
  saldo,
}: {
  cnj: string;
  incluso: boolean;
  saldo: number;
}) {
  const router = useRouter();
  const [ocupado, setOcupado] = useState(false);
  const [texto, setTexto] = useState<string | null>(null);
  const [foiCortesia, setFoiCortesia] = useState(false);
  const [erro, setErro] = useState('');
  const [comprar, setComprar] = useState<string | null>(null);

  const custo = PRECOS[F].tokens;

  async function gerar() {
    setOcupado(true);
    setErro('');
    setTexto(null);
    try {
      const r = await sosc.post<{
        texto?: string;
        cortesia?: boolean;
      }>(`/processos/${encodeURIComponent(cnj)}/relatorio`, {
        tipo: 'PROCESSUAL',
      });
      setTexto(r.texto ?? '');
      setFoiCortesia(Boolean(r.cortesia));
      router.refresh(); // o saldo mudou
    } catch (e) {
      // 402 → o relatório do pacote já foi usado. 6 💎 → celular.
      if (e instanceof ApiError && e.semCota) {
        setComprar('CREDITOS');
      } else {
        setErro(
          e instanceof ApiError
            ? e.message
            : 'Não foi possível gerar o relatório. Tente de novo.',
        );
      }
    } finally {
      setOcupado(false);
    }
  }

  return (
    <>
      <div className={s.box}>
        <div className={s.topo}>
          <span className={s.ic}>
            <Icon n="relatorio" s={24} />
          </span>
          <div className={s.tit}>
            <span className={s.eb}>RELATÓRIO PROCESSUAL</span>
            <strong>O processo explicado</strong>
          </div>
        </div>

        <p className={s.txt}>
          Ele lê a capa, todas as movimentações e o <b>inteiro teor</b> — sentença,
          decisão, despacho, parecer, certidão. E escreve{' '}
          <b>como o advogado falaria com o cliente</b>: sem jargão, sem print de
          movimentação.
        </p>

        <ul className={s.busca}>
          <li>
            <Icon n="ok" s={14} strokeWidth={2.6} />
            Capa completa e as partes
          </li>
          <li>
            <Icon n="ok" s={14} strokeWidth={2.6} />
            A linha do tempo inteira
          </li>
          <li>
            <Icon n="ok" s={14} strokeWidth={2.6} />
            O que juiz, promotor, delegado e escrivão <b>assinaram</b>
          </li>
        </ul>

        {erro ? (
          <div className={s.erro}>
            <Icon n="alerta" s={16} />
            <span>{erro}</span>
          </div>
        ) : null}

        <button
          className={`btn ${incluso ? 'b-money' : 'b-gold'} full`}
          onClick={() => void gerar()}
          disabled={ocupado}
        >
          {ocupado ? (
            <>
              <span className="spin" />
              Lendo o processo…
            </>
          ) : (
            <>
              <Icon n="relatorio" s={19} strokeWidth={2.1} />
              {incluso ? 'Gerar relatório' : 'Gerar outro relatório'}
            </>
          )}
        </button>

        <div className={s.preco}>
          {incluso ? (
            <span className={s.gratis}>
              <Icon n="ok" s={14} strokeWidth={2.4} />
              Incluído no pacote deste processo
            </span>
          ) : (
            <span className={s.pago}>
              <Diamante s={14} />
              {custo} tokens
              {saldo < custo ? ' · você não tem saldo' : ''}
            </span>
          )}
        </div>
      </div>

      {texto ? (
        <div className={s.pronto}>
          <div className={s.prontoTopo}>
            <div>
              <span className={s.eb}>RELATÓRIO PROCESSUAL</span>
              <strong>Pronto</strong>
            </div>
            <div className={s.prontoAcoes}>
              {foiCortesia ? <Gratis texto="Veio no pacote" /> : null}
              <button
                className="btn b-ghost sm"
                onClick={() => void navigator.clipboard.writeText(texto)}
              >
                <Icon n="copiar" s={16} strokeWidth={2.2} />
                Copiar
              </button>
              <button className="btn b-ghost sm" onClick={() => window.print()}>
                <Icon n="baixar" s={16} strokeWidth={2.2} />
                Baixar PDF
              </button>
            </div>
          </div>
          <div className={s.folha}>
            <pre>{texto}</pre>
          </div>
          <div className="nota">
            <Icon n="lock" s={20} />
            <p>
              <b>Este relatório descreve, não aconselha.</b> Ele registra o que
              consta nos autos e traduz para o cliente entender. Não sugere conduta,
              não recomenda estratégia e não avalia o trabalho de ninguém — porque
              isso é decisão do advogado, caso a caso.
            </p>
          </div>
        </div>
      ) : null}

      <Compra
        feature={comprar}
        onFechar={() => setComprar(null)}
        onConfirmado={() => {
          setComprar(null);
          void gerar();
        }}
      />
    </>
  );
}

'use client';

/**
 * ACOMPANHAR O PROCESSO — 20 💎/mês (R$ 9,90)
 *
 * ═══════════════════════════════════════════════════════════════════
 *  ⚠️ 1 pacote = 1 processo = 1 relatório DAQUELE processo.
 *     Não vira token. Não acumula. Não migra.
 *     10 pacotes = 10 processos, cada um com O SEU relatório.
 * ═══════════════════════════════════════════════════════════════════
 *
 * Ligado o acompanhamento, o Escavador avisa por WEBHOOK quando o processo
 * anda. Não é polling — por isso o custo se sustenta.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { sosc, ApiError } from '@/lib/api';
import { PRECOS, LIMIAR_CONFIRMACAO ,
  fmt,
} from '@/lib/creditos';
import Icon from '@/components/Icon';
import Diamante from '@/components/Diamante';
import Gastar from '@/components/Gastar';
import Compra from '@/components/Compra';
import s from './acompanhar.module.css';

const F = 'ACOMPANHAMENTO' as const;

export default function Acompanhar({
  cnj,
  monitorado,
  saldo,
  ilimitado,
}: {
  cnj: string;
  monitorado: boolean;
  saldo: number;
  ilimitado?: boolean;
}) {
  const router = useRouter();
  const [ligado, setLigado] = useState(monitorado);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState('');
  const [confirmar, setConfirmar] = useState<typeof F | null>(null);
  const [comprar, setComprar] = useState<string | null>(null);

  const custo = PRECOS[F].tokens;
  const da = ilimitado || saldo >= custo;

  async function alternar(pular?: boolean) {
    // ═══ FLUIDEZ NO BARATO, TRANSPARÊNCIA NO CARO ═══
    // 20 💎 está NO limiar → confirma antes.
    if (!ligado && !pular && custo > LIMIAR_CONFIRMACAO && !ilimitado) {
      setConfirmar(F);
      return;
    }
    setConfirmar(null);
    setOcupado(true);
    setErro('');
    try {
      await sosc.post(`/processos/${encodeURIComponent(cnj)}/monitorar`, {
        ativo: !ligado,
      });
      setLigado(!ligado);
      router.refresh();
    } catch (e) {
      // 402 → sem token. A web NÃO cobra: manda pro celular.
      if (e instanceof ApiError && e.semCota) {
        setComprar('CREDITOS');
      } else {
        setErro(
          e instanceof ApiError
            ? e.message
            : 'Não foi possível alterar o acompanhamento. Tente de novo.',
        );
      }
    } finally {
      setOcupado(false);
    }
  }

  return (
    <>
      <div className={`${s.box} ${ligado ? s.on : ''}`}>
        <div className={s.topo}>
          <div className={s.radar}>
            <i />
            <i />
            <Icon n="radar" s={24} />
          </div>
          <div className={s.tit}>
            <span className={s.eb}>
              {ligado ? 'ACOMPANHANDO' : 'NÃO ACOMPANHADO'}
            </span>
            <strong>
              {ligado ? 'Você é avisado quando ele andar' : 'Ligue e seja avisado'}
            </strong>
          </div>
          <button
            className={`${s.sw} ${ligado ? s.swOn : ''}`}
            onClick={() => void alternar()}
            disabled={ocupado || (!ligado && !da)}
            role="switch"
            aria-checked={ligado}
            aria-label="Acompanhar este processo"
          />
        </div>

        <p className={s.txt}>
          {ligado ? (
            <>
              O tribunal publicou? Você fica sabendo — sem precisar entrar aqui para
              conferir. <b>O relatório deste processo está incluído no pacote.</b>
            </>
          ) : (
            <>
              Quando o processo se mexer, o aviso chega até você. O pacote já vem com{' '}
              <b>o relatório deste processo</b>.
            </>
          )}
        </p>

        <div className={s.conta}>
          {ilimitado ? (
            <span className={s.contaOk}>
              <Icon n="ok" s={14} strokeWidth={2.4} />
              Sem limite
            </span>
          ) : ligado ? (
            <span className={s.contaOk}>
              <Icon n="ok" s={14} strokeWidth={2.4} />
              Ativo · {custo} tokens por mês
            </span>
          ) : (
            <span className={da ? s.contaLivre : s.contaCheio}>
              <Diamante s={14} />
              {custo} tokens por mês
              {!da ? ' · você não tem saldo' : ''}
            </span>
          )}
        </div>

        {erro ? (
          <div className={s.erro}>
            <Icon n="alerta" s={16} />
            <span>{erro}</span>
          </div>
        ) : null}

        {!ligado ? (
          <button
            className="btn b-tech full"
            onClick={() => void alternar()}
            disabled={ocupado}
          >
            {ocupado ? (
              <>
                <span className="spin" />
                Ligando…
              </>
            ) : (
              <>
                <Icon n="radar" s={19} strokeWidth={2.1} />
                Acompanhar este processo
              </>
            )}
          </button>
        ) : null}
      </div>

      <Gastar
        chave={confirmar}
        saldo={saldo}
        onConfirmar={() => void alternar(true)}
        onCancelar={() => setConfirmar(null)}
        onRecarregar={() => {
          setConfirmar(null);
          router.push('/plano');
        }}
      />

      <Compra
        feature={comprar}
        onFechar={() => setComprar(null)}
        onConfirmado={() => {
          setComprar(null);
          void alternar(true);
        }}
      />
    </>
  );
}

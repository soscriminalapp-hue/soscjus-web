'use client';

/**
 * DonoDoVeiculo.tsx — o upsell honesto.
 *
 * ═══════════════════════════════════════════════════════════════════════
 *  O Pente-Fino do Veículo (20.000 tokens) já entrega TUDO do veículo —
 *  inclusive QUEM É O DONO, com o CPF dele.
 *
 *  Aí o advogado olha o CPF e pensa: "deixa eu ver quem é essa pessoa."
 *
 *  Isso é OUTRA consulta. Outra API, outro custo. Então: 10.000 tokens
 *  (CONSULTA_CADASTRAL).
 *
 *  É honesto porque ELE ESCOLHE. Não é cobrança escondida — ele já tem
 *  o que pediu (o veículo). Se quiser ir além, o preço está na cara,
 *  antes do clique.
 * ═══════════════════════════════════════════════════════════════════════
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { sosc, ApiError } from '@/lib/api';
import { PRECOS, fmt, type Feature } from '@/lib/creditos';
import Diamante from './Diamante';
import Icon from './Icon';
import Gastar from './Gastar';
import s from './dono.module.css';

interface Props {
  nome: string;
  /** Mascarado. O CPF inteiro só aparece no relatório. */
  cpf: string;
  saldo: number;
}

export default function DonoDoVeiculo({ nome, cpf, saldo }: Props) {
  const router = useRouter();
  const [confirmar, setConfirmar] = useState<Feature | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState('');

  const f = PRECOS.CONSULTA_CADASTRAL;

  async function consultar() {
    setConfirmar(null);
    setOcupado(true);
    setErro('');
    try {
      await sosc.post('/processos/cpf/buscar', {
        termo: cpf.replace(/\D/g, ''),
        tipo: 'cpf',
      });
      router.push('/consultas?f=cadastral&resultado=1');
    } catch (e) {
      setErro(
        e instanceof ApiError ? e.message : 'A consulta falhou. Tente de novo.',
      );
    } finally {
      setOcupado(false);
    }
  }

  return (
    <>
      <div className={s.dono}>
        <div className={s.ic}>
          <Icon n="clientes" s={20} />
        </div>

        <div className={s.info}>
          <span className={s.eb}>PROPRIETÁRIO</span>
          <strong>{nome}</strong>
          <small className={s.cpf}>{cpf}</small>
        </div>

        <button
          className={s.acao}
          onClick={() => setConfirmar('CONSULTA_CADASTRAL')}
          disabled={ocupado}
        >
          {ocupado ? (
            <>
              <span className="spin" />
              Consultando…
            </>
          ) : (
            <>
              <span className={s.preco}>
                <Diamante s={14} />
                <b>{fmt(f.tokens)}</b>
                <em>tokens</em>
              </span>
              Consultar esta pessoa
              <Icon n="chev" s={16} strokeWidth={2.4} />
            </>
          )}
        </button>
      </div>

      {erro ? (
        <div className={s.erro}>
          <Icon n="alerta" s={16} />
          <span>{erro}</span>
        </div>
      ) : null}

      <p className={s.nota}>
        <Icon n="lock" s={13} />
        Você já tem tudo do veículo. Isto é uma consulta nova, sobre a pessoa — e
        por isso tem um preço próprio.
      </p>

      <Gastar
        chave={confirmar}
        saldo={saldo}
        onConfirmar={consultar}
        onCancelar={() => setConfirmar(null)}
        onRecarregar={() => {
          setConfirmar(null);
          router.push('/plano');
        }}
      />
    </>
  );
}

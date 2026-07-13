'use client';

/**
 * 💰 COBRAR HONORÁRIOS.
 *
 * ⚠️ O R$ 0,00 AQUI É REAL — é o honorário DELE, em reais. Não tem nada a
 *    ver com token. Token é o que ELE gasta com a gente; honorário é o que
 *    o CLIENTE paga pra ele.
 *
 * 💻 E o computador permite:
 *    · exportar Excel (pro contador)
 *    · imprimir o recibo
 */

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { sosc, ApiError } from '@/lib/api';
import { exportarExcel, imprimirHTML, hoje as hojeStr } from '@/lib/nativo';
import Icon from '@/components/Icon';
import { Gratis } from '@/components/Token';
import s from './honorarios.module.css';

interface Cobranca {
  id: string;
  clientName?: string;
  clientId?: string;
  amount?: number;
  description?: string;
  status?: string;
  dueDate?: string;
  createdAt?: string;
  paidAt?: string;
}
interface Cliente { id: string; fullName?: string }
interface Banco { pixKey?: string; bankName?: string; holderName?: string }

const reais = (n?: number) =>
  (n ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const dataBR = (v?: string) => {
  if (!v) return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('pt-BR');
};

export default function Honorarios({
  cobrancas,
  clientes,
  banco,
}: {
  cobrancas: Cobranca[];
  clientes: Cliente[];
  banco: Banco | null;
}) {
  const router = useRouter();
  const [nova, setNova] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState('');
  const [filtro, setFiltro] = useState<'todas' | 'aberto' | 'pago'>('todas');

  const [cliente, setCliente] = useState('');
  const [valor, setValor] = useState('');
  const [desc, setDesc] = useState('');
  const [venc, setVenc] = useState('');

  const lista = useMemo(() => {
    if (filtro === 'todas') return cobrancas;
    const pago = (c: Cobranca) => c.status === 'PAID' || c.status === 'PAGO' || !!c.paidAt;
    return cobrancas.filter((c) => (filtro === 'pago' ? pago(c) : !pago(c)));
  }, [cobrancas, filtro]);

  const emAberto = cobrancas
    .filter((c) => !(c.status === 'PAID' || c.status === 'PAGO' || c.paidAt))
    .reduce((t, c) => t + (c.amount ?? 0), 0);

  const recebido = cobrancas
    .filter((c) => c.status === 'PAID' || c.status === 'PAGO' || c.paidAt)
    .reduce((t, c) => t + (c.amount ?? 0), 0);

  async function criar() {
    const v = Number(valor.replace(/\./g, '').replace(',', '.'));
    if (!cliente || !v || v <= 0) {
      setErro('Escolha o cliente e informe o valor.');
      return;
    }
    setOcupado(true);
    setErro('');
    try {
      await sosc.post('/honorarios/charges', {
        clientId: cliente,
        amount: v,
        description: desc.trim() || undefined,
        dueDate: venc || undefined,
      });
      setNova(false);
      setCliente(''); setValor(''); setDesc(''); setVenc('');
      router.refresh();
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : 'Não foi possível criar a cobrança.');
    } finally {
      setOcupado(false);
    }
  }

  async function marcarPago(id: string) {
    setOcupado(true);
    try {
      await sosc.patch(`/honorarios/charges/${id}/status`, { status: 'PAID' });
      router.refresh();
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : 'Não foi possível atualizar.');
    } finally {
      setOcupado(false);
    }
  }

  /* 📊 Excel — pro contador */
  function exportar() {
    exportarExcel(
      `honorarios-${hojeStr()}`,
      ['Cliente', 'Descrição', 'Valor', 'Vencimento', 'Status', 'Pago em'],
      lista.map((c) => [
        c.clientName ?? '',
        c.description ?? '',
        c.amount ?? 0,
        dataBR(c.dueDate),
        c.paidAt || c.status === 'PAID' ? 'Pago' : 'Em aberto',
        dataBR(c.paidAt),
      ]),
    );
  }

  /* 🖨️ O recibo */
  function recibo(c: Cobranca) {
    imprimirHTML(
      `Recibo — ${c.clientName ?? ''}`,
      `<h1>Recibo de Honorários</h1>
<p class="sem-recuo">Recebi de <b>${c.clientName ?? '_______'}</b> a importância de
<b>${reais(c.amount)}</b>, referente a ${c.description ?? 'honorários advocatícios'}.</p>
<p class="sem-recuo">Para clareza, firmo o presente recibo.</p>
<p class="local-data">${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}.</p>
<div class="assina"><hr><p>Advogado</p></div>`,
    );
  }

  const wa = (c: Cobranca) => {
    const t = `Olá${c.clientName ? ` ${c.clientName.split(' ')[0]}` : ''}! Segue a cobrança de honorários:\n\n${c.description ?? 'Honorários advocatícios'}\nValor: ${reais(c.amount)}${c.dueDate ? `\nVencimento: ${dataBR(c.dueDate)}` : ''}${banco?.pixKey ? `\n\nPIX: ${banco.pixKey}` : ''}`;
    return `https://wa.me/?text=${encodeURIComponent(t)}`;
  };

  return (
    <>
      <header className={s.topo}>
        <div className={s.somas}>
          <div className={s.soma}>
            <span>Em aberto</span>
            <strong className={s.aberto}>{reais(emAberto)}</strong>
          </div>
          <div className={s.sep} />
          <div className={s.soma}>
            <span>Recebido</span>
            <strong className={s.pago}>{reais(recebido)}</strong>
          </div>
        </div>

        <div className={s.acoes}>
          <button className="btn b-ghost" onClick={exportar} disabled={lista.length === 0}>
            <Icon n="baixar" s={17} />
            Excel
          </button>
          <button className="btn b-money" onClick={() => setNova(true)}>
            <Icon n="mais" s={17} strokeWidth={2.2} />
            Nova cobrança
          </button>
        </div>
      </header>

      {!banco?.pixKey ? (
        <div className="nota gold">
          <Icon n="pix" s={19} />
          <p>
            <b>Cadastre sua chave PIX</b> em Escritório — assim ela vai junto na
            mensagem de cobrança, e o cliente paga na hora.
          </p>
        </div>
      ) : null}

      {erro ? (
        <div className={s.erro}>
          <Icon n="alerta" s={17} />
          <span>{erro}</span>
        </div>
      ) : null}

      {/* ─── NOVA COBRANÇA ─── */}
      {nova ? (
        <section className={`card ${s.nova}`}>
          <div className="card-h">
            <h2>
              <Icon n="dinheiro" s={18} />
              Nova cobrança
              <Gratis texto="Grátis" />
            </h2>
            <button className={s.x} onClick={() => setNova(false)} aria-label="Fechar">
              <Icon n="x" s={17} strokeWidth={2.4} />
            </button>
          </div>
          <div className="card-b">
            <div className={s.form}>
              <label className="fld">
                <span>Cliente</span>
                <select value={cliente} onChange={(e) => setCliente(e.target.value)} disabled={ocupado}>
                  <option value="">Escolha…</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>{c.fullName}</option>
                  ))}
                </select>
              </label>

              <label className="fld">
                <span>Valor (R$)</span>
                <input
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  placeholder="2.500,00"
                  disabled={ocupado}
                />
              </label>

              <label className="fld">
                <span>Vencimento · opcional</span>
                <input type="date" value={venc} onChange={(e) => setVenc(e.target.value)} disabled={ocupado} />
              </label>

              <label className={`fld ${s.desc}`}>
                <span>Descrição</span>
                <input
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Ex.: Honorários — ação penal 5000290-98"
                  disabled={ocupado}
                />
              </label>
            </div>

            <button className="btn b-money full" onClick={() => void criar()} disabled={ocupado}>
              {ocupado ? <span className="spin" /> : <Icon n="ok" s={17} strokeWidth={2.4} />}
              Criar cobrança
            </button>
          </div>
        </section>
      ) : null}

      {/* ─── OS FILTROS ─── */}
      <div className={s.filtros}>
        {(['todas', 'aberto', 'pago'] as const).map((f) => (
          <button
            key={f}
            className={`${s.chip} ${filtro === f ? s.chipOn : ''}`}
            onClick={() => setFiltro(f)}
          >
            {f === 'todas' ? 'Todas' : f === 'aberto' ? 'Em aberto' : 'Pagas'}
          </button>
        ))}
      </div>

      {/* ─── A LISTA ─── */}
      {lista.length === 0 ? (
        <div className={`card ${s.vazio}`}>
          <Icon n="dinheiro" s={36} />
          <p>Nenhuma cobrança.</p>
          <small>Crie uma e mande pelo WhatsApp. O cliente paga pelo PIX.</small>
        </div>
      ) : (
        <div className={s.lista}>
          {lista.map((c) => {
            const pago = c.status === 'PAID' || c.status === 'PAGO' || !!c.paidAt;
            return (
              <article key={c.id} className={`card ${s.cob} ${pago ? s.cPago : ''}`}>
                <div className={s.ci}>
                  <strong>{c.clientName ?? 'Cliente'}</strong>
                  <small>{c.description ?? '—'}</small>
                  {c.dueDate ? (
                    <em className="num">vence {dataBR(c.dueDate)}</em>
                  ) : null}
                </div>

                <b className={`num ${s.valor} ${pago ? s.vPago : ''}`}>{reais(c.amount)}</b>

                <div className={s.cAcoes}>
                  {pago ? (
                    <>
                      <span className={s.selo}>
                        <Icon n="ok" s={13} strokeWidth={3} />
                        Pago
                      </span>
                      <button className="btn b-ghost sm" onClick={() => recibo(c)} title="Imprimir recibo">
                        <Icon n="doc" s={15} />
                      </button>
                    </>
                  ) : (
                    <>
                      <a
                        href={wa(c)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`btn sm ${s.wa}`}
                      >
                        <Icon n="wa" s={15} />
                        Cobrar
                      </a>
                      <button
                        className="btn b-ghost sm"
                        onClick={() => void marcarPago(c.id)}
                        disabled={ocupado}
                      >
                        <Icon n="ok" s={15} strokeWidth={2.4} />
                        Recebi
                      </button>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}

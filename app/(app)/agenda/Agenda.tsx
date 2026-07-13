'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { sosc, ApiError } from '@/lib/api';
import { exportarICS, exportarExcel, imprimir, hoje as hojeStr, type Evento } from '@/lib/nativo';
import Icon from '@/components/Icon';
import Token from '@/components/Token';
import Gastar from '@/components/Gastar';
import Calendario, { type Item } from '@/components/Calendario';
import s from './agenda.module.css';

interface Prazo {
  id?: string;
  tipo?: string;
  cliente?: string;
  numeroProcesso?: string;
  dataFim?: string;
  diasRestantes?: number;
  baseLegal?: string;
  validado?: boolean;
}
interface Audiencia {
  id?: string;
  tipo?: string;
  cliente?: string;
  numeroProcesso?: string;
  data?: string;
  local?: string;
}

function dias(v?: string) {
  if (!v) return 999;
  return Math.ceil((new Date(v).getTime() - Date.now()) / 86400000);
}
function dataBR(v?: string) {
  if (!v) return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('pt-BR');
}
function horaBR(v?: string) {
  if (!v) return '';
  const d = new Date(v);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function Agenda({
  prazos,
  audiencias,
  saldo,
}: {
  prazos: Prazo[];
  audiencias: Audiencia[];
  saldo: number;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [aba, setAba] = useState<'prazos' | 'audiencias'>(
    params.get('t') === 'audiencias' ? 'audiencias' : 'prazos',
  );
  /** 💻 lista ou calendário — o calendário NÃO CABE no celular. */
  const [visao, setVisao] = useState<'lista' | 'mes'>('lista');

  const [gastar, setGastar] = useState<'ATUALIZACAO_NACIONAL' | null>(null);
  const [novo, setNovo] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState('');

  // o formulário do manual
  const [cnj, setCnj] = useState('');
  const [tipo, setTipo] = useState('');
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [local, setLocal] = useState('');

  const pz = [...prazos]
    .map((p) => ({ ...p, d: p.diasRestantes ?? dias(p.dataFim) }))
    .sort((a, b) => a.d - b.d);

  const au = [...audiencias].sort(
    (a, b) => new Date(a.data ?? 0).getTime() - new Date(b.data ?? 0).getTime(),
  );

  /** 🇧🇷 Sincronizar — busca prazos/audiências novos nas movimentações. */
  async function sincronizar() {
    setGastar(null);
    setOcupado(true);
    setErro('');
    try {
      const rota =
        aba === 'prazos'
          ? '/processos/meus-processos/sincronizar-prazos'
          : '/processos/meus-processos/sincronizar-audiencias';
      await sosc.post(rota, {});
      router.refresh();
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : 'A sincronização falhou.');
    } finally {
      setOcupado(false);
    }
  }

  /**
   * ✋ CRIAR NA MÃO — e é GRÁTIS.
   *
   * ⚠️ Ninguém foi ao tribunal buscar nada. Ele SABE do prazo (leu nos autos,
   *    ficou sabendo na audiência). Cobrar por digitar seria roubo.
   *
   *    E o advogado raiz PRECISA disso — ele tem método próprio.
   */
  async function criar() {
    const so = cnj.replace(/\D/g, '');
    if (so.length !== 20) {
      setErro('O número CNJ tem 20 dígitos.');
      return;
    }
    if (!tipo.trim() || !data) {
      setErro('Informe o tipo e a data.');
      return;
    }

    setOcupado(true);
    setErro('');
    try {
      if (aba === 'prazos') {
        await sosc.post(`/processos/${so}/prazos`, {
          tipo: tipo.trim(),
          dataFim: data,
        });
      } else {
        await sosc.post(`/processos/${so}/audiencias`, {
          tipo: tipo.trim(),
          data: hora ? `${data}T${hora}:00` : data,
          local: local.trim() || undefined,
        });
      }
      setNovo(false);
      setCnj(''); setTipo(''); setData(''); setHora(''); setLocal('');
      router.refresh();
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : 'Não foi possível criar.');
    } finally {
      setOcupado(false);
    }
  }

  const vencidos = pz.filter((p) => p.d < 0).length;
  const hoje = pz.filter((p) => p.d === 0).length;

  /* ═══ 📅 TUDO NUM CALENDÁRIO ═══ */
  const doCalendario: Item[] = [
    ...pz
      .filter((p) => p.dataFim)
      .map((p, i) => ({
        id: `p-${p.id ?? i}`,
        tipo: 'prazo' as const,
        titulo: p.tipo ?? 'Prazo',
        data: new Date(p.dataFim!),
        cliente: p.cliente,
        cnj: p.numeroProcesso,
        dias: p.d,
      })),
    ...au
      .filter((a) => a.data)
      .map((a, i) => ({
        id: `a-${a.id ?? i}`,
        tipo: 'audiencia' as const,
        titulo: a.tipo ?? 'Audiência',
        data: new Date(a.data!),
        cliente: a.cliente,
        cnj: a.numeroProcesso,
        local: a.local,
      })),
  ];

  /**
   * ═══ 📅 EXPORTAR PARA O CALENDÁRIO DELE ═══
   *
   * ⚠️ Um clique e cai no Google Calendar / Outlook — COM ALARME.
   *
   *    Prazo → alerta 1 dia antes (ele precisa do dia inteiro pra protocolar)
   *    Audiência → alerta 2 horas antes (tempo de sair do escritório)
   */
  function exportarCalendario() {
    const eventos: Evento[] = [
      ...pz
        .filter((p) => p.dataFim)
        .map((p) => ({
          titulo: `⏰ ${p.tipo ?? 'Prazo'} — ${p.cliente ?? ''}`.trim(),
          inicio: new Date(p.dataFim!),
          descricao: `Processo ${p.numeroProcesso ?? ''}\n${p.baseLegal ?? ''}\n\nSOSC JUS — confira nos autos.`,
          alarmeMin: 1440, // 1 dia antes
        })),
      ...au
        .filter((a) => a.data)
        .map((a) => ({
          titulo: `⚖️ ${a.tipo ?? 'Audiência'} — ${a.cliente ?? ''}`.trim(),
          inicio: new Date(a.data!),
          local: a.local,
          descricao: `Processo ${a.numeroProcesso ?? ''}\n\nSOSC JUS — confira nos autos.`,
          alarmeMin: 120, // 2 horas antes
        })),
    ];
    if (eventos.length === 0) return;
    exportarICS(`agenda-soscjus-${hojeStr()}`, eventos);
  }

  /** 📊 A pauta em Excel — para a secretária, para o contador. */
  function exportarPlanilha() {
    if (aba === 'prazos') {
      exportarExcel(
        `prazos-${hojeStr()}`,
        ['Vence em', 'Dias', 'Tipo', 'Cliente', 'Processo', 'Base legal'],
        pz.map((p) => [
          dataBR(p.dataFim),
          p.d,
          p.tipo ?? '',
          p.cliente ?? '',
          p.numeroProcesso ?? '',
          p.baseLegal ?? '',
        ]),
      );
    } else {
      exportarExcel(
        `audiencias-${hojeStr()}`,
        ['Data', 'Hora', 'Tipo', 'Cliente', 'Processo', 'Local'],
        au.map((a) => [
          dataBR(a.data),
          horaBR(a.data),
          a.tipo ?? '',
          a.cliente ?? '',
          a.numeroProcesso ?? '',
          a.local ?? '',
        ]),
      );
    }
  }

  return (
    <>
      {/* ═══ AS ABAS — motores diferentes, nunca misture ═══ */}
      <header className={s.topo}>
        <div className={s.abas}>
          <button
            className={`${s.aba} ${aba === 'prazos' ? s.abaOn : ''}`}
            onClick={() => setAba('prazos')}
          >
            <Icon n="relogio" s={17} />
            Prazos
            <b>{pz.length}</b>
          </button>
          <button
            className={`${s.aba} ${aba === 'audiencias' ? s.abaOn : ''}`}
            onClick={() => setAba('audiencias')}
          >
            <Icon n="agenda" s={17} />
            Audiências
            <b>{au.length}</b>
          </button>
        </div>

        <div className={s.acoes}>
          {/* 💻 LISTA ou CALENDÁRIO — o calendário NÃO CABE no celular */}
          <div className={s.visao}>
            <button
              className={visao === 'lista' ? s.vOn : ''}
              onClick={() => setVisao('lista')}
              title="Lista"
            >
              <Icon n="menu" s={16} strokeWidth={2.2} />
            </button>
            <button
              className={visao === 'mes' ? s.vOn : ''}
              onClick={() => setVisao('mes')}
              title="Calendário do mês"
            >
              <Icon n="agenda" s={16} strokeWidth={2.2} />
            </button>
          </div>

          {/* ✋ o manual — GRÁTIS. O advogado raiz precisa disso. */}
          <button className="btn b-ghost" onClick={() => setNovo(true)} disabled={ocupado}>
            <Icon n="mais" s={17} strokeWidth={2.2} />
            Criar na mão
          </button>

          <button
            className="btn b-gold"
            onClick={() => setGastar('ATUALIZACAO_NACIONAL')}
            disabled={ocupado}
          >
            {ocupado ? <span className="spin" /> : <Icon n="sync" s={17} strokeWidth={2.1} />}
            Sincronizar
            <span className={s.bp}>
              <Token n={10_000} claro mini />
            </span>
          </button>
        </div>
      </header>

      {/*
        ═══════════════════════════════════════════════════════════════════
         💻 O QUE SÓ O COMPUTADOR FAZ
        ═══════════════════════════════════════════════════════════════════

         O celular não exporta pro Google Calendar. Não gera Excel. Não
         imprime. Aqui é um clique — e tudo nativo do navegador, sem
         biblioteca nenhuma.
      */}
      <div className={s.nativo}>
        <span className={s.nLbl}>
          <Icon n="monitor" s={15} />
          Levar para fora
        </span>

        <button className="btn b-ghost sm" onClick={exportarCalendario}>
          <Icon n="agenda" s={15} />
          Google Calendar / Outlook
        </button>

        <button className="btn b-ghost sm" onClick={exportarPlanilha}>
          <Icon n="baixar" s={15} />
          Excel
        </button>

        <button className="btn b-ghost sm" onClick={imprimir}>
          <Icon n="doc" s={15} />
          Imprimir a pauta
        </button>

        <em className={s.nNota}>
          O .ics já vai com <b>alarme</b>: prazo avisa 1 dia antes, audiência 2 horas.
        </em>
      </div>

      {/* ⚠️ O AVISO QUE PROTEGE ELE — e a nós */}
      <div className="nota gold">
        <Icon n="alerta" s={19} />
        <p>
          {aba === 'prazos' ? (
            <>
              <b>Prazos detectados automaticamente.</b> Confira e valide cada um — a
              responsabilidade pela contagem é do advogado. O SOSC JUS não substitui
              a conferência nos autos.
            </>
          ) : (
            <>
              <b>Audiências detectadas nos andamentos.</b> Confira data, hora e local
              nos autos — a responsabilidade é do advogado.
            </>
          )}
        </p>
      </div>

      {erro ? (
        <div className={s.erro}>
          <Icon n="alerta" s={17} />
          <span>{erro}</span>
        </div>
      ) : null}

      {/* ═══ ✋ CRIAR NA MÃO ═══ */}
      {novo ? (
        <section className={`card ${s.novo}`}>
          <div className="card-h">
            <h2>
              <Icon n="mais" s={18} strokeWidth={2.2} />
              {aba === 'prazos' ? 'Novo prazo' : 'Nova audiência'}
              <span className={s.gratis}>Grátis</span>
            </h2>
            <button className={s.x} onClick={() => setNovo(false)} aria-label="Fechar">
              <Icon n="x" s={17} strokeWidth={2.4} />
            </button>
          </div>

          <div className="card-b">
            <p className={s.novoTxt}>
              <b>Você sabe melhor que a máquina.</b> Se você viu o prazo nos autos ou
              ficou sabendo da audiência, cadastre aqui. Não custa nada — ninguém foi
              ao tribunal buscar.
            </p>

            <div className={s.form}>
              <label className="fld">
                <span>Processo (CNJ)</span>
                <input
                  value={cnj}
                  onChange={(e) => setCnj(e.target.value)}
                  placeholder="0000000-00.0000.0.00.0000"
                  disabled={ocupado}
                />
              </label>

              <label className="fld">
                <span>{aba === 'prazos' ? 'Tipo do prazo' : 'Tipo da audiência'}</span>
                <input
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  placeholder={
                    aba === 'prazos' ? 'Ex.: Memoriais' : 'Ex.: Audiência de instrução'
                  }
                  disabled={ocupado}
                />
              </label>

              <label className="fld">
                <span>{aba === 'prazos' ? 'Vence em' : 'Data'}</span>
                <input
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  disabled={ocupado}
                />
              </label>

              {aba === 'audiencias' ? (
                <>
                  <label className="fld">
                    <span>Hora</span>
                    <input
                      type="time"
                      value={hora}
                      onChange={(e) => setHora(e.target.value)}
                      disabled={ocupado}
                    />
                  </label>
                  <label className="fld">
                    <span>Local</span>
                    <input
                      value={local}
                      onChange={(e) => setLocal(e.target.value)}
                      placeholder="Ex.: 2ª Vara Criminal · Sala 3"
                      disabled={ocupado}
                    />
                  </label>
                </>
              ) : null}
            </div>

            <button className="btn b-lime full" onClick={() => void criar()} disabled={ocupado}>
              {ocupado ? <span className="spin" /> : <Icon n="ok" s={17} strokeWidth={2.4} />}
              {aba === 'prazos' ? 'Criar prazo' : 'Criar audiência'}
            </button>
          </div>
        </section>
      ) : null}

      {/* ═══ 📅 O CALENDÁRIO — o mês inteiro numa tela ═══ */}
      {visao === 'mes' ? (
        <div className={s.cal}>
          <Calendario itens={doCalendario} />
        </div>
      ) : aba === 'prazos' ? (
        <>
          {vencidos > 0 || hoje > 0 ? (
            <div className={s.alarme}>
              <Icon n="alerta" s={20} />
              <p>
                {vencidos > 0 ? (
                  <>
                    <b>
                      {vencidos} {vencidos === 1 ? 'prazo VENCEU' : 'prazos VENCERAM'}
                    </b>
                    {hoje > 0 ? ` e ${hoje} vence${hoje > 1 ? 'm' : ''} hoje.` : '.'}
                  </>
                ) : (
                  <b>
                    {hoje} {hoje === 1 ? 'prazo vence HOJE' : 'prazos vencem HOJE'}.
                  </b>
                )}
              </p>
            </div>
          ) : null}

          <div className={s.lista}>
            {pz.length === 0 ? (
              <div className={`card ${s.vazio}`}>
                <Icon n="relogio" s={32} />
                <p>Nenhum prazo cadastrado.</p>
                <small>
                  Sincronize para buscar nas movimentações, ou crie um na mão.
                </small>
              </div>
            ) : (
              pz.map((p, i) => (
                <Link
                  key={p.id ?? i}
                  href={`/processos/${encodeURIComponent(p.numeroProcesso ?? '')}`}
                  className={`card ${s.item} ${p.d < 0 ? s.venceu : p.d <= 2 ? s.urgente : ''}`}
                >
                  <span className={s.dias}>
                    <b className="num">{p.d < 0 ? 'X' : p.d}</b>
                    <small>{p.d < 0 ? 'venceu' : p.d === 1 ? 'dia' : 'dias'}</small>
                  </span>

                  <div className={s.ic}>
                    <strong>{p.tipo ?? 'Prazo'}</strong>
                    <small>
                      {p.cliente ?? '—'}
                      {p.baseLegal ? ` · ${p.baseLegal}` : ''}
                    </small>
                    <em className="num">{p.numeroProcesso}</em>
                  </div>

                  <div className={s.quando}>
                    <b className="num">{dataBR(p.dataFim)}</b>
                    {p.validado ? (
                      <span className={s.ok}>
                        <Icon n="ok" s={12} strokeWidth={3} />
                        validado
                      </span>
                    ) : (
                      <span className={s.confira}>confira nos autos</span>
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>
        </>
      ) : (
        /* ═══ 📅 AUDIÊNCIAS ═══ */
        <div className={s.lista}>
          {au.length === 0 ? (
            <div className={`card ${s.vazio}`}>
              <Icon n="agenda" s={32} />
              <p>Nenhuma audiência cadastrada.</p>
              <small>Sincronize para buscar nos andamentos, ou crie uma na mão.</small>
            </div>
          ) : (
            au.map((a, i) => {
              const d = dias(a.data);
              return (
                <Link
                  key={a.id ?? i}
                  href={`/processos/${encodeURIComponent(a.numeroProcesso ?? '')}`}
                  className={`card ${s.item} ${d < 0 ? s.passou : d <= 3 ? s.urgente : ''}`}
                >
                  <span className={`${s.dias} ${s.dAud}`}>
                    <b className="num">{dataBR(a.data).slice(0, 5)}</b>
                    <small>{horaBR(a.data) || '—'}</small>
                  </span>

                  <div className={s.ic}>
                    <strong>{a.tipo ?? 'Audiência'}</strong>
                    <small>
                      {a.cliente ?? '—'}
                      {a.local ? ` · ${a.local}` : ''}
                    </small>
                    <em className="num">{a.numeroProcesso}</em>
                  </div>

                  <div className={s.quando}>
                    {d < 0 ? (
                      <span className={s.passouTxt}>já passou</span>
                    ) : d === 0 ? (
                      <b className={s.hoje}>HOJE</b>
                    ) : (
                      <b className="num">em {d}d</b>
                    )}
                  </div>
                </Link>
              );
            })
          )}
        </div>
      )}

      <Gastar
        chave={gastar}
        saldo={saldo}
        onConfirmar={() => void sincronizar()}
        onCancelar={() => setGastar(null)}
        onRecarregar={() => {
          setGastar(null);
          router.push('/tokens');
        }}
      />
    </>
  );
}

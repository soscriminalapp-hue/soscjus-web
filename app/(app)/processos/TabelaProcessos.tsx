'use client';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  A TABELA — 284 processos, organizados
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  ⚠️ ISTO É O QUE A TELA GRANDE PERMITE. E o celular não.
 *
 *    · FILTRAR por classe — e as classes têm COR
 *    · ORDENAR — mais recente, que moveu, prazo próximo
 *    · BUSCAR — nome, cliente, número
 *    · VER 284 de uma vez, sem rolar até a morte
 *
 *  ⚡ E o HABEAS CORPUS tem filtro PRÓPRIO.
 *
 *     Um homem preso pode ter 5 HCs — TJ, TJ, STJ, STJ, STF.
 *     Se eles ficam soltos no meio de 89 processos criminais,
 *     O ADVOGADO PERDE O FIO.
 *
 *     Clique em "Habeas Corpus" e veja TODOS — agrupados pela ORIGEM.
 */

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  CLASSES,
  classificarTodas,
  corDe,
  degrau,
  statusHC,
  COR_STATUS,
  ROTULO_STATUS,
  type Cor,
} from '@/lib/classes';
import Icon from '@/components/Icon';
import Diamante from '@/components/Diamante';
import s from './processos.module.css';

interface Proc {
  numero_processo?: string;
  cnj?: string;
  classe?: string;
  assunto?: string;
  tribunal?: string;
  varaComarca?: string;
  status?: string;
  cliente?: string;
  poloAtivo?: string;
  poloPassivo?: string;
  ultima_mov?: string;
  ultimaMov?: string;
  ultimaMovData?: string;
  monitorado?: boolean;
  temNovidade?: boolean;
  conexoDe?: string | null;
  dataDistribuicao?: string;
}

type Ordem = 'recente' | 'antigo' | 'moveu' | 'cliente';

const ORDENS: Array<{ id: Ordem; rotulo: string }> = [
  { id: 'moveu', rotulo: 'Que moveu' },
  { id: 'recente', rotulo: 'Mais recente' },
  { id: 'antigo', rotulo: 'Mais antigo' },
  { id: 'cliente', rotulo: 'Por cliente' },
];

function cnjDe(p: Proc) {
  return p.numero_processo ?? p.cnj ?? '';
}
function movDe(p: Proc) {
  return p.ultima_mov ?? p.ultimaMov ?? '';
}
function quando(v?: string) {
  if (!v) return '—';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '—';
  const dias = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (dias === 0) return 'hoje';
  if (dias === 1) return 'ontem';
  if (dias < 30) return `${dias} dias`;
  if (dias < 365) return `${Math.floor(dias / 30)} meses`;
  return `${Math.floor(dias / 365)} anos`;
}

export default function TabelaProcessos({
  processos,
  saldo,
  ilimitado,
}: {
  processos: Proc[];
  saldo: number;
  ilimitado: boolean;
}) {
  const [filtro, setFiltro] = useState<Cor | 'todos'>('todos');
  const [ordem, setOrdem] = useState<Ordem>('moveu');
  const [busca, setBusca] = useState('');

  /* ─── classifica cada um ─── */
  const comClasse = useMemo(
    () =>
      processos.map((p) => ({
        ...p,
        classes: classificarTodas(p.classe, p.assunto),
      })),
    [processos],
  );

  /* ─── quantos de cada ─── */
  const contagem = useMemo(() => {
    const c: Record<string, number> = { todos: comClasse.length };
    for (const p of comClasse) {
      for (const k of p.classes) c[k] = (c[k] ?? 0) + 1;
    }
    return c;
  }, [comClasse]);

  /* ─── filtra + busca + ordena ─── */
  const lista = useMemo(() => {
    let L = comClasse;

    if (filtro !== 'todos') {
      L = L.filter((p) => p.classes.includes(filtro));
    }

    const q = busca.trim().toLowerCase();
    if (q) {
      L = L.filter((p) =>
        [
          cnjDe(p),
          p.cliente,
          p.classe,
          p.assunto,
          p.poloAtivo,
          p.poloPassivo,
          p.varaComarca,
        ]
          .filter(Boolean)
          .some((x) => String(x).toLowerCase().includes(q)),
      );
    }

    const D = (p: Proc) =>
      new Date(p.ultimaMovData ?? p.dataDistribuicao ?? 0).getTime();

    return [...L].sort((a, b) => {
      switch (ordem) {
        case 'moveu':
          // ⚠️ O que moveu vem PRIMEIRO. É o que ele precisa ver.
          if (a.temNovidade !== b.temNovidade) return a.temNovidade ? -1 : 1;
          return D(b) - D(a);
        case 'recente':
          return D(b) - D(a);
        case 'antigo':
          return D(a) - D(b);
        case 'cliente':
          return String(a.cliente ?? '').localeCompare(String(b.cliente ?? ''));
      }
    });
  }, [comClasse, filtro, busca, ordem]);

  /* ─── ⚡ HABEAS CORPUS: agrupa pela ORIGEM ─── */
  const grupoHC = useMemo(() => {
    if (filtro !== 'hc') return null;

    const porOrigem = new Map<string, typeof lista>();
    for (const p of lista) {
      // conexoDe = o processo de origem. Se não tem, ele é órfão.
      const chave = p.conexoDe ?? '__sem_origem__';
      const g = porOrigem.get(chave) ?? [];
      g.push(p);
      porOrigem.set(chave, g);
    }

    // ordena cada grupo pela ESCADA: TJ → STJ → STF
    for (const [, g] of porOrigem) {
      g.sort((a, b) => {
        const da = degrau(a.tribunal);
        const db = degrau(b.tribunal);
        const P: Record<string, number> = { STF: 5, STJ: 4, TST: 4, TRF: 3, TJ: 2, '?': 1 };
        return (P[db] ?? 0) - (P[da] ?? 0);
      });
    }
    return porOrigem;
  }, [lista, filtro]);

  const monitorados = comClasse.filter((p) => p.monitorado).length;
  const moveram = comClasse.filter((p) => p.temNovidade).length;

  return (
    <>
      {/* ═══ O RESUMO ═══ */}
      <div className={s.resumo}>
        <div className={s.numero}>
          <strong>{processos.length}</strong>
          <span>processos</span>
        </div>
        <div className={s.divisor} />
        <div className={s.numero}>
          <strong className={s.lime}>{monitorados}</strong>
          <span>acompanhados</span>
        </div>
        {moveram > 0 ? (
          <>
            <div className={s.divisor} />
            <div className={s.numero}>
              <strong className={s.piscando}>{moveram}</strong>
              <span>moveram</span>
            </div>
          </>
        ) : null}
      </div>

      {/* ═══ 🔍 BUSCA + ORDEM ═══ */}
      <div className={s.controles}>
        <label className={s.busca}>
          <Icon n="busca" s={18} />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, cliente ou número do processo…"
          />
          {busca ? (
            <button onClick={() => setBusca('')} aria-label="Limpar">
              <Icon n="x" s={16} strokeWidth={2.4} />
            </button>
          ) : null}
        </label>

        <div className={s.ordem}>
          <span className={s.ordemLbl}>Ordenar</span>
          {ORDENS.map((o) => (
            <button
              key={o.id}
              className={`${s.ordemBtn} ${ordem === o.id ? s.ordemOn : ''}`}
              onClick={() => setOrdem(o.id)}
            >
              {o.rotulo}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ 🎨 OS FILTROS — cada classe com a SUA cor ═══ */}
      <div className={s.filtros}>
        <button
          className={`${s.chip} ${filtro === 'todos' ? s.chipOn : ''}`}
          onClick={() => setFiltro('todos')}
        >
          Todos
          <b>{contagem.todos ?? 0}</b>
        </button>

        {CLASSES.filter((c) => (contagem[c.id] ?? 0) > 0).map((c) => (
          <button
            key={c.id}
            className={`${s.chip} ${filtro === c.id ? s.chipOn : ''} ${c.transversal ? s.chipTrans : ''}`}
            onClick={() => setFiltro(c.id)}
            style={
              filtro === c.id
                ? { borderColor: c.cor, background: c.fundo, color: c.cor }
                : { borderLeftColor: c.cor }
            }
            title={c.oQueE}
          >
            {c.id === 'hc' ? <span className={s.raio}>⚡</span> : null}
            {c.rotulo}
            <b>{contagem[c.id]}</b>
          </button>
        ))}
      </div>

      {/* ⚠️ A EXPLICAÇÃO — a tela grande PERMITE explicar. Use isso. */}
      {filtro !== 'todos' ? (
        <p className={s.explica}>
          <span
            className={s.explicaBarra}
            style={{ background: corDe(filtro as Cor).cor }}
          />
          {corDe(filtro as Cor).oQueE}
        </p>
      ) : null}

      {/* ═══ ⚡ HABEAS CORPUS — agrupado pela ORIGEM ═══ */}
      {grupoHC ? (
        <div className={s.hcWrap}>
          {[...grupoHC.entries()].map(([origem, hcs]) => (
            <section key={origem} className={s.hcGrupo}>
              <header className={s.hcTopo}>
                {origem === '__sem_origem__' ? (
                  <div className={s.hcSemOrigem}>
                    <Icon n="alerta" s={16} />
                    <span>
                      <b>{hcs.length} sem processo de origem.</b> Vincule para
                      acompanhar a escada TJ → STJ → STF.
                    </span>
                  </div>
                ) : (
                  <Link
                    href={`/processos/${encodeURIComponent(origem)}`}
                    className={s.hcOrigem}
                  >
                    <Icon n="processo" s={17} />
                    <div>
                      <span className={s.hcOrigemEb}>PROCESSO DE ORIGEM</span>
                      <strong>{origem}</strong>
                    </div>
                    <b className={s.hcCount}>{hcs.length} HC</b>
                  </Link>
                )}
              </header>

              {/* ⚠️ A ESCADA: TJ → STJ → STF */}
              <div className={s.hcEscada}>
                {hcs.map((p) => {
                  const d = degrau(p.tribunal);
                  const st = statusHC(movDe(p));
                  return (
                    <Link
                      key={cnjDe(p)}
                      href={`/processos/${encodeURIComponent(cnjDe(p))}`}
                      className={s.hcItem}
                    >
                      <span className={s.hcDegrau}>{d}</span>
                      <div className={s.hcCorpo}>
                        <strong>{cnjDe(p)}</strong>
                        <small>{movDe(p) || 'sem movimentação'}</small>
                      </div>
                      <span
                        className={s.hcStatus}
                        style={{
                          color: COR_STATUS[st],
                          borderColor: COR_STATUS[st] + '55',
                          background: COR_STATUS[st] + '12',
                        }}
                      >
                        {ROTULO_STATUS[st]}
                      </span>
                      <span className={s.hcQuando}>{quando(p.ultimaMovData)}</span>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      ) : (
        /* ═══ A TABELA ═══ */
        <div className={s.tabela}>
          <div className={s.cabecalho}>
            <span />
            <span>Processo</span>
            <span>Cliente</span>
            <span>Classe</span>
            <span>Última movimentação</span>
            <span>Quando</span>
            <span />
          </div>

          {lista.length === 0 ? (
            <div className={s.vazio}>
              <Icon n="busca" s={32} />
              <p>Nenhum processo encontrado.</p>
              {busca ? (
                <button className="btn b-ghost sm" onClick={() => setBusca('')}>
                  Limpar a busca
                </button>
              ) : null}
            </div>
          ) : (
            lista.map((p) => {
              const c = corDe(p.classes[0]);
              return (
                <Link
                  key={cnjDe(p)}
                  href={`/processos/${encodeURIComponent(cnjDe(p))}`}
                  className={`${s.linha} ${p.temNovidade ? s.linhaNova : ''}`}
                  style={{ borderLeftColor: c.cor }}
                >
                  {/* o ponto: moveu? acompanha? */}
                  <span className={s.dot}>
                    {p.temNovidade ? (
                      <i className={s.dotNovo} title="Moveu" />
                    ) : p.monitorado ? (
                      <i className={s.dotAtivo} title="Acompanhando" />
                    ) : (
                      <i className={s.dotOff} />
                    )}
                  </span>

                  <span className={s.cnj}>{cnjDe(p)}</span>

                  <span className={s.cliente}>
                    {p.cliente ?? p.poloPassivo ?? '—'}
                  </span>

                  <span className={s.classes}>
                    {p.classes.slice(0, 2).map((k) => {
                      const cc = corDe(k);
                      return (
                        <em
                          key={k}
                          className={s.tag}
                          style={{
                            color: cc.cor,
                            background: cc.fundo,
                            borderColor: cc.cor + '44',
                          }}
                        >
                          {k === 'hc' ? '⚡ ' : ''}
                          {cc.rotulo}
                        </em>
                      );
                    })}
                  </span>

                  <span className={s.mov}>{movDe(p) || '—'}</span>

                  <span className={s.quando}>{quando(p.ultimaMovData)}</span>

                  <span className={s.acao}>
                    {p.monitorado ? (
                      <em className={s.ativo}>
                        <Icon n="ok" s={13} strokeWidth={2.6} />
                        Ativo
                      </em>
                    ) : (
                      <em className={s.acompanhar}>
                        <Diamante s={12} />
                        20
                      </em>
                    )}
                  </span>
                </Link>
              );
            })
          )}
        </div>
      )}

      <p className={s.rodape}>
        <Icon n="lock" s={14} />
        Esta lista já está salva. <b>Abrir não custa nada.</b> Sincronizar de novo
        custa 20 tokens — e é um botão, não um efeito colateral.
      </p>
    </>
  );
}

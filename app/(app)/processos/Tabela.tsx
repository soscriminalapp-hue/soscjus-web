'use client';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  A TABELA — 284 processos, organizados
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  ⚠️ ISTO É O QUE A TELA GRANDE PERMITE. E o celular não.
 *
 *    · FILTRAR por classe — e cada classe tem COR
 *    · ORDENAR — que moveu, mais recente, prazo
 *    · BUSCAR — nome, cliente, número
 *    · VER 284 de uma vez, sem rolar até a morte
 *
 *  ⚠️ E o advogado NÃO busca por "área". Ele busca por O QUE VAI FAZER HOJE.
 *     "Hoje eu vou trabalhar nos recursos" é um dia de trabalho real.
 *     "Hoje eu vou olhar os HCs" é um dia de trabalho real.
 *
 *     Por isso RECURSO e HABEAS CORPUS têm filtro PRÓPRIO — mesmo
 *     atravessando todas as áreas.
 */

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CLASSES, classificarTodas, corDe, type Cor } from '@/lib/classes';
import { sosc, ApiError } from '@/lib/api';
import { exportarExcel, imprimir, hoje as hojeStr } from '@/lib/nativo';
import Icon from '@/components/Icon';
import Token from '@/components/Token';
import Gastar from '@/components/Gastar';
import s from './processos.module.css';

interface Proc {
  numero_processo?: string;
  cnj?: string;
  classe?: string;
  assunto?: string;
  cliente?: string;
  poloPassivo?: string;
  ultima_mov?: string;
  ultimaMov?: string;
  ultimaMovData?: string;
  monitorado?: boolean;
  temNovidade?: boolean;
  segredoJustica?: boolean;
}

type Ordem = 'moveu' | 'recente' | 'antigo' | 'cliente';

const ORDENS: Array<{ id: Ordem; rotulo: string }> = [
  { id: 'moveu', rotulo: 'Que moveu' },
  { id: 'recente', rotulo: 'Mais recente' },
  { id: 'antigo', rotulo: 'Mais antigo' },
  { id: 'cliente', rotulo: 'Por cliente' },
];

const cnjDe = (p: Proc) => p.numero_processo ?? p.cnj ?? '';
const movDe = (p: Proc) => p.ultima_mov ?? p.ultimaMov ?? '';

function quando(v?: string) {
  if (!v) return '—';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '—';
  const dias = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (dias === 0) return 'hoje';
  if (dias === 1) return 'ontem';
  if (dias < 30) return `${dias}d`;
  if (dias < 365) return `${Math.floor(dias / 30)} mes`;
  return `${Math.floor(dias / 365)}a`;
}

export default function Tabela({ processos, saldo }: { processos: Proc[]; saldo: number }) {
  const router = useRouter();
  const [filtro, setFiltro] = useState<Cor | 'todos'>('todos');
  const [ordem, setOrdem] = useState<Ordem>('moveu');
  const [busca, setBusca] = useState('');

  /** o modal de gasto: qual ferramenta? */
  const [gastar, setGastar] = useState<'ATUALIZACAO_NACIONAL' | 'CADASTRO_MANUAL' | null>(null);
  const [cadastro, setCadastro] = useState(false);
  const [cnjNovo, setCnjNovo] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState('');

  const comClasse = useMemo(
    () => processos.map((p) => ({ ...p, classes: classificarTodas(p.classe, p.assunto) })),
    [processos],
  );

  const contagem = useMemo(() => {
    const c: Record<string, number> = { todos: comClasse.length };
    for (const p of comClasse) for (const k of p.classes) c[k] = (c[k] ?? 0) + 1;
    return c;
  }, [comClasse]);

  const lista = useMemo(() => {
    let L = comClasse;

    if (filtro !== 'todos') L = L.filter((p) => p.classes.includes(filtro));

    const q = busca.trim().toLowerCase();
    if (q) {
      L = L.filter((p) =>
        [cnjDe(p), p.cliente, p.classe, p.assunto, p.poloPassivo]
          .filter(Boolean)
          .some((x) => String(x).toLowerCase().includes(q)),
      );
    }

    const D = (p: Proc) => new Date(p.ultimaMovData ?? 0).getTime();

    return [...L].sort((a, b) => {
      switch (ordem) {
        case 'moveu':
          // ⚠️ o que moveu vem PRIMEIRO — é o que ele precisa ver
          if (a.temNovidade !== b.temNovidade) return a.temNovidade ? -1 : 1;
          return D(b) - D(a);
        case 'recente': return D(b) - D(a);
        case 'antigo':  return D(a) - D(b);
        case 'cliente': return String(a.cliente ?? '').localeCompare(String(b.cliente ?? ''));
      }
    });
  }, [comClasse, filtro, busca, ordem]);

  const monitorados = comClasse.filter((p) => p.monitorado).length;
  const moveram = comClasse.filter((p) => p.temNovidade).length;

  /**
   * ═══ 📊 EXPORTAR PARA EXCEL ═══
   *
   * ⚠️ ELE TEM 284 PROCESSOS. No celular, exportar isso não existe.
   *
   *    Aqui ele filtra (só os criminais, só os que moveram), ordena, e
   *    exporta — para a secretária, para o contador, para o relatório
   *    do escritório.
   *
   *    E exporta O QUE ESTÁ NA TELA: se filtrou por HC, sai só os HCs.
   */
  function exportar() {
    exportarExcel(
      `processos-soscjus-${hojeStr()}`,
      ['Processo', 'Cliente', 'Classe', 'Última movimentação', 'Data', 'Acompanhando', 'Segredo'],
      lista.map((p) => [
        cnjDe(p),
        p.cliente ?? p.poloPassivo ?? '',
        p.classes.map((k) => corDe(k).rotulo).join(' / '),
        movDe(p),
        p.ultimaMovData ? new Date(p.ultimaMovData).toLocaleDateString('pt-BR') : '',
        p.monitorado ? 'Sim' : 'Não',
        p.segredoJustica ? 'Sim' : 'Não',
      ]),
    );
  }

  /** 🇧🇷 Sincronizar — varre a OAB dele de novo, em todos os tribunais. */
  async function sincronizar() {
    setGastar(null);
    setOcupado(true);
    setErro('');
    try {
      await sosc.post('/processos/meus-processos', {});
      router.refresh();
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : 'A sincronização falhou.');
    } finally {
      setOcupado(false);
    }
  }

  /**
   * 🔒 Cadastrar manualmente — o processo em SEGREDO DE JUSTIÇA.
   *
   * ⚠️ Ele não aparece na busca automática por OAB. Mas o advogado SABE o
   *    número (tem os autos). Ele digita, e o Escavador varre naquele
   *    momento: traz TUDO que conseguir — capa, movimentações, o que estiver
   *    publicado no Diário.
   *
   *    Se o advogado foi buscar o número, AQUELE PROCESSO IMPORTA.
   */
  async function cadastrarManual() {
    const so = cnjNovo.replace(/\D/g, '');
    if (so.length !== 20) {
      setErro('O número CNJ tem 20 dígitos.');
      return;
    }
    setGastar(null);
    setOcupado(true);
    setErro('');
    try {
      await sosc.post('/processos/meus-processos/manual', { numero: so });
      setCadastro(false);
      setCnjNovo('');
      router.refresh();
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : 'Não foi possível cadastrar.');
    } finally {
      setOcupado(false);
    }
  }

  return (
    <>
      {/* ═══ O RESUMO ═══ */}
      <header className={s.topo}>
        <div className={s.resumo}>
          <div className={s.n}>
            <strong className="num">{processos.length}</strong>
            <span>processos</span>
          </div>
          <div className={s.sep} />
          <div className={s.n}>
            <strong className={`num ${s.lime}`}>{monitorados}</strong>
            <span>acompanhados</span>
          </div>
          {moveram > 0 ? (
            <>
              <div className={s.sep} />
              <div className={s.n}>
                <strong className={`num ${s.piscando}`}>{moveram}</strong>
                <span>moveram</span>
              </div>
            </>
          ) : null}
        </div>

        <div className={s.acoes}>
          {/* 💻 O QUE SÓ O COMPUTADOR FAZ — exporta o que está na tela */}
          <button
            className="btn b-ghost"
            onClick={exportar}
            title="Exporta o que está filtrado na tela"
            disabled={lista.length === 0}
          >
            <Icon n="baixar" s={17} strokeWidth={2.1} />
            Excel
          </button>

          <button className="btn b-ghost" onClick={imprimir} title="Imprimir a lista">
            <Icon n="doc" s={17} strokeWidth={2.1} />
            Imprimir
          </button>

          {/* 🔒 o processo em segredo de justiça */}
          <button className="btn b-ghost" onClick={() => setCadastro(true)} disabled={ocupado}>
            <Icon n="mais" s={17} strokeWidth={2.2} />
            Cadastrar processo
          </button>

          {/* 🇧🇷 sincronizar — é um BOTÃO, não um efeito colateral */}
          <button
            className="btn b-gold"
            onClick={() => setGastar('ATUALIZACAO_NACIONAL')}
            disabled={ocupado}
          >
            {ocupado ? <span className="spin" /> : <Icon n="sync" s={17} strokeWidth={2.1} />}
            Sincronizar
            <span className={s.btnPreco}>
              <Token n={10_000} claro mini />
            </span>
          </button>
        </div>
      </header>

      {erro ? (
        <div className={s.erro}>
          <Icon n="alerta" s={17} />
          <span>{erro}</span>
        </div>
      ) : null}

      {/* ═══ 🔒 CADASTRAR — SEGREDO DE JUSTIÇA ═══ */}
      {cadastro ? (
        <section className={`card ${s.cadastro}`}>
          <div className="card-h">
            <h2>
              <Icon n="segredo" s={18} />
              Cadastrar processo manualmente
            </h2>
            <button className={s.x} onClick={() => setCadastro(false)} aria-label="Fechar">
              <Icon n="x" s={17} strokeWidth={2.4} />
            </button>
          </div>
          <div className="card-b">
            <p className={s.cadTxt}>
              <b>Para processos em segredo de justiça</b> — eles não aparecem na busca
              automática pela sua OAB. Se você tem os autos e sabe o número, digite
              aqui.
            </p>

            <label className="fld">
              <span>Número CNJ</span>
              <input
                value={cnjNovo}
                onChange={(e) => setCnjNovo(e.target.value)}
                placeholder="0000000-00.0000.0.00.0000"
                disabled={ocupado}
              />
            </label>

            <div className="nota gold">
              <Icon n="lock" s={17} />
              <p>
                O Escavador varre o processo <b>naquele momento</b> e traz tudo que
                conseguir: capa, partes e movimentações. Em segredo de justiça, vem o
                que for <b>publicado no Diário Oficial</b> — o inteiro teor você lê no
                PJe, com seu token da OAB.
              </p>
            </div>

            <button
              className="btn b-gold full"
              onClick={() => setGastar('CADASTRO_MANUAL')}
              disabled={ocupado || cnjNovo.replace(/\D/g, '').length !== 20}
            >
              {ocupado ? <span className="spin" /> : <Icon n="busca" s={17} strokeWidth={2.1} />}
              Cadastrar e buscar
              <span className={s.btnPreco}>
                <Token n={10_000} claro mini />
              </span>
            </button>
          </div>
        </section>
      ) : null}

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
              <Icon n="x" s={15} strokeWidth={2.4} />
            </button>
          ) : null}
        </label>

        <div className={s.ordem}>
          {ORDENS.map((o) => (
            <button
              key={o.id}
              className={`${s.oBtn} ${ordem === o.id ? s.oOn : ''}`}
              onClick={() => setOrdem(o.id)}
            >
              {o.rotulo}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ 🎨 OS FILTROS — cada classe com A SUA cor ═══ */}
      <div className={s.filtros}>
        <button
          className={`${s.chip} ${filtro === 'todos' ? s.chipOn : ''}`}
          onClick={() => setFiltro('todos')}
        >
          Todos <b>{contagem.todos ?? 0}</b>
        </button>

        {CLASSES.filter((c) => (contagem[c.id] ?? 0) > 0).map((c) => (
          <button
            key={c.id}
            className={`${s.chip} ${filtro === c.id ? s.chipOn : ''} ${c.transversal ? s.trans : ''}`}
            onClick={() => setFiltro(c.id)}
            style={
              filtro === c.id
                ? { borderColor: c.cor, background: c.fundo, color: c.cor }
                : { borderLeftColor: c.cor }
            }
            title={c.oQueE}
          >
            {c.id === 'hc' ? <span>⚡</span> : null}
            {c.rotulo}
            <b>{contagem[c.id]}</b>
          </button>
        ))}
      </div>

      {/* ⚠️ A EXPLICAÇÃO — a tela grande PERMITE explicar. Use isso. */}
      {filtro !== 'todos' ? (
        <p className={s.explica}>
          <span className={s.barra} style={{ background: corDe(filtro as Cor).cor }} />
          {corDe(filtro as Cor).oQueE}
        </p>
      ) : null}

      {/* ═══ A TABELA ═══ */}
      <div className={s.tabela}>
        <div className={s.cab}>
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
            <Icon n="busca" s={30} />
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
                className={`${s.linha} ${p.temNovidade ? s.nova : ''}`}
                style={{ borderLeftColor: c.cor }}
              >
                <span className={s.dot}>
                  {p.temNovidade ? (
                    <i className={s.dNovo} title="Moveu" />
                  ) : p.monitorado ? (
                    <i className={s.dAtivo} title="Acompanhando" />
                  ) : (
                    <i className={s.dOff} />
                  )}
                </span>

                <span className={`num ${s.cnj}`}>
                  {p.segredoJustica ? (
                    <em className={s.segredo} title="Segredo de justiça">
                      <Icon n="segredo" s={12} strokeWidth={2.2} />
                    </em>
                  ) : null}
                  {cnjDe(p)}
                </span>

                <span className={s.cli}>{p.cliente ?? p.poloPassivo ?? '—'}</span>

                <span className={s.tags}>
                  {p.classes.slice(0, 2).map((k) => {
                    const cc = corDe(k);
                    return (
                      <em
                        key={k}
                        style={{ color: cc.cor, background: cc.fundo, borderColor: cc.cor + '44' }}
                      >
                        {k === 'hc' ? '⚡ ' : ''}
                        {cc.rotulo}
                      </em>
                    );
                  })}
                </span>

                <span className={s.mov}>{movDe(p) || '—'}</span>
                <span className={`num ${s.quando}`}>{quando(p.ultimaMovData)}</span>

                <span className={s.acao}>
                  {p.monitorado ? (
                    <em className={s.ativo}>
                      <Icon n="ok" s={13} strokeWidth={2.6} />
                      Ativo
                    </em>
                  ) : (
                    <Icon n="chev" s={15} className={s.seta} />
                  )}
                </span>
              </Link>
            );
          })
        )}
      </div>

      <p className={s.rodape}>
        <Icon n="lock" s={14} />
        Esta lista já está salva. <b>Abrir não custa nada.</b> Sincronizar de novo
        varre a sua OAB em todos os tribunais — e por isso usa tokens.
      </p>

      {/* ⚠️ O modal mostra o que SOBRA, não o que sai */}
      <Gastar
        chave={gastar}
        saldo={saldo}
        onConfirmar={() => {
          if (gastar === 'ATUALIZACAO_NACIONAL') void sincronizar();
          else void cadastrarManual();
        }}
        onCancelar={() => setGastar(null)}
        onRecarregar={() => {
          setGastar(null);
          router.push('/tokens');
        }}
      />
    </>
  );
}

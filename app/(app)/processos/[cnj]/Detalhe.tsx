'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { sosc, ApiError } from '@/lib/api';
import { classificarTodas, corDe } from '@/lib/classes';
import Icon from '@/components/Icon';
import Token, { Gratis } from '@/components/Token';
import Gastar from '@/components/Gastar';
import type { Feature } from '@/lib/creditos';
import s from './detalhe.module.css';

interface Mov { data?: string; descricao?: string; tipo?: string; temTeor?: boolean }
interface Parte { nome?: string; polo?: string; tipo?: string }
interface Capa {
  numero_processo?: string; cnj?: string;
  classe?: string; assunto?: string;
  tribunal?: string; varaComarca?: string; vara?: string; comarca?: string;
  juiz?: string; valorCausa?: number; dataDistribuicao?: string; status?: string;
  segredoJustica?: boolean; monitorado?: boolean; temNovidade?: boolean;
  relatorioDisponivel?: boolean;
  cliente?: string; clientUserId?: string;
  movimentacoes?: Mov[]; partes?: Parte[];
  poloAtivo?: string; poloPassivo?: string;
}

const MAX_PECA = 8 * 1024 * 1024; // 8 MB

function dataBR(v?: string) {
  if (!v) return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('pt-BR');
}

/** ⚠️ Atos DECISÓRIOS — o que uma autoridade assinou. Separa ato de ruído. */
function ehAto(m: Mov) {
  const t = `${m.tipo ?? ''} ${m.descricao ?? ''}`;
  return (
    m.temTeor ||
    /senten|decis|despach|parecer|ac[oó]rd|den[uú]ncia|liminar|absolv|conden|arquiv/i.test(t)
  );
}

export default function Detalhe({
  cnj,
  capa,
  saldo,
}: {
  cnj: string;
  capa: Capa;
  saldo: number;
}) {
  const router = useRouter();
  const arquivo = useRef<HTMLInputElement>(null);

  const [gastar, setGastar] = useState<Feature | null>(null);
  const [ocupado, setOcupado] = useState('');
  const [erro, setErro] = useState('');
  const [ok, setOk] = useState('');
  const [conexo, setConexo] = useState(false);
  const [cnjConexo, setCnjConexo] = useState('');
  const [soAtos, setSoAtos] = useState(false);

  const movs = capa.movimentacoes ?? [];
  const vistas = soAtos ? movs.filter(ehAto) : movs;
  const classes = classificarTodas(capa.classe, capa.assunto);
  const c1 = corDe(classes[0]);

  /* ═══ 🪙 ACOMPANHAR — 10.000 tokens, cobrado todo mês ═══ */
  async function acompanhar() {
    setGastar(null);
    setOcupado('acompanhar');
    setErro('');
    try {
      await sosc.post(`/processos/${encodeURIComponent(cnj)}/monitorar`, { ativo: true });
      setOk('Acompanhamento ativado. Você é avisado quando o tribunal publicar.');
      router.refresh();
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : 'Não foi possível ativar.');
    } finally {
      setOcupado('');
    }
  }

  async function desacompanhar() {
    setOcupado('acompanhar');
    try {
      await sosc.post(`/processos/${encodeURIComponent(cnj)}/monitorar`, { ativo: false });
      router.refresh();
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : 'Não foi possível desativar.');
    } finally {
      setOcupado('');
    }
  }

  /* ═══ 🪙 RELATÓRIO — 3.000 tokens ═══ */
  async function relatorio() {
    setGastar(null);
    setOcupado('relatorio');
    setErro('');
    try {
      await sosc.post(`/processos/${encodeURIComponent(cnj)}/relatorio`, {});
      setOk('Relatório gerado. Ele está em Relatórios.');
      router.refresh();
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : 'Não foi possível gerar.');
    } finally {
      setOcupado('');
    }
  }

  /**
   * ═══ 🟢 ANEXAR PEÇA — GRÁTIS ═══
   *
   * ⚠️ ORGANIZAR NÃO CUSTA. Ele sobe o PDF, a IA lê o documento.
   *    Ninguém foi ao tribunal buscar nada — não há custo de API externa.
   */
  async function anexarPeca(f: File) {
    if (f.size > MAX_PECA) {
      setErro('O arquivo passa de 8 MB.');
      return;
    }
    setOcupado('peca');
    setErro('');
    try {
      const b64 = await new Promise<string>((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(String(r.result).split(',')[1]);
        r.onerror = () => rej(new Error('leitura falhou'));
        r.readAsDataURL(f);
      });

      await sosc.post(`/processos/${encodeURIComponent(cnj)}/pecas/extrair`, {
        nome: f.name,
        mimeType: f.type || 'application/pdf',
        base64: b64,
      });

      setOk('Peça anexada. A IA já leu o documento.');
      router.refresh();
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : 'Não foi possível anexar.');
    } finally {
      setOcupado('');
      if (arquivo.current) arquivo.current.value = '';
    }
  }

  /**
   * ═══ 🪙 ANEXAR CONEXO — 10.000 tokens ═══
   *
   * ⚠️ AQUI O ESCAVADOR VAI BUSCAR. Por isso custa.
   *    Já existe um processo — ele vincula OUTRO processo a ele.
   */
  async function anexarConexo() {
    const so = cnjConexo.replace(/\D/g, '');
    if (so.length !== 20) {
      setErro('O CNJ do conexo tem 20 dígitos.');
      return;
    }
    setGastar(null);
    setOcupado('conexo');
    setErro('');
    try {
      await sosc.post('/processos/manual', {
        clientUserId: capa.clientUserId ?? '',
        numero: so,
        conexoDe: cnj,
      });
      setConexo(false);
      setCnjConexo('');
      setOk('Processo conexo anexado.');
      router.refresh();
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : 'Não foi possível anexar.');
    } finally {
      setOcupado('');
    }
  }

  return (
    <>
      {/* ═══ O CABEÇALHO ═══ */}
      <header className={s.topo}>
        <Link href="/processos" className={s.voltar}>
          <Icon n="chev" s={16} strokeWidth={2.4} style={{ transform: 'rotate(180deg)' }} />
          Meus Processos
        </Link>

        <div className={s.tit}>
          <div className={s.tags}>
            {classes.map((k) => {
              const c = corDe(k);
              return (
                <em key={k} style={{ color: c.cor, background: c.fundo, borderColor: c.cor + '44' }}>
                  {k === 'hc' ? '⚡ ' : ''}
                  {c.rotulo}
                </em>
              );
            })}
            {capa.segredoJustica ? (
              <em className={s.segredo}>
                <Icon n="segredo" s={12} strokeWidth={2.2} />
                Segredo de justiça
              </em>
            ) : null}
            {capa.temNovidade ? <em className={s.novo}>Moveu</em> : null}
          </div>

          <h1 className="num">{capa.numero_processo ?? capa.cnj ?? cnj}</h1>
          <p>
            {capa.classe ?? 'Processo'}
            {capa.assunto ? ` · ${capa.assunto}` : ''}
          </p>
        </div>
      </header>

      {erro ? (
        <div className={s.erro}>
          <Icon n="alerta" s={17} />
          <span>{erro}</span>
        </div>
      ) : null}
      {ok ? (
        <div className={s.ok}>
          <Icon n="ok" s={17} strokeWidth={2.6} />
          <span>{ok}</span>
        </div>
      ) : null}

      {/* ═══ ⚠️ SEGREDO DE JUSTIÇA — o que vem, e o que não vem ═══ */}
      {capa.segredoJustica ? (
        <div className="nota gold">
          <Icon n="segredo" s={19} />
          <p>
            <b>Processo em segredo de justiça.</b> Aqui aparece o que for publicado no{' '}
            <b>Diário Oficial</b> — o Escavador acompanha. O <b>inteiro teor</b> você lê
            no PJe do tribunal de origem, com o seu token da OAB. Se quiser, baixe a peça
            e anexe aqui.
          </p>
        </div>
      ) : null}

      {/* ═══ AS DUAS COLUNAS — é isto que o celular não faz ═══ */}
      <div className={s.duas}>
        {/* ─────── ESQUERDA: a capa e a linha do tempo ─────── */}
        <div className={s.esq}>
          {/* A CAPA */}
          <section className="card">
            <div className="card-h">
              <h2>
                <Icon n="doc" s={18} />
                A capa
              </h2>
            </div>
            <div className="card-b">
              <dl className={s.capa}>
                {capa.tribunal ? (
                  <div><dt>Tribunal</dt><dd>{capa.tribunal}</dd></div>
                ) : null}
                {capa.varaComarca ?? capa.vara ? (
                  <div><dt>Vara / Comarca</dt><dd>{capa.varaComarca ?? capa.vara}</dd></div>
                ) : null}
                {capa.juiz ? <div><dt>Juiz</dt><dd>{capa.juiz}</dd></div> : null}
                {capa.dataDistribuicao ? (
                  <div><dt>Distribuição</dt><dd className="num">{dataBR(capa.dataDistribuicao)}</dd></div>
                ) : null}
                {capa.valorCausa ? (
                  <div>
                    <dt>Valor da causa</dt>
                    <dd className="num">
                      R$ {capa.valorCausa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </dd>
                  </div>
                ) : null}
                {capa.status ? <div><dt>Status</dt><dd>{capa.status}</dd></div> : null}
              </dl>

              {/* AS PARTES */}
              {(capa.partes?.length ?? 0) > 0 || capa.poloAtivo || capa.poloPassivo ? (
                <div className={s.partes}>
                  <h3>As partes</h3>
                  {capa.partes?.length ? (
                    capa.partes.map((p, i) => (
                      <div key={i} className={s.parte}>
                        <span className={s.polo}>{p.polo ?? p.tipo ?? '—'}</span>
                        <b>{p.nome}</b>
                      </div>
                    ))
                  ) : (
                    <>
                      {capa.poloAtivo ? (
                        <div className={s.parte}>
                          <span className={s.polo}>Ativo</span>
                          <b>{capa.poloAtivo}</b>
                        </div>
                      ) : null}
                      {capa.poloPassivo ? (
                        <div className={s.parte}>
                          <span className={s.polo}>Passivo</span>
                          <b>{capa.poloPassivo}</b>
                        </div>
                      ) : null}
                    </>
                  )}
                </div>
              ) : null}
            </div>
          </section>

          {/* A LINHA DO TEMPO */}
          <section className="card">
            <div className="card-h">
              <h2>
                <Icon n="atividade" s={18} />
                Movimentações
                <b className={s.pill}>{movs.length}</b>
              </h2>

              {/* ⚠️ ATOS DECISÓRIOS — separa o ato do ruído cartorário */}
              <button
                className={`${s.soAtos} ${soAtos ? s.soAtosOn : ''}`}
                onClick={() => setSoAtos((v) => !v)}
                title="Só o que uma autoridade assinou"
              >
                <Icon n="filtro" s={14} strokeWidth={2.2} />
                Só atos decisórios
              </button>
            </div>

            <div className="card-b flush">
              {vistas.length === 0 ? (
                <p className={s.vazio}>
                  {movs.length === 0
                    ? 'Nenhuma movimentação registrada.'
                    : 'Nenhum ato decisório entre as movimentações.'}
                </p>
              ) : (
                <ol className={s.tempo}>
                  {vistas.map((m, i) => (
                    <li key={i} className={ehAto(m) ? s.ato : ''}>
                      <span className={s.md}>
                        <i />
                        <b className="num">{dataBR(m.data)}</b>
                      </span>
                      <div className={s.mc}>
                        {m.tipo ? <strong>{m.tipo}</strong> : null}
                        <p>{m.descricao ?? '—'}</p>
                        {ehAto(m) ? (
                          <em className={s.seloAto}>
                            <Icon n="escudo" s={11} strokeWidth={2.4} />
                            ato decisório
                          </em>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </section>
        </div>

        {/* ─────── DIREITA: o que ele FAZ ─────── */}
        <aside className={s.dir}>
          {/* 🪙 ACOMPANHAR */}
          <section className={`card ${capa.monitorado ? s.ativo : ''}`}>
            <div className="card-b">
              {capa.monitorado ? (
                <>
                  <div className={s.ligado}>
                    <span className={s.pulso} />
                    <div>
                      <strong>Acompanhando</strong>
                      <small>Você é avisado quando o tribunal publicar.</small>
                    </div>
                  </div>
                  <button
                    className="btn b-ghost full sm"
                    onClick={() => void desacompanhar()}
                    disabled={ocupado === 'acompanhar'}
                  >
                    {ocupado === 'acompanhar' ? <span className="spin" /> : null}
                    Desativar
                  </button>
                </>
              ) : (
                <>
                  <h3 className={s.h3}>
                    <Icon n="escudo" s={18} />
                    Acompanhar este processo
                  </h3>
                  <p className={s.p}>
                    O tribunal publicou? Você é avisado — <b>sem precisar entrar aqui
                    para conferir</b>. Movimentações, prazos e audiências entram sozinhos.
                  </p>
                  <button
                    className="btn b-lime full"
                    onClick={() => setGastar('ACOMPANHAMENTO')}
                    disabled={ocupado === 'acompanhar'}
                  >
                    {ocupado === 'acompanhar' ? <span className="spin" /> : <Icon n="escudo" s={17} />}
                    Ativar
                    <span className={s.bp}>
                      <Token n={10_000} claro mini />
                    </span>
                  </button>
                  <p className={s.legenda}>Cobrado todo mês</p>
                </>
              )}
            </div>
          </section>

          {/* 🪙 RELATÓRIO */}
          <section className="card">
            <div className="card-b">
              <h3 className={s.h3}>
                <Icon n="relatorio" s={18} />
                Relatório do processo
              </h3>
              <p className={s.p}>
                O processo <b>explicado ao cliente</b>. Sem jargão, sem print de
                movimentação — como você falaria com ele.
              </p>
              <button
                className="btn b-gold full"
                onClick={() => setGastar('RELATORIO')}
                disabled={ocupado === 'relatorio'}
              >
                {ocupado === 'relatorio' ? <span className="spin" /> : <Icon n="ia" s={17} />}
                Gerar relatório
                <span className={s.bp}>
                  <Token n={3_000} claro mini />
                </span>
              </button>
            </div>
          </section>

          {/* 📎 ANEXAR — a peça (grátis) e o conexo (custa) */}
          <section className="card">
            <div className="card-h">
              <h2>
                <Icon n="anexo" s={18} />
                Anexar
              </h2>
            </div>
            <div className="card-b">
              {/* 🟢 A PEÇA — grátis. Organizar não custa. */}
              <button
                className={s.anexo}
                onClick={() => arquivo.current?.click()}
                disabled={ocupado === 'peca'}
              >
                <span className={`${s.aIc} ${s.aLime}`}>
                  {ocupado === 'peca' ? <span className="spin" /> : <Icon n="anexo" s={18} />}
                </span>
                <div>
                  <strong>Anexar peça</strong>
                  <small>Suba o PDF. A IA lê o documento.</small>
                </div>
                <Gratis mini />
              </button>
              <input
                ref={arquivo}
                type="file"
                accept="application/pdf,image/*"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void anexarPeca(f);
                }}
              />

              {/* 🪙 O CONEXO — o Escavador vai buscar. Por isso custa. */}
              {conexo ? (
                <div className={s.conexoForm}>
                  <label className="fld">
                    <span>CNJ do processo conexo</span>
                    <input
                      value={cnjConexo}
                      onChange={(e) => setCnjConexo(e.target.value)}
                      placeholder="0000000-00.0000.0.00.0000"
                      disabled={ocupado === 'conexo'}
                      autoFocus
                    />
                  </label>
                  <div className={s.cfBtn}>
                    <button className="btn b-ghost sm" onClick={() => setConexo(false)}>
                      Cancelar
                    </button>
                    <button
                      className="btn b-tech sm"
                      onClick={() => setGastar('ANEXAR_CONEXO')}
                      disabled={ocupado === 'conexo' || cnjConexo.replace(/\D/g, '').length !== 20}
                    >
                      {ocupado === 'conexo' ? <span className="spin" /> : null}
                      Anexar
                    </button>
                  </div>
                </div>
              ) : (
                <button className={s.anexo} onClick={() => setConexo(true)}>
                  <span className={`${s.aIc} ${s.aTech}`}>
                    <Icon n="link" s={18} />
                  </span>
                  <div>
                    <strong>Anexar processo conexo</strong>
                    <small>O Escavador busca e traz as movimentações dele.</small>
                  </div>
                  <Token n={10_000} mini />
                </button>
              )}
            </div>
          </section>

          {/* ⚖️ A PEÇA — FinaisJus */}
          <Link href={`/finaisjus?cnj=${encodeURIComponent(cnj)}`} className={`card ${s.atalho}`}>
            <span className={`${s.aIc} ${s.aTech}`}>
              <Icon n="balanca" s={20} />
            </span>
            <div>
              <strong>Gerar a peça</strong>
              <small>O PDF e o vídeo da audiência viram alegações finais.</small>
            </div>
            <Icon n="chev" s={17} className={s.seta} />
          </Link>
        </aside>
      </div>

      <Gastar
        chave={gastar}
        saldo={saldo}
        onConfirmar={() => {
          if (gastar === 'ACOMPANHAMENTO') void acompanhar();
          else if (gastar === 'RELATORIO') void relatorio();
          else if (gastar === 'ANEXAR_CONEXO') void anexarConexo();
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

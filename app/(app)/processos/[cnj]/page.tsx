/**
 * A CAPA DO PROCESSO — o coração da estação.
 *
 * ═══════════════════════════════════════════════════════════════════════
 *  O QUE ESTA TELA MOSTRA (e o que já foi pago por isso)
 * ═══════════════════════════════════════════════════════════════════════
 *
 *  A capa e as movimentações vieram nos R$ 4,50 da busca por OAB/CPF —
 *  já estão salvas no banco. Ler de novo custa ZERO.
 *
 *  ⚠️ Esta tela NÃO re-sincroniza. Se chamasse /meus-processos?fonte=refresh,
 *     queimaria R$ 4,50 a cada abertura.
 *
 *  O que custa é:
 *    · Acompanhar o processo → R$ 9,90/mês (Escavador avisa por webhook)
 *    · Gerar relatório       → grátis no pacote · R$ 2,90 avulso
 * ═══════════════════════════════════════════════════════════════════════
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { buscarSosc } from '@/lib/proxy';
import { sessaoAtual } from '@/lib/session';
import { quemAssinou, ROTULO, PESO, type Autoridade } from '@/lib/tipos';
import Icon from '@/components/Icon';
import Acompanhar from './Acompanhar';
import GerarRelatorio from './GerarRelatorio';
import s from './capa.module.css';

export const dynamic = 'force-dynamic';

interface Mov {
  data?: string;
  descricao?: string;
  texto?: string;
  tipo?: string;
  temTeor?: boolean;
  assinante?: string | null;
  cargo?: string | null;
}
/**
 * ⚠️ ESTA INTERFACE ESPELHA `GET /processos/:cnj/salvo` — snake_case, como o
 *    backend devolve. NÃO invente campos: se não está aqui, não vem.
 *
 * O backend NÃO tem tabela de partes (`envolvidos`). Ele guarda `poloAtivo` e
 * `poloPassivo` como TEXTO. É isso que a capa mostra.
 */
interface Proc {
  numero_processo?: string;
  classe?: string | null;
  area?: string | null;
  tribunal?: string | null;
  comarca?: string | null;
  varaComarca?: string | null;
  instancia?: string | null;
  status?: string | null;
  papel?: string | null;
  /** TEXTO, não lista. */
  polo_ativo?: string | null;
  polo_passivo?: string | null;
  assunto?: string | null;
  valor_causa?: string | null;
  data_distribuicao?: string | null;
  segredo_justica?: boolean;
  ultima_movimentacao?: string | null;
  movimentacoes?: Mov[];

  /* ── B268: os 4 campos do PATCH_salvo.md ── */
  monitorado?: boolean;
  temNovidade?: boolean;
  arquivado?: boolean;
  /** O relatório deste processo veio no pacote e ainda não foi usado? */
  relatorioDisponivel?: boolean;
}

function dt(v?: string | null) {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime())
    ? v
    : d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default async function Capa({ params }: { params: { cnj: string } }) {
  const cnj = decodeURIComponent(params.cnj);
  const ses = await sessaoAtual();

  // ⚠️ Lê o que JÁ ESTÁ SALVO. NÃO re-sincroniza — isso queimaria R$ 4,50.
  const [p, sal] = await Promise.all([
    buscarSosc<Proc>(`/processos/${encodeURIComponent(cnj)}/salvo`),
    buscarSosc<{ saldo?: { total?: number | null; ilimitado?: boolean } }>(
      '/creditos/saldo',
    ),
  ]);

  if (!p.ok || !p.data) notFound();
  const proc = p.data;

  const ilimitado = sal.data?.saldo?.ilimitado ?? false;
  const saldo = ilimitado ? Infinity : (sal.data?.saldo?.total ?? 0);

  /* ─── ATOS DECISÓRIOS: o que uma autoridade assinou ───
     É isto que separa ato de ruído cartorário. */
  const movs = proc.movimentacoes ?? [];
  const atos = movs
    .filter((m) => m.temTeor || m.assinante || /senten|decis|despach|parecer|ac[oó]rd|certid|den[uú]ncia/i.test(m.tipo ?? m.descricao ?? ''))
    .map((m) => ({
      ...m,
      autoridade: quemAssinou(m.tipo ?? m.descricao ?? '', m.cargo),
    }))
    .filter((m) => m.autoridade !== 'OUTRO')
    .sort((a, b) => PESO[b.autoridade] - PESO[a.autoridade])
    .slice(0, 8);

  /** ⚠️ O backend guarda os polos como TEXTO, não como lista de partes. */
  const poloAtivo = proc.polo_ativo?.trim() || null;
  const poloPassivo = proc.polo_passivo?.trim() || null;
  const temPartes = Boolean(poloAtivo || poloPassivo);

  return (
    <>
      <Link href="/processos" className={s.voltar}>
        <Icon n="chev" s={16} style={{ transform: 'rotate(180deg)' }} />
        Meus Processos
      </Link>

      {/* ═══════════ CAPA ═══════════ */}
      <div className={s.capa}>
        <div className={s.capaTopo}>
          <div className={s.tags}>
            {proc.area ? (
              <span className={`${s.tag} ${/crim/i.test(proc.area) ? s.crim : s.civ}`}>
                {proc.area}
              </span>
            ) : null}
            {proc.arquivado ? <span className={`${s.tag} ${s.arq}`}>ARQUIVADO</span> : null}
            {proc.segredo_justica ? (
              <span className={`${s.tag} ${s.sigilo}`}>
                <Icon n="lock" s={12} strokeWidth={2.4} />
                SEGREDO DE JUSTIÇA
              </span>
            ) : null}
            {proc.temNovidade ? <span className={`${s.tag} ${s.novo}`}>MOVIMENTOU</span> : null}
          </div>

          <span className={s.cnj}>{proc.numero_processo ?? cnj}</span>
          <h1>{proc.classe ?? 'Classe não informada'}</h1>
          {proc.assunto ? <p className={s.assunto}>{proc.assunto}</p> : null}
        </div>

        {/* dados da capa — tudo que o Escavador deu nos R$ 4,50 */}
        <dl className={s.dados}>
          <div>
            <dt>Tribunal</dt>
            <dd>{proc.tribunal ?? '—'}</dd>
          </div>
          <div>
            <dt>Vara / Órgão julgador</dt>
            <dd>{proc.varaComarca ?? proc.comarca ?? '—'}</dd>
          </div>
          <div>
            <dt>Distribuído em</dt>
            <dd className={s.mono}>{dt(proc.data_distribuicao) ?? '—'}</dd>
          </div>
          <div>
            <dt>Valor da causa</dt>
            <dd className={s.mono}>{proc.valor_causa ?? '—'}</dd>
          </div>
          <div>
            <dt>Situação</dt>
            <dd className={proc.arquivado ? s.arqTxt : s.ativoTxt}>
              {proc.status ?? 'ATIVO'}
            </dd>
          </div>
          <div>
            <dt>Movimentações</dt>
            <dd className={s.mono}>{movs.length}</dd>
          </div>
        </dl>
      </div>

      {/* ═══════════ PARTES ═══════════ */}
      {temPartes ? (
        <div className="card">
          <div className="card-h">
            <h2>Partes do processo</h2>
            {proc.papel ? <span className={s.n}>{proc.papel}</span> : null}
          </div>
          <div className={s.polos}>
            <div>
              <span className={s.poloTit}>Polo ativo</span>
              {poloAtivo ? (
                <div className={s.parte}>
                  <strong>{poloAtivo}</strong>
                </div>
              ) : (
                <p className={s.semParte}>Não informado</p>
              )}
            </div>
            <div className={s.divisor} />
            <div>
              <span className={`${s.poloTit} ${s.poloPassivo}`}>Polo passivo</span>
              {poloPassivo ? (
                <div className={s.parte}>
                  <strong>{poloPassivo}</strong>
                </div>
              ) : (
                <p className={s.semParte}>Não informado</p>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* ═══════════ ACOMPANHAR + RELATÓRIO ═══════════ */}
      <div className={s.duas}>
        <Acompanhar
          cnj={cnj}
          monitorado={Boolean(proc.monitorado)}
          saldo={saldo}
          ilimitado={ilimitado}
        />
        <GerarRelatorio
          cnj={cnj}
          incluso={Boolean(proc.relatorioDisponivel) || ilimitado}
          saldo={saldo}
        />
      </div>

      {/* ═══════════ ATOS DECISÓRIOS ═══════════ */}
      {atos.length > 0 ? (
        <div className="card">
          <div className="card-h">
            <h2>Atos decisórios</h2>
            <span className={s.n}>{atos.length}</span>
          </div>
          <div className="card-b flush">
            {atos.map((a, i) => (
              <div key={i} className={s.ato}>
                <div className={`${s.selo} ${s[a.autoridade.toLowerCase()]}`}>
                  <Icon
                    n={
                      a.autoridade === 'PROMOTOR'
                        ? 'balanca'
                        : a.autoridade === 'DELEGADO'
                          ? 'escudo'
                          : a.autoridade === 'ESCRIVAO'
                            ? 'doc'
                            : 'oab'
                    }
                    s={18}
                  />
                </div>
                <div className={s.atoCorpo}>
                  <div className={s.atoTags}>
                    <span className={s[`t${a.autoridade.toLowerCase()}`]}>
                      {ROTULO[a.autoridade]}
                    </span>
                    {a.assinante ? <small>{a.assinante}</small> : null}
                    <em>{dt(a.data)}</em>
                  </div>
                  <strong>{a.tipo ?? 'Ato processual'}</strong>
                  <p>{a.descricao ?? a.texto ?? ''}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="nota">
            <Icon n="lock" s={20} />
            <p>
              <b>Por que só estes aparecem aqui.</b> Um processo tem centenas de
              movimentações, e a maioria é cartorária — juntada, conclusos, remessa.
              O que muda o rumo é o que uma autoridade <b>assinou</b>: sentença,
              decisão, parecer, certidão. É isto que está acima.
            </p>
          </div>
        </div>
      ) : null}

      {/* ═══════════ LINHA DO TEMPO ═══════════ */}
      <div className="card">
        <div className="card-h">
          <h2>Todas as movimentações</h2>
          <span className={s.n}>{movs.length}</span>
        </div>
        <div className="card-b flush">
          {movs.length === 0 ? (
            <div className={s.vazio}>
              <Icon n="atividade" s={34} />
              <p>Nenhuma movimentação registrada até agora.</p>
            </div>
          ) : (
            movs.slice(0, 60).map((m, i) => {
              const aut = quemAssinou(m.tipo ?? m.descricao ?? '', m.cargo);
              const decisorio = aut !== 'OUTRO';
              return (
                <div key={i} className={`${s.mov} ${decisorio ? s.movAto : ''}`}>
                  <div className={s.movData}>
                    <span className={s.mono}>{dt(m.data) ?? '—'}</span>
                    {decisorio ? (
                      <b className={s[`t${aut.toLowerCase()}`]}>{ROTULO[aut]}</b>
                    ) : null}
                  </div>
                  <p>{m.descricao ?? m.texto ?? '—'}</p>
                </div>
              );
            })
          )}
          {movs.length > 60 ? (
            <div className={s.maisMov}>
              Mostrando as 60 mais recentes de {movs.length}.
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}

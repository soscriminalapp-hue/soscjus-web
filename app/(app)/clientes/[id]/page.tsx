import Link from 'next/link';
import { notFound } from 'next/navigation';
import { buscarSosc } from '@/lib/proxy';
import { classificarTodas, corDe } from '@/lib/classes';
import Icon from '@/components/Icon';
import Token from '@/components/Token';
import s from './ficha.module.css';

export const dynamic = 'force-dynamic';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  👤 A FICHA DO CLIENTE — tudo dele, num lugar só
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  ⚠️ ISTO É O QUE A TELA GRANDE FAZ MELHOR.
 *
 *  No celular, ele abre o cliente, vê o nome, e precisa navegar pra ver os
 *  processos. Depois volta, e navega de novo pra ver a cobrança.
 *
 *  Aqui: os processos, os honorários, os documentos e o chat — TUDO junto.
 *
 *  ⚠️ E as CONSULTAS aparecem aqui com o CPF JÁ PREENCHIDO. Ele não redigita.
 */

interface Cliente {
  id: string;
  fullName?: string;
  email?: string;
  phone?: string;
  cpf?: string;
  createdAt?: string;
}
interface Proc {
  numero_processo?: string;
  cnj?: string;
  classe?: string;
  assunto?: string;
  ultima_mov?: string;
  monitorado?: boolean;
  temNovidade?: boolean;
  /** É dele como titular, ou ele é advogado de confiança? */
  titular?: boolean;
}
interface Cobranca {
  id: string;
  amount?: number;
  description?: string;
  status?: string;
  paidAt?: string;
  dueDate?: string;
}

const reais = (n?: number) =>
  (n ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default async function Ficha({ params }: { params: { id: string } }) {
  const [c, p, h] = await Promise.all([
    buscarSosc<Cliente>(`/clients/${params.id}`),
    buscarSosc<{ processos?: Proc[]; resultados?: Proc[] }>(
      `/clients/${params.id}/processos`,
    ),
    buscarSosc<{ charges?: Cobranca[] }>('/honorarios/charges'),
  ]);

  if (!c.ok || !c.data) notFound();
  const cli = c.data;

  const processos = p.data?.processos ?? p.data?.resultados ?? [];
  const cobrancas = (h.data?.charges ?? []).filter(
    (x) => (x as { clientId?: string }).clientId === params.id,
  );

  const emAberto = cobrancas
    .filter((x) => !(x.status === 'PAID' || x.paidAt))
    .reduce((t, x) => t + (x.amount ?? 0), 0);

  const moveram = processos.filter((x) => x.temNovidade).length;
  const cpfLimpo = (cli.cpf ?? '').replace(/\D/g, '');

  return (
    <>
      <Link href="/clientes" className={s.voltar}>
        <Icon n="chev" s={16} strokeWidth={2.4} style={{ transform: 'rotate(180deg)' }} />
        Meus Clientes
      </Link>

      {/* ═══ QUEM ELE É ═══ */}
      <header className={`card ${s.topo}`}>
        <span className={s.avatar}>
          {(cli.fullName ?? '?')
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((x) => x[0])
            .join('')
            .toUpperCase()}
        </span>

        <div className={s.quem}>
          <h1>{cli.fullName ?? 'Cliente'}</h1>
          <div className={s.dados}>
            {cli.cpf ? (
              <span>
                <Icon n="oab" s={14} />
                <b className="num">{cli.cpf}</b>
              </span>
            ) : null}
            {cli.phone ? (
              <span>
                <Icon n="celular" s={14} />
                {cli.phone}
              </span>
            ) : null}
            {cli.email ? (
              <span>
                <Icon n="doc" s={14} />
                {cli.email}
              </span>
            ) : null}
          </div>
        </div>

        <div className={s.numeros}>
          <div>
            <strong className="num">{processos.length}</strong>
            <small>processos</small>
          </div>
          {moveram > 0 ? (
            <div>
              <strong className={`num ${s.lime}`}>{moveram}</strong>
              <small>moveram</small>
            </div>
          ) : null}
          {emAberto > 0 ? (
            <div>
              <strong className={s.gold}>{reais(emAberto)}</strong>
              <small>em aberto</small>
            </div>
          ) : null}
        </div>

        {cli.phone ? (
          <a
            href={`https://wa.me/55${cli.phone.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`btn ${s.wa}`}
          >
            <Icon n="wa" s={17} />
            WhatsApp
          </a>
        ) : null}
      </header>

      <div className={s.duas}>
        {/* ─────── ESQUERDA: os processos ─────── */}
        <section className="card">
          <div className="card-h">
            <h2>
              <Icon n="processo" s={18} />
              Os processos dele
            </h2>
          </div>

          <div className="card-b flush">
            {processos.length === 0 ? (
              <p className={s.vazio}>Nenhum processo vinculado a este cliente.</p>
            ) : (
              processos.map((x, i) => {
                const cnj = x.numero_processo ?? x.cnj ?? '';
                const cor = corDe(classificarTodas(x.classe, x.assunto)[0]);
                return (
                  <Link
                    key={i}
                    href={`/processos/${encodeURIComponent(cnj)}`}
                    className={s.proc}
                    style={{ borderLeftColor: cor.cor }}
                  >
                    <span className={s.pd}>
                      {x.temNovidade ? (
                        <i className={s.novo} title="Moveu" />
                      ) : x.monitorado ? (
                        <i className={s.ativo} title="Acompanhando" />
                      ) : (
                        <i className={s.off} />
                      )}
                    </span>

                    <div className={s.pi}>
                      <strong className="num">{cnj}</strong>
                      <small>{x.classe ?? '—'}</small>
                    </div>

                    <em
                      className={s.tag}
                      style={{ color: cor.cor, background: cor.fundo, borderColor: cor.cor + '44' }}
                    >
                      {cor.rotulo}
                    </em>

                    {x.titular === false ? (
                      <span className={s.confianca} title="Você é advogado de confiança">
                        confiança
                      </span>
                    ) : null}
                  </Link>
                );
              })
            )}
          </div>
        </section>

        {/* ─────── DIREITA: o que ele FAZ com este cliente ─────── */}
        <aside className={s.dir}>
          {/* 🔍 AS CONSULTAS — com o CPF JÁ PREENCHIDO */}
          {cpfLimpo ? (
            <section className={`card ${s.consultas}`}>
              <div className="card-h">
                <h2>
                  <Icon n="busca" s={17} />
                  Consultar esta pessoa
                </h2>
              </div>
              <div className="card-b">
                <p className={s.cTxt}>
                  O CPF dele já vai preenchido — você não redigita.
                </p>

                <Link
                  href={`/consultas/processual?cpf=${cpfLimpo}`}
                  className={s.cItem}
                >
                  <span className={`${s.cIc} ${s.cGold}`}>
                    <Icon n="busca" s={17} />
                  </span>
                  <div>
                    <strong>Consulta Processual</strong>
                    <small>Até 200 processos dele, em qualquer tribunal.</small>
                  </div>
                  <Token n={10_000} mini />
                </Link>

                <Link href={`/consultas/mandado?cpf=${cpfLimpo}`} className={s.cItem}>
                  <span className={`${s.cIc} ${s.cRisk}`}>
                    <Icon n="alerta" s={17} />
                  </span>
                  <div>
                    <strong>Consulta de Mandado</strong>
                    <small>Existe mandado em aberto contra ele?</small>
                  </div>
                  <Token n={10_000} mini />
                </Link>

                <Link href={`/consultas/cadastral?cpf=${cpfLimpo}`} className={s.cItem}>
                  <span className={`${s.cIc} ${s.cGold}`}>
                    <Icon n="oab" s={17} />
                  </span>
                  <div>
                    <strong>Consulta Cadastral</strong>
                    <small>Ficha, antecedentes e mandado — num relatório só.</small>
                  </div>
                  <Token n={10_000} mini />
                </Link>
              </div>
            </section>
          ) : null}

          {/* 💰 OS HONORÁRIOS */}
          <section className="card">
            <div className="card-h">
              <h2>
                <Icon n="dinheiro" s={17} />
                Honorários
              </h2>
              <Link href="/honorarios" className={s.ver}>
                Cobrar <Icon n="chev" s={12} strokeWidth={2.4} />
              </Link>
            </div>
            <div className="card-b flush">
              {cobrancas.length === 0 ? (
                <p className={s.vazio}>Nenhuma cobrança.</p>
              ) : (
                cobrancas.slice(0, 4).map((x) => {
                  const pago = x.status === 'PAID' || !!x.paidAt;
                  return (
                    <div key={x.id} className={s.cob}>
                      <div>
                        <strong>{x.description ?? 'Honorários'}</strong>
                        {x.dueDate ? (
                          <small className="num">
                            vence {new Date(x.dueDate).toLocaleDateString('pt-BR')}
                          </small>
                        ) : null}
                      </div>
                      <b className={`num ${pago ? s.pago : s.aberto}`}>{reais(x.amount)}</b>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* 📄 OS DOCUMENTOS */}
          <Link href="/documentos" className={`card ${s.atalho}`}>
            <span className={`${s.cIc} ${s.cGold}`}>
              <Icon n="doc" s={18} />
            </span>
            <div>
              <strong>Contrato e Procuração</strong>
              <small>Monte, imprima e mande para ele assinar.</small>
            </div>
            <Icon n="chev" s={16} className={s.seta} />
          </Link>
        </aside>
      </div>
    </>
  );
}

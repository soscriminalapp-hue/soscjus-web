/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  A ESTAÇÃO — a tela do dia
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  Ele liga o computador às 8h e abre isto. NÃO quer um menu.
 *  Quer saber SE ESTÁ EM PERIGO — e ONDE ESTÁ O PRÓXIMO CLIENTE.
 *
 *  ⚠️ A ORDEM É SAGRADA:
 *
 *    1. PROSPECÇÃO       📡 Plantão · 👤 Convidar
 *                        "Advogado sem cliente, pra que ferramenta?"
 *
 *    2. GESTÃO DO PROCESSO  🔴 Prazos · 📅 Audiências · ⚖️ Movimentações
 *                        "eu não perco prazo"
 *
 *    3. GESTÃO DO CLIENTE   👥 Clientes · 💰 Honorários
 *                        "eu recebo"
 *
 *  ⚠️ PRAZO E AUDIÊNCIA SÃO CARDS SEPARADOS.
 *     Motores diferentes: um conta dias, o outro marca compromisso.
 *
 *  ⚠️ NÃO PONHA "Chave PIX" NEM "Logomarca" AQUI.
 *     Isso é configuração — ele faz uma vez e esquece.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *  O CICLO QUE ESTA TELA SERVE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *      📡 PLANTÃO ──────► cliente NOVO
 *                              │
 *      👤 CONVIDAR ────► cliente que JÁ TEM
 *                              │
 *                              ▼
 *                    🎁 1ª busca grátis (custa R$ 4,50 ao dono)
 *                              │
 *                              ▼
 *                    ⚖️ 10 processos aparecem
 *                       (ele só sabia de 1)
 *                              │
 *                              ▼
 *                    🔗 vincula os que interessam  ← GRÁTIS
 *                              │
 *                              ▼
 *                    💎 acompanha (20/mês)         ← o alarme
 *                              │
 *                              ▼
 *                    💰 HONORÁRIO
 *
 *  Duas portas de entrada. Um funil só.
 */

import Link from 'next/link';
import { buscarSosc } from '@/lib/proxy';
import { sessaoAtual } from '@/lib/session';
import Icon from '@/components/Icon';
import Diamante from '@/components/Diamante';
import PainelPlantao from './PainelPlantao';
import s from './inicio.module.css';

export const dynamic = 'force-dynamic';

/* ─── o que o backend devolve ─── */
interface Prazo {
  id?: string;
  numeroProcesso?: string;
  cliente?: string;
  tipo?: string;
  dataFimEfetiva?: string;
  dataFim?: string;
  diasRestantes?: number;
  confianca?: 'ALTA' | 'MEDIA' | 'BAIXA' | null;
  base?: string;
}
interface Audiencia {
  id?: string;
  numeroProcesso?: string;
  cliente?: string;
  tipo?: string;
  data?: string;
  varaComarca?: string;
  linkVideo?: string | null;
}
interface Proc {
  numero_processo?: string;
  classe?: string;
  cliente?: string;
  ultima_mov?: string;
  temNovidade?: boolean;
  area?: string;
}
interface Cobranca {
  id?: string;
  amountCents?: number;
  status?: string;
  dueDate?: string;
  client?: { fullName?: string };
}

function saudacao(h: number) {
  return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
}
function primeiroNome(n: string) {
  return n.replace(/^Dr[aª]?\.?\s*/i, '').trim().split(/\s+/)[0] || 'Advogado';
}
function reais(c: number) {
  return (c / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}
function hora(v?: string) {
  if (!v) return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}
function ehHoje(v?: string) {
  if (!v) return false;
  const d = new Date(v);
  const h = new Date();
  return d.toDateString() === h.toDateString();
}

export default async function Inicio() {
  const ses = await sessaoAtual();
  const agora = new Date();

  const [prazosR, audsR, procsR, cobR, saldoR] = await Promise.all([
    buscarSosc<{ prazos?: Prazo[] }>('/processos/meus-prazos?dias=30'),
    buscarSosc<{ audiencias?: Audiencia[] }>('/processos/minhas-audiencias?dias=30'),
    buscarSosc<{ resultados?: Proc[] }>('/processos/meus-processos'),
    buscarSosc<{ charges?: Cobranca[] }>('/honorarios/charges'),
    buscarSosc<{ saldo?: { total?: number | null; ilimitado?: boolean } }>(
      '/creditos/saldo',
    ),
  ]);

  const prazos = (prazosR.data?.prazos ?? []).sort(
    (a, b) => (a.diasRestantes ?? 999) - (b.diasRestantes ?? 999),
  );
  const auds = (audsR.data?.audiencias ?? []).sort((a, b) =>
    String(a.data).localeCompare(String(b.data)),
  );
  const procs = procsR.data?.resultados ?? [];
  const cobrancas = cobR.data?.charges ?? [];

  /* ─── 🔴 O RISCO ─── */
  const vencidos = prazos.filter((p) => (p.diasRestantes ?? 99) < 0);
  const hoje = prazos.filter((p) => (p.diasRestantes ?? 99) === 0);
  const semana = prazos.filter(
    (p) => (p.diasRestantes ?? 99) > 0 && (p.diasRestantes ?? 99) <= 7,
  );
  const urgentes = [...vencidos, ...hoje, ...semana];

  /* ─── 📅 AUDIÊNCIA ─── */
  const audHoje = auds.filter((a) => ehHoje(a.data));
  const proxAud = auds.find((a) => !ehHoje(a.data));

  /* ─── ⚖️ O QUE MOVEU ─── */
  const moveram = procs.filter((p) => p.temNovidade);

  /* ─── 💰 O DINHEIRO ─── */
  const aReceber = cobrancas
    .filter((c) => c.status !== 'PAID' && c.status !== 'CANCELED')
    .reduce((t, c) => t + (c.amountCents ?? 0), 0);
  const vencidas = cobrancas.filter(
    (c) =>
      c.status !== 'PAID' &&
      c.status !== 'CANCELED' &&
      c.dueDate &&
      new Date(c.dueDate) < agora,
  ).length;

  const ilimitado = saldoR.data?.saldo?.ilimitado ?? false;
  const saldo = ilimitado ? Infinity : (saldoR.data?.saldo?.total ?? 0);

  return (
    <>
      {/* ═══════════ O CABEÇALHO ═══════════ */}
      <header className={s.topo}>
        <div>
          <span className={s.data}>
            {agora.toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </span>
          <h1>
            {saudacao(agora.getHours())},{' '}
            <em>{primeiroNome(ses?.nome ?? '')}.</em>
          </h1>
        </div>

        {urgentes.length > 0 ? (
          <div className={s.alarme}>
            <Icon n="alerta" s={22} />
            <div>
              <strong>{urgentes.length}</strong>
              <span>
                {urgentes.length === 1 ? 'prazo pede' : 'prazos pedem'} atenção
              </span>
            </div>
          </div>
        ) : (
          <div className={s.calmo}>
            <Icon n="ok" s={20} strokeWidth={2.4} />
            <span>Nenhum prazo urgente</span>
          </div>
        )}
      </header>

      {/* ═══════════════════════════════════════════════════════
          1️⃣  PROSPECÇÃO — "advogado sem cliente, pra que ferramenta?"
          ═══════════════════════════════════════════════════════ */}
      <PainelPlantao />

      {/* ═══════════════════════════════════════════════════════
          2️⃣  GESTÃO DO PROCESSO
          ⚠️ PRAZO e AUDIÊNCIA são CARDS SEPARADOS.
             Motores diferentes: um conta dias, o outro marca compromisso.
          ═══════════════════════════════════════════════════════ */}
      <div className={s.duasColunas}>
        {/* ─── 🔴 PRAZOS ─── */}
        <section className={`${s.painel} ${urgentes.length ? s.painelRisco : ''}`}>
          <header className={s.painelTopo}>
            <div className={s.painelTit}>
              <span className={`${s.pIc} ${s.icRisco}`}>
                <Icon n="relogio" s={20} />
              </span>
              <div>
                <h2>Prazos</h2>
                <small>Contagem legal · confira nos autos</small>
              </div>
            </div>
            <Link href="/agenda?t=prazos" className={s.verTudo}>
              {prazos.length} no total
              <Icon n="chev" s={14} strokeWidth={2.4} />
            </Link>
          </header>

          <div className={s.lista}>
            {urgentes.length === 0 ? (
              <div className={s.vazio}>
                <Icon n="ok" s={28} strokeWidth={2.2} />
                <p>Nenhum prazo nos próximos 7 dias.</p>
              </div>
            ) : (
              urgentes.slice(0, 5).map((p, i) => {
                const d = p.diasRestantes ?? 0;
                const venceu = d < 0;
                const eHoje = d === 0;
                return (
                  <Link
                    key={p.id ?? i}
                    href={`/processos/${encodeURIComponent(p.numeroProcesso ?? '')}`}
                    className={`${s.linha} ${venceu ? s.lVencido : eHoje ? s.lHoje : ''}`}
                  >
                    <div className={s.dias}>
                      <strong>{venceu ? Math.abs(d) : d}</strong>
                      <span>{venceu ? 'atrás' : eHoje ? 'HOJE' : 'dias'}</span>
                    </div>
                    <div className={s.lCorpo}>
                      <strong>{p.tipo ?? 'Prazo'}</strong>
                      <span>{p.cliente ?? p.numeroProcesso}</span>
                      {p.base ? <small>{p.base}</small> : null}
                    </div>
                    <Icon n="chev" s={16} className={s.seta} />
                  </Link>
                );
              })
            )}
          </div>
        </section>

        {/* ─── 📅 AUDIÊNCIAS ─── */}
        <section className={`${s.painel} ${audHoje.length ? s.painelHoje : ''}`}>
          <header className={s.painelTopo}>
            <div className={s.painelTit}>
              <span className={`${s.pIc} ${s.icTech}`}>
                <Icon n="agenda" s={20} />
              </span>
              <div>
                <h2>Audiências</h2>
                <small>Data, local e o link</small>
              </div>
            </div>
            <Link href="/agenda?t=audiencias" className={s.verTudo}>
              {auds.length} no total
              <Icon n="chev" s={14} strokeWidth={2.4} />
            </Link>
          </header>

          <div className={s.lista}>
            {audHoje.length === 0 && !proxAud ? (
              <div className={s.vazio}>
                <Icon n="agenda" s={28} />
                <p>Nenhuma audiência marcada.</p>
              </div>
            ) : (
              <>
                {audHoje.map((a, i) => (
                  <div key={a.id ?? i} className={`${s.linha} ${s.lHoje}`}>
                    <div className={s.horaBox}>
                      <strong>{hora(a.data)}</strong>
                      <span>HOJE</span>
                    </div>
                    <div className={s.lCorpo}>
                      <strong>{a.tipo ?? 'Audiência'}</strong>
                      <span>{a.cliente ?? a.numeroProcesso}</span>
                      <small>{a.varaComarca}</small>
                    </div>
                    {a.linkVideo ? (
                      <a
                        href={a.linkVideo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={s.btnVideo}
                      >
                        Entrar
                      </a>
                    ) : (
                      <Icon n="chev" s={16} className={s.seta} />
                    )}
                  </div>
                ))}

                {proxAud ? (
                  <Link
                    href={`/processos/${encodeURIComponent(proxAud.numeroProcesso ?? '')}`}
                    className={s.linha}
                  >
                    <div className={s.horaBox}>
                      <strong>
                        {proxAud.data
                          ? new Date(proxAud.data).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                            })
                          : '—'}
                      </strong>
                      <span>{hora(proxAud.data)}</span>
                    </div>
                    <div className={s.lCorpo}>
                      <strong>{proxAud.tipo ?? 'Audiência'}</strong>
                      <span>{proxAud.cliente ?? proxAud.numeroProcesso}</span>
                      <small>{proxAud.varaComarca}</small>
                    </div>
                    <Icon n="chev" s={16} className={s.seta} />
                  </Link>
                ) : null}
              </>
            )}
          </div>
        </section>
      </div>

      {/* ─── ⚖️ O QUE MOVEU ─── */}
      <section className={s.painel}>
        <header className={s.painelTopo}>
          <div className={s.painelTit}>
            <span className={`${s.pIc} ${s.icJur}`}>
              <Icon n="atividade" s={20} />
            </span>
            <div>
              <h2>
                O que moveu
                {moveram.length > 0 ? (
                  <b className={s.pisca}>{moveram.length}</b>
                ) : null}
              </h2>
              <small>Só os processos que você acompanha avisam</small>
            </div>
          </div>
          <Link href="/processos" className={s.verTudo}>
            {procs.length} processos
            <Icon n="chev" s={14} strokeWidth={2.4} />
          </Link>
        </header>

        <div className={s.lista}>
          {moveram.length === 0 ? (
            <div className={s.vazio}>
              <Icon n="atividade" s={28} />
              <p>Nada novo desde ontem.</p>
              <Link href="/processos" className={s.vazioLink}>
                Ver meus processos
              </Link>
            </div>
          ) : (
            moveram.slice(0, 6).map((p, i) => (
              <Link
                key={p.numero_processo ?? i}
                href={`/processos/${encodeURIComponent(p.numero_processo ?? '')}`}
                className={`${s.linha} ${s.lNovo}`}
              >
                <span className={s.bolinha} />
                <div className={s.lCorpo}>
                  <strong>{p.ultima_mov ?? 'Movimentação nova'}</strong>
                  <span>{p.cliente ?? p.classe}</span>
                  <small className={s.mono}>{p.numero_processo}</small>
                </div>
                <Icon n="chev" s={16} className={s.seta} />
              </Link>
            ))
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          3️⃣  GESTÃO DO CLIENTE — "eu recebo"
          ═══════════════════════════════════════════════════════ */}
      <div className={s.duasColunas}>
        {/* ─── 👤 CONVIDAR — a PROSPECÇÃO escondida ─── */}
        <section className={`${s.painel} ${s.painelConvite}`}>
          <header className={s.painelTopo}>
            <div className={s.painelTit}>
              <span className={`${s.pIc} ${s.icLime}`}>
                <Icon n="convite" s={20} />
              </span>
              <div>
                <h2>Convidar Cliente</h2>
                <small>
                  <b className={s.lime}>Cada convite é uma carteira que você não viu</b>
                </small>
              </div>
            </div>
          </header>

          <div className={s.convite}>
            <p>
              Quando ele entrar, o SOSC JUS busca <b>todos os processos dele</b> —
              inclusive os que <b>você não sabia que existiam</b>.
            </p>
            <p className={s.conviteArq}>
              <Icon n="ok" s={15} strokeWidth={2.6} />
              Até os <b>arquivados</b>: você pode pedir a baixa definitiva.
            </p>
            <div className={s.convitePe}>
              <span className={s.gratisSelo}>
                Grátis · a busca dele é por nossa conta
              </span>
              <Link href="/clientes?convidar=1" className="btn b-money">
                <Icon n="wa" s={18} strokeWidth={2.1} />
                Convidar pelo WhatsApp
              </Link>
            </div>
          </div>
        </section>

        {/* ─── 💰 O DINHEIRO ─── */}
        <section className={`${s.painel} ${vencidas ? s.painelRisco : ''}`}>
          <header className={s.painelTopo}>
            <div className={s.painelTit}>
              <span className={`${s.pIc} ${s.icMoney}`}>
                <Icon n="dinheiro" s={20} />
              </span>
              <div>
                <h2>A receber</h2>
                <small>O dinheiro vai direto pra sua conta</small>
              </div>
            </div>
            <Link href="/cobrancas" className={s.verTudo}>
              Ver todas
              <Icon n="chev" s={14} strokeWidth={2.4} />
            </Link>
          </header>

          <div className={s.dinheiro}>
            <div className={s.valor}>
              <small>Em aberto</small>
              <strong>R$ {reais(aReceber)}</strong>
            </div>
            {vencidas > 0 ? (
              <div className={s.vencidas}>
                <Icon n="alerta" s={16} />
                <span>
                  <b>{vencidas}</b>{' '}
                  {vencidas === 1 ? 'cobrança vencida' : 'cobranças vencidas'}
                </span>
              </div>
            ) : (
              <div className={s.emDia}>
                <Icon n="ok" s={16} strokeWidth={2.4} />
                <span>Nenhuma vencida</span>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ═══════════════════════════════════════════════════════
          🔍 AS CONSULTAS — ele vai aqui QUANDO PRECISA.
             Não estão na cara porque não são o dia a dia.
          ═══════════════════════════════════════════════════════ */}
      <section className={s.consultas}>
        <header className={s.consTopo}>
          <div>
            <h2>Consultar alguém</h2>
            <small>Chegou cliente novo? Comece por aqui.</small>
          </div>
          {!ilimitado ? (
            <span className={s.saldoInline}>
              <Diamante s={15} />
              <b>{saldo.toLocaleString('pt-BR')}</b>
              créditos
            </span>
          ) : null}
        </header>

        <div className={s.consGrade}>
          <Link href="/consultas?f=processual" className={`${s.cons} ${s.consJur}`}>
            <span className={s.consBandeira}>🇧🇷</span>
            <Icon n="balanca" s={26} />
            <strong>Consulta Processual SOSC</strong>
            <p>
              O <b>pente-fino</b>: até <b>200 processos</b> de uma pessoa, no Brasil
              inteiro. Por CPF ou CNPJ.
            </p>
            <span className={s.consPreco}>
              <Diamante s={13} />
              20
            </span>
          </Link>

          <Link href="/consultas?f=mandado" className={`${s.cons} ${s.consRisco}`}>
            <span className={s.consBandeira}>🇧🇷</span>
            <Icon n="alerta" s={26} />
            <strong>Consultar Mandado</strong>
            <p>
              Existe <b>mandado de prisão em aberto</b>? Consulta o BNMP/CNJ nacional,
              com comprovante.
            </p>
            <span className={s.consPreco}>
              <Diamante s={13} />
              20
            </span>
          </Link>

          <Link href="/consultas?f=cpf" className={`${s.cons} ${s.consJur}`}>
            <Icon n="busca" s={26} />
            <strong>Consultar CPF</strong>
            <p>
              <b>Ficha cadastral + antecedentes + mandado</b>, num relatório único.
              Busque por nome, CPF, celular ou e-mail.
            </p>
            <span className={s.consPreco}>
              <Diamante s={13} />
              20
            </span>
          </Link>

          <Link href="/consultas?f=veiculo" className={`${s.cons} ${s.consMente}`}>
            <Icon n="carro" s={26} />
            <strong>Consultar Veículo</strong>
            <p>
              <b>Pente-fino</b> pela placa: restrições (<b>RENAJUD</b>), FIPE,
              proprietário, roubo, leilão, chassi remarcado.
            </p>
            <span className={s.consPreco}>
              <Diamante s={13} />
              40
            </span>
          </Link>
        </div>
      </section>
    </>
  );
}

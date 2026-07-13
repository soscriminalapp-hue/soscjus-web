import Link from 'next/link';
import { buscarSosc } from '@/lib/proxy';
import { sessaoAtual } from '@/lib/session';
import Icon from '@/components/Icon';
import Token from '@/components/Token';
import Plantao from './Plantao';
import s from './inicio.module.css';

export const dynamic = 'force-dynamic';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  A HOME — na ordem do dia dele
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  ⚠️ A ORDEM NÃO É ESTÉTICA. É A ORDEM DA CABEÇA DELE AO ABRIR:
 *
 *   1. 🔴 O QUE VENCE     → prazo é o que tira o sono. Vem PRIMEIRO.
 *   2. ⚖️ O QUE MOVEU     → o tribunal publicou. Ele precisa saber.
 *   3. 📡 PLANTÃO         → a CONEXÃO com o usuário. O cliente NOVO.
 *   4. 👥 CLIENTE         → quem já é dele: honorário, contrato, chat.
 *
 *  Prazo e audiência são cards SEPARADOS — motores diferentes.
 *  Um conta dias. O outro marca compromisso. Nunca misture.
 */

interface Prazo {
  id?: string;
  tipo?: string;
  cliente?: string;
  numeroProcesso?: string;
  dataFim?: string;
  diasRestantes?: number;
}
interface Audiencia {
  id?: string;
  tipo?: string;
  cliente?: string;
  numeroProcesso?: string;
  data?: string;
  local?: string;
}
interface Proc {
  numero_processo?: string;
  cnj?: string;
  cliente?: string;
  classe?: string;
  ultima_mov?: string;
  ultimaMovData?: string;
  temNovidade?: boolean;
}

function dias(v?: string) {
  if (!v) return 99;
  return Math.ceil((new Date(v).getTime() - Date.now()) / 86400000);
}
function dataBR(v?: string) {
  if (!v) return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}
function horaBR(v?: string) {
  if (!v) return '';
  const d = new Date(v);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default async function Inicio() {
  const ses = await sessaoAtual();

  const [pz, au, pr, cl] = await Promise.all([
    buscarSosc<{ prazos?: Prazo[] }>('/processos/meus-prazos'),
    buscarSosc<{ audiencias?: Audiencia[] }>('/processos/minhas-audiencias'),
    buscarSosc<{ resultados?: Proc[]; processos?: Proc[] }>('/processos/meus-processos'),
    buscarSosc<{ clients?: unknown[] }>('/clients'),
  ]);

  const prazos = (pz.data?.prazos ?? [])
    .map((p) => ({ ...p, d: p.diasRestantes ?? dias(p.dataFim) }))
    .filter((p) => p.d <= 15)
    .sort((a, b) => a.d - b.d);

  const audiencias = (au.data?.audiencias ?? [])
    .filter((a) => dias(a.data) >= 0 && dias(a.data) <= 30)
    .sort((a, b) => new Date(a.data ?? 0).getTime() - new Date(b.data ?? 0).getTime());

  const processos = pr.data?.resultados ?? pr.data?.processos ?? [];
  const moveram = processos.filter((p) => p.temNovidade);
  const nClientes = (cl.data?.clients ?? []).length;

  const vencidos = prazos.filter((p) => p.d < 0).length;
  const hoje = prazos.filter((p) => p.d === 0).length;

  const primeiroNome = (ses?.nome ?? 'Doutor').split(' ')[0];

  return (
    <>
      {/* ═══ A SAUDAÇÃO — e o que aperta ═══ */}
      <header className={s.topo}>
        <div>
          <h1>
            Bom dia, <em>{primeiroNome}</em>
          </h1>
          <p>
            {vencidos > 0 ? (
              <b className={s.grave}>
                {vencidos} {vencidos === 1 ? 'prazo venceu' : 'prazos venceram'}.
              </b>
            ) : hoje > 0 ? (
              <b className={s.grave}>
                {hoje} {hoje === 1 ? 'prazo vence' : 'prazos vencem'} hoje.
              </b>
            ) : prazos.length > 0 ? (
              <>
                <b>{prazos.length}</b>{' '}
                {prazos.length === 1 ? 'prazo em 15 dias' : 'prazos nos próximos 15 dias'}.
              </>
            ) : (
              'Nenhum prazo apertando. Bom dia de trabalho.'
            )}
          </p>
        </div>

        <div className={s.numeros}>
          <Link href="/processos" className={s.n}>
            <strong className="num">{processos.length}</strong>
            <span>processos</span>
          </Link>
          <Link href="/clientes" className={s.n}>
            <strong className="num">{nClientes}</strong>
            <span>clientes</span>
          </Link>
        </div>
      </header>

      {/* ═══ 1️⃣ + 2️⃣ — O QUE APERTA HOJE ═══ */}
      <div className={s.grade2}>
        {/* 🔴 PRAZOS — o que tira o sono */}
        <section className={`card ${s.cardPrazo}`}>
          <div className="card-h">
            <h2>
              <Icon n="relogio" s={18} />
              Prazos
            </h2>
            <Link href="/agenda" className={s.ver}>
              Ver todos <Icon n="chev" s={13} strokeWidth={2.4} />
            </Link>
          </div>

          <div className="card-b flush">
            {prazos.length === 0 ? (
              <p className={s.vazio}>Nenhum prazo nos próximos 15 dias.</p>
            ) : (
              prazos.slice(0, 5).map((p, i) => (
                <Link
                  key={p.id ?? i}
                  href={`/processos/${encodeURIComponent(p.numeroProcesso ?? '')}`}
                  className={`${s.linha} ${p.d < 0 ? s.venceu : p.d <= 2 ? s.urgente : ''}`}
                >
                  <span className={s.badge}>
                    {p.d < 0 ? 'VENCEU' : p.d === 0 ? 'HOJE' : `${p.d}d`}
                  </span>
                  <div className={s.lc}>
                    <strong>{p.tipo ?? 'Prazo'}</strong>
                    <small>{p.cliente ?? p.numeroProcesso ?? '—'}</small>
                  </div>
                  <em className="num">{dataBR(p.dataFim)}</em>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* 📅 AUDIÊNCIAS — outro motor. Card SEPARADO. Sempre. */}
        <section className="card">
          <div className="card-h">
            <h2>
              <Icon n="agenda" s={18} />
              Audiências
            </h2>
            <Link href="/agenda?t=audiencias" className={s.ver}>
              Ver todas <Icon n="chev" s={13} strokeWidth={2.4} />
            </Link>
          </div>

          <div className="card-b flush">
            {audiencias.length === 0 ? (
              <p className={s.vazio}>Nenhuma audiência nos próximos 30 dias.</p>
            ) : (
              audiencias.slice(0, 5).map((a, i) => (
                <Link
                  key={a.id ?? i}
                  href={`/processos/${encodeURIComponent(a.numeroProcesso ?? '')}`}
                  className={s.linha}
                >
                  <span className={`${s.badge} ${s.bAud}`}>{dataBR(a.data)}</span>
                  <div className={s.lc}>
                    <strong>{a.tipo ?? 'Audiência'}</strong>
                    <small>{a.cliente ?? a.local ?? a.numeroProcesso ?? '—'}</small>
                  </div>
                  <em className="num">{horaBR(a.data)}</em>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>

      {/* ═══ ⚖️ O QUE MOVEU ═══ */}
      {moveram.length > 0 ? (
        <section className={`card ${s.moveu}`}>
          <div className="card-h">
            <h2>
              <Icon n="atividade" s={18} />
              O que moveu
              <b className={s.pill}>{moveram.length}</b>
            </h2>
            <Link href="/processos" className={s.ver}>
              Ver processos <Icon n="chev" s={13} strokeWidth={2.4} />
            </Link>
          </div>
          <div className="card-b flush">
            {moveram.slice(0, 4).map((p, i) => (
              <Link
                key={i}
                href={`/processos/${encodeURIComponent(p.numero_processo ?? p.cnj ?? '')}`}
                className={s.linha}
              >
                <span className={s.dot} />
                <div className={s.lc}>
                  <strong className="num">{p.numero_processo ?? p.cnj}</strong>
                  <small>{p.ultima_mov ?? 'movimentação nova'}</small>
                </div>
                <em>{p.cliente ?? ''}</em>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* ═══ 3️⃣ 📡 PLANTÃO — A CONEXÃO COM O USUÁRIO ═══ */}
      <Plantao />

      {/* ═══ 4️⃣ 👥 O CLIENTE ═══ */}
      <div className={s.atalhos}>
        <Link href="/clientes/convidar" className={s.atalho}>
          <span className={`${s.aIc} ${s.aLime}`}>
            <Icon n="convite" s={20} />
          </span>
          <div>
            <strong>Convidar cliente</strong>
            <small>
              Quando ele entrar, o SOSC JUS busca <b>todos os processos dele</b> —
              inclusive os que você não sabia que existiam.
            </small>
          </div>
          <Icon n="chev" s={17} className={s.aSeta} />
        </Link>

        <Link href="/honorarios" className={s.atalho}>
          <span className={`${s.aIc} ${s.aMoney}`}>
            <Icon n="dinheiro" s={20} />
          </span>
          <div>
            <strong>Cobrar honorários</strong>
            <small>Gere a cobrança e mande pelo WhatsApp. O cliente paga pelo PIX.</small>
          </div>
          <Icon n="chev" s={17} className={s.aSeta} />
        </Link>

        <Link href="/consultas/processual" className={s.atalho}>
          <span className={`${s.aIc} ${s.aGold}`}>
            <Icon n="busca" s={20} />
          </span>
          <div>
            <strong>Consulta Processual SOSC</strong>
            <small>
              O pente-fino: até 200 processos da pessoa, em qualquer tribunal.
            </small>
          </div>
          <Token n={10_000} mini />
        </Link>
      </div>
    </>
  );
}

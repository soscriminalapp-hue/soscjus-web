'use client';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  🔔 O SINO — o que faz ele deixar a estação ABERTA O DIA INTEIRO
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  Sem isto, ele abre, olha, e fecha.
 *  Com isto, ele DEIXA ABERTO — porque a estação CHAMA ELE.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *  ⚠️ AS ROTAS SÃO REAIS. Verificadas no backend.
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  GET /lawyers/notificacoes  → { total, itens[] }
 *
 *     Ela JÁ devolve tudo pronto, com 6 tipos:
 *
 *       vinculo    → "Novo cliente vinculado"
 *       chat       → "Mensagem na Sala Chat SOSC"
 *       relatorio  → "Relatório aguardando sua revisão"
 *       cobranca   → "Pagamento informado pelo cliente"
 *       processo   → movimentação
 *       suporte    → suporte
 *
 *     Cada item traz: { tipo, titulo, texto, data, refId, peerName?, pendente? }
 *
 *  GET /sos/active  → { sessions[] }
 *
 *     ⚠️ SEPARADA. Porque o SOS é OUTRA COISA — é emergência.
 *
 *  GET /mural/casos → { casos[] }
 *
 *     O Plantão. Quem está procurando advogado AGORA.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *  A ORDEM É POR URGÊNCIA — NÃO POR DATA
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   1. 🚨 SOS         → o cliente está sendo abordado AGORA (raro: 1×/mês)
 *   2. 💬 Chat        → o cliente falou com ele
 *   3. 📡 Plantão     → gente procurando advogado (5-10/dia)
 *   4. 📄 Relatório   → o cliente PEDIU e está esperando
 *   5. 👤 Vínculo     → cliente novo entrou
 *   6. 💰 Cobrança    → o cliente informou pagamento
 *   7. ● Processo     → o tribunal publicou
 *
 *  ⚠️ O SOS é RARO. Mas quando acontece, é O MAIS URGENTE QUE EXISTE.
 *     Por isso o sino fica VERMELHO E PULSA.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { sosc } from '@/lib/api';
import Icon, { type Nome } from '@/components/Icon';
import s from './sino.module.css';

/** ⚠️ Os 6 tipos que /lawyers/notificacoes devolve + os 2 que buscamos à parte. */
type Tipo =
  | 'sos'
  | 'chat'
  | 'plantao'
  | 'relatorio'
  | 'vinculo'
  | 'cobranca'
  | 'processo'
  | 'documento'
  | 'procuracao'
  | 'contrato'
  | 'mandado'
  | 'suporte';

interface ItemAPI {
  tipo: string;
  titulo: string;
  texto: string;
  data: string;
  refId: string;
  peerName?: string;
  pendente?: boolean;
}

interface Aviso {
  id: string;
  tipo: Tipo;
  titulo: string;
  texto: string;
  quando?: string;
  href: string;
  peso: number;
  /** Pede ação dele. */
  pendente?: boolean;
}

const ICONE: Record<Tipo, Nome> = {
  sos: 'sos',
  chat: 'chat',
  plantao: 'radar',
  relatorio: 'relatorio',
  vinculo: 'clientes',
  cobranca: 'dinheiro',
  processo: 'atividade',
  documento: 'doc',
  procuracao: 'doc',
  contrato: 'doc',
  mandado: 'alerta',
  suporte: 'sino',
};

const COR: Record<Tipo, string> = {
  sos: 'var(--risk-lit)',
  chat: 'var(--miami)',
  plantao: 'var(--lime)',
  relatorio: 'var(--gold)',
  vinculo: 'var(--lime)',
  cobranca: 'var(--money-lit)',
  processo: 'var(--t2)',
  documento: 'var(--gold)',
  procuracao: 'var(--gold)',
  contrato: 'var(--gold)',
  mandado: 'var(--risk-lit)',
  suporte: 'var(--t2)',
};

/** ⚠️ A URGÊNCIA. Não é a data. */
const PESO: Record<Tipo, number> = {
  sos: 1000, // 🚨 ele está sendo abordado AGORA
  chat: 90, // 💬 o cliente falou
  plantao: 80, // 📡 cliente novo esperando
  relatorio: 70, // 📄 ele PEDIU e está esperando
  mandado: 65,
  vinculo: 60, // 👤 cliente novo entrou
  cobranca: 50, // 💰 informou pagamento
  contrato: 40,
  procuracao: 40,
  documento: 40,
  processo: 20, // ● o tribunal publicou
  suporte: 10,
};

/** Para onde o clique leva. */
function destino(t: Tipo, refId: string): string {
  switch (t) {
    case 'sos':
      return `/sos/${refId}`;
    case 'plantao':
      return '/plantao';
    case 'processo':
      return refId ? `/processos/${encodeURIComponent(refId)}` : '/processos';
    case 'chat':
    case 'vinculo':
    case 'relatorio':
    case 'documento':
    case 'procuracao':
    case 'contrato':
      // ⚠️ refId = clientId → abre a ficha do cliente
      return `/clientes/${refId}`;
    case 'cobranca':
      return '/cobrancas';
    default:
      return '/inicio';
  }
}

function faz(v?: string) {
  if (!v) return '';
  const min = Math.floor((Date.now() - new Date(v).getTime()) / 60000);
  if (min < 1) return 'agora';
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d`;
  return `${Math.floor(d / 30)} mês`;
}

export default function Sino() {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [aberto, setAberto] = useState(false);
  const caixa = useRef<HTMLDivElement>(null);

  const ler = useCallback(async () => {
    const out: Aviso[] = [];

    /* ═══ 🚨 SOS — o mais urgente que existe ═══ */
    try {
      const r = await sosc.get<{
        sessions?: Array<{
          id: string;
          status?: string;
          startedAt?: string;
          client?: { user?: { fullName?: string } };
        }>;
      }>('/sos/active');

      for (const x of r.sessions ?? []) {
        out.push({
          id: `sos-${x.id}`,
          tipo: 'sos',
          titulo: `${x.client?.user?.fullName ?? 'Um cliente'} acionou o SOS`,
          texto:
            x.status === 'PENDING'
              ? 'Aguardando você aceitar. Áudio e GPS ao vivo.'
              : 'Em atendimento. Áudio e GPS ao vivo.',
          quando: x.startedAt,
          href: destino('sos', x.id),
          peso: PESO.sos + (x.status === 'PENDING' ? 100 : 0),
          pendente: x.status === 'PENDING',
        });
      }
    } catch {
      /* silencioso */
    }

    /* ═══ 📬 AS NOTIFICAÇÕES — a rota já entrega tudo pronto ═══ */
    try {
      const r = await sosc.get<{ total?: number; itens?: ItemAPI[] }>(
        '/lawyers/notificacoes',
      );

      for (const x of r.itens ?? []) {
        const t = (x.tipo as Tipo) ?? 'suporte';
        out.push({
          id: `${x.tipo}-${x.refId}-${x.data}`,
          tipo: t,
          titulo: x.titulo,
          texto: x.texto,
          quando: x.data,
          href: destino(t, x.refId),
          peso: PESO[t] ?? 10,
          pendente: x.pendente,
        });
      }
    } catch {
      /* silencioso */
    }

    /* ═══ 📡 PLANTÃO — cliente NOVO (5-10/dia) ═══ */
    try {
      const r = await sosc.get<{ casos?: Array<{ status?: string }> }>(
        '/mural/casos',
      );
      const n = (r.casos ?? []).filter((c) => c.status !== 'RECUSADO').length;
      if (n > 0) {
        out.push({
          id: 'plantao',
          tipo: 'plantao',
          titulo: `${n} ${n === 1 ? 'pessoa procurando' : 'pessoas procurando'} advogado`,
          texto: 'Grátis no seu plano. Não desconta crédito.',
          href: '/plantao',
          peso: PESO.plantao,
          pendente: true,
        });
      }
    } catch {
      /* sem assinatura — tudo bem */
    }

    // ⚠️ ORDENA POR URGÊNCIA — não por data
    out.sort((a, b) => {
      if (b.peso !== a.peso) return b.peso - a.peso;
      return String(b.quando ?? '').localeCompare(String(a.quando ?? ''));
    });

    setAvisos(out);
  }, []);

  /**
   * ⚠️ POLLING DE 30s — e por que basta (POR ENQUANTO)
   *
   * O backend não tem WebSocket. Fazer SSE agora atrasaria tudo.
   *
   * 30s é aceitável para chat, prazo, movimentação e plantão.
   *
   * ⚠️ Para o SOS, NÃO É. Ele precisa saber AGORA.
   *    → v4.2: SSE em /sos/stream.
   */
  useEffect(() => {
    void ler();
    const t = setInterval(ler, 30_000);
    return () => clearInterval(t);
  }, [ler]);

  /* clique fora fecha */
  useEffect(() => {
    if (!aberto) return;
    const h = (e: MouseEvent) => {
      if (caixa.current && !caixa.current.contains(e.target as Node)) {
        setAberto(false);
      }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [aberto]);

  /** Marca como visto (a rota existe). */
  async function marcarVisto() {
    try {
      await sosc.post('/lawyers/notificacoes/marcar-visto', {});
    } catch {
      /* silencioso */
    }
  }

  const temSOS = avisos.some((a) => a.tipo === 'sos');
  const pendentes = avisos.filter((a) => a.pendente).length;
  const n = avisos.length;

  return (
    <div className={s.wrap} ref={caixa}>
      <button
        className={`${s.sino} ${temSOS ? s.sinoSOS : n > 0 ? s.sinoAtivo : ''}`}
        onClick={() => {
          setAberto((v) => !v);
          if (!aberto) void marcarVisto();
        }}
        aria-label={`${n} avisos`}
        title={temSOS ? 'SOS ACIONADO' : `${n} avisos`}
      >
        <Icon n="sino" s={20} />
        {n > 0 ? (
          <b className={temSOS ? s.badgeSOS : s.badge}>{n > 9 ? '9+' : n}</b>
        ) : null}
      </button>

      {aberto ? (
        <div className={s.painel} role="dialog">
          <header className={s.topo}>
            <strong>Avisos</strong>
            {pendentes > 0 ? (
              <span className={s.pendentes}>{pendentes} pedem ação</span>
            ) : n > 0 ? (
              <span>{n}</span>
            ) : null}
          </header>

          {n === 0 ? (
            <div className={s.vazio}>
              <Icon n="ok" s={26} strokeWidth={2.2} />
              <p>Nada pendente. Respire.</p>
            </div>
          ) : (
            <div className={s.lista}>
              {avisos.map((a) => (
                <Link
                  key={a.id}
                  href={a.href}
                  className={`${s.aviso} ${a.tipo === 'sos' ? s.avisoSOS : ''} ${a.pendente ? s.avisoPendente : ''}`}
                  onClick={() => setAberto(false)}
                >
                  <span className={s.ic} style={{ color: COR[a.tipo] }}>
                    <Icon n={ICONE[a.tipo]} s={18} />
                  </span>

                  <div className={s.corpo}>
                    <strong style={a.tipo === 'sos' ? { color: COR.sos } : undefined}>
                      {a.titulo}
                    </strong>
                    <small>{a.texto}</small>
                  </div>

                  {a.quando ? <em className={s.quando}>{faz(a.quando)}</em> : null}
                </Link>
              ))}
            </div>
          )}

          <footer className={s.rodape}>Atualiza a cada 30 segundos</footer>
        </div>
      ) : null}
    </div>
  );
}
